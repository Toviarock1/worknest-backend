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
