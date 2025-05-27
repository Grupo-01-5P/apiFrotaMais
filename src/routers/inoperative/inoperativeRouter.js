import express from "express";
import * as controller from "../../controllers/inoperativeController.js";
// import maintenanceValidator from "./maintenanceValidator.js" <-- AJUSTAR ;
import validator from "../../middlewares/validator.js";


const router = express.Router();

router.get("/", controller.listAll);
router.get("/inoperative", controller.listInoperative);
router.get("/completed", controller.listCompleted);
router.get("/:id", controller.getById);
router.get("/phases", controller.getPhaseInfo);

export default router;
