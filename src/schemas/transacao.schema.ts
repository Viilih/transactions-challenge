import { z } from "zod";

export const createTransacaoSchema = z.object({
  value: z.number().positive("Valor deve ser positivo"),
  payer: z.number().int().positive("ID do pagador inválido"),
  payee: z.number().int().positive("ID do beneficiário inválido"),
});

export const transacaoResponseSchema = z.object({
  id: z.number(),
  pagadorId: z.number(),
  beneficiarioId: z.number(),
  valor: z.string(),
  status: z.string(),
  createdAt: z.date().nullable(),
});

export type CreateTransacaoInput = z.infer<typeof createTransacaoSchema>;
export type TransacaoResponse = z.infer<typeof transacaoResponseSchema>;
