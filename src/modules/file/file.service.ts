import { ensureIsMember, ensureProjectExist } from "utils/permissions";
import cloudinary from "./../../config/cloudinary";
import prisma from "config/db";

async function uploadToCloudinary(fileBuffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "worknest_files",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

async function saveFileRecord(
  projectId: string,
  userId: string,
  name: string,
  url: string,
  size: number
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

export { uploadToCloudinary, saveFileRecord, getProjectFiles };
