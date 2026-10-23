import { requisicaoApi } from "@/lib/api/cliente"
import { ErroApi, ErroLimite, detalheDoErro, formatarEspera, segundosDeEspera } from "@/lib/api/erros"

/** Perfil devolvido pela API (`UsuarioResponse`). */
export type Usuario = {
  id: string
  nome: string
  email: string
  /** Só dígitos, com DDD. */
  whatsapp: string | null
}

/** Resposta de `POST /auth/verificar-codigo`. */
export type TokenResponse = {
  token: string
  tipo: string
  /** ISO 8601. */
  expiraEm: string
  usuario: Usuario
}

/**
 * Etapa 1 do OTP: pede ao backend que envie um código de 6 dígitos para o email.
 *
 * - Cadastro: manda `nome`. A conta só é criada quando o código for verificado;
 *   se o email já tiver conta, o nome dela não é alterado.
 * - Login: não manda `nome`. A resposta é a mesma exista a conta ou não, para
 *   não revelar quais emails estão cadastrados.
 *
 * `ipVisitante` vai em `X-Forwarded-For`: como o front chama o backend pelo
 * servidor, sem ele todo mundo chegaria ao limite por IP com o IP do front.
 *
 * Lança `ErroLimite` no HTTP 429 (cooldown de 60 s ou limites por hora).
 */
export async function solicitarCodigo(email: string, nome?: string, ipVisitante?: string | null) {
  const res = await requisicaoApi("/auth/solicitar-codigo", {
    metodo: "POST",
    json: nome ? { nome, email } : { email },
    headers: ipVisitante ? { "X-Forwarded-For": ipVisitante } : undefined,
  })
  if (res.ok) return

  if (res.status === 429) {
    const segundos = segundosDeEspera(res)
    console.warn(`[auth] solicitar-codigo limitado (HTTP 429, ${segundos}s)`)
    throw new ErroLimite(`Muitos pedidos de código. Tente de novo em ${formatarEspera(segundos)}.`, segundos)
  }

  const detalhe = await detalheDoErro(res)
  if (res.status === 400) {
    // Login sem nome para um email sem conta: o backend atual responde 400 por
    // falta de `nome`. Tratamos como sucesso para não revelar que o email não
    // existe. Quando o backend tornar `nome` opcional (ajuste pendente no
    // peca-backend, descrito no PR deste front), ele já responde 200 nesse caso.
    if (!nome && detalhe && /\bnome\b/i.test(detalhe) && !/\bemail\b/i.test(detalhe)) {
      console.info("[auth] solicitar-codigo sem nome recusado (HTTP 400): tratado como envio neutro")
      return
    }
    console.warn("[auth] solicitar-codigo recusado (HTTP 400)", detalhe)
    throw new ErroApi("Informe um email válido.", 400)
  }

  console.error(`[auth] solicitar-codigo HTTP ${res.status}`, detalhe)
  throw new ErroApi("Não foi possível enviar o código agora.", res.status)
}

/** Etapa 2: troca email + código por um JWT. Lança `ErroApi` com mensagem para o usuário. */
export async function verificarCodigo(email: string, codigo: string): Promise<TokenResponse> {
  const res = await requisicaoApi("/auth/verificar-codigo", { metodo: "POST", json: { email, codigo } })
  if (res.status === 401 || res.status === 400) {
    // 401 cobre código errado, expirado, já usado ou bloqueado após 5 tentativas.
    console.warn(`[auth] código recusado (HTTP ${res.status})`, await detalheDoErro(res))
    throw new ErroApi("Código inválido ou expirado. Confira o email ou peça um novo código.", res.status)
  }
  if (!res.ok) {
    console.error(`[auth] verificar-codigo HTTP ${res.status}`, await detalheDoErro(res))
    throw new ErroApi("Não foi possível entrar na sua conta agora.", res.status)
  }
  return (await res.json()) as TokenResponse
}
