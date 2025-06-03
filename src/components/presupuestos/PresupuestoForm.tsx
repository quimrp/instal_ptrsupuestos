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
import { dataService, type Presupuesto, type Cliente, type CaracteristicaValor, type LineaPresupuesto, type CaracteristicaSeleccionable, type CaracteristicaPermanente } from '@/services/dataService'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { ClienteFormModal } from '@/components/clientes/ClienteFormModal'
import { Fieldset, Legend, FieldGroup, Field, Label, Description, ErrorMessage } from '@/components/catalyst/fieldset'
import { CaracteristicasTable } from './CaracteristicasTable'
import { NuevaCaracteristicaModal } from './NuevaCaracteristicaModal'
import { CaracteristicasSeleccionables } from './CaracteristicasSeleccionables'
import { Switch } from '@/components/catalyst/switch'
import type { OpcionGlobalPresupuesto } from '@/types/presupuesto'

type Producto = {
  id: string
  nombre: string
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

type NuevaLinea = {
  referencia?: string
  cantidad: number
  precio: number
}

export function PresupuestoForm({ presupuestoInicial }: PresupuestoFormProps) {
  const [lineas, setLineas] = useState<LineaPresupuesto[]>([])
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false)
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [lineaEditando, setLineaEditando] = useState<string | null>(null)
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([])
  const [caracteristicasProducto, setCaracteristicasProducto] = useState<Record<string, CaracteristicaValor>>({})
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [mostrarModalCrearCliente, setMostrarModalCrearCliente] = useState(false)
  const [numeroPresupuesto, setNumeroPresupuesto] = useState<string>('')
  const [mostrarAlertaCliente, setMostrarAlertaCliente] = useState(false)
  const [mensajeAlerta, setMensajeAlerta] = useState('')
  const [estadoPresupuesto, setEstadoPresupuesto] = useState<EstadoPresupuesto>('borrador')
  const [nuevaLinea, setNuevaLinea] = useState<NuevaLinea>({
    cantidad: 1,
    precio: 0,
    referencia: ''
  })
  const [mostrarModalNuevaCaracteristica, setMostrarModalNuevaCaracteristica] = useState(false)
  const [opcionesGlobales, setOpcionesGlobales] = useState<OpcionGlobalPresupuesto[]>(presupuestoInicial?.opcionesGlobales || [])
  const [mostrarModalOpcionGlobal, setMostrarModalOpcionGlobal] = useState(false)
  const [opcionGlobalEditando, setOpcionGlobalEditando] = useState<null | {
    id: string
    nombre: string
    descripcion: string
    precio: number
    activada: boolean
  }>(null)
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
        const valoresIniciales: Record<string, CaracteristicaValor> = {}
        
        // Procesar características permanentes
        Object.entries(caracteristicas.caracteristicasPermanentes || {}).forEach(([key, config]) => {
          const valor = {
            valor: config.tipo === 'select' && config.opciones && config.opciones.length > 0
              ? config.opciones[0]
              : config.tipo === 'number'
              ? config.min || 0
              : '',
            precio: undefined,
            activada: true
          }
          valoresIniciales[key] = valor
        })

        // Procesar características seleccionables
        Object.entries(caracteristicas.caracteristicasSeleccionables || {}).forEach(([key, config]) => {
          let valorInicial: any = ''
          let precioInicial = config.precioBase || 0

          if (config.tipo === 'select' && config.opciones && config.opciones.length > 0) {
            valorInicial = config.opciones[0].valor
            precioInicial = config.opciones[0].precio
          } else if (config.tipo === 'number') {
            valorInicial = config.min || 0
          }

          valoresIniciales[key] = {
            valor: valorInicial,
            precio: config.incluyePrecio ? precioInicial : undefined,
            activada: config.activadaPorDefecto
          }
        })

        setCaracteristicasProducto(valoresIniciales)
        
        // Calcular precio inicial incluyendo características activas
        const precioBase = caracteristicas.precioBase || 0
        const precioCaracteristicas = Object.values(valoresIniciales)
          .reduce((total, { precio, activada }) => {
            return total + (activada && precio ? precio : 0)
          }, 0)
        
        // Establecer precio total del producto
          setNuevaLinea(prev => ({
            ...prev,
          precio: precioBase + precioCaracteristicas
          }))
      }
    }
  }, [productoSeleccionado])

  const calcularPrecioTotal = (caracteristicas: Record<string, CaracteristicaValor>, precioBase: number) => {
    console.log('=== Calculando Precio Total ===')
    console.log('Precio Base:', precioBase)
    
    // Calcular la suma de los precios de las características activas
    const precioCaracteristicas = Object.entries(caracteristicas).reduce((total, [nombre, { precio, activada }]) => {
      // Solo sumar si la característica está activada (o es permanente) y tiene precio
      const estaActiva = activada === undefined || activada === true
      const precioCaracteristica = estaActiva && precio ? precio : 0
      
      console.log(`Característica "${nombre}":`, {
        precio: precio || 0,
        activada: estaActiva,
        sumado: precioCaracteristica
      })
      
      return total + precioCaracteristica
    }, 0)
    
    console.log('Suma precios características:', precioCaracteristicas)
    console.log('Precio Total Final:', precioBase + precioCaracteristicas)
    console.log('========================')

    // Retornar la suma del precio base más las características
    return precioBase + precioCaracteristicas
  }

  const actualizarCaracteristica = (nombre: string, valor: any, activada?: boolean) => {
    console.log('Actualizando característica:', { nombre, valor, activada })
    if (!productoSeleccionado) return

    const caracteristicas = dataService.getProductoCaracteristicas(productoSeleccionado.id)
    if (!caracteristicas) return

    // Buscar la característica en ambas secciones
    const configPermanente = caracteristicas.caracteristicasPermanentes?.[nombre]
    const configSeleccionable = caracteristicas.caracteristicasSeleccionables?.[nombre]

    setCaracteristicasProducto(prev => {
      // Crear una copia del estado actual
      const nuevasCaracteristicas = { ...prev }

      // Actualizar o crear la característica
      if (configPermanente) {
      nuevasCaracteristicas[nombre] = {
        valor,
          precio: undefined,
          activada: true
        }
      } else if (configSeleccionable) {
        // Para características seleccionables de tipo select con opciones con precio
        let precioCaracteristica = configSeleccionable.precioBase || 0
        
        if (configSeleccionable.tipo === 'select' && configSeleccionable.opciones) {
          // Buscar el precio específico de la opción seleccionada
          const opcionSeleccionada = configSeleccionable.opciones.find(opt => opt.valor === valor)
          if (opcionSeleccionada) {
            precioCaracteristica = opcionSeleccionada.precio
          }
        }
        
        nuevasCaracteristicas[nombre] = {
          valor,
          precio: configSeleccionable.incluyePrecio ? precioCaracteristica : undefined,
          activada: activada ?? prev[nombre]?.activada ?? configSeleccionable.activadaPorDefecto
        }
      }

      console.log('Nuevas características:', nuevasCaracteristicas)

      // Calcular el precio total
      const precioBase = caracteristicas.precioBase || 0
      const precioCaracteristicas = Object.entries(nuevasCaracteristicas)
        .reduce((total, [_, caracteristica]) => {
          return total + (caracteristica.activada && caracteristica.precio ? caracteristica.precio : 0)
        }, 0)

      console.log('Precios:', {
        base: precioBase,
        caracteristicas: precioCaracteristicas,
        total: precioBase + precioCaracteristicas
      })

      // Actualizar el precio de la línea
      setNuevaLinea(prev => ({
        ...prev,
        precio: precioBase + precioCaracteristicas
      }))

      return nuevasCaracteristicas
    })
  }

  const actualizarPrecioCaracteristica = (nombre: string, precio: number) => {
    console.log('Actualizando precio de característica:', { nombre, precio })
    if (!productoSeleccionado) return

    const caracteristicas = dataService.getProductoCaracteristicas(productoSeleccionado.id)
    if (!caracteristicas) return

    setCaracteristicasProducto(prev => {
      // Crear una copia del estado actual
      const nuevasCaracteristicas = { ...prev }

      // Actualizar el precio de la característica
      if (nombre in nuevasCaracteristicas) {
        nuevasCaracteristicas[nombre] = {
          ...nuevasCaracteristicas[nombre],
          precio
        }
      }

      console.log('Nuevas características después de actualizar precio:', nuevasCaracteristicas)

      // Calcular el precio total
      const precioBase = caracteristicas.precioBase || 0
      const precioCaracteristicas = Object.entries(nuevasCaracteristicas)
        .reduce((total, [_, caracteristica]) => {
          return total + (caracteristica.activada && caracteristica.precio ? caracteristica.precio : 0)
        }, 0)

      console.log('Precios después de actualizar:', {
        base: precioBase,
        caracteristicas: precioCaracteristicas,
        total: precioBase + precioCaracteristicas
      })

      // Actualizar el precio de la línea
      setNuevaLinea(prev => ({
        ...prev,
        precio: precioBase + precioCaracteristicas
      }))

      return nuevasCaracteristicas
    })
  }

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

    console.log('=== Agregando Producto Existente ===')
    console.log('Producto:', productoSeleccionado)
    console.log('Precio Final:', nuevaLinea.precio)
    console.log('Características:', caracteristicasProducto)
    
    const nueva: LineaPresupuesto = {
      id: Date.now().toString(),
      tipo: 'existente',
      producto: {
        id: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre
      },
      referencia: nuevaLinea.referencia || '',
      caracteristicasPermanentes: {},
      caracteristicasSeleccionables: {},
      cantidad: nuevaLinea.cantidad || 1,
      precio: nuevaLinea.precio || 0
    }

    // Separar las características en permanentes y seleccionables
    Object.entries(caracteristicasProducto).forEach(([nombre, valor]) => {
      const caracteristicas = dataService.getProductoCaracteristicas(productoSeleccionado.id)
      if (!caracteristicas) return

      if (nombre in caracteristicas.caracteristicasPermanentes) {
        nueva.caracteristicasPermanentes[nombre] = valor
      } else if (nombre in caracteristicas.caracteristicasSeleccionables) {
        nueva.caracteristicasSeleccionables[nombre] = valor
      }
    })

    console.log('Nueva línea a agregar:', nueva)
    setLineas([...lineas, nueva])
    resetearFormulario()
  }

  const agregarProductoPersonalizado = () => {
    if (!nuevaLinea.referencia) {
      setMensajeAlerta('La referencia es obligatoria para productos personalizados')
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
      tipo: 'personalizado',
      producto: {
        id: 'personalizado',
        nombre: nuevaLinea.referencia
      },
      referencia: nuevaLinea.referencia,
      caracteristicasPermanentes: {},
      caracteristicasSeleccionables: {},
      cantidad: nuevaLinea.cantidad || 1,
      precio: nuevaLinea.precio || 0
    }
    setLineas([...lineas, nueva])
    resetearFormulario()
  }

  const crearProductoNuevo = () => {
    if (!nuevaLinea.referencia) {
      setMensajeAlerta('La referencia es obligatoria para productos personalizados')
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
      tipo: 'personalizado',
      producto: {
        id: 'personalizado',
        nombre: nuevaLinea.referencia
      },
      referencia: nuevaLinea.referencia || '',
      caracteristicasPermanentes: {},
      caracteristicasSeleccionables: {},
      cantidad: nuevaLinea.cantidad || 1,
      precio: nuevaLinea.precio || 0
    }
    setLineas([...lineas, nueva])
    resetearFormulario()
  }

  const editarLinea = (linea: LineaPresupuesto) => {
    console.log('Editando línea:', linea)
    setLineaEditando(linea.id)
    setMostrarFormularioProducto(true)
    setMostrarFormularioNuevo(false)

    if (linea.tipo === 'existente') {
      const producto = productosDisponibles.find(p => p.id === linea.producto.id)
      if (producto) {
        console.log('Producto encontrado:', producto)
        setProductoSeleccionado(producto)
        
        // Obtener la configuración del producto
        const configuracionProducto = dataService.getProductoCaracteristicas(producto.id)
        if (configuracionProducto) {
          // Inicializar características con valores por defecto
          const caracteristicasIniciales: Record<string, CaracteristicaValor> = {}

          // Procesar características permanentes
          Object.entries(configuracionProducto.caracteristicasPermanentes || {}).forEach(([nombre, config]) => {
            caracteristicasIniciales[nombre] = {
              valor: linea.caracteristicasPermanentes[nombre]?.valor || (
                config.tipo === 'select' && config.opciones && config.opciones.length > 0
                  ? config.opciones[0]
                  : config.tipo === 'number'
                  ? config.min || 0
                  : ''
              ),
              precio: undefined,
              activada: true
            }
          })

          // Procesar características seleccionables
          Object.entries(configuracionProducto.caracteristicasSeleccionables || {}).forEach(([nombre, config]) => {
            const caracteristicaExistente = linea.caracteristicasSeleccionables[nombre]
            
            let valorInicial = caracteristicaExistente?.valor
            let precioInicial = config.precioBase || 0
            
            if (!valorInicial) {
              // Si no hay valor existente, usar el valor por defecto
              if (config.tipo === 'select' && config.opciones && config.opciones.length > 0) {
                valorInicial = config.opciones[0].valor
                precioInicial = config.opciones[0].precio
              } else if (config.tipo === 'number') {
                valorInicial = config.min || 0
              } else {
                valorInicial = ''
              }
            } else if (config.tipo === 'select' && config.opciones) {
              // Si hay valor existente y es un select, buscar el precio de la opción
              const opcionSeleccionada = config.opciones.find(opt => opt.valor === valorInicial)
              if (opcionSeleccionada) {
                precioInicial = opcionSeleccionada.precio
              }
            }
            
            caracteristicasIniciales[nombre] = {
              valor: valorInicial,
              precio: caracteristicaExistente?.precio || (config.incluyePrecio ? precioInicial : undefined),
              activada: caracteristicaExistente?.activada ?? config.activadaPorDefecto
            }
          })

          console.log('Características inicializadas:', caracteristicasIniciales)
          setCaracteristicasProducto(caracteristicasIniciales)
        }
      }
    }

    setNuevaLinea({
      referencia: linea.referencia || '',
      cantidad: linea.cantidad,
      precio: linea.precio
    })

    // Asegurarse de que el formulario sea visible
    const formulario = document.querySelector('.border.border-zinc-200')
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const actualizarLinea = (id: string) => {
    console.log('Actualizando línea:', id)
    console.log('Estado actual de características:', caracteristicasProducto)
    
    if (!productoSeleccionado && !nuevaLinea.referencia) {
      setMensajeAlerta('Debes seleccionar un producto o ingresar una referencia')
      setMostrarAlertaCliente(true)
      return
    }

    setLineas(lineasActuales => lineasActuales.map(linea => {
      if (linea.id === id) {
        if (productoSeleccionado) {
          console.log('Actualizando línea existente con producto:', productoSeleccionado)
          
          // Obtener la configuración del producto
          const configuracionProducto = dataService.getProductoCaracteristicas(productoSeleccionado.id)
          if (!configuracionProducto) return linea

          // Separar características en permanentes y seleccionables
          const caracteristicasPermanentes: Record<string, CaracteristicaValor> = {}
          const caracteristicasSeleccionables: Record<string, CaracteristicaValor> = {}

          // Procesar todas las características del producto
          Object.entries(caracteristicasProducto).forEach(([nombre, caracteristica]) => {
            console.log(`Procesando característica ${nombre}:`, caracteristica)

            // Verificar si es una característica permanente
            if (configuracionProducto.caracteristicasPermanentes?.[nombre]) {
              caracteristicasPermanentes[nombre] = {
                valor: caracteristica.valor,
                precio: caracteristica.precio,
                activada: true
              }
            }
            // Verificar si es una característica seleccionable
            else if (configuracionProducto.caracteristicasSeleccionables?.[nombre]) {
              caracteristicasSeleccionables[nombre] = {
                valor: caracteristica.valor,
                precio: caracteristica.precio,
                activada: caracteristica.activada ?? false
              }
            }
          })

          console.log('Características permanentes finales:', caracteristicasPermanentes)
          console.log('Características seleccionables finales:', caracteristicasSeleccionables)

          // Usar el precio que ya se calculó y está en nuevaLinea
          const precioTotal = nuevaLinea.precio

          console.log('Precio total desde nuevaLinea:', precioTotal)

          const lineaActualizada: LineaPresupuesto = {
            ...linea,
            tipo: 'existente' as const,
            producto: {
              id: productoSeleccionado.id,
              nombre: productoSeleccionado.nombre
            },
            referencia: nuevaLinea.referencia || '',
            caracteristicasPermanentes,
            caracteristicasSeleccionables,
            cantidad: nuevaLinea.cantidad || 1,
            precio: precioTotal
          }

          console.log('Línea actualizada:', lineaActualizada)
          return lineaActualizada
        } else {
          console.log('Actualizando línea como personalizada')
          const lineaPersonalizada: LineaPresupuesto = {
            ...linea,
            tipo: 'personalizado' as const,
            producto: {
              id: 'personalizado',
              nombre: nuevaLinea.referencia || ''
            },
            referencia: nuevaLinea.referencia || '',
            caracteristicasPermanentes: {},
            caracteristicasSeleccionables: {},
            cantidad: nuevaLinea.cantidad || 1,
            precio: nuevaLinea.precio || 0
          }
          return lineaPersonalizada
        }
      }
      return linea
    }))

    setLineaEditando(null)
    setMostrarFormularioProducto(false)
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

  const resetearFormulario = () => {
    setProductoSeleccionado(null)
    setCaracteristicasProducto({})
    setNuevaLinea({
      cantidad: 1,
      precio: 0,
      referencia: ''
    })
  }

  const abrirModalNuevaOpcionGlobal = () => {
    setOpcionGlobalEditando(null)
    setMostrarModalOpcionGlobal(true)
  }

  const abrirModalEditarOpcionGlobal = (opcion: {
    id: string
    nombre: string
    descripcion: string
    precio: number
    activada: boolean
  }) => {
    setOpcionGlobalEditando(opcion)
    setMostrarModalOpcionGlobal(true)
  }

  const guardarOpcionGlobal = (opcion: {
    id: string
    nombre: string
    descripcion: string
    precio: number
    activada: boolean
  }) => {
    if (opcion.id) {
      setOpcionesGlobales(prev => prev.map(o => o.id === opcion.id ? opcion : o))
    } else {
      setOpcionesGlobales(prev => [...prev, { ...opcion, id: Date.now().toString() }])
    }
    setMostrarModalOpcionGlobal(false)
  }

  const eliminarOpcionGlobal = (id: string) => {
    setOpcionesGlobales(prev => prev.filter(o => o.id !== id))
  }

  const toggleOpcionGlobal = (id: string) => {
    setOpcionesGlobales(prev => prev.map(o => o.id === id ? { ...o, activada: !o.activada } : o))
  }

  const totalOpcionesGlobales = opcionesGlobales.reduce((sum, o) => o.activada ? sum + o.precio : sum, 0)
  const totalPresupuesto = lineas.reduce((sum, linea) => sum + (linea.cantidad * linea.precio), 0) + totalOpcionesGlobales

  const guardarPresupuesto = async () => {
    if (!clienteSeleccionado) {
      setMensajeAlerta('Debes seleccionar un cliente')
      setMostrarAlertaCliente(true)
      return
    }
    if (lineas.length === 0) {
      setMensajeAlerta('Debes agregar al menos una línea al presupuesto')
      setMostrarAlertaCliente(true)
      return
    }
    try {
      const total = totalPresupuesto
      const datosPresupuesto = {
        numero: presupuestoInicial?.numero,
        clienteId: clienteSeleccionado.id,
        cliente: clienteSeleccionado.nombre,
        datosCliente: clienteSeleccionado,
        lineas,
        opcionesGlobales,
        total,
        estado: estadoPresupuesto
      }
      if (presupuestoInicial) {
        await dataService.actualizarPresupuesto(presupuestoInicial.id, datosPresupuesto)
      } else {
        await dataService.guardarPresupuesto(datosPresupuesto)
      }
      router.push('/presupuestos/lista')
    } catch (error) {
      console.error('Error al guardar presupuesto:', error)
      setMensajeAlerta(error instanceof Error ? error.message : 'Error al guardar presupuesto')
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

  const renderizarLinea = (linea: LineaPresupuesto) => {
    // Obtener la configuración del producto para acceder a las etiquetas
    const productoConfig = linea.tipo === 'existente' 
      ? dataService.getProductoCaracteristicas(linea.producto.id) 
      : null

    return (
      <div key={linea.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{linea.producto.nombre}</span>
            {linea.referencia && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                (Ref: {linea.referencia})
              </span>
            )}
          </div>
        
          {/* Mostrar características permanentes */}
          {linea.caracteristicasPermanentes && Object.entries(linea.caracteristicasPermanentes).length > 0 && (
          <div className="ml-4 text-sm text-zinc-600 dark:text-zinc-400">
            {Object.entries(linea.caracteristicasPermanentes).map(([nombre, { valor }]) => {
              const label = productoConfig?.caracteristicasPermanentes?.[nombre]?.label || nombre
              return (
                <div key={nombre}>
                  <span className="font-medium">{label}:</span> {valor}
                </div>
              )
            })}
            </div>
          )}
        
        {/* Mostrar características seleccionables activas */}
        {linea.caracteristicasSeleccionables && 
         Object.entries(linea.caracteristicasSeleccionables).filter(([_, { activada }]) => activada).length > 0 && (
          <div className="ml-4 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Opciones incluidas:</span>
            {Object.entries(linea.caracteristicasSeleccionables)
              .filter(([_, { activada }]) => activada)
              .map(([nombre, { valor, precio }]) => {
                const label = productoConfig?.caracteristicasSeleccionables?.[nombre]?.label || nombre
                return (
                  <div key={nombre} className="text-green-600 dark:text-green-400">
                    ✓ {label}: {valor}
                    {precio !== undefined && precio > 0 && ` (+${precio}€)`}
                </div>
                )
              })}
            </div>
          )}
      </div>
    )
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

          {/* Renderizar campos de características */}
          {productoSeleccionado && (
            <div className="space-y-6">
              {/* Características Permanentes */}
              <Fieldset>
                <Legend>Características Permanentes</Legend>
                <div className="space-y-4">
                  {Object.entries(caracteristicasProducto)
                    .filter(([nombre, _]) => {
                      const producto = dataService.getProductoCaracteristicas(productoSeleccionado.id)
                      return nombre in (producto?.caracteristicasPermanentes || {})
                    })
                    .map(([nombre, caracteristica]) => {
                      const producto = dataService.getProductoCaracteristicas(productoSeleccionado.id)
                      const config = producto?.caracteristicasPermanentes?.[nombre]
                      if (!config) return null

                      return (
                        <Field key={nombre}>
                        <Label>{config.label}</Label>
                          {config.tipo === 'select' && config.opciones ? (
                            <Listbox
                              value={caracteristica.valor}
                              onChange={(valor) => actualizarCaracteristica(nombre, valor)}
                            >
                              {config.opciones.map((opcion) => (
                                <ListboxOption key={opcion} value={opcion}>
                                  <ListboxLabel>{opcion}</ListboxLabel>
                                </ListboxOption>
                              ))}
                            </Listbox>
                          ) : (
                            <Input
                              type={config.tipo}
                              value={caracteristica.valor}
                              onChange={(e) => actualizarCaracteristica(nombre, e.target.value)}
                              min={config.min}
                              max={config.max}
                            />
                          )}
                              </Field>
                      )
                    })}
                </div>
              </Fieldset>

              {/* Características Seleccionables */}
              <Fieldset>
                <Legend>Características Seleccionables</Legend>
                <div className="space-y-4">
                  {productoSeleccionado && (
                    <>
                      {/* Componente para manejar las características seleccionables */}
                      <CaracteristicasSeleccionables
                        caracteristicas={dataService.getProductoCaracteristicas(productoSeleccionado.id)?.caracteristicasSeleccionables || {}}
                        valores={caracteristicasProducto}
                        onUpdate={(nombre, valor) => {
                          setCaracteristicasProducto(prev => {
                            const nuevasCaracteristicas = { ...prev, [nombre]: valor }
                            
                            // Recalcular precio total
                            const configuracionProducto = dataService.getProductoCaracteristicas(productoSeleccionado.id)
                            if (configuracionProducto) {
                              const precioBase = configuracionProducto.precioBase || 0
                              const precioCaracteristicas = Object.values(nuevasCaracteristicas)
                                .reduce((total, caracteristica) => {
                                  return total + (caracteristica.activada && caracteristica.precio ? caracteristica.precio : 0)
                                }, 0)
                              
                              setNuevaLinea(prev => ({
                                ...prev,
                                precio: precioBase + precioCaracteristicas
                              }))
                            }
                            
                            return nuevasCaracteristicas
                          })
                        }}
                      />
                    </>
                  )}
                          </div>
              </Fieldset>
              
              {/* Gestión de Características del Producto - Solo visible si queremos gestionar el producto */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100">
                  ⚙️ Gestionar características del producto (avanzado)
                </summary>
                
                <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Aquí puedes añadir, editar o eliminar las características disponibles para este producto. 
                    Los cambios se aplicarán a todos los presupuestos futuros.
                  </p>
                  
                  {/* Tabla para gestionar características */}
                  <CaracteristicasTable
                    caracteristicas={dataService.getProductoCaracteristicas(productoSeleccionado.id)?.caracteristicasSeleccionables || {}}
                    onUpdate={async (nombre, caracteristica) => {
                      const producto = dataService.getProductoCaracteristicas(productoSeleccionado.id)
                      if (producto) {
                        producto.caracteristicasSeleccionables = {
                          ...producto.caracteristicasSeleccionables,
                          [nombre]: caracteristica
                        }
                        const actualizado = await dataService.actualizarProductoCaracteristicas(productoSeleccionado.id, producto)
                        if (actualizado) {
                          // Si la característica existe en el estado actual, actualizar sus valores
                          if (caracteristicasProducto[nombre]) {
                            const primerOpcion = caracteristica.opciones && caracteristica.opciones.length > 0 
                              ? caracteristica.opciones[0] 
                              : null
                            
                            setCaracteristicasProducto(prev => ({
                              ...prev,
                              [nombre]: {
                                valor: primerOpcion ? primerOpcion.valor : '',
                                precio: caracteristica.incluyePrecio && primerOpcion ? primerOpcion.precio : undefined,
                                activada: prev[nombre].activada
                              }
                            }))
                          }
                        }
                      }
                    }}
                    onDelete={async (nombre) => {
                      const producto = dataService.getProductoCaracteristicas(productoSeleccionado.id)
                      if (producto && producto.caracteristicasSeleccionables) {
                        const { [nombre]: _, ...resto } = producto.caracteristicasSeleccionables
                        producto.caracteristicasSeleccionables = resto
                        const actualizado = await dataService.actualizarProductoCaracteristicas(productoSeleccionado.id, producto)
                        if (actualizado) {
                          // Eliminar del estado local
                          setCaracteristicasProducto(prev => {
                            const { [nombre]: _, ...resto } = prev
                            return resto
                          })
                        }
                      }
                    }}
                  />
                  
                  <Button
                    onClick={() => setMostrarModalNuevaCaracteristica(true)}
                    className="mt-4"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Añadir Característica
                  </Button>
                </div>
              </details>
              
              <NuevaCaracteristicaModal
                abierto={mostrarModalNuevaCaracteristica}
                onClose={() => setMostrarModalNuevaCaracteristica(false)}
                onGuardar={async (nombre, caracteristica) => {
                  const producto = dataService.getProductoCaracteristicas(productoSeleccionado.id)
                  if (producto) {
                    producto.caracteristicasSeleccionables = {
                      ...producto.caracteristicasSeleccionables,
                      [nombre]: caracteristica
                    }
                    const actualizado = await dataService.actualizarProductoCaracteristicas(productoSeleccionado.id, producto)
                    if (actualizado) {
                      // Añadir nueva característica al estado local
                      const primerOpcion = caracteristica.opciones && caracteristica.opciones.length > 0 
                        ? caracteristica.opciones[0] 
                        : null
                      
                      setCaracteristicasProducto(prev => ({
                        ...prev,
                        [nombre]: {
                          valor: primerOpcion ? primerOpcion.valor : '',
                          precio: caracteristica.incluyePrecio && primerOpcion ? primerOpcion.precio : undefined,
                          activada: caracteristica.activadaPorDefecto
                        }
                      }))
                    }
                  }
                }}
              />
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
              onClick={() => lineaEditando ? actualizarLinea(lineaEditando) : agregarProductoPersonalizado()}
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
                    {renderizarLinea(linea)}
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
                  {totalPresupuesto.toFixed(2)} €
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
          <Button 
            onClick={guardarPresupuesto}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {presupuestoInicial ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
          </Button>
        </div>
      )}

      {/* Tabla de opciones globales */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Opciones globales del presupuesto</h3>
          <Button type="button" onClick={abrirModalNuevaOpcionGlobal}>Añadir opción</Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-2 py-1">Nombre</th>
              <th className="text-left px-2 py-1">Descripción</th>
              <th className="text-right px-2 py-1">Precio (€)</th>
              <th className="text-center px-2 py-1">Activa</th>
              <th className="text-center px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {opcionesGlobales.map(opcion => (
              <tr key={opcion.id}>
                <td className="px-2 py-1">{opcion.nombre}</td>
                <td className="px-2 py-1">{opcion.descripcion}</td>
                <td className="px-2 py-1 text-right">{opcion.precio.toFixed(2)}</td>
                <td className="px-2 py-1 text-center">
                  <input type="checkbox" checked={opcion.activada} onChange={() => toggleOpcionGlobal(opcion.id)} />
                </td>
                <td className="px-2 py-1 text-center">
                  <Button type="button" onClick={() => abrirModalEditarOpcionGlobal(opcion)}>Editar</Button>
                  <Button type="button" className="ml-2 bg-red-500 hover:bg-red-600" onClick={() => eliminarOpcionGlobal(opcion.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {/* Modal para añadir/editar opción global */}
      <Dialog open={mostrarModalOpcionGlobal} onClose={() => setMostrarModalOpcionGlobal(false)} size="sm">
        <DialogTitle>{opcionGlobalEditando ? 'Editar opción global' : 'Añadir opción global'}</DialogTitle>
        <DialogBody>
          <form onSubmit={e => {
            e.preventDefault()
            const form = e.target as any
            const nombre = form.nombre.value.trim()
            const descripcion = form.descripcion.value.trim()
            const precio = parseFloat(form.precio.value)
            if (!nombre || isNaN(precio)) return
            guardarOpcionGlobal({
              id: opcionGlobalEditando?.id || '',
              nombre,
              descripcion,
              precio,
              activada: opcionGlobalEditando?.activada ?? true
            })
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Input name="nombre" defaultValue={opcionGlobalEditando?.nombre || ''} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <Input name="descripcion" defaultValue={opcionGlobalEditando?.descripcion || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio (€)</label>
              <Input name="precio" type="number" min="0" step="0.01" defaultValue={opcionGlobalEditando?.precio || 0} required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setMostrarModalOpcionGlobal(false)} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900">Cancelar</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Guardar</Button>
            </div>
          </form>
        </DialogBody>
      </Dialog>
    </div>
  )
} 