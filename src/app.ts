import "express-async-errors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import response from "./utils/responseObject.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import statusCodes from "./constants/statusCodes.js";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import rootRouter from "./routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(bodyParser.json());
app.use(apiLimiter);
app.use(
  morgan("combined", {
    skip: (req: Request, res: Response) => {
      return res.statusCode < 400;
    },
  }),
);

app.get("/", (req, res) => {
  res.send("Happy Whale");
});

app.use("/api/v1", rootRouter);

app.use(errorMiddleware);
export default app;
