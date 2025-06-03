'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Fieldset, Legend, Field, Label } from '@/components/catalyst/fieldset'
import { type CaracteristicaPermanente, type CaracteristicaSeleccionable } from '@/services/dataService'
import { dataService } from '@/services/dataService'
import { CaracteristicasForm } from '@/components/productos/CaracteristicasForm'

export default function NuevoProductoPage() {
  const [nombre, setNombre] = useState('')
  const [caracteristicasPermanentes, setCaracteristicasPermanentes] = useState<Record<string, CaracteristicaPermanente>>({})
  const [caracteristicasSeleccionables, setCaracteristicasSeleccionables] = useState<Record<string, CaracteristicaSeleccionable>>({})
  const [precioBase, setPrecioBase] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [imagen, setImagen] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const router = useRouter()

  const handleGuardar = async () => {
    try {
      setError(null)

      if (!nombre.trim()) {
        setError('El nombre del producto es obligatorio')
        return
      }

      await dataService.crearProducto(nombre.trim(), {
        caracteristicasPermanentes,
        caracteristicasSeleccionables,
        precioBase,
        imagen
      })
      router.push('/dashboard/productos')
    } catch (error) {
      console.error('Error al crear producto:', error)
      setError(error instanceof Error ? error.message : 'Error al crear producto')
    }
  }

  const handleCaracteristicasChange = (
    nuevasCaracteristicasPermanentes: Record<string, CaracteristicaPermanente>,
    nuevasCaracteristicasSeleccionables: Record<string, CaracteristicaSeleccionable>,
    nuevoPrecioBase?: number
  ) => {
    setCaracteristicasPermanentes(nuevasCaracteristicasPermanentes)
    setCaracteristicasSeleccionables(nuevasCaracteristicasSeleccionables)
    setPrecioBase(nuevoPrecioBase)
  }

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImagen(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
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

          <Field className="space-y-2">
            <Label>Imagen del Producto</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
            />
            {preview && (
              <img src={preview} alt="Previsualización" className="mt-2 max-h-40 rounded shadow" />
            )}
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
            onClick={() => router.push('/dashboard/productos')}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button onClick={handleGuardar}>
            Crear Producto
          </Button>
        </div>
      </div>
    </div>
  )
} 