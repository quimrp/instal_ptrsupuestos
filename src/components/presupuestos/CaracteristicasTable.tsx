'use client'

import { useState } from 'react'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/catalyst/table'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { type CaracteristicaSeleccionable } from '@/services/dataService'

type CaracteristicasTableProps = {
  caracteristicas: Record<string, CaracteristicaSeleccionable>
  onUpdate: (nombre: string, caracteristica: CaracteristicaSeleccionable) => void
  onDelete: (nombre: string) => void
}

export function CaracteristicasTable({ caracteristicas, onUpdate, onDelete }: CaracteristicasTableProps) {
  const [editando, setEditando] = useState<string | null>(null)
  const [caracteristicaEditada, setCaracteristicaEditada] = useState<CaracteristicaSeleccionable | null>(null)

  const iniciarEdicion = (nombre: string, caracteristica: CaracteristicaSeleccionable) => {
    setEditando(nombre)
    setCaracteristicaEditada({ ...caracteristica })
  }

  const guardarEdicion = (nombre: string) => {
    if (caracteristicaEditada) {
      onUpdate(nombre, caracteristicaEditada)
      setEditando(null)
      setCaracteristicaEditada(null)
    }
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setCaracteristicaEditada(null)
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Nombre</TableHeader>
          <TableHeader>Tipo</TableHeader>
          <TableHeader>Precio Base</TableHeader>
          <TableHeader>Por Defecto</TableHeader>
          <TableHeader className="text-right">Acciones</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(caracteristicas).map(([nombre, caracteristica]) => (
          <TableRow key={nombre}>
            {editando === nombre ? (
              <>
                <TableCell>
                  <Input
                    type="text"
                    value={caracteristicaEditada?.label || ''}
                    onChange={(e) => setCaracteristicaEditada(prev => prev ? { ...prev, label: e.target.value } : null)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={caracteristicaEditada?.tipo || ''}
                    onChange={(e) => setCaracteristicaEditada(prev => prev ? { ...prev, tipo: e.target.value as 'select' | 'number' | 'text' } : null)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={caracteristicaEditada?.precioBase || 0}
                    onChange={(e) => setCaracteristicaEditada(prev => prev ? { ...prev, precioBase: Number(e.target.value) } : null)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="checkbox"
                    checked={caracteristicaEditada?.activadaPorDefecto || false}
                    onChange={(e) => setCaracteristicaEditada(prev => prev ? { ...prev, activadaPorDefecto: e.target.checked } : null)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => guardarEdicion(nombre)}
                      className="p-1.5 bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={cancelarEdicion}
                      className="p-1.5 bg-zinc-600 hover:bg-zinc-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </>
            ) : (
              <>
                <TableCell>{caracteristica.label}</TableCell>
                <TableCell>{caracteristica.tipo}</TableCell>
                <TableCell>{caracteristica.precioBase}€</TableCell>
                <TableCell>{caracteristica.activadaPorDefecto ? 'Sí' : 'No'}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => iniciarEdicion(nombre, caracteristica)}
                      className="p-1.5"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => onDelete(nombre)}
                      className="p-1.5 bg-red-600 hover:bg-red-700"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 