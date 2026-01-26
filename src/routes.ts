import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/projects/project.routes";
import taskRoutes from "./modules/tasks/tasks.routes";
import userRoutes from "./modules/user/user.routes";
import statusCodes from "./constants/statusCodes";
import response from "./utils/responseObject";

const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/project", projectRoutes);
rootRouter.use("/tasks", taskRoutes);
rootRouter.use("/user", userRoutes);
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
