import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  createTransacaoSchema,
  transacaoResponseSchema,
} from "../schemas/transacao.schema";
import { TransacaoService } from "../services/transacao.service";

export async function transacoesRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/transacoes",
    {
      schema: {
        tags: ["Transações"],
        summary: "Realizar transferência",
        headers: z.object({
          "idempotency-key": z.uuidv4(),
        }),
        body: createTransacaoSchema,
        response: {
          201: transacaoResponseSchema,
          400: z.object({ error: z.string() }),
          403: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const idempotencyKey = request.headers["idempotency-key"];
        const transacao = await TransacaoService.realizarTransferencia({
          ...request.body,
          idempotencyKey,
        });
        return reply.code(201).send(transacao);
      } catch (error) {
        const statusCode =
          error instanceof Error && error.message.includes("autorizado")
            ? 403
            : 400;
        return reply.code(statusCode).send({
          error:
            error instanceof Error ? error.message : "Erro ao criar transação",
        });
      }
    }
  );
}
