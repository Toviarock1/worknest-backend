import prisma from "./../../config/db.js";
import statusCodes from "./../../constants/statusCodes.js";
import { AppError } from "./../../utils/AppError.js";
import { ensureUserExist } from "./../../utils/permissions.js";
import supabase, { STORAGE_BUCKET } from "./../../config/supabase.js";
import { randomUUID } from "node:crypto";
import path from "node:path";
import bcrypt from "bcrypt";

const AVATAR_MAX_BYTES = 800 * 1024; // 800KB — matches settings UI copy
const AVATAR_MIME_ALLOW = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

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
      avatarUrl: true,
    },
    take: 10,
  });
}

async function uploadAvatar(
  userId: string,
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string | undefined,
  size: number,
) {
  await ensureUserExist(undefined, userId);

  if (!mimeType || !AVATAR_MIME_ALLOW.has(mimeType)) {
    throw new AppError(
      "Avatar must be a JPG, PNG, GIF or WebP image",
      statusCodes.BAD_REQUEST,
    );
  }
  if (size > AVATAR_MAX_BYTES) {
    throw new AppError(
      "Avatar too large — max 800KB",
      statusCodes.BAD_REQUEST,
    );
  }

  const ext = path.extname(originalName).toLowerCase().slice(0, 12) || ".jpg";
  const storagePath = `avatars/${userId}/${randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });
  if (error) {
    throw new AppError(
      `Avatar upload failed: ${error.message}`,
      statusCodes.SERVER_ERROR,
    );
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  // Remove the previous avatar object so we don't orphan files.
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });
  const oldPath = storagePathFromUrl(current?.avatarUrl);
  if (oldPath) {
    const { error: rmErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([oldPath]);
    if (rmErr) console.warn(`Avatar remove failed for ${oldPath}: ${rmErr.message}`);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: data.publicUrl },
  });
}

async function removeAvatar(userId: string) {
  await ensureUserExist(undefined, userId);

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });
  const oldPath = storagePathFromUrl(current?.avatarUrl);
  if (oldPath) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([oldPath]);
    if (error) console.warn(`Avatar remove failed for ${oldPath}: ${error.message}`);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  });
}

export { userDetails, updateUser, searchUsersByEmail, uploadAvatar, removeAvatar };
