"use server"

import type { Usuario } from "@/lib/api/auth"
import { ErroApi } from "@/lib/api/erros"
import { WHATSAPP_VALIDO, atualizarPerfil, soDigitos } from "@/lib/api/perfil"
import { atualizarNomeSessao, encerrarSessao, lerSessao } from "@/lib/sessao"

export type ResultadoPerfil =
  | { ok: true; perfil: Usuario }
  /** `precisaLogin`: a sessão não vale mais; é preciso entrar de novo. */
  | { ok: false; erro: string; precisaLogin?: true }

export async function salvarPerfil(formData: FormData): Promise<ResultadoPerfil> {
  // O Proxy já barra quem não está logado, mas a action pode ser chamada direto.
  const sessao = await lerSessao()
  if (!sessao) return { ok: false, erro: "Sua sessão expirou. Entre novamente.", precisaLogin: true }

  // Mesmas regras do `UsuarioRequest` do backend, repetidas porque o navegador
  // pode ter sido contornado. O email não é lido: ele não pode ser alterado aqui.
  const nome = String(formData.get("nome") ?? "").trim()
  const whatsapp = soDigitos(formData.get("whatsapp"))
  if (!nome) return { ok: false, erro: "Informe o seu nome." }
  if (nome.length > 120) return { ok: false, erro: "O nome deve ter no máximo 120 caracteres." }
  if (!WHATSAPP_VALIDO.test(whatsapp)) return { ok: false, erro: "Informe o WhatsApp com DDD (10 a 13 dígitos)." }

  try {
    const perfil = await atualizarPerfil(sessao.token, sessao.usuarioId, { nome, whatsapp })
    // O header mostra o nome do cookie: atualiza para refletir a edição.
    await atualizarNomeSessao(sessao, perfil.nome)
    return { ok: true, perfil }
  } catch (erro) {
    if (erro instanceof ErroApi) {
      if (erro.status === 401 || erro.status === 403 || erro.status === 404) {
        await encerrarSessao()
        return { ok: false, erro: erro.message, precisaLogin: true }
      }
      return { ok: false, erro: erro.message }
    }
    console.error("[salvarPerfil] falha ao conectar no backend", erro)
    return { ok: false, erro: "Não foi possível conectar ao servidor. Tente novamente." }
  }
}
