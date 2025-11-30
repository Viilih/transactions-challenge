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
import { db } from "./database";

const app: FastifyInstance = Fastify().withTypeProvider<ZodTypeProvider>();

app.get("/", async function handler(request, reply) {
	return { hello: "world3" };
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
	origin: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	// credentials: true, -> Envio automatico de cookies para o backend
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

try {
	await app.listen({ port: 3000 }).then(() => {
		console.log("HTTP server running on http://localhost:3000");
		console.log("Docs avaiable at http://localhost:3000/api-docs");
	});
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
