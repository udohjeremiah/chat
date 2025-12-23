import fp from "fastify-plugin";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

/**
 * This plugin enables Fastify to use Zod schemas directly
 * for route validation and automatic type inference.
 *
 * @see {@link https://github.com/turkerdev/fastify-type-provider-zod}
 */
export default fp(
  async (fastify) => {
    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);
    fastify.withTypeProvider<ZodTypeProvider>();
  },
  { name: "type-provider-zod" },
);
