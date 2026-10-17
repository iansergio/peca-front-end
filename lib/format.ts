const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Formata um valor em reais, omitindo centavos quando o valor é inteiro (ex: "R$ 1.790"). */
export function formatarPreco(valor: number) {
  return brl.format(valor)
}
