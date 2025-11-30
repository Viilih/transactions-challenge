export type TUsuario = {
	id: number;
	nome: string;
	cpf: string;
	email: string;
	senha: string;
	tipoUsuarioId: number;
	createdAt: Date | null;
};
