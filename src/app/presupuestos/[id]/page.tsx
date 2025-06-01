'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { dataService, type Presupuesto } from '@/services/dataService'
import { Button } from '@/components/catalyst/button'
import { Listbox, ListboxOption, ListboxLabel } from '@/components/catalyst/listbox'
import { 
  PencilIcon, 
  ArrowLeftIcon,
  PrinterIcon,
  SparklesIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/20/solid'
import { Heading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { Badge } from '@/components/catalyst/badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/catalyst/table'
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/components/catalyst/description-list'

export default function DetallePresupuestoPage() {
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [versionSeleccionada, setVersionSeleccionada] = useState<number | null>(null)
  const [presupuestoMostrado, setPresupuestoMostrado] = useState<Presupuesto | null>(null)
  const [cargando, setCargando] = useState(true)
  const params = useParams()
  const router = useRouter()
  
  useEffect(() => {
    cargarPresupuesto()
  }, [params.id])
  
  useEffect(() => {
    // Actualizar el presupuesto mostrado cuando cambia la versión seleccionada
    if (presupuesto && versionSeleccionada !== null) {
      if (versionSeleccionada === presupuesto.version) {
        setPresupuestoMostrado(presupuesto)
      } else {
        const version = presupuesto.versiones?.find(v => v.version === versionSeleccionada)
        if (version) {
          setPresupuestoMostrado(version)
        }
      }
    }
  }, [versionSeleccionada, presupuesto])
  
  const cargarPresupuesto = async () => {
    try {
      if (params.id && typeof params.id === 'string') {
        const data = await dataService.getPresupuesto(params.id)
        if (data) {
          setPresupuesto(data)
          setVersionSeleccionada(data.version || 1)
          setPresupuestoMostrado(data)
        } else {
          // Presupuesto no encontrado
          router.push('/presupuestos/lista')
        }
      }
    } catch (error) {
      console.error('Error al cargar presupuesto:', error)
      router.push('/presupuestos/lista')
    } finally {
      setCargando(false)
    }
  }
  
  const crearNuevaVersion = async () => {
    if (!presupuesto) return
    
    try {
      const nuevaVersion = await dataService.crearNuevaVersionPresupuesto(presupuesto.id)
      if (nuevaVersion) {
        // Recargar el presupuesto y seleccionar la nueva versión
        await cargarPresupuesto()
        router.push(`/presupuestos/${nuevaVersion.id}/editar`)
      }
    } catch (error) {
      console.error('Error al crear nueva versión:', error)
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
  
  const getNumeroCompleto = () => {
    if (!presupuestoMostrado) return ''
    
    if (!presupuestoMostrado.numero) {
      // Para presupuestos antiguos sin número, usar ID + versión
      const idCorto = presupuestoMostrado.id.slice(-6)
      const version = presupuestoMostrado.version || 1
      return `${idCorto}/${version}`
    }
    
    // Para presupuestos con número asignado
    return `${presupuestoMostrado.numero}/${presupuestoMostrado.version || 1}`
  }
  
  const getVersionesDisponibles = () => {
    if (!presupuesto) return []
    
    const versiones = []
    
    // Añadir la versión actual
    versiones.push({
      value: presupuesto.version || 1,
      label: `Versión ${presupuesto.version || 1} (Actual)`,
      fecha: presupuesto.fecha
    })
    
    // Añadir versiones anteriores
    if (presupuesto.versiones) {
      presupuesto.versiones.forEach(v => {
        versiones.push({
          value: v.version,
          label: `Versión ${v.version}`,
          fecha: v.fecha
        })
      })
    }
    
    // Ordenar por versión descendente
    return versiones.sort((a, b) => b.value - a.value)
  }
  
  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">Cargando presupuesto...</div>
      </div>
    )
  }
  
  if (!presupuesto || !presupuestoMostrado) {
    return null
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Encabezado con selector de versión */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <Heading className="version-number">Presupuesto {getNumeroCompleto()}</Heading>
            {versionSeleccionada !== presupuesto.version && (
              <Badge color="amber" className="flex items-center gap-1 no-print">
                <ClockIcon className="h-3 w-3" />
                Versión Anterior
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 no-print">
            <div className="flex items-center gap-2">
              <Text className="text-sm font-medium">Versión:</Text>
              <Listbox 
                value={versionSeleccionada} 
                onChange={setVersionSeleccionada}
                className="min-w-[180px]"
              >
                {getVersionesDisponibles().map((version) => (
                  <ListboxOption key={version.value} value={version.value}>
                    <ListboxLabel>
                      <div>
                        <div>{version.label}</div>
                        <div className="text-xs text-zinc-500">
                          {formatearFecha(version.fecha)}
                        </div>
                      </div>
                    </ListboxLabel>
                  </ListboxOption>
                ))}
              </Listbox>
            </div>
            <Badge color={getEstadoColor(presupuestoMostrado.estado)}>
              {presupuestoMostrado.estado.charAt(0).toUpperCase() + presupuestoMostrado.estado.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 no-print">
          <Button
            onClick={() => router.push('/presupuestos/lista')}
            outline
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver
          </Button>
          <Button
            onClick={() => window.print()}
            className="gap-2"
          >
            <PrinterIcon className="h-4 w-4" />
            Imprimir
          </Button>
          <Button
            onClick={crearNuevaVersion}
            className="gap-2"
            color="amber"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            Nueva Versión
          </Button>
          <Button
            onClick={() => {
              // Editar la versión seleccionada
              if (versionSeleccionada === presupuesto.version) {
                router.push(`/presupuestos/${presupuesto.id}/editar`)
              } else {
                router.push(`/presupuestos/${presupuesto.id}/editar?version=${versionSeleccionada}`)
              }
            }}
            className="gap-2"
            color="blue"
          >
            <PencilIcon className="h-4 w-4" />
            Editar v{versionSeleccionada}
          </Button>
        </div>
      </div>
      
      {/* Información del cliente */}
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-6">
        <Heading level={2} className="mb-4 flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Datos del Cliente
        </Heading>
        
        {presupuestoMostrado.datosCliente ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Text className="font-medium text-lg">
                  {presupuestoMostrado.datosCliente.nombre} {presupuestoMostrado.datosCliente.apellidos}
                </Text>
                {presupuestoMostrado.datosCliente.tipoCliente === 'empresa' && (
                  <Badge color="blue">Empresa</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <IdentificationIcon className="h-4 w-4 text-zinc-400" />
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {presupuestoMostrado.datosCliente.nif}
                </Text>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-zinc-400" />
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {presupuestoMostrado.datosCliente.direccion}
                </Text>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-zinc-400" />
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {presupuestoMostrado.datosCliente.telefono}
                </Text>
              </div>
              
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-zinc-400" />
                <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                  {presupuestoMostrado.datosCliente.email}
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <Text className="text-zinc-600 dark:text-zinc-400">
            {presupuestoMostrado.cliente || 'Sin cliente asignado'}
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
          {presupuestoMostrado.lineas.map((linea) => (
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
            {presupuestoMostrado.total.toFixed(2)} €
          </Text>
        </div>
      </div>
      
      {/* Información adicional */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          Este presupuesto tiene validez de 30 días desde su fecha de emisión.
        </Text>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">
          IVA no incluido en los precios mostrados.
        </Text>
      </div>
    </div>
  )
} 