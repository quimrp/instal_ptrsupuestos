'use client'

import { useState } from 'react'
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Listbox, ListboxOption, ListboxLabel } from '@/components/catalyst/listbox'
import { Switch } from '@/components/catalyst/switch'
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid'
import { type CaracteristicaSeleccionable, type OpcionPrecio } from '@/services/dataService'

type NuevaCaracteristicaModalProps = {
  abierto: boolean
  onClose: () => void
  onGuardar: (nombre: string, caracteristica: CaracteristicaSeleccionable) => void
}

export function NuevaCaracteristicaModal({ abierto, onClose, onGuardar }: NuevaCaracteristicaModalProps) {
  const [nombre, setNombre] = useState('')
  const [caracteristica, setCaracteristica] = useState<CaracteristicaSeleccionable>({
    label: '',
    tipo: 'text',
    incluyePrecio: false,
    precioBase: 0,
    activadaPorDefecto: false,
    opciones: []
  })
  const [nuevaOpcion, setNuevaOpcion] = useState({ valor: '', precio: 0 })

  const handleGuardar = () => {
    if (nombre && caracteristica.label) {
      onGuardar(nombre, caracteristica)
      resetForm()
      onClose()
    }
  }

  const resetForm = () => {
    setNombre('')
    setCaracteristica({
      label: '',
      tipo: 'text',
      incluyePrecio: false,
      precioBase: 0,
      activadaPorDefecto: false,
      opciones: []
    })
    setNuevaOpcion({ valor: '', precio: 0 })
  }

  const agregarOpcion = () => {
    if (nuevaOpcion.valor) {
      setCaracteristica(prev => ({
        ...prev,
        opciones: [...(prev.opciones || []), { ...nuevaOpcion }]
      }))
      setNuevaOpcion({ valor: '', precio: 0 })
    }
  }

  const eliminarOpcion = (index: number) => {
    setCaracteristica(prev => ({
      ...prev,
      opciones: prev.opciones?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <Dialog open={abierto} onClose={onClose}>
      <DialogTitle>Añadir Nueva Característica</DialogTitle>
      <DialogBody>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la característica</label>
            <Input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: color, tamaño, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Etiqueta</label>
            <Input
              type="text"
              value={caracteristica.label}
              onChange={(e) => setCaracteristica({ ...caracteristica, label: e.target.value })}
              placeholder="Ej: Color, Tamaño, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <Listbox
              value={caracteristica.tipo}
              onChange={(tipo) => setCaracteristica({ ...caracteristica, tipo })}
            >
              <ListboxOption value="text">
                <ListboxLabel>Texto</ListboxLabel>
              </ListboxOption>
              <ListboxOption value="number">
                <ListboxLabel>Número</ListboxLabel>
              </ListboxOption>
              <ListboxOption value="select">
                <ListboxLabel>Selección</ListboxLabel>
              </ListboxOption>
            </Listbox>
          </div>

          {caracteristica.tipo === 'select' && (
            <div className="space-y-4">
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Opciones y Precios</h3>
                
                <div className="space-y-4">
                  {caracteristica.opciones?.map((opcion, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={opcion.valor}
                          onChange={(e) => {
                            const nuevasOpciones = [...(caracteristica.opciones || [])]
                            nuevasOpciones[index] = { ...opcion, valor: e.target.value }
                            setCaracteristica({ ...caracteristica, opciones: nuevasOpciones })
                          }}
                          placeholder="Valor de la opción"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          value={opcion.precio}
                          onChange={(e) => {
                            const nuevasOpciones = [...(caracteristica.opciones || [])]
                            nuevasOpciones[index] = { ...opcion, precio: Number(e.target.value) }
                            setCaracteristica({ ...caracteristica, opciones: nuevasOpciones })
                          }}
                          placeholder="Precio"
                          min={0}
                          step="0.01"
                        />
                      </div>
                      <Button
                        onClick={() => eliminarOpcion(index)}
                        className="p-2 bg-red-600 hover:bg-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={nuevaOpcion.valor}
                        onChange={(e) => setNuevaOpcion({ ...nuevaOpcion, valor: e.target.value })}
                        placeholder="Nueva opción"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        value={nuevaOpcion.precio}
                        onChange={(e) => setNuevaOpcion({ ...nuevaOpcion, precio: Number(e.target.value) })}
                        placeholder="Precio"
                        min={0}
                        step="0.01"
                      />
                    </div>
                    <Button
                      onClick={agregarOpcion}
                      className="p-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Incluye precio adicional base</label>
              <Switch
                checked={caracteristica.incluyePrecio}
                onChange={(checked) => setCaracteristica({ ...caracteristica, incluyePrecio: checked })}
              />
            </div>

            {caracteristica.incluyePrecio && (
              <div>
                <label className="block text-sm font-medium mb-2">Precio base</label>
                <Input
                  type="number"
                  value={caracteristica.precioBase}
                  onChange={(e) => setCaracteristica({ ...caracteristica, precioBase: Number(e.target.value) })}
                  min={0}
                  step="0.01"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Activada por defecto</label>
              <Switch
                checked={caracteristica.activadaPorDefecto}
                onChange={(checked) => setCaracteristica({ ...caracteristica, activadaPorDefecto: checked })}
              />
            </div>
          </div>
        </div>
      </DialogBody>
      <DialogActions>
        <Button onClick={handleGuardar}>Guardar</Button>
        <Button onClick={onClose} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  )
} 