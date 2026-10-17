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
  /** Nome exibido na vitrine (plural). */
  nome: string
  /** Valor enviado/recebido pela API (singular, ex: "Tela"). */
  valorApi: string
  icone: LucideIcon
}

// Categorias fixas da vitrine (mesma ordem do mockup).
export const categorias: Categoria[] = [
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
  { slug: "placas-principais", nome: "Placas principais", valorApi: "Placa principal", icone: CircuitBoard },
  { slug: "sensores", nome: "Sensores", valorApi: "Sensor", icone: Radar },
  { slug: "subplacas", nome: "Subplacas", valorApi: "Subplaca", icone: Microchip },
  { slug: "tampas-traseiras", nome: "Tampas traseiras", valorApi: "Tampa traseira", icone: PanelBottom },
  { slug: "telas", nome: "Telas", valorApi: "Tela", icone: Smartphone },
]

// Ícone de fallback do card (sem foto). A API usa o singular ("Tela"), mas
// aceitamos também o nome exibido ("Telas") para dados antigos.
export const iconePorCategoria: Record<string, LucideIcon | undefined> =
  Object.fromEntries(
    categorias.flatMap((c) => [
      [c.valorApi, c.icone],
      [c.nome, c.icone],
    ])
  )
