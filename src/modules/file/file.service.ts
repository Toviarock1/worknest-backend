import {
  ensureIsMember,
  ensureProjectExist,
} from "./../../utils/permissions.js";
import cloudinary from "./../../config/cloudinary.js";
import prisma from "./../../config/db.js";
import { AppError } from "./../../utils/AppError.js";
import statusCodes from "./../../constants/statusCodes.js";

async function uploadToCloudinary(fileBuffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "worknest_files",
        resource_type: "auto",
        access_mode: "public",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    uploadStream.end(fileBuffer);
  });
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

  const publicId = file.url.split("/").pop()?.split(".")[0];

  if (publicId) await cloudinary.uploader.destroy(`worknest_files/${publicId}`);

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

export { uploadToCloudinary, saveFileRecord, getProjectFiles, deleteFile };
