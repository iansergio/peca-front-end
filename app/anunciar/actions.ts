"use server"

import { criarAnuncio, type ResultadoAnuncio } from "@/lib/api/anuncios"
import { encerrarSessao, lerSessao } from "@/lib/sessao"
import { lerFormularioAnuncio } from "@/lib/validar-anuncio"

export async function publicarAnuncio(formData: FormData): Promise<ResultadoAnuncio> {
  // O Proxy já barra quem não está logado, mas a action pode ser chamada
  // direto (ou o token pode ter expirado com o formulário aberto).
  const sessao = await lerSessao()
  if (!sessao) return { ok: false, erro: "Sua sessão expirou. Entre novamente.", precisaLogin: true }

  const lido = lerFormularioAnuncio(formData, { fotoObrigatoria: true })
  if (!lido.ok) return lido

  const resultado = await criarAnuncio(sessao.token, lido.dados, lido.foto as File)
  // Token recusado pelo backend: apaga o cookie para o header não mostrar
  // uma sessão que já não vale.
  if (resultado.ok === false && resultado.precisaLogin) await encerrarSessao()
  return resultado
}
