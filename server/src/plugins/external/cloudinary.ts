import cloudinary from "fastify-cloudinary";
import fp from "fastify-plugin";

/**
 * This plugin adds a cloudinary connection you
 * can share in every part of your server.
 *
 * @see {@link https://github.com/Vanilla-IceCream/fastify-cloudinary}
 */
export default fp(
  async (fastify) => {
    fastify.register(cloudinary, {
      url: fastify.env.CLOUDINARY_URL,
    });
  },
  { name: "cloudinary", dependencies: ["env"] },
);
