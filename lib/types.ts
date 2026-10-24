/** Anunciante da peça, como retornado pela API. */
export type Vendedor = {
  id: string
  nome: string
  /** Número no formato internacional, só dígitos (ex: "5511999999999"). */
  whatsapp: string
}

export type Condicao = "Nova" | "Original" | "Retirada" | "Usada"

/** Peça retornada por `GET {API_URL}/pecas` e `GET {API_URL}/pecas/{id}`. */
export type Peca = {
  id: string
  titulo: string
  /** Opcional no anúncio: pode vir nula ou vazia. */
  descricao: string | null
  /** Preço em reais. */
  preco: number
  /** Nome da categoria, igual ao exibido na vitrine (ex: "Telas"). */
  categoria: string
  modeloCelular: string
  /**
   * Selo de condição do DS. Ainda não existe no backend: fica opcional e o
   * cartão só mostra o selo quando a API mandar o campo.
   */
  condicao?: Condicao | null
  imagemUrl: string | null
  vendedor: Vendedor | null
}
