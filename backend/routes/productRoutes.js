const express = require("express");
const router = express.Router();

const{ newProduct, 
    productById, 
    readProduct, 
    deleteProduct, 
    updateProduct,
    list, 
    listBySearch, 
    image,
    listSearch 
} = require("../controllers/productController");

//Routes 
router.get("/product/:productId", readProduct);
router.get("/products/search", listSearch);
router.post("/product/create", newProduct);
router.delete("/product/:productId", deleteProduct);
router.put("/product/updateproduct/:productId", updateProduct);
router.get("/products", list);
router.post("/products/by/search", listBySearch);
router.get("/product/image/:productId", image);
router.param("productId", productById);

module.exports = router;