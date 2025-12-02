import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import Fastify, { type FastifyInstance } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { transacoesRoutes } from "./routes/transacao.routes";
import { usuariosRoutes } from "./routes/usuario.routes";

const app: FastifyInstance = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Transactions Challenge API",
      description: "API for Transactions Challenge",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(ScalarApiReference, {
  routePrefix: "/api-docs",
});

app.register(usuariosRoutes, { prefix: "/api" });
app.register(transacoesRoutes, { prefix: "/api" });

try {
  await app.listen({ port: 3000 }).then(() => {
    console.log("HTTP server running on http://localhost:3000");
    console.log("Docs available at http://localhost:3000/api-docs");
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
