import prisma from "./../../config/db.js";
import bcrypt from "bcrypt";
import { env } from "./../../config/env.js";
import jwt, { Secret } from "jsonwebtoken";
import { AppError } from "./../../utils/AppError.js";
import statusCodes from "./../../constants/statusCodes.js";

async function register(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (user) {
    throw new AppError("User already exist", statusCodes.CONFLICT);
  }

  const hashpassword = await bcrypt
    .hash(payload.password, 10)
    .then((hash) => hash);

  // console.log(hashpassword);

  const newUser = await prisma.user.create({
    data: { ...payload, password: hashpassword },
  });

  const userData = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };

  const token = await jwt.sign(userData, env.JWT_SECRET as Secret, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });

  return { ...newUser, token };
}

async function login(payload: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email/password", statusCodes.UNAUTHORIZED);
  }
  const validPassword = await bcrypt.compare(payload.password, user.password);

  if (!validPassword) {
    throw new AppError("Invalid email/password", statusCodes.BAD_REQUEST);
  }

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  const token = await jwt.sign(userData, env.JWT_SECRET as Secret, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });

  const data = {
    ...userData,
    createdAt: user.createdAt,
    token,
  };

  return data;
}

export { login, register };
