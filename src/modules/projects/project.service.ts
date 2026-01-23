import statusCodes from "./../../constants/statusCodes";
import prisma from "./../../config/db";
import { AppError } from "./../../utils/AppError";
import { ensureIsProjectOwner, ensureProjectExist } from "utils/permissions";

async function create(name: string, ownerId: string) {
  const existingProject = await prisma.project.findFirst({
    where: {
      ownerId: ownerId,
      name: name,
    },
  });

  if (existingProject)
    throw new AppError("Project already exist", statusCodes.CONFLICT);

  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: { name, ownerId: ownerId },
    });

    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId: ownerId,
        role: "owner",
      },
    });

    return project;
  });
}

async function updateProject(
  projectId: string,
  userId: string,
  name?: string,
  description?: string
) {
  const updatedData: { name?: string; description?: string } = {};
  if (name !== undefined) updatedData.name = name;

  if (description !== undefined) updatedData.description = description;

  await ensureIsProjectOwner(projectId, userId);

  const updatedProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: updatedData,
  });

  return updatedProject;
}

async function deleteProject(id: string, userId: string) {
  await ensureProjectExist(id);

  await ensureIsProjectOwner(id, userId);
  return await prisma.project.delete({
    where: {
      id,
    },
  });
}

async function addMember(
  projectId: string,
  userEmail: string,
  ownerId: string
) {
  await ensureIsProjectOwner(projectId, ownerId);
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });
  // console.log(user);

  if (!user) throw new AppError("User does not exist", statusCodes.NOTFOUND);

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
  });

  if (existingMember)
    throw new AppError("User is already a member", statusCodes.CONFLICT);

  return await prisma.projectMember.create({
    data: {
      projectId,
      userId: user.id,
      role: "member",
    },
  });
}

async function listProjectMembers(id: string, userId: string) {
  const projectMembers = await prisma.project.findUnique({
    where: {
      id,
    },
    include: { projectMembers: true },
  });
  if (!projectMembers)
    throw new AppError("Project not found", statusCodes.NOTFOUND);
  const { projectMembers: membersList } = projectMembers;

  const isMember = membersList.filter((member) => member.userId === userId);
  if (!isMember)
    throw new AppError(
      "Access denied. your not a member of this project",
      statusCodes.UNAUTHORIZED
    );

  return projectMembers;
}

async function listAllUserProjects(userId: string) {
  const userProjects = await prisma.projectMember.findMany({
    where: {
      userId: userId,
    },
    include: {
      project: true,
    },
  });

  if (userProjects.length <= 0)
    throw new AppError(
      "User is not a member of any project",
      statusCodes.NOTFOUND
    );

  return userProjects;
}

export {
  create,
  updateProject,
  addMember,
  listProjectMembers,
  listAllUserProjects,
  deleteProject,
};
