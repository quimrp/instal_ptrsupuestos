// Servicio robusto para gestión de productos
// Este servicio maneja toda la lógica de productos, características y precios

import { productosCaracteristicas } from '@/data/productos-caracteristicas'

// ===== TIPOS BASE =====
export interface OpcionPrecio {
  valor: string
  precio: number
}

export interface CaracteristicaConfig {
  label: string
  tipo: 'select' | 'number' | 'text'
  min?: number
  max?: number
}

export interface CaracteristicaPermanente extends CaracteristicaConfig {
  opciones?: string[]
}

export interface CaracteristicaSeleccionable extends CaracteristicaConfig {
  opciones?: OpcionPrecio[]
  incluyePrecio: boolean
  precioBase: number
  activadaPorDefecto: boolean
}

export interface Producto {
  id: string
  nombre: string
  precioBase: number
  caracteristicasPermanentes: Record<string, CaracteristicaPermanente>
  caracteristicasSeleccionables: Record<string, CaracteristicaSeleccionable>
}

export interface ValorCaracteristica {
  valor: any
  precio?: number
  activada?: boolean
}

// ===== SERVICIO DE PRODUCTOS =====
class ProductService {
  private productos: Record<string, Producto>

  constructor() {
    // Inicializar con los datos importados
    this.productos = this.normalizarProductos(productosCaracteristicas)
  }

  // Normalizar los datos de productos para asegurar consistencia
  private normalizarProductos(datos: any): Record<string, Producto> {
    const productosNormalizados: Record<string, Producto> = {}
    
    for (const [id, producto] of Object.entries(datos)) {
      productosNormalizados[id] = {
        id,
        nombre: (producto as any).nombre || id,
        precioBase: (producto as any).precioBase || 0,
        caracteristicasPermanentes: this.normalizarCaracteristicasPermanentes(
          (producto as any).caracteristicasPermanentes || {}
        ),
        caracteristicasSeleccionables: this.normalizarCaracteristicasSeleccionables(
          (producto as any).caracteristicasSeleccionables || {}
        )
      }
    }
    
    return productosNormalizados
  }

  private normalizarCaracteristicasPermanentes(
    caracteristicas: any
  ): Record<string, CaracteristicaPermanente> {
    const resultado: Record<string, CaracteristicaPermanente> = {}
    
    for (const [nombre, config] of Object.entries(caracteristicas)) {
      resultado[nombre] = {
        label: (config as any).label || nombre,
        tipo: (config as any).tipo || 'text',
        opciones: (config as any).opciones,
        min: (config as any).min,
        max: (config as any).max
      }
    }
    
    return resultado
  }

  private normalizarCaracteristicasSeleccionables(
    caracteristicas: any
  ): Record<string, CaracteristicaSeleccionable> {
    const resultado: Record<string, CaracteristicaSeleccionable> = {}
    
    for (const [nombre, config] of Object.entries(caracteristicas)) {
      resultado[nombre] = {
        label: (config as any).label || nombre,
        tipo: (config as any).tipo || 'text',
        opciones: (config as any).opciones,
        incluyePrecio: (config as any).incluyePrecio ?? false,
        precioBase: (config as any).precioBase ?? 0,
        activadaPorDefecto: (config as any).activadaPorDefecto ?? false,
        min: (config as any).min,
        max: (config as any).max
      }
    }
    
    return resultado
  }

  // ===== MÉTODOS PÚBLICOS =====

  // Obtener todos los productos disponibles
  obtenerProductos(): Producto[] {
    return Object.values(this.productos)
  }

  // Obtener un producto por ID
  obtenerProducto(id: string): Producto | null {
    return this.productos[id] || null
  }

  // Obtener lista simplificada de productos para selectores
  obtenerListaProductos(): Array<{ id: string; nombre: string }> {
    return Object.entries(this.productos).map(([id, producto]) => ({
      id,
      nombre: producto.nombre
    }))
  }

  // Calcular precio total de un producto con sus características
  calcularPrecio(
    productoId: string,
    caracteristicas: Record<string, ValorCaracteristica>
  ): number {
    const producto = this.obtenerProducto(productoId)
    if (!producto) return 0

    let precioTotal = producto.precioBase

    // Sumar precios de características seleccionables activas
    for (const [nombre, valor] of Object.entries(caracteristicas)) {
      if (valor.activada && valor.precio) {
        precioTotal += valor.precio
      }
    }

    return precioTotal
  }

  // Validar valores de características
  validarCaracteristicas(
    productoId: string,
    caracteristicas: Record<string, ValorCaracteristica>
  ): { valido: boolean; errores: string[] } {
    const producto = this.obtenerProducto(productoId)
    if (!producto) {
      return { valido: false, errores: ['Producto no encontrado'] }
    }

    const errores: string[] = []

    // Validar características permanentes
    for (const [nombre, config] of Object.entries(producto.caracteristicasPermanentes)) {
      const valor = caracteristicas[nombre]
      
      if (!valor || valor.valor === undefined || valor.valor === '') {
        errores.push(`${config.label} es requerido`)
        continue
      }

      if (config.tipo === 'select' && config.opciones) {
        if (!config.opciones.includes(valor.valor)) {
          errores.push(`${config.label}: opción inválida`)
        }
      } else if (config.tipo === 'number') {
        const num = Number(valor.valor)
        if (isNaN(num)) {
          errores.push(`${config.label} debe ser un número`)
        } else {
          if (config.min !== undefined && num < config.min) {
            errores.push(`${config.label} debe ser mayor o igual a ${config.min}`)
          }
          if (config.max !== undefined && num > config.max) {
            errores.push(`${config.label} debe ser menor o igual a ${config.max}`)
          }
        }
      }
    }

    // Validar características seleccionables activas
    for (const [nombre, valor] of Object.entries(caracteristicas)) {
      if (!valor.activada) continue

      const config = producto.caracteristicasSeleccionables[nombre]
      if (!config) continue

      if (config.tipo === 'select' && config.opciones) {
        const opcionValida = config.opciones.some(opt => opt.valor === valor.valor)
        if (!opcionValida) {
          errores.push(`${config.label}: opción inválida`)
        }
      }
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }

  // Obtener valores por defecto para un producto
  obtenerValoresPorDefecto(productoId: string): Record<string, ValorCaracteristica> {
    const producto = this.obtenerProducto(productoId)
    if (!producto) return {}

    const valores: Record<string, ValorCaracteristica> = {}

    // Valores por defecto para características permanentes
    for (const [nombre, config] of Object.entries(producto.caracteristicasPermanentes)) {
      let valorDefecto: any = ''
      
      if (config.tipo === 'select' && config.opciones && config.opciones.length > 0) {
        valorDefecto = config.opciones[0]
      } else if (config.tipo === 'number') {
        valorDefecto = config.min || 0
      }

      valores[nombre] = {
        valor: valorDefecto,
        activada: true
      }
    }

    // Valores por defecto para características seleccionables
    for (const [nombre, config] of Object.entries(producto.caracteristicasSeleccionables)) {
      let valorDefecto: any = ''
      let precioDefecto = config.precioBase

      if (config.tipo === 'select' && config.opciones && config.opciones.length > 0) {
        valorDefecto = config.opciones[0].valor
        precioDefecto = config.opciones[0].precio
      } else if (config.tipo === 'number') {
        valorDefecto = config.min || 0
      }

      valores[nombre] = {
        valor: valorDefecto,
        precio: config.incluyePrecio ? precioDefecto : undefined,
        activada: config.activadaPorDefecto
      }
    }

    return valores
  }

  // Actualizar precio de una característica según su valor
  actualizarPrecioCaracteristica(
    productoId: string,
    nombreCaracteristica: string,
    valor: any
  ): number | undefined {
    const producto = this.obtenerProducto(productoId)
    if (!producto) return undefined

    const config = producto.caracteristicasSeleccionables[nombreCaracteristica]
    if (!config || !config.incluyePrecio) return undefined

    if (config.tipo === 'select' && config.opciones) {
      const opcion = config.opciones.find(opt => opt.valor === valor)
      return opcion ? opcion.precio : config.precioBase
    }

    return config.precioBase
  }

  // Crear un nuevo producto
  async crearProducto(producto: Omit<Producto, 'id'>): Promise<Producto> {
    const id = this.generarId(producto.nombre)
    const nuevoProducto: Producto = {
      id,
      ...producto
    }

    this.productos[id] = nuevoProducto

    // TODO: Persistir en base de datos/archivo
    await this.persistirProductos()

    return nuevoProducto
  }

  // Actualizar un producto existente
  async actualizarProducto(id: string, datos: Partial<Producto>): Promise<Producto | null> {
    const productoExistente = this.obtenerProducto(id)
    if (!productoExistente) return null

    const productoActualizado = {
      ...productoExistente,
      ...datos,
      id // Asegurar que el ID no cambie
    }

    this.productos[id] = productoActualizado

    // TODO: Persistir en base de datos/archivo
    await this.persistirProductos()

    return productoActualizado
  }

  // Eliminar un producto
  async eliminarProducto(id: string): Promise<boolean> {
    if (!this.productos[id]) return false

    delete this.productos[id]

    // TODO: Persistir en base de datos/archivo
    await this.persistirProductos()

    return true
  }

  // ===== MÉTODOS PRIVADOS =====

  private generarId(nombre: string): string {
    // Generar un ID basado en el nombre
    const base = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    let id = base
    let contador = 1

    while (this.productos[id]) {
      id = `${base}-${contador}`
      contador++
    }

    return id
  }

  private async persistirProductos(): Promise<void> {
    // TODO: Implementar persistencia real
    // Por ahora, solo logueamos
    console.log('Productos actualizados:', this.productos)
    
    // En el futuro, esto podría:
    // - Guardar en una base de datos
    // - Actualizar un archivo
    // - Llamar a una API
  }
}

// Exportar instancia única del servicio
export const productService = new ProductService()

// Exportar también la clase para testing
export { ProductService } 