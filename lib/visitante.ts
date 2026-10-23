import { headers } from "next/headers"

/**
 * IP de quem está usando o site, para o backend aplicar o limite por IP do OTP
 * (o front chama o backend pelo servidor, então o backend só veria o IP do front).
 *
 * Usa a entrada mais à DIREITA do `X-Forwarded-For`: é a que o proxy do
 * Azure App Service acrescenta com o IP real. As da esquerda vêm do próprio
 * cliente e podem ser forjadas. O App Service manda "ip:porta"; a porta é
 * removida. Em desenvolvimento (sem proxy) devolve `null`.
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
