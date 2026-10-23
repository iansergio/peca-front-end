import { solicitarCodigo } from "@/lib/api/auth"
import { ErroApi, ErroLimite } from "@/lib/api/erros"
import { ipDoVisitante } from "@/lib/visitante"

/**
 * Resultado das Server Actions de login e registo. `ok: true` só aparece no
 * envio do código; a confirmação redireciona no sucesso. `esperaSegundos`
 * vem do 429 do backend, para a tela travar o reenvio pelo tempo certo.
 */
export type ResultadoAuth = { ok: true } | { ok: false; erro: string; esperaSegundos?: number }

/** Converte o erro de uma chamada ao backend em resultado para a tela. */
export function resultadoDeErro(origem: string, erro: unknown): ResultadoAuth {
  if (erro instanceof ErroLimite) return { ok: false, erro: erro.message, esperaSegundos: erro.segundos }
  if (erro instanceof ErroApi) return { ok: false, erro: erro.message }
  console.error(`[${origem}] falha ao conectar no backend`, erro)
  return { ok: false, erro: "Não foi possível conectar ao servidor. Tente novamente." }
}

/** Pede o código ao backend repassando o IP do visitante. `nome` só no cadastro. */
export async function pedirCodigo(origem: string, email: string, nome?: string): Promise<ResultadoAuth> {
  try {
    await solicitarCodigo(email, nome, await ipDoVisitante())
    return { ok: true }
  } catch (erro) {
    return resultadoDeErro(origem, erro)
  }
}
