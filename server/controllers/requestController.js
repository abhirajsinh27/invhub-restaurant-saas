const Product = require("../models/Product");
const User = require("../models/User");
const Request = require("../models/Request");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const { checkAndCreateStockNotifications } = require("../services/notificationService");

const createRequest = (req, res) => {
  const { productId, requestedQty, reason } = req.body;

  if (!productId || requestedQty === undefined) {
    return res
      .status(400)
      .json({ message: "Product ID and requested quantity are required" });
  }

  Product.findOne({ _id: productId, organizationId: req.user.organizationId })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      User.findById(req.user.userId)
        .then((user) => {
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

          Request.create({
            productId: product._id,
            productName: product.name,
            currentQty: product.qty,
            requestedQty: Number(requestedQty),
            reason: reason || "",
            requestedBy: user._id,
            requesterName: user.fullName,
            organizationId: req.user.organizationId,
            unit: product.unit || "pcs",
          })
            .then((request) => {
              const unitStr = product.unit || "pcs";
              Activity.create({
                UserId: req.user.userId,
                userId: req.user.userId,
                organizationId: req.user.organizationId,
                type: "request created",
                action: "request created",
                message: `Request created: ${user.fullName} requested stock of ${product.name} to be ${requestedQty} ${unitStr} (Current: ${product.qty} ${unitStr})`,
                relatedProduct: product._id,
              }).catch((err) =>
                console.error("Error creating activity log:", err),
              );

              // Create notification for all admins in the organization
              User.find({
                organizationId: req.user.organizationId,
                role: "admin",
              }).then((admins) => {
                const notifications = admins.map((admin) => ({
                  organizationId: req.user.organizationId,
                  userId: admin._id,
                  type: "request_submitted",
                  message: `New stock request submitted for ${product.name} (Qty: ${requestedQty} ${unitStr}) by ${user.fullName}.`,
                }));
                if (notifications.length > 0) {
                  Notification.insertMany(notifications).catch((err) =>
                    console.error(err),
                  );
                }
              });

              res.status(201).json(request);
            })
            .catch((err) => {
              res.status(500).json({ message: err.message });
            });
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
};

const getRequests = (req, res) => {
  let query = { organizationId: req.user.organizationId };
  if (req.user.role !== "admin") {
    query.requestedBy = req.user.userId;
  }

  Request.find(query)
    .sort({ createdAt: -1 })
    .then((requests) => {
      res.json(requests);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error fetching requests", details: err.message });
    });
};

const approveRequest = (req, res) => {
  Request.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId,
  })
    .then((request) => {
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ message: `Request is already ${request.status}` });
      }

      request.status = "approved";
      request
        .save()
        .then((updatedRequest) => {
          Product.findOne({
            _id: request.productId,
            organizationId: req.user.organizationId,
          })
            .then((product) => {
              if (!product) {
                console.error(
                  `Product ${request.productId} not found during approval`,
                );
                return res.json(updatedRequest);
              }

              product.qty = request.requestedQty;
              product
                .save()
                .then(() => {
                  checkAndCreateStockNotifications(product, req.user.organizationId);
                  Activity.create({
                    UserId: req.user.userId,
                    userId: req.user.userId,
                    organizationId: req.user.organizationId,
                    type: "request approved",
                    action: "request approved",
                    message: `Request approved: ${request.productName} quantity updated to ${request.requestedQty} (Requested by: ${request.requesterName})`,
                    relatedProduct: product._id,
                  })
                    .then(() => {
                      // Create notification for requester
                      Notification.create({
                        organizationId: req.user.organizationId,
                        userId: request.requestedBy,
                        type: "request_approved",
                        message: `Your request for ${request.productName} (Qty: ${request.requestedQty}) has been approved.`,
                      }).catch((err) => console.error(err));

                      res.json(updatedRequest);
                    })
                    .catch((err) => {
                      console.error("Error creating activity log:", err);
                      res.json(updatedRequest);
                    });
                })
                .catch((err) => {
                  res.status(500).json({
                    message: "Error updating product inventory",
                    details: err.message,
                  });
                });
            })
            .catch((err) => {
              res.status(500).json({
                message: "Error finding product",
                details: err.message,
              });
            });
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
};

const rejectRequest = (req, res) => {
  Request.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId,
  })
    .then((request) => {
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ message: `Request is already ${request.status}` });
      }

      request.status = "rejected";
      request
        .save()
        .then((updatedRequest) => {
          Activity.create({
            UserId: req.user.userId,
            userId: req.user.userId,
            organizationId: req.user.organizationId,
            type: "request rejected",
            action: "request rejected",
            message: `Request rejected: ${request.productName} (Requested: ${request.requestedQty}, By: ${request.requesterName})`,
            relatedProduct: request.productId,
          })
            .then(() => {
              // Create notification for requester
              Notification.create({
                organizationId: req.user.organizationId,
                userId: request.requestedBy,
                type: "request_rejected",
                message: `Your request for ${request.productName} (Qty: ${request.requestedQty}) has been rejected.`,
              }).catch((err) => console.error(err));

              res.json(updatedRequest);
            })
            .catch((err) => {
              console.error("Error creating activity log:", err);
              res.json(updatedRequest);
            });
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
};

module.exports = {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
};
