'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/catalyst/button'
import { Listbox, ListboxOption, ListboxLabel } from '@/components/catalyst/listbox'
import { Input } from '@/components/catalyst/input'
import { Badge } from '@/components/catalyst/badge'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  SparklesIcon,
  UserIcon,
  UserPlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  LockClosedIcon
} from '@heroicons/react/20/solid'
import { dataService, type CaracteristicaProducto, type Presupuesto, type Cliente } from '@/services/dataService'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { ClienteFormModal } from '@/components/clientes/ClienteFormModal'
import { Fieldset, Legend, FieldGroup, Field, Label, Description, ErrorMessage } from '@/components/catalyst/fieldset'

type Producto = {
  id: string
  nombre: string
}

type LineaPresupuesto = {
  id: string
  tipo: 'existente' | 'nuevo'
  producto?: Producto
  descripcion?: string
  referencia?: string
  caracteristicas?: Record<string, any>
  cantidad: number
  precio: number
}

interface PresupuestoFormProps {
  presupuestoInicial?: Presupuesto
}

type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado'

const estadosDisponibles: { value: EstadoPresupuesto; label: string; color: string }[] = [
  { value: 'borrador', label: 'Borrador', color: 'zinc' },
  { value: 'enviado', label: 'Enviado', color: 'blue' },
  { value: 'aceptado', label: 'Aceptado', color: 'green' },
  { value: 'rechazado', label: 'Rechazado', color: 'red' }
]

export function PresupuestoForm({ presupuestoInicial }: PresupuestoFormProps) {
  const [lineas, setLineas] = useState<LineaPresupuesto[]>([])
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false)
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [lineaEditando, setLineaEditando] = useState<string | null>(null)
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([])
  const [caracteristicasProducto, setCaracteristicasProducto] = useState<Record<string, any>>({})
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [mostrarModalCrearCliente, setMostrarModalCrearCliente] = useState(false)
  const [numeroPresupuesto, setNumeroPresupuesto] = useState<string>('')
  const [mostrarAlertaCliente, setMostrarAlertaCliente] = useState(false)
  const [mensajeAlerta, setMensajeAlerta] = useState('')
  const [estadoPresupuesto, setEstadoPresupuesto] = useState<EstadoPresupuesto>('borrador')
  const [nuevaLinea, setNuevaLinea] = useState<Partial<LineaPresupuesto>>({
    cantidad: 1,
    precio: 0,
    referencia: ''
  })
  const router = useRouter()
  const esEdicion = !!presupuestoInicial

  // Cargar productos disponibles y clientes
  useEffect(() => {
    const productos = dataService.getProductosDisponibles()
    setProductosDisponibles(productos)
    
    cargarClientes()
    
    // Generar número para nuevo presupuesto
    if (!esEdicion) {
      const cargarSiguienteNumero = async () => {
        const siguienteNumero = await dataService.obtenerSiguienteNumero()
        setNumeroPresupuesto(siguienteNumero)
      }
      cargarSiguienteNumero()
    }
  }, [])

  const cargarClientes = async () => {
    const clientesDisponibles = await dataService.getClientes()
    setClientes(clientesDisponibles || []) // Asegurar que sea un array
  }

  // Callback para cuando se crea un nuevo cliente
  const handleClienteCreado = async (clienteId: string) => {
    await cargarClientes()
    const nuevoCliente = await dataService.getCliente(clienteId)
    if (nuevoCliente) {
      setClienteSeleccionado(nuevoCliente)
    }
    setMostrarModalCrearCliente(false)
  }

  // Cargar datos del presupuesto inicial si existe
  useEffect(() => {
    if (presupuestoInicial) {
      setLineas(presupuestoInicial.lineas)
      setEstadoPresupuesto(presupuestoInicial.estado || 'borrador')
      
      // Cargar cliente si existe
      if (presupuestoInicial.clienteId) {
        const cargarClienteInicial = async () => {
          const cliente = await dataService.getCliente(presupuestoInicial.clienteId!)
          if (cliente) {
            setClienteSeleccionado(cliente)
          }
        }
        cargarClienteInicial()
      } else if (presupuestoInicial.datosCliente) {
        setClienteSeleccionado(presupuestoInicial.datosCliente)
      }
    }
  }, [presupuestoInicial])

  // Cargar características cuando se selecciona un producto
  useEffect(() => {
    if (productoSeleccionado) {
      const caracteristicas = dataService.getProductoCaracteristicas(productoSeleccionado.id)
      if (caracteristicas) {
        // Inicializar valores por defecto
        const valoresIniciales: Record<string, any> = {}
        Object.entries(caracteristicas.caracteristicas).forEach(([key, config]) => {
          if (config.tipo === 'select' && config.opciones && config.opciones.length > 0) {
            valoresIniciales[key] = config.opciones[0]
          } else if (config.tipo === 'number') {
            valoresIniciales[key] = config.min || 0
          } else {
            valoresIniciales[key] = ''
          }
        })
        setCaracteristicasProducto(valoresIniciales)
      }
    }
  }, [productoSeleccionado])

  const agregarProductoExistente = () => {
    if (!productoSeleccionado) {
      setMensajeAlerta('Debes seleccionar un producto')
      setMostrarAlertaCliente(true)
      return
    }
    
    if (nuevaLinea.precio === 0 || !nuevaLinea.precio) {
      setMensajeAlerta('El precio del producto no puede ser 0')
      setMostrarAlertaCliente(true)
      return
    }
    
    const nueva: LineaPresupuesto = {
      id: Date.now().toString(),
      tipo: 'existente',
      producto: productoSeleccionado,
      referencia: nuevaLinea.referencia || '',
      caracteristicas: caracteristicasProducto,
      cantidad: nuevaLinea.cantidad || 1,
      precio: nuevaLinea.precio || 0
    }
    setLineas([...lineas, nueva])
    resetearFormulario()
  }

  const crearProductoNuevo = () => {
    if (!nuevaLinea.descripcion || nuevaLinea.descripcion.trim() === '') {
      setMensajeAlerta('Debes escribir una descripción para el producto')
      setMostrarAlertaCliente(true)
      return
    }
    
    if (nuevaLinea.precio === 0 || !nuevaLinea.precio) {
      setMensajeAlerta('El precio del producto no puede ser 0')
      setMostrarAlertaCliente(true)
      return
    }
    
    const nueva: LineaPresupuesto = {
      id: Date.now().toString(),
      tipo: 'nuevo',
      descripcion: nuevaLinea.descripcion,
      referencia: nuevaLinea.referencia || '',
      cantidad: nuevaLinea.cantidad || 1,
      precio: nuevaLinea.precio || 0
    }
    setLineas([...lineas, nueva])
    resetearFormulario()
  }

  const actualizarLinea = (id: string) => {
    setLineas(lineas.map(linea => 
      linea.id === id 
        ? { 
            ...linea, 
            ...nuevaLinea, 
            producto: productoSeleccionado || linea.producto,
            caracteristicas: caracteristicasProducto
          }
        : linea
    ))
    setLineaEditando(null)
    resetearFormulario()
  }

  const eliminarLinea = (id: string) => {
    setLineas(lineas.filter(linea => linea.id !== id))
  }

  const duplicarLinea = (linea: LineaPresupuesto) => {
    const nueva = {
      ...linea,
      id: Date.now().toString()
    }
    setLineas([...lineas, nueva])
  }

  const moverLineaArriba = (index: number) => {
    if (index <= 0) return
    const nuevasLineas = [...lineas]
    const temp = nuevasLineas[index]
    nuevasLineas[index] = nuevasLineas[index - 1]
    nuevasLineas[index - 1] = temp
    setLineas(nuevasLineas)
  }

  const moverLineaAbajo = (index: number) => {
    if (index >= lineas.length - 1) return
    const nuevasLineas = [...lineas]
    const temp = nuevasLineas[index]
    nuevasLineas[index] = nuevasLineas[index + 1]
    nuevasLineas[index + 1] = temp
    setLineas(nuevasLineas)
  }

  const editarLinea = (linea: LineaPresupuesto) => {
    setLineaEditando(linea.id)
    setNuevaLinea({
      descripcion: linea.descripcion,
      referencia: linea.referencia || '',
      cantidad: linea.cantidad,
      precio: linea.precio
    })
    setProductoSeleccionado(linea.producto || null)
    if (linea.caracteristicas) {
      setCaracteristicasProducto(linea.caracteristicas)
    }
    if (linea.tipo === 'existente') {
      setMostrarFormularioProducto(true)
    } else {
      setMostrarFormularioNuevo(true)
    }
  }

  const resetearFormulario = () => {
    setMostrarFormularioProducto(false)
    setMostrarFormularioNuevo(false)
    setProductoSeleccionado(null)
    setCaracteristicasProducto({})
    setNuevaLinea({ cantidad: 1, precio: 0, referencia: '' })
  }

  const renderizarCampoCaracteristica = (key: string, config: CaracteristicaProducto) => {
    if (config.tipo === 'select' && config.opciones) {
      return (
        <div key={key}>
          <label className="block text-sm font-medium mb-2">{config.label}</label>
          <Listbox 
            value={caracteristicasProducto[key]} 
            onChange={(value) => setCaracteristicasProducto({...caracteristicasProducto, [key]: value})}
          >
            {config.opciones.map((opcion) => (
              <ListboxOption key={opcion} value={opcion}>
                <ListboxLabel>{opcion}</ListboxLabel>
              </ListboxOption>
            ))}
          </Listbox>
        </div>
      )
    } else if (config.tipo === 'number') {
      return (
        <div key={key}>
          <label className="block text-sm font-medium mb-2">{config.label}</label>
          <Input 
            type="number" 
            min={config.min}
            max={config.max}
            value={caracteristicasProducto[key] || ''}
            onChange={(e) => setCaracteristicasProducto({
              ...caracteristicasProducto, 
              [key]: parseInt(e.target.value) || 0
            })}
          />
        </div>
      )
    }
    return null
  }

  const guardarPresupuesto = async () => {
    // Validar cliente
    if (!clienteSeleccionado) {
      setMensajeAlerta('No puedes guardar un presupuesto sin seleccionar un cliente')
      setMostrarAlertaCliente(true)
      return
    }
    
    // Validar que hay líneas
    if (lineas.length === 0) {
      setMensajeAlerta('No puedes guardar un presupuesto sin productos')
      setMostrarAlertaCliente(true)
      return
    }
    
    try {
      const datosPresupuesto = {
        clienteId: clienteSeleccionado?.id,
        cliente: clienteSeleccionado ? 
          `${clienteSeleccionado.nombre}${clienteSeleccionado.apellidos ? ' ' + clienteSeleccionado.apellidos : ''}` : '',
        datosCliente: clienteSeleccionado || undefined,
        lineas: lineas,
        total: lineas.reduce((sum, linea) => sum + (linea.cantidad * linea.precio), 0),
        estado: estadoPresupuesto,
        // Incluir el número solo si es nuevo presupuesto
        ...((!esEdicion && numeroPresupuesto) ? { numero: numeroPresupuesto } : {})
      }

      if (esEdicion && presupuestoInicial) {
        // Actualizar presupuesto existente
        await dataService.actualizarPresupuesto(presupuestoInicial.id, datosPresupuesto)
        console.log('Presupuesto actualizado')
      } else {
        // Crear nuevo presupuesto
        const presupuesto = await dataService.guardarPresupuesto(datosPresupuesto)
        console.log('Presupuesto guardado:', presupuesto)
      }
      
      // Redirigir a la lista de presupuestos
      router.push('/presupuestos/lista')
    } catch (error) {
      console.error('Error al guardar presupuesto:', error)
    }
  }

  const getNumeroCompleto = () => {
    if (!esEdicion && numeroPresupuesto) {
      // Para nuevo presupuesto, mostrar el número que se va a asignar
      return `${numeroPresupuesto}/1`
    }
    
    if (!presupuestoInicial) return ''
    
    if (!presupuestoInicial.numero) {
      // Para presupuestos antiguos sin número, usar ID + versión
      const idCorto = presupuestoInicial.id.slice(-6)
      const version = presupuestoInicial.version || 1
      return `${idCorto}/${version}`
    }
    
    // Para presupuestos con número asignado
    return `${presupuestoInicial.numero}/${presupuestoInicial.version || 1}`
  }
  
  const getEstadoColor = (estado: string): 'zinc' | 'blue' | 'green' | 'red' => {
    switch (estado) {
      case 'borrador': return 'zinc'
      case 'enviado': return 'blue'
      case 'aceptado': return 'green'
      case 'rechazado': return 'red'
      default: return 'zinc'
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Presupuesto {getNumeroCompleto()}
            </h1>
            {!esEdicion && (
              <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                Nuevo
              </span>
            )}
          </div>
          {!esEdicion && numeroPresupuesto && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Este presupuesto tendrá el número <strong>{numeroPresupuesto}/1</strong> cuando lo guardes
            </p>
          )}
        </div>
        
        {/* Selector de estado */}
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <Listbox 
            value={estadoPresupuesto} 
            onChange={setEstadoPresupuesto}
            className="min-w-[150px]"
          >
            {estadosDisponibles.map((estado) => (
              <ListboxOption key={estado.value} value={estado.value}>
                <ListboxLabel className="flex items-center gap-2">
                  <Badge color={getEstadoColor(estado.value) as any} className="text-xs">
                    {estado.label}
                  </Badge>
                </ListboxLabel>
              </ListboxOption>
            ))}
          </Listbox>
        </div>
      </div>

      {/* Sección de cliente */}
      <div className={`border ${!clienteSeleccionado ? 'border-red-300 dark:border-red-700' : 'border-zinc-200 dark:border-zinc-700'} rounded-lg p-6`}>
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Datos del Cliente
          {!clienteSeleccionado && (
            <span className="text-sm text-red-600 dark:text-red-400 font-normal">
              (Requerido)
            </span>
          )}
          {esEdicion && (
            <div className="flex items-center gap-2 ml-auto">
              <LockClosedIcon className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-500">Cliente fijado al editar</span>
            </div>
          )}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Seleccionar Cliente</label>
            <div className="flex gap-2">
              <Listbox 
                value={clienteSeleccionado} 
                onChange={setClienteSeleccionado}
                placeholder="Buscar cliente..."
                className="flex-1"
                disabled={esEdicion}
              >
                {clientes.map((cliente) => (
                  <ListboxOption key={cliente.id} value={cliente}>
                    <ListboxLabel>
                      {cliente.nombre} {cliente.apellidos}
                      <span className="text-xs text-zinc-500 ml-2">({cliente.nif})</span>
                    </ListboxLabel>
                  </ListboxOption>
                ))}
              </Listbox>
              {!esEdicion && (
                <Button
                  onClick={() => setMostrarModalCrearCliente(true)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  title="Crear nuevo cliente"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  Crear Cliente
                </Button>
              )}
            </div>
          </div>
          
          {clienteSeleccionado && (
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{clienteSeleccionado.nombre} {clienteSeleccionado.apellidos}</span>
                {clienteSeleccionado.tipoCliente === 'empresa' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Empresa</span>
                )}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <p><span className="font-medium">NIF:</span> {clienteSeleccionado.nif}</p>
                <p><span className="font-medium">Dirección:</span> {clienteSeleccionado.direccion}</p>
                <p><span className="font-medium">Teléfono:</span> {clienteSeleccionado.telefono}</p>
                <p><span className="font-medium">Email:</span> {clienteSeleccionado.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones principales */}
      <div className="flex gap-3">
        <Button 
          onClick={() => {
            if (!clienteSeleccionado) {
              setMensajeAlerta('Debes seleccionar o crear un cliente antes de añadir productos')
              setMostrarAlertaCliente(true)
              return
            }
            resetearFormulario()
            setMostrarFormularioProducto(true)
          }} 
          className="gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Añadir producto
        </Button>
        <Button 
          onClick={() => {
            if (!clienteSeleccionado) {
              setMensajeAlerta('Debes seleccionar o crear un cliente antes de añadir productos')
              setMostrarAlertaCliente(true)
              return
            }
            resetearFormulario()
            setMostrarFormularioNuevo(true)
          }}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <SparklesIcon className="h-5 w-5" />
          Crear producto
        </Button>
      </div>

      {/* Formulario para producto existente */}
      {mostrarFormularioProducto && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium">
            {lineaEditando ? 'Editar producto' : 'Añadir producto existente'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Producto</label>
              <Listbox 
                value={productoSeleccionado} 
                onChange={setProductoSeleccionado}
                placeholder="Selecciona un producto"
              >
                {productosDisponibles.map((prod) => (
                  <ListboxOption key={prod.id} value={prod}>
                    <ListboxLabel>{prod.nombre}</ListboxLabel>
                  </ListboxOption>
                ))}
              </Listbox>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Referencia</label>
              <Input 
                type="text" 
                placeholder="Opcional"
                value={nuevaLinea.referencia || ''}
                onChange={(e) => setNuevaLinea({...nuevaLinea, referencia: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cantidad</label>
              <Input 
                type="number" 
                min="1"
                value={nuevaLinea.cantidad}
                onChange={(e) => setNuevaLinea({...nuevaLinea, cantidad: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Precio (€)</label>
              <Input 
                type="number" 
                min="0"
                step="0.01"
                value={nuevaLinea.precio}
                onChange={(e) => setNuevaLinea({...nuevaLinea, precio: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          {productoSeleccionado && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-3">Configuración de {productoSeleccionado.nombre}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(dataService.getProductoCaracteristicas(productoSeleccionado.id)?.caracteristicas || {})
                  .map(([key, config]) => renderizarCampoCaracteristica(key, config))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              type="button"
              onClick={() => lineaEditando ? actualizarLinea(lineaEditando) : agregarProductoExistente()}
            >
              {lineaEditando ? 'Actualizar' : 'Añadir'}
            </Button>
            <Button 
              type="button"
              onClick={() => {
                setLineaEditando(null)
                resetearFormulario()
              }}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Formulario para producto nuevo */}
      {mostrarFormularioNuevo && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium">
            {lineaEditando ? 'Editar producto personalizado' : 'Crear producto nuevo'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Input 
                type="text" 
                placeholder="Describe el producto"
                value={nuevaLinea.descripcion || ''}
                onChange={(e) => setNuevaLinea({...nuevaLinea, descripcion: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Referencia</label>
              <Input 
                type="text" 
                placeholder="Opcional"
                value={nuevaLinea.referencia || ''}
                onChange={(e) => setNuevaLinea({...nuevaLinea, referencia: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cantidad</label>
              <Input 
                type="number" 
                min="1"
                value={nuevaLinea.cantidad}
                onChange={(e) => setNuevaLinea({...nuevaLinea, cantidad: parseInt(e.target.value) || 1})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Precio (€)</label>
              <Input 
                type="number" 
                min="0"
                step="0.01"
                value={nuevaLinea.precio}
                onChange={(e) => setNuevaLinea({...nuevaLinea, precio: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button"
              onClick={() => lineaEditando ? actualizarLinea(lineaEditando) : crearProductoNuevo()}
            >
              {lineaEditando ? 'Actualizar' : 'Crear'}
            </Button>
            <Button 
              type="button"
              onClick={() => {
                setLineaEditando(null)
                resetearFormulario()
              }}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Tabla de líneas del presupuesto */}
      {lineas.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-2 py-3 text-center text-sm font-medium w-20">Orden</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Producto/Descripción</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Cantidad</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Precio</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {lineas.map((linea, index) => (
                <tr key={linea.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        {index + 1}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => moverLineaArriba(index)}
                          className={`p-1 ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                          disabled={index === 0}
                          title="Mover arriba"
                        >
                          <ChevronUpIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => moverLineaAbajo(index)}
                          className={`p-1 ${index === lineas.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                          disabled={index === lineas.length - 1}
                          title="Mover abajo"
                        >
                          <ChevronDownIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {linea.tipo === 'nuevo' && (
                        <SparklesIcon className="h-4 w-4 text-green-600" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{linea.tipo === 'existente' ? linea.producto?.nombre : linea.descripcion}</span>
                          {linea.referencia && (
                            <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded">
                              Ref: {linea.referencia}
                            </span>
                          )}
                        </div>
                        {linea.caracteristicas && (
                          <div className="text-xs text-zinc-500 mt-1">
                            {Object.entries(linea.caracteristicas)
                              .filter(([_, value]) => value)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' | ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{linea.cantidad}</td>
                  <td className="px-4 py-3 text-right">{linea.precio.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {(linea.cantidad * linea.precio).toFixed(2)} €
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <Button
                        onClick={() => editarLinea(linea)}
                        className="p-1.5"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => duplicarLinea(linea)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700"
                        title="Duplicar"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => eliminarLinea(linea.id)}
                        className="p-1.5 bg-red-600 hover:bg-red-700"
                        title="Borrar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-medium">Total:</td>
                <td className="px-4 py-3 text-right font-bold text-lg">
                  {lineas.reduce((sum, linea) => sum + (linea.cantidad * linea.precio), 0).toFixed(2)} €
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Botón para guardar presupuesto */}
      {lineas.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button 
            onClick={() => router.push('/presupuestos/lista')} 
            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
          >
            Cancelar
          </Button>
          <Button onClick={guardarPresupuesto} className="bg-green-600 hover:bg-green-700">
            {esEdicion ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}
          </Button>
        </div>
      )}

      {/* Modal para crear cliente */}
      <Dialog open={mostrarModalCrearCliente} onClose={() => setMostrarModalCrearCliente(false)} size="2xl">
        <DialogTitle>Crear Nuevo Cliente</DialogTitle>
        <DialogDescription>
          Complete los datos del nuevo cliente. Una vez creado, se seleccionará automáticamente en el presupuesto.
        </DialogDescription>
        <DialogBody>
          <ClienteFormModal 
            onClienteCreado={handleClienteCreado}
            onCancelar={() => setMostrarModalCrearCliente(false)}
          />
        </DialogBody>
      </Dialog>
      
      {/* Modal de alerta */}
      <Dialog open={mostrarAlertaCliente} onClose={() => setMostrarAlertaCliente(false)} size="sm">
        <DialogTitle>Atención</DialogTitle>
        <DialogDescription>{mensajeAlerta}</DialogDescription>
        <DialogActions>
          <Button onClick={() => setMostrarAlertaCliente(false)}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
} 