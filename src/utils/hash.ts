import bcrypt from "bcrypt";
export const hashSenha = async (senha: string): Promise<string> => {
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(senha, salt);
	return hash;
};
