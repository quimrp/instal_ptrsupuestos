import productosCaracteristicas from '@/data/productos-caracteristicas'
import type { OpcionGlobalPresupuesto } from '@/types/presupuesto'

// Crear una copia tipada para evitar problemas de tipos
const productosCaracteristicasData = productosCaracteristicas as Record<string, ProductoCaracteristicas>

export type OpcionPrecio = {
  valor: string
  precio: number
}

export type CaracteristicaBase = {
  label: string
  tipo: 'select' | 'number' | 'text'
  min?: number
  max?: number
}

export type CaracteristicaPermanente = CaracteristicaBase & {
  opciones?: string[]
}

export type CaracteristicaSeleccionable = CaracteristicaBase & {
  opciones?: OpcionPrecio[]
  incluyePrecio: boolean
  precioBase: number
  activadaPorDefecto: boolean
}

export type ProductoCaracteristicas = {
  nombre: string
  caracteristicasPermanentes: Record<string, CaracteristicaPermanente>
  caracteristicasSeleccionables: Record<string, CaracteristicaSeleccionable>
  precioBase?: number
}

export type CaracteristicaValor = {
  valor: any
  precio?: number
  activada?: boolean
}

export type LineaPresupuesto = {
  id: string
  tipo: 'existente' | 'personalizado'
  producto: {
    id: string
    nombre: string
  }
  referencia?: string
  caracteristicasPermanentes: Record<string, CaracteristicaValor>
  caracteristicasSeleccionables: Record<string, CaracteristicaValor>
  cantidad: number
  precio: number
}

export type Cliente = {
  id: string
  nombre: string
  apellidos: string
  nif: string
  direccion: string
  telefono: string
  email: string
  tipoCliente: 'particular' | 'empresa'
}

export type Presupuesto = {
  id: string
  numero: string // Ej: 20250635 (año + 4 dígitos empezando desde 635)
  version: number // Ej: 1, 2, 3...
  fecha: string
  clienteId?: string
  cliente?: string
  datosCliente?: Cliente
  lineas: LineaPresupuesto[]
  total: number
  estado: 'borrador' | 'enviado' | 'aceptado' | 'rechazado'
  versiones?: Presupuesto[] // Histórico de versiones anteriores
  opcionesGlobales?: OpcionGlobalPresupuesto[]
}

class DataService {
  // ========== GESTIÓN DE PRODUCTOS ==========
  // Obtener características de un producto
  getProductoCaracteristicas(productoId: string): ProductoCaracteristicas | null {
    const producto = productosCaracteristicasData[productoId]
    if (!producto) return null

    // Asegurarse de que las características tengan los valores por defecto necesarios
    const caracteristicasSeleccionables: Record<string, CaracteristicaSeleccionable> = {}
    Object.entries(producto.caracteristicasSeleccionables || {}).forEach(([nombre, caracteristica]) => {
      caracteristicasSeleccionables[nombre] = {
        ...caracteristica,
        incluyePrecio: caracteristica.incluyePrecio ?? false,
        precioBase: caracteristica.precioBase ?? 0,
        activadaPorDefecto: caracteristica.activadaPorDefecto ?? false
      } as CaracteristicaSeleccionable
    })

      return {
      ...producto,
      caracteristicasSeleccionables
    }
  }

  // Obtener todos los productos disponibles
  getProductosDisponibles() {
    return Object.entries(productosCaracteristicasData).map(([id, data]) => ({
      id,
      nombre: data.nombre
    }))
  }

  // Crear nuevo producto
  async crearProducto(
    nombre: string, 
    datos: {
      caracteristicasPermanentes: Record<string, CaracteristicaPermanente>
      caracteristicasSeleccionables: Record<string, CaracteristicaSeleccionable>
      precioBase?: number
    }
  ) {
    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre, 
          caracteristicasPermanentes: datos.caracteristicasPermanentes,
          caracteristicasSeleccionables: datos.caracteristicasSeleccionables,
          precioBase: datos.precioBase
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear producto')
      }
      
      const data = await response.json()
      return data.producto
    } catch (error) {
      console.error('Error al crear producto:', error)
      throw error
    }
  }

  // Actualizar producto existente
  async actualizarProducto(
    id: string, 
    datos: { 
      nombre?: string
      caracteristicasPermanentes?: Record<string, CaracteristicaPermanente>
      caracteristicasSeleccionables?: Record<string, CaracteristicaSeleccionable>
      precioBase?: number
    }
  ) {
    try {
      const response = await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...datos })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar producto')
      }
      
      const data = await response.json()
      return data.producto
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      throw error
    }
  }

  // Eliminar producto
  async eliminarProducto(id: string) {
    try {
      const response = await fetch(`/api/productos?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar producto')
      }
      
      return true
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      throw error
    }
  }

  // ========== GESTIÓN DE CLIENTES ==========
  async getClientes(): Promise<Cliente[]> {
    try {
      const response = await fetch('/api/clientes')
      if (response.ok) {
        const data = await response.json()
        return data.clientes
      }
    } catch (error) {
      console.error('Error al obtener clientes:', error)
    }
    return []
  }

  async getCliente(id: string): Promise<Cliente | null> {
    try {
      const clientes = await this.getClientes()
      return clientes.find(c => c.id === id) || null
    } catch (error) {
      console.error('Error al obtener cliente:', error)
    }
    return null
  }

  async guardarCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      })
      if (response.ok) {
        const data = await response.json()
        return data.cliente
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error)
    }
    throw new Error('No se pudo guardar el cliente')
  }

  async actualizarCliente(id: string, datos: Partial<Cliente>): Promise<Cliente | null> {
    try {
      const response = await fetch('/api/clientes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...datos })
      })
      if (response.ok) {
        const data = await response.json()
        return data.cliente
      }
    } catch (error) {
      console.error('Error al actualizar cliente:', error)
    }
    return null
  }

  async eliminarCliente(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/clientes?id=${id}`, { method: 'DELETE' })
      return response.ok
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
    }
    return false
  }

  // ========== GESTIÓN DE PRESUPUESTOS ==========
  async getPresupuestos(): Promise<Presupuesto[]> {
    try {
      console.log('Obteniendo todos los presupuestos...');
      const response = await fetch('/api/presupuestos')
      if (response.ok) {
        const data = await response.json()
        console.log('Presupuestos obtenidos:', data.presupuestos);
        return data.presupuestos
      }
    } catch (error) {
      console.error('Error al obtener presupuestos:', error)
    }
    return []
  }

  async getPresupuesto(id: string): Promise<Presupuesto | null> {
    try {
      console.log('Buscando presupuesto con ID:', id);
      const presupuestos = await this.getPresupuestos()
      const presupuesto = presupuestos.find(p => p.id === id)
      console.log('Presupuesto encontrado:', presupuesto);
      return presupuesto || null
    } catch (error) {
      console.error('Error al obtener presupuesto:', error)
    }
    return null
  }

  async obtenerSiguienteNumero(): Promise<string> {
    try {
      const presupuestos = await this.getPresupuestos()
      const año = new Date().getFullYear()
      
      // Filtrar presupuestos del año actual
      const presupuestosAñoActual = presupuestos.filter(p => p.numero.startsWith(año.toString()))
      
      if (presupuestosAñoActual.length === 0) {
        // Si no hay presupuestos este año, empezar desde 635
        return `${año}0635`
      }
      
      // Encontrar el número más alto
      const numeros = presupuestosAñoActual.map(p => parseInt(p.numero.slice(-4)))
      const ultimoNumero = Math.max(...numeros)
      
      // Incrementar en 1
      const siguienteNumero = ultimoNumero + 1
      return `${año}${siguienteNumero.toString().padStart(4, '0')}`
    } catch (error) {
      console.error('Error al obtener siguiente número:', error)
      throw error
    }
  }

  async guardarPresupuesto(presupuesto: Omit<Presupuesto, 'id' | 'fecha' | 'numero' | 'version' | 'versiones'> & { numero?: string }): Promise<Presupuesto> {
    const numero = presupuesto.numero || await this.obtenerSiguienteNumero()
    const nuevoPresupuesto: Presupuesto = {
      ...presupuesto,
      id: Date.now().toString(),
      numero,
      version: 1,
      fecha: new Date().toISOString(),
      versiones: []
    }
    
    try {
      const response = await fetch('/api/presupuestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPresupuesto)
      })
      if (response.ok) {
        const data = await response.json()
        return data.presupuesto
      }
    } catch (error) {
      console.error('Error al guardar presupuesto:', error)
    }
    throw new Error('No se pudo guardar el presupuesto')
  }

  async actualizarPresupuesto(id: string, datos: Partial<Presupuesto>): Promise<Presupuesto | null> {
    try {
      console.log('Actualizando presupuesto:', { id, datos });
      const response = await fetch('/api/presupuestos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...datos })
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Presupuesto actualizado:', data.presupuesto);
        return data.presupuesto
      }
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error)
    }
    return null
  }

  async eliminarPresupuesto(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/presupuestos?id=${id}`, { method: 'DELETE' })
      return response.ok
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error)
    }
    return false
  }

  async crearNuevaVersionPresupuesto(id: string): Promise<Presupuesto | null> {
    try {
      console.log('Creando nueva versión para presupuesto:', id)
      // Obtener el presupuesto actual
      const presupuestoActual = await this.getPresupuesto(id)
      if (!presupuestoActual) {
        console.error('No se encontró el presupuesto original')
        return null
      }

      // Crear una copia del presupuesto actual
      const nuevaVersion: Presupuesto = {
        ...presupuestoActual,
        version: (presupuestoActual.version || 1) + 1,
        fecha: new Date().toISOString(),
        estado: 'borrador'
      }

      // Guardar la versión actual en el histórico
      const versiones = presupuestoActual.versiones || []
      const presupuestoActualizado = {
        ...presupuestoActual,
        versiones: [...versiones, { ...presupuestoActual, versiones: [] }]
      }

      // Actualizar el presupuesto con la nueva versión
      const presupuestoFinal = await this.actualizarPresupuesto(id, presupuestoActualizado)
      if (!presupuestoFinal) {
        console.error('Error al actualizar el presupuesto con la nueva versión')
        return null
      }

      console.log('Nueva versión creada:', nuevaVersion)
      return nuevaVersion
    } catch (error) {
      console.error('Error al crear nueva versión:', error)
      return null
    }
  }

  // Añadir método para actualizar características de un producto
  async actualizarProductoCaracteristicas(productoId: string, caracteristicas: ProductoCaracteristicas): Promise<boolean> {
    try {
      const response = await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productoId,
          caracteristicasPermanentes: caracteristicas.caracteristicasPermanentes,
          caracteristicasSeleccionables: caracteristicas.caracteristicasSeleccionables
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Error al actualizar características del producto:', error)
      return false
    }
  }
}

export const dataService = new DataService() 