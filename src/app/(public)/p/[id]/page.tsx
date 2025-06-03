'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { dataService } from '@/services/dataService'
import { PresupuestoClienteView } from '@/components/presupuestos/PresupuestoClienteView'

export default function PresupuestoPublicoPage() {
  const [presupuesto, setPresupuesto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)
  const params = useParams()

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
      setGuardadoExitoso(false)
      await dataService.actualizarPresupuesto(presupuesto.id, presupuestoActualizado)
      setPresupuesto(presupuestoActualizado)
      setGuardadoExitoso(true)
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setGuardadoExitoso(false)
      }, 3000)
    } catch (error) {
      console.error('Error al guardar el presupuesto:', error)
      setError('Error al guardar los cambios')
    }
  }

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Cargando presupuesto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-lg text-center">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!presupuesto) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-6 rounded-lg text-center">
          <h2 className="text-lg font-semibold mb-2">Presupuesto no encontrado</h2>
          <p>El presupuesto que estás buscando no existe o ha sido eliminado.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {guardadoExitoso && (
        <div className="fixed top-4 right-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-6 py-3 rounded-lg shadow-lg">
          ✓ Cambios guardados correctamente
        </div>
      )}
      <PresupuestoClienteView 
        presupuesto={presupuesto} 
        onGuardar={handleGuardar} 
      />
    </>
  )
} 