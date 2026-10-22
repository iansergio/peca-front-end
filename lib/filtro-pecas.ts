import type { Peca } from "@/lib/types"

/** Minúsculas e sem acento, para "camera" achar "Câmera". */
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

/**
 * Filtra a listagem por categoria e termo de busca.
 *
 * Feito aqui porque `GET /pecas` só filtra por modelo e preço máximo. O termo
 * é quebrado em palavras e cada uma precisa aparecer em título, modelo ou
 * categoria: assim "tela iphone 12" acha "Tela OLED" de modelo "iPhone 12".
 */
export function filtrarPecas(pecas: Peca[], { valoresApi, termo }: { valoresApi?: string[]; termo?: string }) {
  const categorias = valoresApi ? new Set(valoresApi) : null
  const palavras = termo ? normalizar(termo).split(/\s+/).filter(Boolean) : []

  return pecas.filter((peca) => {
    if (categorias && !categorias.has(peca.categoria)) return false
    if (palavras.length === 0) return true
    const texto = normalizar(`${peca.titulo} ${peca.modeloCelular} ${peca.categoria}`)
    return palavras.every((palavra) => texto.includes(palavra))
  })
}
