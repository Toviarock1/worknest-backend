import prisma from "./../../config/db.js";
import statusCodes from "./../../constants/statusCodes.js";
import { AppError } from "./../../utils/AppError.js";
import { ensureUserExist } from "./../../utils/permissions.js";
import bcrypt from "bcrypt";

async function userDetails(id: string) {
  const user = await ensureUserExist(undefined, id);

  return user;
}

async function updateUser(userId: string, name?: string, password?: string) {
  const data: { name?: string; password?: string } = {};
  await ensureUserExist(undefined, userId);
  if (name !== undefined) data.name = name;
  if (password !== undefined) {
    const hashpassword = await bcrypt.hash(password, 10).then((hash) => hash);

    data.password = hashpassword;
  }

  return prisma.user.update({
    where: { id: userId },
    data: data,
  });
}

async function searchUsersByEmail(query: string, excludeId: string) {
  return await prisma.user.findMany({
    where: {
      email: { contains: query, mode: "insensitive" },
      NOT: {
        id: excludeId,
      },
    },
    select: {
      name: true,
      id: true,
      email: true,
    },
    take: 10,
  });
}

export { userDetails, updateUser, searchUsersByEmail };
