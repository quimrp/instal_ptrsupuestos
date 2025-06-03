'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { dataService } from '@/services/dataService'
import { PresupuestoClienteView } from '@/components/presupuestos/PresupuestoClienteView'

export default function PresupuestoClientePage() {
  const [presupuesto, setPresupuesto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const cargarPresupuesto = async () => {
      try {
        if (typeof params.id !== 'string') return

        const data = await dataService.getPresupuesto(params.id)
        if (data) {
          setPresupuesto(data)
        } else {
          setError('No se encontró el presupuesto')
        }
      } catch (error) {
        console.error('Error al cargar el presupuesto:', error)
        setError('Error al cargar el presupuesto')
      } finally {
        setCargando(false)
      }
    }

    cargarPresupuesto()
  }, [params.id])

  const handleGuardar = async (presupuestoActualizado) => {
    try {
      await dataService.actualizarPresupuesto(presupuesto.id, presupuestoActualizado)
      router.push(`/presupuestos/${presupuesto.id}`)
    } catch (error) {
      console.error('Error al guardar el presupuesto:', error)
      setError('Error al guardar los cambios')
    }
  }

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">Cargando presupuesto...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!presupuesto) {
    return null
  }

  return <PresupuestoClienteView presupuesto={presupuesto} onGuardar={handleGuardar} />
} 