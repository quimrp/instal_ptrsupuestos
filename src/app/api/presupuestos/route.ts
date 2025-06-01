import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const PRESUPUESTOS_FILE = path.join(process.cwd(), 'src/data/presupuestos.json')

// GET - Obtener todos los presupuestos
export async function GET() {
  try {
    const data = await fs.readFile(PRESUPUESTOS_FILE, 'utf8')
    const { presupuestos } = JSON.parse(data)
    return NextResponse.json({ presupuestos })
  } catch (error) {
    console.error('Error al leer presupuestos:', error)
    return NextResponse.json({ presupuestos: [] })
  }
}

// POST - Crear nuevo presupuesto
export async function POST(request: NextRequest) {
  try {
    const nuevoPresupuesto = await request.json()
    
    // Leer datos actuales
    const data = await fs.readFile(PRESUPUESTOS_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    
    // Agregar nuevo presupuesto
    jsonData.presupuestos.push(nuevoPresupuesto)
    
    // Escribir de vuelta al archivo
    await fs.writeFile(PRESUPUESTOS_FILE, JSON.stringify(jsonData, null, 2))
    
    return NextResponse.json({ success: true, presupuesto: nuevoPresupuesto })
  } catch (error) {
    console.error('Error al guardar presupuesto:', error)
    return NextResponse.json({ error: 'Error al guardar presupuesto' }, { status: 500 })
  }
}

// PUT - Actualizar presupuesto existente
export async function PUT(request: NextRequest) {
  try {
    const { id, ...datos } = await request.json()
    
    // Leer datos actuales
    const data = await fs.readFile(PRESUPUESTOS_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    
    // Buscar y actualizar presupuesto
    const index = jsonData.presupuestos.findIndex((p: any) => p.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
    }
    
    jsonData.presupuestos[index] = { ...jsonData.presupuestos[index], ...datos, id }
    
    // Escribir de vuelta al archivo
    await fs.writeFile(PRESUPUESTOS_FILE, JSON.stringify(jsonData, null, 2))
    
    return NextResponse.json({ success: true, presupuesto: jsonData.presupuestos[index] })
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error)
    return NextResponse.json({ error: 'Error al actualizar presupuesto' }, { status: 500 })
  }
}

// DELETE - Eliminar presupuesto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    // Leer datos actuales
    const data = await fs.readFile(PRESUPUESTOS_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    
    // Filtrar presupuestos
    const presupuestosActualizados = jsonData.presupuestos.filter((p: any) => p.id !== id)
    
    if (presupuestosActualizados.length === jsonData.presupuestos.length) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
    }
    
    jsonData.presupuestos = presupuestosActualizados
    
    // Escribir de vuelta al archivo
    await fs.writeFile(PRESUPUESTOS_FILE, JSON.stringify(jsonData, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error)
    return NextResponse.json({ error: 'Error al eliminar presupuesto' }, { status: 500 })
  }
} 