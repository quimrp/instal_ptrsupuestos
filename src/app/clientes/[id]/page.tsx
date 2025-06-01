'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { dataService, type Cliente, type Presupuesto } from '@/services/dataService'
import { Button } from '@/components/catalyst/button'
import { 
  PencilIcon, 
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  ClipboardDocumentListIcon,
  PlusIcon
} from '@heroicons/react/20/solid'

export default function DetalleClientePage() {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [presupuestosCliente, setPresupuestosCliente] = useState<Presupuesto[]>([])
  const [cargando, setCargando] = useState(true)
  const params = useParams()
  const router = useRouter()
  
  useEffect(() => {
    cargarDatos()
  }, [params.id])
  
  const cargarDatos = async () => {
    try {
      if (params.id && typeof params.id === 'string') {
        const clienteData = dataService.getCliente(params.id)
        if (clienteData) {
          setCliente(clienteData)
          
          // Cargar presupuestos del cliente
          const todosPresupuestos = await dataService.getPresupuestos()
          const presupuestosDelCliente = todosPresupuestos.filter(
            p => p.clienteId === params.id || 
            (p.datosCliente && p.datosCliente.id === params.id)
          )
          setPresupuestosCliente(presupuestosDelCliente)
        } else {
          // Cliente no encontrado
          router.push('/clientes')
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      router.push('/clientes')
    } finally {
      setCargando(false)
    }
  }
  
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return 'bg-gray-100 text-gray-800'
      case 'enviado':
        return 'bg-blue-100 text-blue-800'
      case 'aceptado':
        return 'bg-green-100 text-green-800'
      case 'rechazado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">Cargando cliente...</div>
      </div>
    )
  }
  
  if (!cliente) {
    return null
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {cliente.tipoCliente === 'empresa' ? (
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
          ) : (
            <UserIcon className="h-8 w-8 text-zinc-600" />
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {cliente.nombre} {cliente.apellidos}
            </h1>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
              cliente.tipoCliente === 'empresa' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {cliente.tipoCliente === 'empresa' ? 'Empresa' : 'Particular'}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/clientes')}
            className="gap-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver
          </Button>
          <Button
            onClick={() => router.push(`/clientes/${cliente.id}/editar`)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <PencilIcon className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>
      
      {/* Información del cliente */}
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-6">
        <h2 className="font-semibold mb-4 text-lg">Información de Contacto</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <IdentificationIcon className="h-5 w-5 text-zinc-400" />
              <span className="font-medium">NIF/CIF:</span>
              <span>{cliente.nif}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon className="h-5 w-5 text-zinc-400" />
              <span className="font-medium">Teléfono:</span>
              <a href={`tel:${cliente.telefono}`} className="text-blue-600 hover:text-blue-800">
                {cliente.telefono}
              </a>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <EnvelopeIcon className="h-5 w-5 text-zinc-400" />
              <span className="font-medium">Email:</span>
              <a href={`mailto:${cliente.email}`} className="text-blue-600 hover:text-blue-800">
                {cliente.email}
              </a>
            </div>
            
            <div className="flex items-start gap-2 text-sm">
              <MapPinIcon className="h-5 w-5 text-zinc-400 mt-0.5" />
              <div>
                <span className="font-medium">Dirección:</span>
                <p className="text-zinc-600 dark:text-zinc-400">{cliente.direccion}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Historial de presupuestos */}
      <div>
        <h2 className="font-semibold mb-4 text-lg flex items-center gap-2">
          <ClipboardDocumentListIcon className="h-5 w-5" />
          Historial de Presupuestos
        </h2>
        
        {presupuestosCliente.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              No hay presupuestos para este cliente
            </p>
            <Button 
              onClick={() => router.push('/presupuestos/nuevo')}
              className="gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Crear Presupuesto
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                {presupuestosCliente.map((presupuesto) => (
                  <tr key={presupuesto.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {getNumeroCompleto(presupuesto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatearFecha(presupuesto.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(presupuesto.estado)}`}>
                        {presupuesto.estado.charAt(0).toUpperCase() + presupuesto.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {presupuesto.total.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        onClick={() => router.push(`/presupuestos/${presupuesto.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Resumen estadístico */}
      {presupuestosCliente.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Resumen</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Total presupuestos</p>
              <p className="text-xl font-semibold">{presupuestosCliente.length}</p>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Aceptados</p>
              <p className="text-xl font-semibold text-green-600">
                {presupuestosCliente.filter(p => p.estado === 'aceptado').length}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">En borrador</p>
              <p className="text-xl font-semibold text-gray-600">
                {presupuestosCliente.filter(p => p.estado === 'borrador').length}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Valor total</p>
              <p className="text-xl font-semibold">
                {presupuestosCliente.reduce((sum, p) => sum + p.total, 0).toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 