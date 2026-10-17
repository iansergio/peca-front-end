export async function SiteFooter() {
  // Com Cache Components, `new Date()` precisa estar em um escopo cacheado
  // para que o footer continue sendo prerenderizado estaticamente.
  "use cache"

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} PEÇA • Marketplace de peças de celular
      </div>
    </footer>
  )
}
