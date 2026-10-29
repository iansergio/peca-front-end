import { connection } from "next/server"

import { urlDaApi } from "@/lib/api/cliente"

/**
 * Fotos dos anúncios (`/imagens/{pasta}/{arquivo}`). O backend grava as fotos no disco
 * e salva o `imagemUrl` com este caminho relativo; aqui o front repassa o pedido para
 * `GET /api/imagens/...`. Assim o navegador continua sem falar com o backend, e o
 * next/image otimiza as fotos como imagens locais.
 */
export async function GET(_request: Request, { params }: RouteContext<"/imagens/[pasta]/[arquivo]">) {
  await connection()
  const { pasta, arquivo } = await params

  let res: Response
  try {
    res = await fetch(`${urlDaApi()}/imagens/${encodeURIComponent(pasta)}/${encodeURIComponent(arquivo)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
  } catch (erro) {
    console.error("[imagens] falha ao buscar a imagem no backend", erro)
    return new Response(null, { status: 502 })
  }

  if (!res.ok || !res.body) {
    return new Response(null, { status: res.status === 404 ? 404 : 502 })
  }
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
      // O nome do arquivo é único (UUID): a foto nunca muda nesse endereço.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
