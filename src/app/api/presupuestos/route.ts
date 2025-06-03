import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { type Presupuesto, type LineaPresupuesto, type CaracteristicaValor } from '@/services/dataService'

const PRESUPUESTOS_FILE = path.join(process.cwd(), 'src/data/presupuestos.json')

// Función para validar la estructura de una línea de presupuesto
function validarLineaPresupuesto(linea: any): linea is LineaPresupuesto {
  return (
    typeof linea === 'object' &&
    typeof linea.id === 'string' &&
    (linea.tipo === 'existente' || linea.tipo === 'personalizado') &&
    typeof linea.producto === 'object' &&
    typeof linea.producto.id === 'string' &&
    typeof linea.producto.nombre === 'string' &&
    typeof linea.cantidad === 'number' &&
    typeof linea.precio === 'number' &&
    typeof linea.caracteristicasPermanentes === 'object' &&
    typeof linea.caracteristicasSeleccionables === 'object'
  )
}

// Función para validar la estructura de un presupuesto
function validarPresupuesto(presupuesto: any): presupuesto is Presupuesto {
  return (
    typeof presupuesto === 'object' &&
    typeof presupuesto.id === 'string' &&
    typeof presupuesto.numero === 'string' &&
    typeof presupuesto.version === 'number' &&
    typeof presupuesto.fecha === 'string' &&
    typeof presupuesto.clienteId === 'string' &&
    typeof presupuesto.cliente === 'string' &&
    typeof presupuesto.estado === 'string' &&
    Array.isArray(presupuesto.lineas) &&
    presupuesto.lineas.every(validarLineaPresupuesto) &&
    typeof presupuesto.total === 'number'
  )
}

// Función para convertir formato antiguo a nuevo
function convertirFormatoCaracteristicas(linea: any): LineaPresupuesto {
  if (!linea.caracteristicas) return linea

  const nuevaLinea = {
    ...linea,
    caracteristicasPermanentes: {} as Record<string, CaracteristicaValor>,
    caracteristicasSeleccionables: {} as Record<string, CaracteristicaValor>
  }
  delete nuevaLinea.caracteristicas

  // Convertir características antiguas al nuevo formato
  Object.entries(linea.caracteristicas).forEach(([nombre, valor]) => {
    nuevaLinea.caracteristicasPermanentes[nombre] = {
      valor,
      activada: true
    }
  })

  return nuevaLinea
}

// GET - Obtener todos los presupuestos
export async function GET() {
  try {
    const data = await fs.readFile(PRESUPUESTOS_FILE, 'utf8')
    const { presupuestos } = JSON.parse(data)
    
    // Convertir presupuestos antiguos al nuevo formato
    const presupuestosActualizados = presupuestos.map((p: any) => ({
      ...p,
      lineas: p.lineas.map(convertirFormatoCaracteristicas)
    }))
    
    return NextResponse.json({ presupuestos: presupuestosActualizados })
  } catch (error) {
    console.error('Error al leer presupuestos:', error)
    return NextResponse.json({ presupuestos: [] })
  }
}

// POST - Crear nuevo presupuesto
export async function POST(request: NextRequest) {
  try {
    const nuevoPresupuesto = await request.json()
    
    // Validar estructura del presupuesto
    if (!validarPresupuesto(nuevoPresupuesto)) {
      return NextResponse.json(
        { error: 'Estructura de presupuesto inválida' },
        { status: 400 }
      )
    }
    
    // Leer datos actuales
    const data = await fs.readFile(PRESUPUESTOS_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    
    // Agregar nuevo presupuesto
    jsonData.presupuestos.push(nuevoPresupuesto)
    
    // Escribir de vuelta al archivo
    await fs.writeFile(
      PRESUPUESTOS_FILE,
      JSON.stringify(jsonData, null, 2)
    )
    
    return NextResponse.json({ success: true, presupuesto: nuevoPresupuesto })
  } catch (error) {
    console.error('Error al guardar presupuesto:', error)
    return NextResponse.json(
      { error: 'Error al guardar presupuesto' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar presupuesto existente
export async function PUT(request: NextRequest) {
  try {
    const { id, ...datos } = await request.json()
    
    // Leer datos actuales
    const data = await fs.readFile(PRESUPUESTOS_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    
    // Buscar presupuesto
    const index = jsonData.presupuestos.findIndex((p: any) => p.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }
    
    // Crear presupuesto actualizado
    const presupuestoActualizado = {
      ...jsonData.presupuestos[index],
      ...datos,
      id
    }
    
    // Validar estructura del presupuesto actualizado
    if (!validarPresupuesto(presupuestoActualizado)) {
      return NextResponse.json(
        { error: 'Estructura de presupuesto inválida' },
        { status: 400 }
      )
    }
    
    // Actualizar presupuesto
    jsonData.presupuestos[index] = presupuestoActualizado
    
    // Escribir de vuelta al archivo
    await fs.writeFile(
      PRESUPUESTOS_FILE,
      JSON.stringify(jsonData, null, 2)
    )
    
    return NextResponse.json({
      success: true,
      presupuesto: presupuestoActualizado
    })
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar presupuesto' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar presupuesto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }
    
    // Leer datos actuales
    const data = await fs.readFile(PRESUPUESTOS_FILE, 'utf8')
    const jsonData = JSON.parse(data)
    
    // Filtrar presupuestos
    const presupuestosActualizados = jsonData.presupuestos.filter(
      (p: any) => p.id !== id
    )
    
    if (presupuestosActualizados.length === jsonData.presupuestos.length) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      )
    }
    
    jsonData.presupuestos = presupuestosActualizados
    
    // Escribir de vuelta al archivo
    await fs.writeFile(
      PRESUPUESTOS_FILE,
      JSON.stringify(jsonData, null, 2)
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar presupuesto' },
      { status: 500 }
    )
  }
} 