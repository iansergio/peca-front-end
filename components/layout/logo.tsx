import { cn } from "@/lib/utils"

/**
 * Logo PEÇA (docs/Logo.png): celular com engrenagem e o nome em letras largas.
 * Versão para fundo `marca`, em branco. Abaixo de 96px de largura o DS pede só
 * o símbolo; no celular o subtítulo some para caber o header numa linha.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 text-white", className)}>
      <svg viewBox="0 0 32 40" className="h-9 w-auto shrink-0" fill="none" aria-hidden>
        {/* Celular */}
        <path
          d="M20 37H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v19"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M11 7.5h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* Engrenagem no canto inferior direito */}
        <g transform="translate(25 32)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angulo) => (
            <rect
              key={angulo}
              x="-1.25"
              y="-6.5"
              width="2.5"
              height="3"
              rx="0.5"
              fill="currentColor"
              transform={`rotate(${angulo})`}
            />
          ))}
          <circle r="4" stroke="currentColor" strokeWidth="2.2" />
        </g>
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-2xl font-extrabold tracking-wider">PEÇA</span>
        <span className="mt-0.5 hidden text-[0.5rem] font-bold tracking-[0.3em] sm:block">
          PEÇAS PARA CELULAR
        </span>
      </span>
    </span>
  )
}
