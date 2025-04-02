import { Router } from "express";

import validator from "../middlewares/validator.js";
import userValidator from "./userValidator.js";

import {
  listUsers,
  showUser,
  createUser,
  editUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();
router.get("/users/", listUsers);
router.get("/users/:_id", showUser);
router.post("/users/", validator(userValidator), createUser);
router.put("/users/:_id", validator(userValidator), editUser);
router.delete("/users/:_id", deleteUser);

export default router;