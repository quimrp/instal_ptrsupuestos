import productosCaracteristicas from '@/data/productos-caracteristicas.json'

export type CaracteristicaProducto = {
  label: string
  tipo: 'select' | 'number' | 'text'
  opciones?: string[]
  min?: number
  max?: number
}

export type ProductoCaracteristicas = {
  nombre: string
  caracteristicas: Record<string, CaracteristicaProducto>
}

export type LineaPresupuesto = {
  id: string
  tipo: 'existente' | 'nuevo'
  producto?: {
    id: string
    nombre: string
  }
  descripcion?: string
  referencia?: string
  caracteristicas?: Record<string, any>
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
}

class DataService {
  // Obtener características de un producto
  getProductoCaracteristicas(productoId: string): ProductoCaracteristicas | null {
    const productos = productosCaracteristicas as Record<string, ProductoCaracteristicas>
    return productos[productoId] || null
  }

  // Obtener todos los productos disponibles
  getProductosDisponibles() {
    const productos = productosCaracteristicas as Record<string, ProductoCaracteristicas>
    return Object.entries(productos).map(([id, data]) => ({
      id,
      nombre: data.nombre
    }))
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
      const response = await fetch('/api/presupuestos')
      if (response.ok) {
        const data = await response.json()
        return data.presupuestos
      }
    } catch (error) {
      console.error('Error al obtener presupuestos:', error)
    }
    return []
  }

  async getPresupuesto(id: string): Promise<Presupuesto | null> {
    try {
      const presupuestos = await this.getPresupuestos()
      return presupuestos.find(p => p.id === id) || null
    } catch (error) {
      console.error('Error al obtener presupuesto:', error)
    }
    return null
  }

  // Generar número de presupuesto: AÑO + número de 4 dígitos empezando desde 635
  async generarNumeroPresupuesto(): Promise<string> {
    const presupuestos = await this.getPresupuestos()
    const year = new Date().getFullYear()
    const presupuestosDelAnio = presupuestos.filter(p => p.numero && p.numero.startsWith(year.toString()))
    
    const numeroInicial = 635
    
    if (presupuestosDelAnio.length === 0) {
      return `${year}${numeroInicial.toString().padStart(4, '0')}`
    }
    
    const maxNum = Math.max(...presupuestosDelAnio.map(p => parseInt(p.numero.slice(4)) || 0))
    const siguiente = (maxNum + 1).toString().padStart(4, '0')
    return `${year}${siguiente}`
  }

  // Obtener el siguiente número de presupuesto (sin guardar)
  async obtenerSiguienteNumero(): Promise<string> {
    return this.generarNumeroPresupuesto()
  }

  async guardarPresupuesto(presupuesto: Omit<Presupuesto, 'id' | 'fecha' | 'numero' | 'version' | 'versiones'> & { numero?: string }): Promise<Presupuesto> {
    const numero = presupuesto.numero || await this.generarNumeroPresupuesto()
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

  async crearNuevaVersionPresupuesto(id: string): Promise<Presupuesto | null> {
    const presupuestos = await this.getPresupuestos()
    const presupuestoActual = presupuestos.find(p => p.id === id)
    if (!presupuestoActual) return null
    
    const { versiones, ...versionAnteriorSinVersiones } = presupuestoActual
    const nuevasVersiones = [...(versiones || []), versionAnteriorSinVersiones]
    
    const nuevaVersion: Presupuesto = {
      ...presupuestoActual,
      id: Date.now().toString(), // Nuevo ID para la nueva versión
      version: (presupuestoActual.version || 1) + 1,
      fecha: new Date().toISOString(),
      estado: 'borrador',
      versiones: nuevasVersiones
    }

    try {
      const response = await fetch('/api/presupuestos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaVersion) // Enviar la nueva versión completa para actualizar
      })
      if (response.ok) {
        const data = await response.json()
        return data.presupuesto
      }
    } catch (error) {
      console.error('Error al crear nueva versión:', error)
    }
    return null
  }

  async restaurarVersionPresupuesto(idPresupuesto: string, numeroVersionRestaurar: number): Promise<Presupuesto | null> {
    const presupuestos = await this.getPresupuestos()
    const presupuestoBase = presupuestos.find(p => p.id === idPresupuesto)
    if (!presupuestoBase) return null

    const versionARestaurar = presupuestoBase.versiones?.find(v => v.version === numeroVersionRestaurar)
    if (!versionARestaurar) return null

    const { versiones, ...versionActualSinVersiones } = presupuestoBase
    const nuevasVersionesHistoricas = [...(versiones || []), versionActualSinVersiones]

    const versionRestaurada: Presupuesto = {
        ...versionARestaurar,
        id: Date.now().toString(), // Nuevo ID para la "nueva" versión actual
        numero: presupuestoBase.numero, // Mantiene el número del presupuesto original
        version: (presupuestoBase.version || 1) + 1, // Nueva versión principal
        fecha: new Date().toISOString(),
        estado: 'borrador',
        versiones: nuevasVersionesHistoricas
    }

    try {
      const response = await fetch('/api/presupuestos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(versionRestaurada) // Enviar la versión restaurada para actualizar
      });
      if (response.ok) {
        const data = await response.json();
        return data.presupuesto;
      }
    } catch (error) {
      console.error('Error al restaurar versión:', error);
    }
    return null;
  }
  
  async actualizarPresupuesto(id: string, datos: Partial<Presupuesto>): Promise<Presupuesto | null> {
    try {
      const response = await fetch('/api/presupuestos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...datos })
      })
      if (response.ok) {
        const data = await response.json()
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
}

export const dataService = new DataService() 