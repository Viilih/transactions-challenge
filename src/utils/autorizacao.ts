export const autorizarTransacao = async (): Promise<boolean> => {
  try {
    const response = await fetch("https://util.devi.tools/api/v2/authorize", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Serviço autorizador indisponível.");
      return false;
    }

    const data = await response.json();
    console.log(data);

    return data.status === "success";
  } catch (error) {
    console.error("Erro ao conectar ao serviço autorizador:", error);
    return false;
  }
};
