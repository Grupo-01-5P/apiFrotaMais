import express from "express";
import * as controller from "../../controllers/inoperativeController.js";
// import maintenanceValidator from "./maintenanceValidator.js" <-- AJUSTAR ;
import validator from "../../middlewares/validator.js";


const router = express.Router();

router.get("/", controller.listInoperantVehicles);

router.get("/inoperative", (req, res, next) => {
  req.query.status = "aprovado";
  controller.listInoperantVehicles(req, res, next);
});

router.get("/completed", (req, res, next) => {
  req.query.status = "concluido";
  controller.listInoperantVehicles(req, res, next);
});

router.get("/:id", controller.getById);

router.get("/phases", controller.getPhaseInfo);

export default router;
