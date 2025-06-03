'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/catalyst/button'
import { PencilIcon } from '@heroicons/react/20/solid'
import { type CaracteristicaProducto } from '@/services/dataService'
import { dataService } from '@/services/dataService'

type Producto = {
  id: string
  nombre: string
  caracteristicasPermanentes: Record<string, CaracteristicaProducto>
  caracteristicasSeleccionables: Record<string, CaracteristicaProducto>
  precioBase?: number
}

export default function DetalleProductoPage() {
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cargando, setCargando] = useState(true)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    cargarProducto()
  }, [params.id])

  const cargarProducto = () => {
    if (typeof params.id !== 'string') return

    const productoData = dataService.getProductoCaracteristicas(params.id)
    if (productoData) {
      setProducto({
        id: params.id,
        nombre: productoData.nombre,
        caracteristicasPermanentes: productoData.caracteristicasPermanentes || {},
        caracteristicasSeleccionables: productoData.caracteristicasSeleccionables || {},
        precioBase: productoData.precioBase
      })
    } else {
      router.push('/dashboard/productos')
    }
    setCargando(false)
  }

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">Cargando producto...</div>
      </div>
    )
  }

  if (!producto) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{producto.nombre}</h1>
          {producto.precioBase !== undefined && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-1">
              Precio Base: {producto.precioBase}€
            </p>
          )}
        </div>
        <Button
          onClick={() => router.push(`/dashboard/productos/${producto.id}/editar`)}
          className="gap-2"
        >
          <PencilIcon className="h-5 w-5" />
          Editar Producto
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Características Permanentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(producto.caracteristicasPermanentes).map(([nombre, caracteristica]) => (
            <div key={nombre} className="bg-zinc-50 dark:bg-zinc-700/50 p-4 rounded-lg">
              <p className="font-medium">{caracteristica.label}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {caracteristica.tipo === 'select' && (
                  <>Opciones: {caracteristica.opciones?.join(', ')}</>
                )}
                {caracteristica.tipo === 'number' && (
                  <>Rango: {caracteristica.min} - {caracteristica.max}</>
                )}
                {caracteristica.tipo === 'text' && (
                  <>Tipo: Texto</>
                )}
                {caracteristica.precioBase !== undefined && (
                  <><br />Precio Base: {caracteristica.precioBase}€</>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Características Seleccionables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(producto.caracteristicasSeleccionables).map(([nombre, caracteristica]) => (
            <div key={nombre} className="bg-zinc-50 dark:bg-zinc-700/50 p-4 rounded-lg">
              <p className="font-medium">{caracteristica.label}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {caracteristica.tipo === 'select' && (
                  <>Opciones: {caracteristica.opciones?.join(', ')}</>
                )}
                {caracteristica.tipo === 'number' && (
                  <>Rango: {caracteristica.min} - {caracteristica.max}</>
                )}
                {caracteristica.tipo === 'text' && (
                  <>Tipo: Texto</>
                )}
                {caracteristica.precioBase !== undefined && (
                  <><br />Precio Base: {caracteristica.precioBase}€</>
                )}
                {caracteristica.activadaPorDefecto && (
                  <><br />Activada por defecto</>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 