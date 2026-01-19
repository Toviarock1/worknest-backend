import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import statusCodes from "./constants/statusCodes";
import response from "./utils/responseObject";

const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("*", (req, res) => {
  res.status(statusCodes.NOTFOUND).json(
    response({
      message: `The following endpoint ${req.originalUrl} is not found.`,
      status: statusCodes.NOTFOUND,
      success: false,
      data: {},
    })
  );
});

export default rootRouter;
