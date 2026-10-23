"use server"

import { redirect } from "next/navigation"

import { verificarCodigo, type TokenResponse } from "@/lib/api/auth"
import { WHATSAPP_VALIDO, atualizarPerfil, soDigitos, type DadosPerfil } from "@/lib/api/perfil"
import { pedirCodigo, resultadoDeErro, type ResultadoAuth } from "@/lib/resultado-auth"
import { destinoSeguro, salvarSessao } from "@/lib/sessao"

type DadosRegisto = DadosPerfil & { email: string }

/**
 * Lê e valida os dados do registo. Mesmas regras do backend, repetidas aqui
 * porque o navegador pode ter sido contornado.
 */
function lerRegisto(formData: FormData): DadosRegisto | { erro: string } {
  const nome = String(formData.get("nome") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  // Aceita "(11) 99999-8888": a API quer só dígitos.
  const whatsapp = soDigitos(formData.get("whatsapp"))

  if (!nome || !email) return { erro: "Informe nome e email." }
  if (nome.length > 120) return { erro: "O nome deve ter no máximo 120 caracteres." }
  if (!WHATSAPP_VALIDO.test(whatsapp)) return { erro: "Informe o WhatsApp com DDD (10 a 13 dígitos)." }
  return { nome, email, whatsapp }
}

/**
 * Etapa 1 do registo (e reenvio): valida os dados e pede o código mandando o
 * nome. O backend só cria a conta quando o código for verificado.
 */
export async function iniciarRegisto(formData: FormData): Promise<ResultadoAuth> {
  const dados = lerRegisto(formData)
  if ("erro" in dados) return { ok: false, erro: dados.erro }
  return pedirCodigo("iniciarRegisto", dados.email, dados.nome)
}

/**
 * Etapa 2 do registo. A verificação do código cria a conta com o nome; o
 * WhatsApp não faz parte do OTP, então é gravado logo depois com o token
 * recém-emitido em `PUT /usuarios/{id}` (só nome e WhatsApp: o email não muda).
 */
export async function confirmarRegisto(formData: FormData): Promise<ResultadoAuth> {
  const dados = lerRegisto(formData)
  if ("erro" in dados) return { ok: false, erro: dados.erro }
  const codigo = String(formData.get("codigo") ?? "").trim()
  if (!/^\d{6}$/.test(codigo)) return { ok: false, erro: "Digite os 6 dígitos do código." }

  let sessao: TokenResponse
  try {
    sessao = await verificarCodigo(dados.email, codigo)
  } catch (erro) {
    return resultadoDeErro("confirmarRegisto", erro)
  }

  // O código já foi consumido: se o PUT falhar, a pessoa entra mesmo assim
  // (sem WhatsApp) em vez de ficar presa num código que não vale mais. Ela
  // pode completar o número no perfil ou ao anunciar.
  let nome = sessao.usuario.nome
  try {
    nome = (await atualizarPerfil(sessao.token, sessao.usuario.id, { nome: dados.nome, whatsapp: dados.whatsapp })).nome
  } catch (erro) {
    console.error("[confirmarRegisto] login feito, mas o perfil não foi salvo", erro)
  }
  await salvarSessao(sessao, nome)

  redirect(destinoSeguro(formData.get("destino")))
}
