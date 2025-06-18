import express from "express";
import * as controller from "../../controllers/inoperativeController.js";
import validator from "../../middlewares/validator.js";
import { verify } from "../../controllers/authController.js";

const router = express.Router();

// Verifica se uma manutenção já tem inoperante associado
router.get("/check/maintenance/:manutencaoId", verify, controller.checkMaintenanceInoperative);

// Criar novo inoperante a partir de uma manutenção
router.post("/maintenance/:manutencaoId", verify, controller.create);

// Lista todos os veículos inoperantes
router.get("/", verify, controller.listInoperantVehicles);

// Busca um veículo inoperante específico
router.get("/:id", verify, controller.getById);

// Busca a fase atual de um veículo inoperante
router.get("/:id/phase", verify, controller.getPhase);

// Atualiza a fase de um veículo inoperante
router.put("/:id/phase", verify, controller.updatePhase);

export default router;
