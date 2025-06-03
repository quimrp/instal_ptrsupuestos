'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { PresupuestoForm } from '@/components/presupuestos/PresupuestoForm'
import { dataService, type Presupuesto, type LineaPresupuesto, type CaracteristicaValor } from '@/services/dataService'

// Función para convertir formato antiguo a nuevo
const convertirFormatoCaracteristicas = (linea: LineaPresupuesto): LineaPresupuesto => {
  if ('caracteristicas' in linea) {
    console.log('Convirtiendo línea de formato antiguo:', linea)
    const caracteristicasAntiguas = (linea as any).caracteristicas
    const nuevaLinea: LineaPresupuesto = {
      ...linea,
      caracteristicasPermanentes: {} as Record<string, CaracteristicaValor>,
      caracteristicasSeleccionables: {} as Record<string, CaracteristicaValor>
    }
    delete (nuevaLinea as any).caracteristicas

    // Obtener la configuración del producto
    const producto = dataService.getProductoCaracteristicas(linea.producto.id)
    if (producto) {
      console.log('Producto encontrado para conversión:', producto)
      // Distribuir las características entre permanentes y seleccionables
      Object.entries(caracteristicasAntiguas).forEach(([nombre, valor]) => {
        const caracteristicaPermanente = producto.caracteristicasPermanentes?.[nombre]
        const caracteristicaSeleccionable = producto.caracteristicasSeleccionables?.[nombre]

        if (caracteristicaPermanente) {
          nuevaLinea.caracteristicasPermanentes[nombre] = {
            valor,
            activada: true
          }
        } else if (caracteristicaSeleccionable) {
          nuevaLinea.caracteristicasSeleccionables[nombre] = {
            valor,
            activada: true,
            precio: caracteristicaSeleccionable.precioBase
          }
        }
      })
      console.log('Línea convertida:', nuevaLinea)
    }
    return nuevaLinea
  }
  return linea
}

export default function EditarPresupuestoPage() {
  const params = useParams();
  console.log('INICIO EditarPresupuestoPage - params:', params);

  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  useEffect(() => {
    cargarPresupuesto()
  }, [params.id, searchParams])
  
  const cargarPresupuesto = async () => {
    try {
      if (!params.id || typeof params.id !== 'string') {
        console.error('ID de presupuesto no válido:', params.id)
        setError('ID de presupuesto no válido')
        return
      }

      console.log('EditarPage: Intentando cargar presupuesto con ID:', params.id);
      const data = await dataService.getPresupuesto(params.id)
      console.log('EditarPage: Datos recibidos de getPresupuesto:', data);
      
      if (!data) {
        console.error('No se encontró el presupuesto')
        setError('No se encontró el presupuesto')
        return
      }

      // Convertir formato antiguo a nuevo si es necesario
      const presupuestoConvertido = {
        ...data,
        lineas: data.lineas.map(convertirFormatoCaracteristicas)
      }

      // Verificar si se especificó una versión específica
      const versionParam = searchParams.get('version')
      if (versionParam) {
        const versionNum = parseInt(versionParam)
        if (versionNum !== presupuestoConvertido.version) {
          // Buscar la versión específica en el histórico
          const versionEspecifica = presupuestoConvertido.versiones?.find(v => v.version === versionNum)
          if (versionEspecifica) {
            // Usar la versión específica pero con el ID principal
            setPresupuesto({
              ...versionEspecifica,
              id: presupuestoConvertido.id,
              numero: presupuestoConvertido.numero,
              lineas: versionEspecifica.lineas.map(convertirFormatoCaracteristicas)
            })
          } else {
            setPresupuesto(presupuestoConvertido)
          }
        } else {
          setPresupuesto(presupuestoConvertido)
        }
      } else {
        setPresupuesto(presupuestoConvertido)
      }
    } catch (error) {
      console.error('Error al cargar el presupuesto:', error)
      setError('Error al cargar el presupuesto')
    } finally {
      setCargando(false)
    }
  }
  
  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">Cargando presupuesto...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center text-red-600">
          {error}
          <div className="mt-4">
            <button
              onClick={() => router.push('/presupuestos/lista')}
              className="text-blue-600 hover:underline"
            >
              Volver a la lista de presupuestos
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  if (!presupuesto) {
    return null
  }
  
  return (
    <div>
      <PresupuestoForm presupuestoInicial={presupuesto} />
    </div>
  )
} 