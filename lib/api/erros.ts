/** Erro de uma chamada à API, já com mensagem pronta para o usuário. */
export class ErroApi extends Error {}

/** Lê o `detail` do ProblemDetail do Spring, se houver. */
export async function detalheDoErro(res: Response) {
  try {
    const corpo = await res.json()
    return typeof corpo?.detail === "string" ? corpo.detail : null
  } catch {
    return null
  }
}
