'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Fieldset, Legend, Field, Label } from '@/components/catalyst/fieldset'
import { type CaracteristicaProducto } from '@/services/dataService'
import { dataService } from '@/services/dataService'
import { CaracteristicasForm } from '@/components/productos/CaracteristicasForm'

type Producto = {
  id: string
  nombre: string
  caracteristicasPermanentes: Record<string, CaracteristicaProducto>
  caracteristicasSeleccionables: Record<string, CaracteristicaProducto & { activadaPorDefecto: boolean }>
  precioBase?: number
}

export default function EditarProductoPage() {
  const [producto, setProducto] = useState<Producto | null>(null)
  const [nombre, setNombre] = useState('')
  const [caracteristicasPermanentes, setCaracteristicasPermanentes] = useState<Record<string, CaracteristicaProducto>>({})
  const [caracteristicasSeleccionables, setCaracteristicasSeleccionables] = useState<Record<string, CaracteristicaProducto & { activadaPorDefecto: boolean }>>({})
  const [precioBase, setPrecioBase] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const productoData = await dataService.getProductoCaracteristicas(params.id as string)
        if (productoData) {
          setProducto({
            id: params.id as string,
            nombre: productoData.nombre,
            caracteristicasPermanentes: productoData.caracteristicasPermanentes || {},
            caracteristicasSeleccionables: productoData.caracteristicasSeleccionables || {},
            precioBase: productoData.precioBase
          })
          setNombre(productoData.nombre)
          setCaracteristicasPermanentes(productoData.caracteristicasPermanentes || {})
          setCaracteristicasSeleccionables(productoData.caracteristicasSeleccionables || {})
          setPrecioBase(productoData.precioBase)
        }
      } catch (error) {
        console.error('Error al cargar producto:', error)
        setError('Error al cargar el producto')
      } finally {
        setCargando(false)
      }
    }

    if (params.id) {
      cargarProducto()
    }
  }, [params.id])

  const handleGuardar = async () => {
    try {
      setError(null)

      if (!nombre.trim()) {
        setError('El nombre del producto es obligatorio')
        return
      }

      await dataService.actualizarProducto(params.id as string, {
        nombre: nombre.trim(),
        caracteristicasPermanentes,
        caracteristicasSeleccionables,
        precioBase
      })

      router.push(`/dashboard/productos/${params.id}`)
    } catch (error) {
      console.error('Error al guardar producto:', error)
      setError(error instanceof Error ? error.message : 'Error al guardar producto')
    }
  }

  const handleCaracteristicasChange = (
    nuevasCaracteristicasPermanentes: Record<string, CaracteristicaProducto>,
    nuevasCaracteristicasSeleccionables: Record<string, CaracteristicaProducto & { activadaPorDefecto: boolean }>,
    nuevoPrecioBase?: number
  ) => {
    setCaracteristicasPermanentes(nuevasCaracteristicasPermanentes)
    setCaracteristicasSeleccionables(nuevasCaracteristicasSeleccionables)
    setPrecioBase(nuevoPrecioBase)
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
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Editar Producto</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 space-y-6">
        <Fieldset>
          <Legend>Información del Producto</Legend>
          
          <Field className="space-y-2">
            <Label>
              Nombre del Producto
            </Label>
            <Input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Ventana, Puerta, Mampara..."
            />
          </Field>
        </Fieldset>

        <Fieldset>
          <Legend>Características</Legend>
          <CaracteristicasForm
            caracteristicasPermanentes={caracteristicasPermanentes}
            caracteristicasSeleccionables={caracteristicasSeleccionables}
            precioBase={precioBase}
            onChange={handleCaracteristicasChange}
          />
        </Fieldset>

        <div className="flex justify-end gap-3">
          <Button
            onClick={() => router.push(`/dashboard/productos/${producto.id}`)}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button onClick={handleGuardar}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  )
} 