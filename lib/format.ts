const brlInteiro = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

const brlCentavos = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

/** Formata um valor em reais, omitindo centavos só quando o valor é inteiro (ex: "R$ 1.790", "R$ 119,50"). */
export function formatarPreco(valor: number) {
  return (Number.isInteger(valor) ? brlInteiro : brlCentavos).format(valor)
}
