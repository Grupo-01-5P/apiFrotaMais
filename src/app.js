import express from "express";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./config/swagger.json" with { type: "json" };

import database from "./config/database.js";
import routes from "./routes.js";

dotenv.config();
database.config(process.env.DATABASE);

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(routes);

export default app;