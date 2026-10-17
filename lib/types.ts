/** Anunciante da peça, como retornado pela API. */
export type Usuario = {
  nome: string
  /** Número no formato internacional, só dígitos (ex: "5511999999999"). */
  whatsapp: string
}

/** Peça retornada por `GET {API_URL}/pecas`. */
export type Peca = {
  id: string
  titulo: string
  descricao: string
  /** Preço em reais. */
  preco: number
  /** Nome da categoria, igual ao exibido na vitrine (ex: "Telas"). */
  categoria: string
  modeloCelular: string
  imagemUrl: string | null
  usuario: Usuario
}
