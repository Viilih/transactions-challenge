export const enviarNotificacao = async (
  email: string,
  transacaoId: number
): Promise<void> => {
  try {
    const response = await fetch("https://util.devi.tools/api/v1/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        message: `Você recebeu uma transferência! ID: ${transacaoId}`,
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao enviar notificação");
    }

    console.log(`Notificação enviada para ${email}`);
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    // Não propaga o erro para não falhar a transação
    throw error;
  }
};
