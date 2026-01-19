import "express-async-errors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import response from "./utils/responseObject";

import errorMiddleware from "./middlewares/error.middleware";
import statusCodes from "./constants/statusCodes";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import rootRouter from "./routes";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(apiLimiter);
app.use(
  morgan("combined", {
    skip: (req: Request, res: Response) => {
      return res.statusCode < 400;
    },
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With, Content-Type, Accept"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Happy Whale");
});

app.use("/api/v1", rootRouter);

app.use(errorMiddleware);
export default app;
