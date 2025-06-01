'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dataService, type Presupuesto } from '@/services/dataService'
import { Button } from '@/components/catalyst/button'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon
} from '@heroicons/react/20/solid'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/catalyst/table'
import { Badge } from '@/components/catalyst/badge'
import { Text } from '@/components/catalyst/text'
import { Heading } from '@/components/catalyst/heading'

export default function ListaPresupuestos() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [cargando, setCargando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    cargarPresupuestos()
  }, [])

  const cargarPresupuestos = async () => {
    try {
      const data = await dataService.getPresupuestos()
      setPresupuestos(data)
    } catch (error) {
      console.error('Error al cargar presupuestos:', error)
    } finally {
      setCargando(false)
    }
  }

  const eliminarPresupuesto = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      const exito = await dataService.eliminarPresupuesto(id)
      if (exito) {
        cargarPresupuestos()
      }
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEstadoColor = (estado: string): 'zinc' | 'blue' | 'green' | 'red' => {
    switch (estado) {
      case 'borrador':
        return 'zinc'
      case 'enviado':
        return 'blue'
      case 'aceptado':
        return 'green'
      case 'rechazado':
        return 'red'
      default:
        return 'zinc'
    }
  }

  const getNumeroCompleto = (presupuesto: Presupuesto) => {
    if (!presupuesto.numero) {
      // Para presupuestos antiguos sin número, usar ID + versión
      const idCorto = presupuesto.id.slice(-6)
      const version = presupuesto.version || 1
      return `${idCorto}/${version}`
    }
    
    // Para presupuestos con número asignado
    return `${presupuesto.numero}/${presupuesto.version || 1}`
  }

  if (cargando) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">Cargando presupuestos...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Heading>Lista de Presupuestos</Heading>
        <Button 
          onClick={() => router.push('/presupuestos/nuevo')}
          className="gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Presupuesto
        </Button>
      </div>

      {presupuestos.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <Text className="text-zinc-500 dark:text-zinc-400 mb-4">
            No hay presupuestos creados todavía
          </Text>
          <Button onClick={() => router.push('/presupuestos/nuevo')}>
            Crear primer presupuesto
          </Button>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Fecha</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Líneas</TableHeader>
              <TableHeader>Total</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader className="text-right">Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {presupuestos.map((presupuesto) => (
              <TableRow key={presupuesto.id}>
                <TableCell className="font-medium">
                  {getNumeroCompleto(presupuesto)}
                </TableCell>
                <TableCell>
                  <Text>{formatearFecha(presupuesto.fecha)}</Text>
                </TableCell>
                <TableCell>
                  <Text>{presupuesto.cliente || 'Sin cliente'}</Text>
                </TableCell>
                <TableCell>
                  <Text>{presupuesto.lineas.length} producto{presupuesto.lineas.length !== 1 ? 's' : ''}</Text>
                </TableCell>
                <TableCell className="font-medium">
                  {presupuesto.total.toFixed(2)} €
                </TableCell>
                <TableCell>
                  <Badge color={getEstadoColor(presupuesto.estado)}>
                    {presupuesto.estado.charAt(0).toUpperCase() + presupuesto.estado.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => {
                        console.log('Ver detalles presupuesto:', presupuesto.id)
                        router.push(`/presupuestos/${presupuesto.id}`)
                      }}
                      className="p-1.5"
                      title="Ver detalles"
                      plain
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('Editando presupuesto:', presupuesto.id)
                        router.push(`/presupuestos/${presupuesto.id}/editar`)
                      }}
                      className="p-1.5"
                      color="blue"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('Eliminando presupuesto:', presupuesto.id)
                        eliminarPresupuesto(presupuesto.id)
                      }}
                      className="p-1.5"
                      color="red"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}