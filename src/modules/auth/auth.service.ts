import prisma from "./../../config/db";
import bcrypt from "bcrypt";
import { env } from "config/env";
import jwt, { Secret } from "jsonwebtoken";
import { email } from "zod";
import { da } from "zod/v4/locales";

async function login(payload: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new Error("AUTH_FAILED");
  }
  const validPassword = await bcrypt.compare(payload.password, user.password);

  if (!validPassword) {
    throw new Error("INVALID_EMAIL/PASSWORD");
  }

  const token = await jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    env.JWT_SECRET as Secret,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );

  const data = {
    ...user,
    token,
  };

  return data;
}

export { login };
