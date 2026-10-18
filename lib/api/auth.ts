import { ErroApi, detalheDoErro } from "@/lib/api/erros"

/** Resposta de `POST /auth/login`. */
export type TokenResponse = {
  token: string
  tipo: string
  /** ISO 8601. */
  expiraEm: string
  usuarioId: string
}

export type DadosCadastro = {
  nome: string
  email: string
  senha: string
  /** Só dígitos, com DDD. Opcional. */
  whatsapp?: string
}

function apiUrl() {
  const url = process.env.API_URL
  if (!url) {
    console.error("[auth] variável de ambiente API_URL não definida")
    throw new ErroApi("O serviço de contas não está configurado.")
  }
  return url
}

/** Troca email e senha por um JWT. Lança `ErroApi` com mensagem para o usuário. */
export async function login(email: string, senha: string): Promise<TokenResponse> {
  const res = await fetch(`${apiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
    cache: "no-store",
  })
  if (res.status === 401 || res.status === 400) {
    console.warn(`[auth] login recusado (HTTP ${res.status})`, await detalheDoErro(res))
    throw new ErroApi("Email ou senha inválidos.")
  }
  if (!res.ok) {
    console.error(`[auth] login HTTP ${res.status}`, await detalheDoErro(res))
    throw new ErroApi("Não foi possível entrar na sua conta agora.")
  }
  return (await res.json()) as TokenResponse
}

/** Cria a conta em `POST /usuarios` (cadastro público, sem token). */
export async function cadastrar(dados: DadosCadastro) {
  const res = await fetch(`${apiUrl()}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
    cache: "no-store",
  })
  if (res.status === 409) throw new ErroApi("Já existe uma conta com esse email.")
  if (!res.ok) {
    const detalhe = await detalheDoErro(res)
    console.error(`[auth] cadastro HTTP ${res.status}`, detalhe)
    throw new ErroApi(
      res.status === 400 && detalhe
        ? `Verifique os seus dados (${detalhe}).`
        : "Não foi possível criar a sua conta agora."
    )
  }
}
