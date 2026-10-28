import { headers } from "next/headers"

/**
 * IP de quem está usando o site, para o backend aplicar o limite por IP do OTP
 * (o front chama o backend pelo servidor, então o backend só veria o IP do front).
 *
 * Usa a entrada mais à DIREITA do `X-Forwarded-For`. O front-end do Azure App
 * Service não sobrescreve o header: ele ACRESCENTA no fim o endereço de quem
 * abriu a conexão, às vezes com porta ("203.0.113.7:51234"). As entradas da
 * esquerda vêm do próprio navegador e podem ser forjadas, então só a última é
 * confiável (o front é acessado direto, sem outro proxy na frente). Por isso a
 * porta é removida antes de repassar ao backend.
 * Em desenvolvimento (sem proxy) e no health check da plataforma, que chega
 * sem o header, devolve `null`.
 */
export async function ipDoVisitante() {
  const valor = (await headers()).get("x-forwarded-for")
  const ultimo = valor?.split(",").at(-1)?.trim()
  if (!ultimo) return null

  // "[2001:db8::1]:443" ou "203.0.113.7:51234" -> só o endereço.
  const ipv6ComPorta = /^\[([^\]]+)\](?::\d+)?$/.exec(ultimo)
  if (ipv6ComPorta) return ipv6ComPorta[1]
  const ipv4ComPorta = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/.exec(ultimo)
  return ipv4ComPorta ? ipv4ComPorta[1] : ultimo
}
