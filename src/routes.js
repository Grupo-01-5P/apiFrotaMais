import { Router } from "express";

import NotFound from "./routers/helpers/404.js";
import InternalServerError from "./routers/helpers/500.js";

import hateos from "./middlewares/hateos.js";
import handler from "./middlewares/handler.js";

import AuthRouter from "./routers/auth/authRouter.js"
import UserRouter from "./routers/user/userRouter.js"
import MaintenanceRouter from "./routers/maintenance/maintenanceRouter.js"
import GarageRouter from "./routers/garage/garageRouter.js"

import { verify } from "./controllers/authController.js"

const routes = Router()
routes.use(hateos);
routes.use(handler);

routes.use("/login", AuthRouter)
routes.use("/api/users", verify, UserRouter)
routes.use("/api/maintenance", verify, MaintenanceRouter)
routes.use("/api/garage", verify, GarageRouter)

routes.use(InternalServerError)
routes.use(NotFound);

export default routes;