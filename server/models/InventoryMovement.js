const mongoose = require("mongoose");

const inventoryMovementSchema =
    new mongoose.Schema(
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },

            organizationId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Organization",
            },

            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },

            type: {
                type: String,

                enum: [
                    "used",
                    "restock",
                    "waste",
                    "adjustment",
                ],
            },

            quantity: Number,

            reason: String,
        },

        {
            timestamps: true,
        }
    );

module.exports = mongoose.model(
    "InventoryMovement",
    inventoryMovementSchema
);