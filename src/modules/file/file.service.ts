import { ensureIsMember, ensureProjectExist } from "utils/permissions";
import cloudinary from "./../../config/cloudinary";
import prisma from "config/db";
import { AppError } from "utils/AppError";
import statusCodes from "constants/statusCodes";
import { split } from "lodash";

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
) {
  await ensureProjectExist(projectId);
  await ensureIsMember(projectId, userId);

  return await prisma.file.create({
    data: {
      projectId,
      uploaderId: userId,
      name,
      url,
      size,
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

  return await prisma.file.findMany({
    where: { projectId },
    include: { uploader: { select: { name: true } } },
    orderBy: {
      createdAt: "asc",
    },
    take: 50,
  });
}

export { uploadToCloudinary, saveFileRecord, getProjectFiles, deleteFile };
