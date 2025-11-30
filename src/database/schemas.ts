import { relations, sql } from "drizzle-orm";
import {
	check,
	decimal,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const usuarios = pgTable("usuarios", {
	id: serial("id").primaryKey(),
	nome: varchar("nome", { length: 255 }).notNull(),
	cpf: varchar("cpf", { length: 11 }).notNull().unique(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	senha: varchar("senha", { length: 255 }).notNull(),
	tipoUsuarioId: integer("tipo_usuario_id")
		.notNull()
		.references(() => tiposUsuarios.id),
	createdAt: timestamp("created_at").defaultNow(),
});

export const tiposUsuarios = pgTable("tipos_usuarios", {
	id: serial("id").primaryKey(),
	tipo: varchar("tipo", { length: 50 }).notNull().unique(),
});

export const contas = pgTable(
	"contas",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.unique()
			.references(() => usuarios.id, { onDelete: "cascade" }),
		saldo: decimal("saldo", { precision: 15, scale: 2 }).notNull().default("0"),
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => [check("saldo_check", sql`${table.saldo} >= 0`)],
);

export const transacoes = pgTable(
	"transacoes",
	{
		id: serial("id").primaryKey(),
		pagadorId: integer("pagador_id")
			.notNull()
			.references(() => usuarios.id),
		beneficiarioId: integer("beneficiario_id")
			.notNull()
			.references(() => usuarios.id),
		valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
		status: varchar("status", { length: 20 }).notNull().default("PENDENTE"),
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => [
		check("valor_check", sql`${table.valor} > 0`),
		check(
			"pagador_beneficiario_check",
			sql`${table.pagadorId} <> ${table.beneficiarioId}`,
		),
	],
);

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
	tipoUsuario: one(tiposUsuarios, {
		fields: [usuarios.tipoUsuarioId],
		references: [tiposUsuarios.id],
	}),
	conta: one(contas, {
		fields: [usuarios.id],
		references: [contas.userId],
	}),
	transacoesPagador: many(transacoes, { relationName: "pagador" }),
	transacoesBeneficiario: many(transacoes, { relationName: "beneficiario" }),
}));

export const transacoesRelations = relations(transacoes, ({ one }) => ({
	pagador: one(usuarios, {
		fields: [transacoes.pagadorId],
		references: [usuarios.id],
		relationName: "pagador",
	}),
	beneficiario: one(usuarios, {
		fields: [transacoes.beneficiarioId],
		references: [usuarios.id],
		relationName: "beneficiario",
	}),
}));
