import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CLIENTES_FILE = path.join(process.cwd(), 'src/data/clientes.json')

// GET - Obtener todos los clientes
export async function GET() {
  try {
    const data = await fs.readFile(CLIENTES_FILE, 'utf8')
    const { clientes } = JSON.parse(data)
    return NextResponse.json({ clientes })
  } catch (error) {
    console.error('Error al leer clientes:', error)
    return NextResponse.json({ clientes: [] })
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const nuevoCliente = await request.json()
    
    // Leer datos actuales
    const data = await fs.readFile(CLIENTES_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    
    // Agregar nuevo cliente
    jsonData.clientes.push(nuevoCliente)
    
    // Escribir de vuelta al archivo
    await fs.writeFile(CLIENTES_FILE, JSON.stringify(jsonData, null, 2))
    
    return NextResponse.json({ success: true, cliente: nuevoCliente })
  } catch (error) {
    console.error('Error al guardar cliente:', error)
    return NextResponse.json({ error: 'Error al guardar cliente' }, { status: 500 })
  }
}

// PUT - Actualizar cliente existente
export async function PUT(request: NextRequest) {
  try {
    const { id, ...datos } = await request.json()
    
    // Leer datos actuales
    const data = await fs.readFile(CLIENTES_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    
    // Buscar y actualizar cliente
    const index = jsonData.clientes.findIndex((c: any) => c.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    
    jsonData.clientes[index] = { ...jsonData.clientes[index], ...datos, id }
    
    // Escribir de vuelta al archivo
    await fs.writeFile(CLIENTES_FILE, JSON.stringify(jsonData, null, 2))
    
    return NextResponse.json({ success: true, cliente: jsonData.clientes[index] })
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 })
  }
}

// DELETE - Eliminar cliente
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    // Leer datos actuales
    const data = await fs.readFile(CLIENTES_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    
    // Filtrar clientes
    const clientesActualizados = jsonData.clientes.filter((c: any) => c.id !== id)
    
    if (clientesActualizados.length === jsonData.clientes.length) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    
    jsonData.clientes = clientesActualizados
    
    // Escribir de vuelta al archivo
    await fs.writeFile(CLIENTES_FILE, JSON.stringify(jsonData, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 })
  }
} 