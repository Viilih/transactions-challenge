import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
	createUsuarioSchema,
	usuarioResponseSchema,
} from "../schemas/usuario.schema";

import { UsuarioService } from "../services/usuario.service";

export async function usuariosRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/usuarios",
		{
			schema: {
				tags: ["Usuários"],
				summary: "Criar novo usuário",
				body: createUsuarioSchema,
				response: {
					201: usuarioResponseSchema,
					400: z.object({ error: z.string() }),
				},
			},
		},
		async (request, reply) => {
			try {
				const user = await UsuarioService.createUsuario(request.body);
				return reply.code(201).send(user);
			} catch (error) {
				return reply.code(400).send({
					error:
						error instanceof Error ? error.message : "Erro ao criar usuário",
				});
			}
		},
	);

	// // GET /usuarios
	// app.withTypeProvider<ZodTypeProvider>().get(
	// 	"/usuarios",
	// 	{
	// 		schema: {
	// 			tags: ["Usuários"],
	// 			summary: "Listar usuários",
	// 			response: {
	// 				200: z.array(usuarioResponseSchema),
	// 			},
	// 		},
	// 	},
	// 	async (request, reply) => {
	// 		const users = await service.findAll();
	// 		return reply.send(users);
	// 	},
	// );

	// // GET /usuarios/:id
	// app.withTypeProvider<ZodTypeProvider>().get(
	// 	"/usuarios/:id",
	// 	{
	// 		schema: {
	// 			tags: ["Usuários"],
	// 			summary: "Buscar usuário por ID",
	// 			params: z.object({
	// 				id: z.coerce.number(),
	// 			}),
	// 			response: {
	// 				200: usuarioResponseSchema,
	// 				404: z.object({ error: z.string() }),
	// 			},
	// 		},
	// 	},
	// 	async (request, reply) => {
	// 		try {
	// 			const user = await service.findById(request.params.id);
	// 			return reply.send(user);
	// 		} catch (error) {
	// 			return reply.code(404).send({
	// 				error:
	// 					error instanceof Error ? error.message : "Usuário não encontrado",
	// 			});
	// 		}
	// 	},
	// );
}
