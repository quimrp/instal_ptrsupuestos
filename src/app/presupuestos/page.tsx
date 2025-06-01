import Link from 'next/link'
import { Button } from '@/components/catalyst/button'
import { PlusIcon } from '@heroicons/react/20/solid'

export default function PresupuestosPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Presupuestos</h1>
        <Link href="/presupuestos/nuevo">
          <Button>
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Presupuesto
          </Button>
        </Link>
      </div>
      <div className="grid gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
          <p className="text-zinc-600 dark:text-zinc-400">Lista de presupuestos</p>
        </div>
      </div>
    </div>
  )
} 