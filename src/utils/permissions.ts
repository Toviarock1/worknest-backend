import prisma from "./../config/db";
import statusCodes from "./../constants/statusCodes";
import { AppError } from "./AppError";

// is member
export const ensureIsMember = async (projectId: string, userId: string) => {
  const isMember = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId,
    },
  });

  if (!isMember) throw new AppError("User not a member", statusCodes.NOTFOUND);
  return isMember;
};

// is project owner
export const ensureIsProjectOwner = async (
  projectId: string,
  userId: string
) => {
  const isOwner = await prisma.project.findUnique({
    where: {
      id: projectId,
      ownerId: userId,
    },
  });

  if (!isOwner)
    throw new AppError("User is not the owner", statusCodes.UNAUTHORIZED);

  return isOwner;
};

// does project exist
export const ensureProjectExist = async (projectId: string) => {
  const projectExist = await prisma.project.findFirst({
    where: {
      id: projectId,
    },
  });

  if (!projectExist)
    throw new AppError("Project not found", statusCodes.NOTFOUND);

  return projectExist;
};

// does task exist
export const ensureTasksExist = async (taskId: string) => {
  const TasksExist = await prisma.task.findFirst({
    where: {
      id: taskId,
    },
  });

  if (!TasksExist) throw new AppError("Tasks not found", statusCodes.NOTFOUND);

  return TasksExist;
};

// does user exist
export const ensureUserExist = async (email?: string, id?: string) => {
  if (!email && !id) {
    throw new AppError(
      "User identifier required (email or id)",
      statusCodes.BAD_REQUEST
    );
  }

  const user = await prisma.user.findUnique({
    where: email ? { email } : { id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  // console.log(user);

  if (!user) throw new AppError("User does not exist", statusCodes.NOTFOUND);

  return user;
};
