import { z } from "zod";

export const createUsuarioSchema = z.object({
	nome: z.string().min(3),
	cpf: z.string().length(11),
	email: z.string().email(),
	senha: z.string().min(6),
	tipoUsuarioId: z.number().int().positive(),
});

export const usuarioResponseSchema = z.object({
	id: z.number(),
	nome: z.string(),
	cpf: z.string(),
	email: z.string(),
	tipoUsuarioId: z.number(),
	createdAt: z.date().nullable(),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;
