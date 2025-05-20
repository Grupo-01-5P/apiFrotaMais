import { Router } from "express";

import NotFound from "./routers/helpers/404.js";
import InternalServerError from "./routers/helpers/500.js";

import hateos from "./middlewares/hateos.js";
import handler from "./middlewares/handler.js";

import AuthRouter from "./routers/auth/authRouter.js"
import UserRouter from "./routers/user/userRouter.js"
import BudgetRouter from "./routers/budget/budgetRouter.js"

import { verify } from "./controllers/authController.js"

const routes = Router()
routes.use(hateos);
routes.use(handler);

routes.use("/login", AuthRouter)
routes.use("/usuarios", verify, UserRouter)
routes.use("/orcamento",   BudgetRouter)//COLOCAR O VERIFY

routes.use(InternalServerError)
routes.use(NotFound);

export default routes;