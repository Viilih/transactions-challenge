import { eq } from "drizzle-orm";
import { db } from "../database";
import { contas, usuarios } from "../database/schemas";
import type { TUsuario } from "../interfaces/usuario";
import type { CreateUsuarioInput } from "../schemas/usuario.schema";
import { hashSenha } from "../utils/hash";

export const createUsuario = async (data: CreateUsuarioInput) => {
	const cpfExiste = await db
		.select()
		.from(usuarios)
		.where(eq(usuarios.cpf, data.cpf))
		.limit(1);

	if (cpfExiste.length > 0) {
		throw new Error("Usuário com CPF já existe");
	}

	const emailExiste = await db
		.select()
		.from(usuarios)
		.where(eq(usuarios.email, data.email))
		.limit(1);

	if (emailExiste.length > 0) {
		throw new Error("Usuário com email já existe");
	}

	return await db.transaction(async (transaction) => {
		const senhaHash = await hashSenha(data.senha);
		const [usuarioCriado]: Array<TUsuario> = await transaction
			.insert(usuarios)
			.values({
				nome: data.nome,
				cpf: data.cpf,
				email: data.email,
				senha: senhaHash,
				tipoUsuarioId: data.tipoUsuarioId,
			})
			.returning();

		await transaction.insert(contas).values({
			userId: usuarioCriado.id,
			saldo: "0",
		});

		return usuarioCriado;
	});
};

export const UsuarioService = {
	createUsuario,
};
