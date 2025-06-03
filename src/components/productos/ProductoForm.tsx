'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/catalyst/input'
import { Button } from '@/components/catalyst/button'
import { Fieldset, Legend, Field, Label, Description } from '@/components/catalyst/fieldset'
import { dataService } from '@/services/dataService'

type ProductoFormProps = {
  productoInicial?: {
    id: string
    nombre: string
  }
  onGuardar: (producto: { nombre: string }) => void
  onCancelar: () => void
}

export function ProductoForm({ productoInicial, onGuardar, onCancelar }: ProductoFormProps) {
  const [nombre, setNombre] = useState(productoInicial?.nombre || '')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [imagen, setImagen] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {}

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validarFormulario()) {
      onGuardar({
        nombre: nombre.trim(),
        imagen // puedes adaptar el backend para aceptar File o base64
      })
    }
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
          {errores.nombre && (
            <Description className="text-red-600">
              {errores.nombre}
            </Description>
          )}
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

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={onCancelar}
          outline
        >
          Cancelar
        </Button>
        <Button type="submit">
          {productoInicial ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
} 