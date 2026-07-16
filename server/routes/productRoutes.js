const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/products/seed", auth, productController.seedProducts);
router.get("/products", auth, productController.getProducts);
router.post("/products", auth, requireAdmin, productController.createProduct);
router.delete("/products/:id", auth, requireAdmin, productController.deleteProduct);
router.delete("/products", auth, requireAdmin, productController.clearProducts);
router.put("/products/:id/use", auth, productController.useProduct);
router.put("/products/:id", auth, requireAdmin, productController.updateProduct);

module.exports = router;
