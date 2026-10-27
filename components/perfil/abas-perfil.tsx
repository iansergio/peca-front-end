"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type Aba = "dados" | "anuncios"

const classeAba =
  "h-11 flex-1 text-base font-semibold text-tinta-suave hover:text-tinta data-active:text-marca group-data-horizontal/tabs:after:bottom-[-4px] after:bg-marca sm:flex-none sm:px-4"

/**
 * Abas do perfil. A aba ativa fica na URL (`?aba=anuncios`) para o link
 * "Meus anúncios" do menu cair direto nela e o "voltar" da edição também.
 * Os dois painéis chegam prontos do servidor; trocar de aba não refaz busca.
 */
export function AbasPerfil({
  abaInicial,
  dados,
  anuncios,
}: {
  abaInicial: Aba
  dados: React.ReactNode
  anuncios: React.ReactNode
}) {
  return (
    <Tabs
      defaultValue={abaInicial}
      onValueChange={(aba) => {
        // Só atualiza o endereço (sem navegar): o Next sincroniza com o histórico.
        const url = aba === "anuncios" ? "/perfil?aba=anuncios" : "/perfil"
        window.history.replaceState(null, "", url)
      }}
      className="gap-6"
    >
      <TabsList variant="line" className="w-full justify-start border-b border-borda group-data-horizontal/tabs:h-11">
        <TabsTrigger value="dados" className={classeAba}>
          Meus dados
        </TabsTrigger>
        <TabsTrigger value="anuncios" className={classeAba}>
          Meus anúncios
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dados">{dados}</TabsContent>
      <TabsContent value="anuncios">{anuncios}</TabsContent>
    </Tabs>
  )
}
