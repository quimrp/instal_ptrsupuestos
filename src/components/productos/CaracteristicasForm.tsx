'use client'

import { useState } from 'react'
import { Input } from '@/components/catalyst/input'
import { Button } from '@/components/catalyst/button'
import { Listbox, ListboxOption, ListboxLabel } from '@/components/catalyst/listbox'
import { Fieldset, Legend, Field, Label, Description } from '@/components/catalyst/fieldset'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/20/solid'
import { type CaracteristicaPermanente, type CaracteristicaSeleccionable } from '@/services/dataService'

type CaracteristicasFormProps = {
  caracteristicasPermanentes: Record<string, CaracteristicaPermanente>
  caracteristicasSeleccionables: Record<string, CaracteristicaSeleccionable>
  precioBase?: number
  onChange: (
    caracteristicasPermanentes: Record<string, CaracteristicaPermanente>,
    caracteristicasSeleccionables: Record<string, CaracteristicaSeleccionable>,
    precioBase?: number
  ) => void
}

type CaracteristicaBase = {
  nombre: string
  label: string
  tipo: 'select' | 'number' | 'text'
  opciones: string[]
  min?: number
  max?: number
  incluyePrecio?: boolean
  precioBase?: number
  activadaPorDefecto?: boolean
}

const caracteristicaVacia: CaracteristicaBase = {
  nombre: '',
  label: '',
  tipo: 'text',
  opciones: [],
  min: undefined,
  max: undefined,
  incluyePrecio: false,
  precioBase: undefined,
  activadaPorDefecto: false
}

const tiposDisponibles = [
  { value: 'text' as const, label: 'Texto' },
  { value: 'number' as const, label: 'Número' },
  { value: 'select' as const, label: 'Selector' }
]

export function CaracteristicasForm({ 
  caracteristicasPermanentes, 
  caracteristicasSeleccionables, 
  precioBase, 
  onChange 
}: CaracteristicasFormProps) {
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState<CaracteristicaBase>(caracteristicaVacia)
  const [caracteristicaEditando, setCaracteristicaEditando] = useState<string | null>(null)
  const [tipoSeccion, setTipoSeccion] = useState<'permanente' | 'seleccionable'>('permanente')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [opcionActual, setOpcionActual] = useState('')
  const [precioBaseProducto, setPrecioBaseProducto] = useState<string>(precioBase?.toString() || '')

  const validarCaracteristica = (caracteristica: CaracteristicaBase) => {
    const nuevosErrores: Record<string, string> = {}

    if (!caracteristica.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    }
    if (!caracteristica.label.trim()) {
      nuevosErrores.label = 'La etiqueta es obligatoria'
    }
    if (caracteristica.tipo === 'number') {
      if (typeof caracteristica.min !== 'number') {
        nuevosErrores.min = 'El valor mínimo es obligatorio'
      }
      if (typeof caracteristica.max !== 'number') {
        nuevosErrores.max = 'El valor máximo es obligatorio'
      }
      if (caracteristica.min! >= caracteristica.max!) {
        nuevosErrores.max = 'El valor máximo debe ser mayor que el mínimo'
      }
    }
    if (caracteristica.tipo === 'select' && caracteristica.opciones.length === 0) {
      nuevosErrores.opciones = 'Debe agregar al menos una opción'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const editarCaracteristica = (nombre: string) => {
    if (tipoSeccion === 'permanente') {
      const caracteristica = caracteristicasPermanentes[nombre]
      setCaracteristicaEditando(nombre)
      setNuevaCaracteristica({
        nombre,
        label: caracteristica.label,
        tipo: caracteristica.tipo,
        opciones: caracteristica.opciones || [],
        min: caracteristica.min,
        max: caracteristica.max,
        incluyePrecio: false,
        precioBase: undefined,
        activadaPorDefecto: false
      })
    } else {
      const caracteristica = caracteristicasSeleccionables[nombre]
      setCaracteristicaEditando(nombre)
      setNuevaCaracteristica({
        nombre,
        label: caracteristica.label,
        tipo: caracteristica.tipo,
        opciones: (caracteristica.opciones || []).map(o => o.valor),
        min: caracteristica.min,
        max: caracteristica.max,
        incluyePrecio: caracteristica.incluyePrecio,
        precioBase: caracteristica.precioBase,
        activadaPorDefecto: caracteristica.activadaPorDefecto
      })
    }
  }

  const cancelarEdicion = () => {
    setCaracteristicaEditando(null)
    setNuevaCaracteristica(caracteristicaVacia)
    setErrores({})
  }

  const guardarCaracteristica = () => {
    if (validarCaracteristica(nuevaCaracteristica)) {
      const nombreNormalizado = caracteristicaEditando || nuevaCaracteristica.nombre.toLowerCase().replace(/\s+/g, '_')
      if (tipoSeccion === 'permanente') {
        const nuevasCaracteristicas: Record<string, CaracteristicaPermanente> = {
          ...caracteristicasPermanentes,
          [nombreNormalizado]: {
            label: nuevaCaracteristica.label,
            tipo: nuevaCaracteristica.tipo,
            ...(nuevaCaracteristica.tipo === 'select' && { opciones: nuevaCaracteristica.opciones }),
            ...(nuevaCaracteristica.tipo === 'number' && {
              min: nuevaCaracteristica.min,
              max: nuevaCaracteristica.max
            })
          }
        }
        onChange(nuevasCaracteristicas, caracteristicasSeleccionables, precioBaseProducto ? parseFloat(precioBaseProducto) : undefined)
      } else {
        const nuevasCaracteristicas: Record<string, CaracteristicaSeleccionable> = {
          ...caracteristicasSeleccionables,
          [nombreNormalizado]: {
            label: nuevaCaracteristica.label,
            tipo: nuevaCaracteristica.tipo,
            ...(nuevaCaracteristica.tipo === 'select' && {
              opciones: nuevaCaracteristica.opciones.map(valor => ({ valor, precio: 0 }))
            }),
            ...(nuevaCaracteristica.tipo === 'number' && {
              min: nuevaCaracteristica.min,
              max: nuevaCaracteristica.max
            }),
            incluyePrecio: nuevaCaracteristica.incluyePrecio || false,
            precioBase: nuevaCaracteristica.precioBase || 0,
            activadaPorDefecto: nuevaCaracteristica.activadaPorDefecto || false
          }
        }
        onChange(caracteristicasPermanentes, nuevasCaracteristicas, precioBaseProducto ? parseFloat(precioBaseProducto) : undefined)
      }
      setCaracteristicaEditando(null)
      setNuevaCaracteristica(caracteristicaVacia)
      setErrores({})
    }
  }

  const agregarOpcion = () => {
    if (!opcionActual.trim()) return

    setNuevaCaracteristica(prev => ({
      ...prev,
      opciones: [...prev.opciones, opcionActual.trim()]
    }))
    setOpcionActual('')
  }

  const eliminarOpcion = (opcion: string) => {
    setNuevaCaracteristica(prev => ({
      ...prev,
      opciones: prev.opciones.filter(o => o !== opcion)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Precio base del producto */}
      <Fieldset>
        <Legend>Precio Base del Producto</Legend>
        <Field className="space-y-2">
          <Label>Precio Base (€)</Label>
          <Input
            type="number"
            value={precioBaseProducto}
            onChange={(e) => {
              setPrecioBaseProducto(e.target.value)
              onChange(
                caracteristicasPermanentes,
                caracteristicasSeleccionables,
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }}
            placeholder="Dejar vacío para precio variable"
            step="0.01"
          />
          <Description>
            Este precio se usará como valor por defecto en los presupuestos, pero podrá ser modificado en cada caso.
          </Description>
        </Field>
      </Fieldset>

      {/* Sección de Características Permanentes */}
      <Fieldset>
        <Legend>Características Permanentes</Legend>
        <div className="space-y-4">
          {Object.entries(caracteristicasPermanentes).map(([nombre, caracteristica]) => (
            <div key={nombre} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div>
                <p className="font-medium">{caracteristica.label}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {nombre} - {caracteristica.tipo}
                  {caracteristica.tipo === 'select' && ` (${caracteristica.opciones?.length} opciones)`}
                  {caracteristica.tipo === 'number' && ` (${caracteristica.min} - ${caracteristica.max})`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setTipoSeccion('permanente')
                    editarCaracteristica(nombre)
                  }}
                  className="h-8 w-8 p-0"
                  title="Editar característica"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const { [nombre]: _, ...resto } = caracteristicasPermanentes
                    onChange(resto, caracteristicasSeleccionables, precioBaseProducto ? parseFloat(precioBaseProducto) : undefined)
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Eliminar característica"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Fieldset>

      {/* Sección de Características Seleccionables */}
      <Fieldset>
        <Legend>Características Seleccionables</Legend>
        <Field>
          <Description className="mb-4">
            Estas características podrán ser activadas o desactivadas por el cliente en el presupuesto.
          </Description>
        </Field>
        <div className="space-y-4">
          {Object.entries(caracteristicasSeleccionables).map(([nombre, caracteristica]) => (
            <div key={nombre} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div>
                <p className="font-medium">{caracteristica.label}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {nombre} - {caracteristica.tipo}
                  {caracteristica.tipo === 'select' && ` (${caracteristica.opciones?.length} opciones)`}
                  {caracteristica.tipo === 'number' && ` (${caracteristica.min} - ${caracteristica.max})`}
                  {caracteristica.precioBase !== undefined && ` - Precio Base: ${caracteristica.precioBase}€`}
                  {caracteristica.activadaPorDefecto && ' - Activada por defecto'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setTipoSeccion('seleccionable')
                    editarCaracteristica(nombre)
                  }}
                  className="h-8 w-8 p-0"
                  title="Editar característica"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const { [nombre]: _, ...resto } = caracteristicasSeleccionables
                    onChange(caracteristicasPermanentes, resto, precioBaseProducto ? parseFloat(precioBaseProducto) : undefined)
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Eliminar característica"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Fieldset>

      {/* Formulario para nueva/editar característica */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
        <h3 className="text-sm font-medium mb-4">
          {caracteristicaEditando ? 'Editar Característica' : 'Agregar Nueva Característica'}
        </h3>

        {/* Selector de tipo de característica */}
        {!caracteristicaEditando && (
          <Field className="space-y-2 mb-4">
            <Label>Tipo de Característica</Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTipoSeccion('permanente')}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  tipoSeccion === 'permanente'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                Permanente
              </button>
              <button
                type="button"
                onClick={() => setTipoSeccion('seleccionable')}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  tipoSeccion === 'seleccionable'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                Seleccionable
              </button>
            </div>
          </Field>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field className="space-y-2">
            <Label>Nombre Interno</Label>
            <Input
              type="text"
              value={nuevaCaracteristica.nombre}
              onChange={(e) => setNuevaCaracteristica(prev => ({
                ...prev,
                nombre: e.target.value
              }))}
              placeholder="Ej: color, tamaño, material..."
              disabled={!!caracteristicaEditando}
            />
            {errores.nombre && (
              <Description className="text-red-600">{errores.nombre}</Description>
            )}
          </Field>

          <Field className="space-y-2">
            <Label>Etiqueta</Label>
            <Input
              type="text"
              value={nuevaCaracteristica.label}
              onChange={(e) => setNuevaCaracteristica(prev => ({
                ...prev,
                label: e.target.value
              }))}
              placeholder="Ej: Color, Tamaño, Material..."
            />
            {errores.label && (
              <Description className="text-red-600">{errores.label}</Description>
            )}
          </Field>
        </div>

        <Field className="space-y-2 mt-4">
          <Label>Tipo de Característica</Label>
          <Listbox
            value={nuevaCaracteristica.tipo}
            onChange={(valor) => {
              const tipo = valor as CaracteristicaBase['tipo']
              setNuevaCaracteristica(prev => ({
                ...prev,
                tipo,
                // Reiniciar valores específicos del tipo
                ...(tipo === 'number' && { min: undefined, max: undefined }),
                ...(tipo === 'select' && { opciones: [] }),
                ...(tipo === 'text' && { opciones: [], min: undefined, max: undefined })
              }))
            }}
          >
            {tiposDisponibles.map((tipo) => (
              <ListboxOption key={tipo.value} value={tipo.value}>
                <ListboxLabel>{tipo.label}</ListboxLabel>
              </ListboxOption>
            ))}
          </Listbox>
        </Field>

        <div className="mt-4 space-y-4">
          <Field className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={nuevaCaracteristica.incluyePrecio}
              onChange={(e) => setNuevaCaracteristica(prev => ({
                ...prev,
                incluyePrecio: e.target.checked,
                precioBase: e.target.checked ? prev.precioBase : undefined
              }))}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600"
            />
            <Label>Incluye precio adicional</Label>
          </Field>

          {nuevaCaracteristica.incluyePrecio && (
            <Field className="space-y-2">
              <Label>Precio Base (€)</Label>
              <Input
                type="number"
                value={nuevaCaracteristica.precioBase || ''}
                onChange={(e) => setNuevaCaracteristica(prev => ({
                  ...prev,
                  precioBase: e.target.value ? parseFloat(e.target.value) : undefined
                }))}
                placeholder="0.00"
                step="0.01"
              />
              <Description>
                Este precio se sumará al precio base del producto cuando esta característica sea seleccionada
              </Description>
            </Field>
          )}
        </div>

        {nuevaCaracteristica.tipo === 'number' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field className="space-y-2">
              <Label>Valor Mínimo</Label>
              <Input
                type="number"
                value={nuevaCaracteristica.min || ''}
                onChange={(e) => setNuevaCaracteristica(prev => ({
                  ...prev,
                  min: parseInt(e.target.value)
                }))}
              />
              {errores.min && (
                <Description className="text-red-600">{errores.min}</Description>
              )}
            </Field>

            <Field className="space-y-2">
              <Label>Valor Máximo</Label>
              <Input
                type="number"
                value={nuevaCaracteristica.max || ''}
                onChange={(e) => setNuevaCaracteristica(prev => ({
                  ...prev,
                  max: parseInt(e.target.value)
                }))}
              />
              {errores.max && (
                <Description className="text-red-600">{errores.max}</Description>
              )}
            </Field>
          </div>
        )}

        {nuevaCaracteristica.tipo === 'select' && (
          <Field className="space-y-2 mt-4">
            <Label>Opciones</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={opcionActual}
                onChange={(e) => setOpcionActual(e.target.value)}
                placeholder="Nueva opción..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={agregarOpcion}
                disabled={!opcionActual.trim()}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            {errores.opciones && (
              <Description className="text-red-600">{errores.opciones}</Description>
            )}
            
            <div className="mt-2 space-y-2">
              {nuevaCaracteristica.opciones.map((opcion) => (
                <div key={opcion} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded">
                  <span>{opcion}</span>
                  <Button
                    type="button"
                    onClick={() => eliminarOpcion(opcion)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Field>
        )}

        {tipoSeccion === 'seleccionable' && (
          <Field className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={nuevaCaracteristica.activadaPorDefecto}
              onChange={(e) => setNuevaCaracteristica(prev => ({
                ...prev,
                activadaPorDefecto: e.target.checked
              }))}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600"
            />
            <Label>Activada por defecto</Label>
          </Field>
        )}

        <div className="flex justify-end gap-3 mt-4">
          {caracteristicaEditando && (
            <Button
              type="button"
              onClick={() => {
                setCaracteristicaEditando(null)
                setNuevaCaracteristica(caracteristicaVacia)
                setErrores({})
              }}
              className="text-zinc-600 hover:text-zinc-700"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="button"
            onClick={guardarCaracteristica}
          >
            {caracteristicaEditando ? 'Guardar Cambios' : 'Agregar Característica'}
          </Button>
        </div>
      </div>
    </div>
  )
} 