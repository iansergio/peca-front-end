import type { Metadata } from "next";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { UserXIcon } from "lucide-react";

import type { Usuario } from "@/lib/api/auth";
import { FormularioPerfil, FormularioPerfilCarregando } from "@/components/perfil/formulario-perfil";
import { ErroApi } from "@/lib/api/erros";
import { buscarMeuPerfil } from "@/lib/api/perfil";
import { lerSessao } from "@/lib/sessao";

export const metadata: Metadata = {
  title: "Meu perfil - PEÇA",
};

export default function PerfilPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Meu perfil</h1>
      <p className="mt-1 mb-6 text-muted-foreground">
        Seu nome e WhatsApp aparecem para os compradores nos seus anúncios.
      </p>
      <div className="rounded-2xl border bg-card p-4 md:p-6">
        {/* Lê o cookie e chama o backend: com Cache Components, fica atrás do Suspense. */}
        <Suspense fallback={<FormularioPerfilCarregando />}>
          <PerfilDoUsuario />
        </Suspense>
      </div>
    </div>
  );
}

async function PerfilDoUsuario() {
  const sessao = await lerSessao();
  // O Proxy já redireciona quem não tem cookie; aqui cobre o token expirado.
  if (!sessao) redirect("/login?destino=/perfil");

  let perfil: Usuario;
  try {
    perfil = await buscarMeuPerfil(sessao.token);
  } catch (erro) {
    unstable_rethrow(erro);
    const sessaoInvalida = erro instanceof ErroApi && (erro.status === 401 || erro.status === 404);
    if (!(erro instanceof ErroApi)) console.error("[perfil] falha ao conectar no backend", erro);
    return (
      <div role="status" className="flex flex-col items-center gap-2 py-6 text-center">
        <UserXIcon className="size-8 text-muted-foreground" aria-hidden />
        <p className="font-semibold">
          {sessaoInvalida ? "Sua sessão expirou." : "Não foi possível carregar o seu perfil agora."}
        </p>
        <p className="text-sm text-muted-foreground">
          {sessaoInvalida ? "Entre novamente para ver e editar o seu perfil." : "Tente novamente em alguns minutos."}
        </p>
        {sessaoInvalida && (
          <Link
            href="/login?destino=/perfil"
            className="mt-1 inline-flex h-11 items-center font-bold text-destaque underline underline-offset-4 hover:text-marca"
          >
            Entrar
          </Link>
        )}
      </div>
    );
  }
  return <FormularioPerfil perfil={perfil} />;
}
