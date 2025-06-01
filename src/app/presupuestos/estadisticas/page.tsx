'use client'

export default function EstadisticasPresupuestosPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Estadísticas de Presupuestos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Presupuestos por Mes</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Gráfico de presupuestos por mes</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Productos más Vendidos</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Lista de productos más vendidos</p>
        </div>
      </div>
    </div>
  )
} 