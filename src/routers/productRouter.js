import { Router } from "express";
import validator from "../middlewares/validator.js";
import productValidator from "./productValidator.js";
import { listProducts, showProduct, createProduct, editProduct, deleteProduct } from "../controllers/productController.js";

const router = Router();
router.get("/products/", listProducts);
router.get("/products/:_id", showProduct);
router.post("/products/", validator(productValidator), createProduct);
router.put("/products/:_id", validator(productValidator), editProduct);
router.delete("/products/:_id", deleteProduct);

export default router;