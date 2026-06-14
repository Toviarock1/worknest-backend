import {
  ensureIsMember,
  ensureProjectExist,
} from "./../../utils/permissions.js";
import supabase, { STORAGE_BUCKET } from "./../../config/supabase.js";
import { randomUUID } from "node:crypto";
import path from "node:path";
import prisma from "./../../config/db.js";
import { AppError } from "./../../utils/AppError.js";
import statusCodes from "./../../constants/statusCodes.js";

export interface UploadedAsset {
  /** Path inside the bucket — kept on the row so we can delete later. */
  storagePath: string;
  /** Public URL for direct download / embed. */
  publicUrl: string;
}

/**
 * Upload a buffer to Supabase Storage. Returns the storage path (for future
 * deletes) and the public URL (for the DB and the frontend).
 *
 * `projectId` is folded into the storage path so files cluster per-project,
 * and the filename is a UUID to avoid collisions / path-traversal abuse.
 */
async function uploadToSupabase(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string | undefined,
  projectId: string,
): Promise<UploadedAsset> {
  const ext = path.extname(originalName).toLowerCase().slice(0, 12); // cap ext length
  const safeId = randomUUID();
  const storagePath = `${projectId}/${safeId}${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new AppError(
      `Storage upload failed: ${error.message}`,
      statusCodes.SERVER_ERROR,
    );
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}

async function saveFileRecord(
  projectId: string,
  userId: string,
  name: string,
  url: string,
  size: number,
  taskId?: string,
) {
  await ensureProjectExist(projectId);
  await ensureIsMember(projectId, userId);

  if (taskId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });
    if (!task || task.projectId !== projectId) {
      throw new AppError(
        "Task does not belong to this project",
        statusCodes.BAD_REQUEST,
      );
    }
  }

  return await prisma.file.create({
    data: {
      projectId,
      uploaderId: userId,
      name,
      url,
      size,
      taskId: taskId ?? null,
    },
  });
}
async function deleteFile(fileId: string, userId: string) {
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
      uploaderId: userId,
    },
  });

  if (!file) throw new AppError("File not found", statusCodes.NOTFOUND);

  // Pull the path back out of the public URL. Public Supabase URLs end with
  // `/storage/v1/object/public/<bucket>/<path…>`. We slice everything after
  // the bucket segment.
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = file.url.indexOf(marker);
  if (idx >= 0) {
    const storagePath = decodeURIComponent(file.url.slice(idx + marker.length));
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);
    // Don't block DB cleanup on a storage failure — log it but proceed.
    if (error) {
      console.warn(`Supabase remove failed for ${storagePath}: ${error.message}`);
    }
  }

  return await prisma.file.delete({
    where: {
      id: fileId,
    },
  });
}

async function getProjectFiles(projectId: string, userId: string) {
  await ensureProjectExist(projectId);
  await ensureIsMember(projectId, userId);

  // Chat tab only shows files shared in chat (taskId === null). Task attachments
  // surface in their own task panel, not in the shared chat feed.
  return await prisma.file.findMany({
    where: { projectId, taskId: null },
    include: { uploader: { select: { name: true } } },
    orderBy: {
      createdAt: "asc",
    },
    take: 50,
  });
}

export { uploadToSupabase, saveFileRecord, getProjectFiles, deleteFile };
