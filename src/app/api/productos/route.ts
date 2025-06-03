import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { type CaracteristicaPermanente, type CaracteristicaSeleccionable, type ProductoCaracteristicas } from '@/services/dataService'

const PRODUCTOS_FILE = path.join(process.cwd(), 'src/data/productos-caracteristicas.json')

// Función para validar una característica permanente
function validarCaracteristicaPermanente(caracteristica: any): caracteristica is CaracteristicaPermanente {
  return (
    typeof caracteristica === 'object' &&
    typeof caracteristica.label === 'string' &&
    ['select', 'number', 'text'].includes(caracteristica.tipo) &&
    (caracteristica.tipo !== 'select' || Array.isArray(caracteristica.opciones)) &&
    (caracteristica.tipo !== 'number' || (
      typeof caracteristica.min === 'number' &&
      typeof caracteristica.max === 'number'
    ))
  )
}

// Función para validar una característica seleccionable
function validarCaracteristicaSeleccionable(caracteristica: any): caracteristica is CaracteristicaSeleccionable {
  if (typeof caracteristica !== 'object') return false
  if (typeof caracteristica.label !== 'string') return false
  if (!['select', 'number', 'text'].includes(caracteristica.tipo)) return false
  if (typeof caracteristica.incluyePrecio !== 'boolean') return false
  if (typeof caracteristica.precioBase !== 'number') return false
  if (typeof caracteristica.activadaPorDefecto !== 'boolean') return false
  
  // Para select, verificar que las opciones sean válidas
  if (caracteristica.tipo === 'select' && caracteristica.opciones) {
    if (!Array.isArray(caracteristica.opciones)) return false
    for (const opcion of caracteristica.opciones) {
      if (typeof opcion !== 'object') return false
      if (typeof opcion.valor !== 'string') return false
      if (typeof opcion.precio !== 'number') return false
    }
  }
  
  // Para number, verificar min y max si existen
  if (caracteristica.tipo === 'number') {
    if (caracteristica.min !== undefined && typeof caracteristica.min !== 'number') return false
    if (caracteristica.max !== undefined && typeof caracteristica.max !== 'number') return false
  }
  
  return true
}

// Función para validar un producto
function validarProducto(producto: any): producto is ProductoCaracteristicas {
  return (
    typeof producto === 'object' &&
    typeof producto.nombre === 'string' &&
    (typeof producto.precioBase === 'undefined' || typeof producto.precioBase === 'number') &&
    typeof producto.caracteristicasPermanentes === 'object' &&
    Object.values(producto.caracteristicasPermanentes).every(validarCaracteristicaPermanente) &&
    typeof producto.caracteristicasSeleccionables === 'object' &&
    Object.values(producto.caracteristicasSeleccionables).every(validarCaracteristicaSeleccionable)
  )
}

export async function GET() {
  try {
    const data = await fs.readFile(PRODUCTOS_FILE, 'utf-8')
    const productos = JSON.parse(data)
    return NextResponse.json({ productos })
  } catch (error) {
    console.error('Error al leer productos:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { nombre, caracteristicasPermanentes, caracteristicasSeleccionables, precioBase } = await request.json()
    
    // Validar datos
    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
    }

    // Leer archivo actual
    const data = await fs.readFile(PRODUCTOS_FILE, 'utf-8')
    const productos = JSON.parse(data)

    // Crear ID único basado en el nombre
    const id = nombre.toLowerCase().replace(/\s+/g, '_')

    // Verificar si ya existe
    if (productos[id]) {
      return NextResponse.json({ error: 'Ya existe un producto con ese nombre' }, { status: 400 })
    }

    // Crear nuevo producto
    const nuevoProducto = {
      nombre,
      precioBase: precioBase || 0,
      caracteristicasPermanentes: caracteristicasPermanentes || {},
      caracteristicasSeleccionables: caracteristicasSeleccionables || {}
    }

    // Validar estructura del producto
    if (!validarProducto(nuevoProducto)) {
      return NextResponse.json({ error: 'Estructura de producto inválida' }, { status: 400 })
    }

    // Agregar nuevo producto
    productos[id] = nuevoProducto

    // Guardar cambios
    await fs.writeFile(PRODUCTOS_FILE, JSON.stringify(productos, null, 2))

    return NextResponse.json({ producto: { id, ...nuevoProducto } })
  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, nombre, caracteristicasPermanentes, caracteristicasSeleccionables, precioBase } = await request.json()
    
    // Validar datos
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Leer archivo actual
    const data = await fs.readFile(PRODUCTOS_FILE, 'utf-8')
    const productos = JSON.parse(data)

    // Verificar si existe
    if (!productos[id]) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Crear producto actualizado
    const productoActualizado = {
      nombre: nombre || productos[id].nombre,
      precioBase: precioBase ?? productos[id].precioBase ?? 0,
      caracteristicasPermanentes: caracteristicasPermanentes || productos[id].caracteristicasPermanentes || {},
      caracteristicasSeleccionables: caracteristicasSeleccionables || productos[id].caracteristicasSeleccionables || {}
    }

    // Validar estructura del producto
    if (!validarProducto(productoActualizado)) {
      return NextResponse.json({ error: 'Estructura de producto inválida' }, { status: 400 })
    }

    // Actualizar producto
    productos[id] = productoActualizado

    // Guardar cambios
    await fs.writeFile(PRODUCTOS_FILE, JSON.stringify(productos, null, 2))

    console.log('Producto actualizado:', { id, ...productoActualizado })
    return NextResponse.json({ producto: { id, ...productoActualizado } })
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // Leer archivo actual
    const data = await fs.readFile(PRODUCTOS_FILE, 'utf-8')
    const productos = JSON.parse(data)

    // Verificar si existe
    if (!productos[id]) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Eliminar producto
    delete productos[id]

    // Guardar cambios
    await fs.writeFile(PRODUCTOS_FILE, JSON.stringify(productos, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
} 