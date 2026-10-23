import type { Usuario } from "@/lib/api/auth"
import { requisicaoApi } from "@/lib/api/cliente"
import { ErroApi, detalheDoErro } from "@/lib/api/erros"

/** Campos editáveis do perfil. O email é a identidade confirmada por OTP e não muda aqui. */
export type DadosPerfil = {
  nome: string
  /** Só dígitos, com DDD. */
  whatsapp: string
}

/** Mesma regra do backend (`UsuarioRequest` e `PecaRequest`): 10 a 13 dígitos. */
export const WHATSAPP_VALIDO = /^\d{10,13}$/

/** Remove máscara ("(11) 99999-8888" vira "11999998888"). */
export function soDigitos(valor: FormDataEntryValue | null) {
  return String(valor ?? "").replace(/\D/g, "")
}

/**
 * Perfil do dono do token (`GET /usuarios/me`).
 * Lança `ErroApi` com `status` 401/404 quando a sessão não vale mais.
 */
export async function buscarMeuPerfil(token: string): Promise<Usuario> {
  const res = await requisicaoApi("/usuarios/me", { token })
  if (res.status === 401 || res.status === 404) {
    // 404: o usuário do token foi removido.
    console.warn(`[perfil] GET /usuarios/me HTTP ${res.status}`)
    throw new ErroApi("Sua sessão expirou. Entre novamente.", res.status)
  }
  if (!res.ok) {
    console.error(`[perfil] GET /usuarios/me HTTP ${res.status}`, await detalheDoErro(res))
    throw new ErroApi("Não foi possível carregar o seu perfil agora.", res.status)
  }
  return (await res.json()) as Usuario
}

/** Atualiza nome e WhatsApp em `PUT /usuarios/{id}` (só vale para o próprio usuário). */
export async function atualizarPerfil(token: string, id: string, dados: DadosPerfil): Promise<Usuario> {
  const res = await requisicaoApi(`/usuarios/${id}`, { metodo: "PUT", token, json: dados })
  if (res.ok) return (await res.json()) as Usuario

  const detalhe = await detalheDoErro(res)
  console.error(`[perfil] PUT /usuarios/${id} HTTP ${res.status}`, detalhe)
  if (res.status === 401 || res.status === 403 || res.status === 404) {
    throw new ErroApi("Sua sessão expirou. Entre novamente.", res.status)
  }
  throw new ErroApi(
    res.status === 400 && detalhe ? `Verifique os seus dados (${detalhe}).` : "Não foi possível salvar os seus dados agora.",
    res.status
  )
}
