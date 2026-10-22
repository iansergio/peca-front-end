import { ErroApi, detalheDoErro } from "@/lib/api/erros"

/** Perfil resumido devolvido pela API (`UsuarioResponse`). */
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

export type DadosPerfil = {
  nome: string
  email: string
  /** Só dígitos, com DDD. */
  whatsapp: string
}

function apiUrl() {
  const url = process.env.API_URL
  if (!url) {
    console.error("[auth] variável de ambiente API_URL não definida")
    throw new ErroApi("O serviço de contas não está configurado.")
  }
  return url
}

/**
 * Etapa 1 do login OTP: pede ao backend que envie um código de 6 dígitos para
 * o email. Se o email ainda não tem conta, o backend cria uma na hora (com um
 * nome provisório tirado do email), por isso não existe "email não encontrado".
 */
export async function solicitarCodigo(email: string) {
  const res = await fetch(`${apiUrl()}/auth/solicitar-codigo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  })
  if (res.status === 400) {
    console.warn("[auth] solicitar-codigo recusado (HTTP 400)", await detalheDoErro(res))
    throw new ErroApi("Informe um email válido.")
  }
  if (!res.ok) {
    console.error(`[auth] solicitar-codigo HTTP ${res.status}`, await detalheDoErro(res))
    throw new ErroApi("Não foi possível enviar o código agora.")
  }
}

/** Etapa 2: troca email + código por um JWT. Lança `ErroApi` com mensagem para o usuário. */
export async function verificarCodigo(email: string, codigo: string): Promise<TokenResponse> {
  const res = await fetch(`${apiUrl()}/auth/verificar-codigo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, codigo }),
    cache: "no-store",
  })
  if (res.status === 401 || res.status === 400) {
    // 401 cobre código errado, expirado, já usado ou bloqueado após 5 tentativas.
    console.warn(`[auth] código recusado (HTTP ${res.status})`, await detalheDoErro(res))
    throw new ErroApi("Código inválido ou expirado. Confira o email ou peça um novo código.")
  }
  if (!res.ok) {
    console.error(`[auth] verificar-codigo HTTP ${res.status}`, await detalheDoErro(res))
    throw new ErroApi("Não foi possível entrar na sua conta agora.")
  }
  return (await res.json()) as TokenResponse
}

/** Atualiza o perfil do próprio usuário em `PUT /usuarios/{id}`. */
export async function atualizarPerfil(token: string, id: string, dados: DadosPerfil): Promise<Usuario> {
  const res = await fetch(`${apiUrl()}/usuarios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
    cache: "no-store",
  })
  if (!res.ok) {
    const detalhe = await detalheDoErro(res)
    console.error(`[auth] atualizar perfil HTTP ${res.status}`, detalhe)
    throw new ErroApi(
      res.status === 400 && detalhe
        ? `Verifique os seus dados (${detalhe}).`
        : "Não foi possível salvar os seus dados agora."
    )
  }
  return (await res.json()) as Usuario
}
