import type { Peca } from "@/lib/types"

// Dados mockados até a integração com a API (Fase 4).
export const pecasDestaque: Peca[] = [
  {
    id: "1",
    titulo: "Tela para iPhone 13",
    preco: 289,
    categoria: "Tela",
    condicao: "Nova",
    detalhe: "pronta entrega",
    modeloCelular: "iPhone 13",
  },
  {
    id: "2",
    titulo: "Bateria Samsung S21 FE",
    preco: 119,
    categoria: "Bateria",
    condicao: "Nova",
    detalhe: "garantia",
    modeloCelular: "Samsung Galaxy S21 FE",
  },
  {
    id: "3",
    titulo: "Conector USB-C Galaxy A54",
    preco: 69,
    categoria: "Conector",
    condicao: "Peça de reposição",
    detalhe: "",
    modeloCelular: "Samsung Galaxy A54",
  },
  {
    id: "4",
    titulo: "iPhone 12 usado",
    preco: 1790,
    categoria: "Celular",
    condicao: "128 GB",
    detalhe: "bom estado",
    modeloCelular: "iPhone 12",
  },
]
