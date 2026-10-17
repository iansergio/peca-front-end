import { formatarPreco } from "@/lib/format"
import type { Peca } from "@/lib/types"

/** Remove tudo que não for dígito (espaços, parênteses, traços, "+", etc.). */
export function formatarTelefone(telefone: string) {
  return telefone.replace(/\D/g, "")
}

/**
 * Normaliza o número para o formato aceito pelo wa.me (DDI + DDD + número, só
 * dígitos) ou retorna `null` se ele não for utilizável.
 *
 * - 10 ou 11 dígitos: número brasileiro sem DDI (DDD + 8/9 dígitos), então
 *   prefixamos "55", já que o marketplace é nacional.
 * - 12 a 15 dígitos: já vem com DDI (15 é o máximo do padrão E.164).
 * - Qualquer outro tamanho é considerado inválido.
 */
export function normalizarWhatsapp(telefone: string | null | undefined) {
  if (!telefone) return null
  const digitos = formatarTelefone(telefone)
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`
  if (digitos.length >= 12 && digitos.length <= 15) return digitos
  return null
}

/** Gera o link do WhatsApp com a mensagem de interesse, ou `null` se o vendedor não tiver número válido. */
export function gerarLinkWhatsapp(peca: Peca) {
  const numero = normalizarWhatsapp(peca.vendedor?.whatsapp)
  if (!numero) return null

  const nome = peca.vendedor?.nome
  const saudacao = nome ? `Olá ${nome}!` : "Olá!"
  // Intl usa espaço não separável depois de "R$"; trocamos por um espaço comum.
  const preco = formatarPreco(peca.preco).replace(/\s/g, " ")
  const mensagem = `${saudacao} Tenho interesse na peça '${peca.titulo}' que está anunciada por ${preco} no PEÇA.`

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}
