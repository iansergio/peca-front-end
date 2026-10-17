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
  nome: string
  icone: LucideIcon
}

// Categorias fixas da vitrine (mesma ordem do mockup).
export const categorias: Categoria[] = [
  { slug: "alto-falantes", nome: "Alto-falantes", icone: Speaker },
  { slug: "antenas", nome: "Antenas", icone: Antenna },
  { slug: "aros-chassis", nome: "Aros / Chassis", icone: Frame },
  { slug: "auriculares", nome: "Auriculares", icone: Ear },
  { slug: "baterias", nome: "Baterias", icone: BatteryFull },
  { slug: "biometria", nome: "Biometria", icone: Fingerprint },
  { slug: "botoes-laterais", nome: "Botões laterais", icone: ToggleRight },
  { slug: "cameras", nome: "Câmeras — Frontais e Traseiras", icone: Camera },
  { slug: "carcacas", nome: "Carcaças", icone: Shield },
  { slug: "conectores-de-carga", nome: "Conectores de carga", icone: PlugZap },
  { slug: "flex", nome: "Flex", icone: Spline },
  { slug: "gavetas-de-chip", nome: "Gavetas de chip", icone: Microchip },
  { slug: "lentes-de-camera", nome: "Lentes de câmera", icone: Aperture },
  { slug: "microfones", nome: "Microfones", icone: Mic },
  { slug: "motores-de-vibracao", nome: "Motores de vibração", icone: Vibrate },
  { slug: "placas-principais", nome: "Placas principais", icone: CircuitBoard },
  { slug: "sensores", nome: "Sensores", icone: Radar },
  { slug: "subplacas", nome: "Subplacas", icone: Microchip },
  { slug: "tampas-traseiras", nome: "Tampas traseiras", icone: PanelBottom },
  { slug: "telas", nome: "Telas", icone: Smartphone },
]

// Ícone de fallback do card (sem foto), indexado pelo nome da categoria vindo da API.
export const iconePorCategoria: Record<string, LucideIcon | undefined> =
  Object.fromEntries(categorias.map((c) => [c.nome, c.icone]))
