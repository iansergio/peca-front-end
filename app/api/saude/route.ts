import { connection } from "next/server"

/**
 * Health check do App Service (`/api/saude`). Não chama o backend: só diz que
 * o servidor Node está de pé, para uma queda da API não derrubar o front.
 *
 * `connection()` faz a rota rodar a cada requisição: sem ele, com Cache
 * Components, o GET seria pré-renderizado no build e responderia mesmo com o
 * servidor travado.
 */
export async function GET() {
  await connection()
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } })
}
