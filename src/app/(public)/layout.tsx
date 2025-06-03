export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-auto"
              />
              <span className="ml-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Presupuestos Online
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="py-10">
        {children}
      </main>

      <footer className="bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
} 