import prisma from "./../../config/db";

async function create(name: string, ownerId: string) {
  const existingProject = await prisma.project.findFirst({
    where: {
      ownerId: ownerId,
      name: name,
    },
  });

  if (existingProject) throw new Error("DUPLICATE_PROJECT");

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

  const isOwner = await prisma.project.findUnique({
    where: {
      id: projectId,
      ownerId: userId,
    },
  });

  if (!isOwner) throw new Error("UNAUTHORIZED");
  const updatedProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: updatedData,
  });

  return updatedProject;
}

async function addMember(
  projectId: string,
  userEmail: string,
  ownerId: string
) {
  const projectOwner = await prisma.projectMember.findFirst({
    where: {
      projectId: projectId,
      userId: ownerId,
      role: "owner",
    },
  });

  if (!projectOwner) throw new Error("UNAUTHORIZED_ACTION");

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });
  // console.log(user);

  if (!user) throw new Error("USER_NOT_FOUND");

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId },
    },
  });

  if (existingMember) throw new Error("USER_ALREADY_EXIST");

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
  if (!projectMembers) throw new Error("NOT_FOUND");
  const { projectMembers: membersList } = projectMembers;

  const isMember = membersList.filter((member) => member.userId === userId);
  if (!isMember) throw new Error("UNAUTHORIZED");

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

  if (userProjects.length <= 0) throw new Error("NOT_MEMBER");

  return userProjects;
}

export {
  create,
  updateProject,
  addMember,
  listProjectMembers,
  listAllUserProjects,
};
