import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import taskRoutes from "./modules/tasks/tasks.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import messageRoutes from "./modules/messages/messages.routes.js";
import fileRoutes from "./modules/file/file.routes.js";
import statusCodes from "./constants/statusCodes.js";
import response from "./utils/responseObject.js";

const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/project", projectRoutes);
rootRouter.use("/tasks", taskRoutes);
rootRouter.use("/user", userRoutes);
rootRouter.use("/message", messageRoutes);
rootRouter.use("/file", fileRoutes);
rootRouter.use("*", (req, res) => {
  res.status(statusCodes.NOTFOUND).json(
    response({
      message: `The following endpoint ${req.originalUrl} is not found.`,
      status: statusCodes.NOTFOUND,
      success: false,
      data: {},
    }),
  );
});

export default rootRouter;
