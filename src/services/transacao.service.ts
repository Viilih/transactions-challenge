import { and, eq } from "drizzle-orm";
import { uuidv4 } from "zod";
import { db } from "../database";
import {
  contas,
  tiposUsuarios,
  transacoes,
  usuarios,
} from "../database/schemas";
import type { CreateTransacaoInput } from "../schemas/transacao.schema";
import { autorizarTransacao } from "../utils/autorizacao";
import { enviarNotificacao } from "../utils/notificacao";

export const realizarTransferencia = async (
  data: CreateTransacaoInput & { idempotencyKey?: string }
) => {
  if (!data.idempotencyKey) {
    throw new Error("Header 'Idempotency-Key' é obrigatório");
  }

  const idempotencyKey = data.idempotencyKey;

  const [existing] = await db
    .select()
    .from(transacoes)
    .where(eq(transacoes.idempotencyKey, idempotencyKey))
    .limit(1);

  if (existing) {
    console.log("🔄 Requisição duplicada detectada");
    return existing;
  }

  const [pagador] = await db
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      tipoUsuarioId: usuarios.tipoUsuarioId,
      saldo: contas.saldo,
      contaId: contas.id,
    })
    .from(usuarios)
    .innerJoin(contas, eq(usuarios.id, contas.userId))
    .where(eq(usuarios.id, data.payer))
    .limit(1);

  if (!pagador) {
    throw new Error("Pagador não encontrado");
  }

  const [beneficiario] = await db
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
      contaId: contas.id,
      saldo: contas.saldo,
    })
    .from(usuarios)
    .innerJoin(contas, eq(usuarios.id, contas.userId))
    .where(eq(usuarios.id, data.payee))
    .limit(1);

  if (!beneficiario) {
    throw new Error("Beneficiário não encontrado");
  }

  const [tipoPagador] = await db
    .select()
    .from(tiposUsuarios)
    .where(eq(tiposUsuarios.id, pagador.tipoUsuarioId))
    .limit(1);

  if (tipoPagador.tipo === "LOJISTA") {
    throw new Error("Lojistas não podem realizar transferências");
  }

  const saldoAtual = Number.parseFloat(pagador.saldo);
  if (saldoAtual < data.value) {
    throw new Error("Saldo insuficiente");
  }

  const autorizado = await autorizarTransacao();
  if (!autorizado) {
    throw new Error("Transação não autorizada pelo serviço autorizador");
  }

  return await db.transaction(async (tx) => {
    const [transacao] = await tx
      .insert(transacoes)
      .values({
        pagadorId: pagador.id,
        beneficiarioId: beneficiario.id,
        valor: data.value.toString(),
        status: "PROCESSANDO",
        idempotencyKey,
      })
      .returning();

    try {
      await tx
        .update(contas)
        .set({
          saldo: (saldoAtual - data.value).toFixed(2),
        })
        .where(eq(contas.id, pagador.contaId));

      const saldoBeneficiario = Number.parseFloat(beneficiario.saldo);
      await tx
        .update(contas)
        .set({
          saldo: (saldoBeneficiario + data.value).toFixed(2),
        })
        .where(eq(contas.id, beneficiario.contaId));

      await tx
        .update(transacoes)
        .set({ status: "CONCLUIDA" })
        .where(eq(transacoes.id, transacao.id));

      enviarNotificacao(beneficiario.email, transacao.id).catch((error) => {
        console.error("Erro ao enviar notificação:", error);
      });

      return {
        ...transacao,
        status: "CONCLUIDA",
      };
    } catch (error) {
      // Marcar transação como falha
      await tx
        .update(transacoes)
        .set({ status: "FALHA" })
        .where(eq(transacoes.id, transacao.id));

      throw error;
    }
  });
};

export const TransacaoService = {
  realizarTransferencia,
};
