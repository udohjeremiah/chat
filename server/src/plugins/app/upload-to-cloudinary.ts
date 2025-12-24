import { Readable } from "node:stream";

import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    uploadToCloudinary: (
      buffer: Buffer,
      folder: "chat/voices" | "chat/images",
    ) => Promise<{ url: string; publicId: string }>;
  }
}

/**
 * This plugin provides a helper for uploading
 * images and audio files to Cloudinary.
 */
export default fp(
  async (fastify) => {
    fastify.decorate("uploadToCloudinary", (buffer, folder) => {
      return new Promise((resolve, reject) => {
        const resourceType = folder === "chat/voices" ? "video" : "image";

        const uploadStream = fastify.cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            discard_original_filename: true,
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result?.secure_url || !result.public_id) {
              return reject(new Error("Cloudinary upload failed"));
            }

            resolve({ url: result.secure_url, publicId: result.public_id });
          },
        );

        const stream = new Readable();
        stream.push(buffer);
        // eslint-disable-next-line unicorn/no-null
        stream.push(null);
        stream.pipe(uploadStream);
      });
    });
  },
  { name: "upload-to-cloudinary", dependencies: ["cloudinary"] },
);
