'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dataService, type Cliente } from '@/services/dataService'
import { Button } from '@/components/catalyst/button'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/20/solid'
import { Input } from '@/components/catalyst/input'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/catalyst/table'
import { Badge } from '@/components/catalyst/badge'
import { Link } from '@/components/catalyst/link'
import { Text } from '@/components/catalyst/text'
import { Heading } from '@/components/catalyst/heading'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    cargarClientes()
  }, [])

  useEffect(() => {
    // Filtrar clientes según búsqueda
    if (busqueda) {
      const filtrados = clientes.filter(cliente => {
        const nombreCompleto = `${cliente.nombre} ${cliente.apellidos}`.toLowerCase()
        const searchTerm = busqueda.toLowerCase()
        return (
          nombreCompleto.includes(searchTerm) ||
          cliente.nif.toLowerCase().includes(searchTerm) ||
          cliente.email.toLowerCase().includes(searchTerm) ||
          cliente.telefono.includes(searchTerm)
        )
      })
      setClientesFiltrados(filtrados)
    } else {
      setClientesFiltrados(clientes)
    }
  }, [busqueda, clientes])

  const cargarClientes = async () => {
    try {
      const data = await dataService.getClientes()
      setClientes(data || []) // Asegurar que sea un array
      setClientesFiltrados(data || []) // Asegurar que sea un array
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      setClientes([]) // En caso de error, establecer como array vacío
      setClientesFiltrados([]) // En caso de error, establecer como array vacío
    } finally {
      setCargando(false)
    }
  }

  const eliminarCliente = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      const exito = await dataService.eliminarCliente(id)
      if (exito) {
        cargarClientes()
      }
    }
  }

  if (cargando) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">Cargando clientes...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Heading>Gestión de Clientes</Heading>
        <Button 
          onClick={() => router.push('/clientes/nuevo')}
          className="gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <Input
          type="text"
          placeholder="Buscar por nombre, NIF, email o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10"
        />
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <Text className="text-zinc-500 dark:text-zinc-400 mb-4">
            No hay clientes registrados todavía
          </Text>
          <Button onClick={() => router.push('/clientes/nuevo')}>
            Añadir primer cliente
          </Button>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <Text className="text-zinc-500 dark:text-zinc-400">
            No se encontraron clientes que coincidan con "{busqueda}"
          </Text>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>NIF/CIF</TableHeader>
              <TableHeader>Teléfono</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Tipo</TableHeader>
              <TableHeader className="text-right">Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesFiltrados.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>
                  <div>
                    <Text className="font-medium">
                      {cliente.nombre} {cliente.apellidos}
                    </Text>
                    <Text className="text-zinc-500 text-sm truncate max-w-xs">
                      {cliente.direccion}
                    </Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Text>{cliente.nif}</Text>
                </TableCell>
                <TableCell>
                  <Text>{cliente.telefono}</Text>
                </TableCell>
                <TableCell>
                  <Link href={`mailto:${cliente.email}`}>
                    {cliente.email}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge color={cliente.tipoCliente === 'empresa' ? 'blue' : 'green'}>
                    {cliente.tipoCliente === 'empresa' ? 'Empresa' : 'Particular'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => router.push(`/clientes/${cliente.id}`)}
                      className="p-1.5"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => router.push(`/clientes/${cliente.id}/editar`)}
                      className="p-1.5 bg-blue-600 hover:bg-blue-700"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => eliminarCliente(cliente.id)}
                      className="p-1.5 bg-red-600 hover:bg-red-700"
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

      {/* Resumen */}
      {clientes.length > 0 && (
        <div className="flex justify-between items-center">
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            Mostrando {clientesFiltrados.length} de {clientes.length} clientes
          </Text>
          <div className="flex gap-4">
            <Text className="text-sm text-zinc-600 dark:text-zinc-400">
              Particulares: {clientesFiltrados.filter(c => c.tipoCliente === 'particular').length}
            </Text>
            <Text className="text-sm text-zinc-600 dark:text-zinc-400">
              Empresas: {clientesFiltrados.filter(c => c.tipoCliente === 'empresa').length}
            </Text>
          </div>
        </div>
      )}
    </div>
  )
} 