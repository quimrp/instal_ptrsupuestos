'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { dataService, type Presupuesto } from '@/services/dataService'
import { Button } from '@/components/catalyst/button'
import { 
  ArrowLeftIcon,
  SparklesIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/20/solid'
import { Heading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { Badge } from '@/components/catalyst/badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/catalyst/table'

export default function VersionPresupuestoPage() {
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [versionData, setVersionData] = useState<Presupuesto | null>(null)
  const [cargando, setCargando] = useState(true)
  const params = useParams()
  const router = useRouter()
  
  useEffect(() => {
    cargarVersionPresupuesto()
  }, [params.id, params.version])
  
  const cargarVersionPresupuesto = async () => {
    try {
      if (params.id && params.version && typeof params.id === 'string') {
        const data = await dataService.getPresupuesto(params.id)
        if (data && data.versiones) {
          const versionNum = parseInt(params.version as string)
          const version = data.versiones.find(v => v.version === versionNum)
          if (version) {
            setPresupuesto(data)
            setVersionData(version)
          } else {
            router.push('/presupuestos/lista')
          }
        } else {
          router.push('/presupuestos/lista')
        }
      }
    } catch (error) {
      console.error('Error al cargar versión:', error)
      router.push('/presupuestos/lista')
    } finally {
      setCargando(false)
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
  
  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">Cargando versión del presupuesto...</div>
      </div>
    )
  }
  
  if (!versionData || !presupuesto) {
    return null
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Aviso de versión antigua */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="flex-1">
          <Text className="font-medium text-amber-900 dark:text-amber-200">
            Estás viendo una versión anterior
          </Text>
          <Text className="text-sm text-amber-800 dark:text-amber-300 mt-1">
            Esta es la versión {versionData.version} del presupuesto. La versión actual es la {presupuesto.version}.
          </Text>
        </div>
      </div>
      
      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div>
          <Heading className="flex items-center gap-3 version-number">
            Presupuesto {presupuesto.numero}/{versionData.version}
            <Badge color="amber" className="flex items-center gap-1 no-print">
              <ClockIcon className="h-3 w-3" />
              Versión Histórica
            </Badge>
          </Heading>
          <div className="mt-2 flex items-center gap-4">
            <Text className="text-sm text-zinc-600 dark:text-zinc-400">
              Fecha: {formatearFecha(versionData.fecha)}
            </Text>
            <Badge color={getEstadoColor(versionData.estado)}>
              {versionData.estado.charAt(0).toUpperCase() + versionData.estado.slice(1)}
            </Badge>
          </div>
          {/* Badge visible solo en impresión */}
          <div className="hidden print:block mt-2">
            <Badge color="amber" className="badge">
              Versión Histórica {versionData.version} - {versionData.estado.charAt(0).toUpperCase() + versionData.estado.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 no-print">
          <Button
            onClick={() => router.push(`/presupuestos/${presupuesto.id}`)}
            outline
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver al Actual
          </Button>
        </div>
      </div>
      
      {/* Información del cliente */}
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-6">
        <Heading level={2} className="mb-4 flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Datos del Cliente
        </Heading>
        
        {versionData.datosCliente ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Text className="font-medium text-lg">
                  {versionData.datosCliente.nombre} {versionData.datosCliente.apellidos}
                </Text>
                {versionData.datosCliente.tipoCliente === 'empresa' && (
                  <Badge color="blue">Empresa</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <IdentificationIcon className="h-4 w-4 text-zinc-400" />
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {versionData.datosCliente.nif}
                </Text>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-zinc-400" />
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {versionData.datosCliente.direccion}
                </Text>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-zinc-400" />
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {versionData.datosCliente.telefono}
                </Text>
              </div>
              
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-zinc-400" />
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {versionData.datosCliente.email}
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <Text className="text-zinc-600 dark:text-zinc-400">
            {versionData.cliente || 'Sin cliente asignado'}
          </Text>
        )}
      </div>
      
      {/* Tabla de productos */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Producto/Descripción</TableHeader>
            <TableHeader className="text-center">Cantidad</TableHeader>
            <TableHeader className="text-right">Precio unitario</TableHeader>
            <TableHeader className="text-right">Total</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {versionData.lineas.map((linea) => (
            <TableRow key={linea.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {linea.tipo === 'nuevo' && (
                    <SparklesIcon className="h-4 w-4 text-green-600" />
                  )}
                  <div>
                    <Text className="font-medium">
                      {linea.tipo === 'existente' ? linea.producto?.nombre : linea.descripcion}
                    </Text>
                    {linea.caracteristicas && (
                      <Text className="text-sm text-zinc-500 mt-1">
                        {Object.entries(linea.caracteristicas)
                          .filter(([_, value]) => value)
                          .map(([key, value]) => (
                            <span key={key} className="inline-block mr-3">
                              <span className="font-medium">{key}:</span> {value}
                            </span>
                          ))}
                      </Text>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">{linea.cantidad}</TableCell>
              <TableCell className="text-right">{linea.precio.toFixed(2)} €</TableCell>
              <TableCell className="text-right font-medium">
                {(linea.cantidad * linea.precio).toFixed(2)} €
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Total */}
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Text className="font-semibold">Total del presupuesto:</Text>
          <Text className="text-2xl font-bold">
            {versionData.total.toFixed(2)} €
          </Text>
        </div>
      </div>
    </div>
  )
} 