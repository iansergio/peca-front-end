/** Formato esperado de uma peça retornada pela API REST do backend. */
export type Peca = {
  id: string
  titulo: string
  /** Preço em reais. */
  preco: number
  /** Etiqueta curta exibida no card (ex: "Tela", "Bateria"). */
  categoria: string
  condicao: string
  detalhe: string
  modeloCelular: string
}
