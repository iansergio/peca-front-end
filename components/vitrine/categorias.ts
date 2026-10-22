import {
  Antenna,
  Aperture,
  BatteryFull,
  Camera,
  CircuitBoard,
  Ear,
  Fingerprint,
  Frame,
  Microchip,
  Mic,
  PanelBottom,
  PlugZap,
  Headphones,
  Layers,
  Radar,
  Shield,
  Smartphone,
  Speaker,
  Spline,
  ToggleRight,
  Vibrate,
  type LucideIcon,
} from "lucide-react"

export type Categoria = {
  slug: string
  /** Nome exibido na vitrine (plural). */
  nome: string
  /** Valor enviado/recebido pela API (singular, ex: "Tela"). */
  valorApi: string
  icone: LucideIcon
}

// Categorias fixas da vitrine (mesma ordem do mockup).
export const categorias: Categoria[] = [
  { slug: "acessorios", nome: "Acessórios", valorApi: "Acessório", icone: Headphones },
  { slug: "alto-falantes", nome: "Alto-falantes", valorApi: "Alto-falante", icone: Speaker },
  { slug: "antenas", nome: "Antenas", valorApi: "Antena", icone: Antenna },
  { slug: "aros-chassis", nome: "Aros / Chassis", valorApi: "Aro / Chassi", icone: Frame },
  { slug: "auriculares", nome: "Auriculares", valorApi: "Auricular", icone: Ear },
  { slug: "baterias", nome: "Baterias", valorApi: "Bateria", icone: BatteryFull },
  { slug: "biometria", nome: "Biometria", valorApi: "Biometria", icone: Fingerprint },
  { slug: "botoes-laterais", nome: "Botões laterais", valorApi: "Botão lateral", icone: ToggleRight },
  { slug: "cameras", nome: "Câmeras — Frontais e Traseiras", valorApi: "Câmera", icone: Camera },
  { slug: "carcacas", nome: "Carcaças", valorApi: "Carcaça", icone: Shield },
  { slug: "conectores-de-carga", nome: "Conectores de carga", valorApi: "Conector de carga", icone: PlugZap },
  { slug: "flex", nome: "Flex", valorApi: "Flex", icone: Spline },
  { slug: "gavetas-de-chip", nome: "Gavetas de chip", valorApi: "Gaveta de chip", icone: Microchip },
  { slug: "lentes-de-camera", nome: "Lentes de câmera", valorApi: "Lente de câmera", icone: Aperture },
  { slug: "microfones", nome: "Microfones", valorApi: "Microfone", icone: Mic },
  { slug: "motores-de-vibracao", nome: "Motores de vibração", valorApi: "Motor de vibração", icone: Vibrate },
  { slug: "peliculas", nome: "Películas", valorApi: "Película", icone: Layers },
  { slug: "placas-principais", nome: "Placas principais", valorApi: "Placa principal", icone: CircuitBoard },
  { slug: "sensores", nome: "Sensores", valorApi: "Sensor", icone: Radar },
  { slug: "subplacas", nome: "Subplacas", valorApi: "Subplaca", icone: Microchip },
  { slug: "tampas-traseiras", nome: "Tampas traseiras", valorApi: "Tampa traseira", icone: PanelBottom },
  { slug: "telas", nome: "Telas", valorApi: "Tela", icone: Smartphone },
]

export type CategoriaRapida = {
  slug: string
  nome: string
  /** Valores da API que a categoria agrupa (ex: "Placas" = principal + subplaca). */
  valoresApi: string[]
}

/** Atalhos do sub-header: as categorias mais procuradas, algumas agrupadas. */
export const categoriasRapidas: CategoriaRapida[] = [
  { slug: "telas", nome: "Telas", valoresApi: ["Tela"] },
  { slug: "baterias", nome: "Baterias", valoresApi: ["Bateria"] },
  { slug: "peliculas", nome: "Películas", valoresApi: ["Película"] },
  { slug: "cameras", nome: "Câmeras", valoresApi: ["Câmera", "Lente de câmera"] },
  { slug: "placas", nome: "Placas", valoresApi: ["Placa principal", "Subplaca"] },
  { slug: "acessorios", nome: "Acessórios", valoresApi: ["Acessório"] },
]

/**
 * Resolve o `?categoria=` da URL (slug de categoria ou de atalho) para o nome
 * exibido e os valores da API que ele cobre, ou `null` se o slug não existe.
 */
export function resolverCategoria(slug: string | undefined) {
  if (!slug) return null
  const rapida = categoriasRapidas.find((c) => c.slug === slug)
  if (rapida) return { nome: rapida.nome, valoresApi: rapida.valoresApi }
  const categoria = categorias.find((c) => c.slug === slug)
  if (categoria) return { nome: categoria.nome, valoresApi: [categoria.valorApi] }
  return null
}

// Ícone de fallback do card (sem foto). A API usa o singular ("Tela"), mas
// aceitamos também o nome exibido ("Telas") para dados antigos.
export const iconePorCategoria: Record<string, LucideIcon | undefined> =
  Object.fromEntries(
    categorias.flatMap((c) => [
      [c.valorApi, c.icone],
      [c.nome, c.icone],
    ])
  )
