'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { PresupuestoForm } from '@/components/presupuestos/PresupuestoForm'
import { dataService, type Presupuesto } from '@/services/dataService'

export default function EditarPresupuestoPage() {
  const params = useParams();
  console.log('INICIO EditarPresupuestoPage - params:', params);

  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [cargando, setCargando] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  useEffect(() => {
    cargarPresupuesto()
  }, [params.id, searchParams])
  
  const cargarPresupuesto = async () => {
    try {
      if (params.id && typeof params.id === 'string') {
        console.log('EditarPage: Intentando cargar presupuesto con ID:', params.id);
        const data = await dataService.getPresupuesto(params.id)
        console.log('EditarPage: Datos recibidos de getPresupuesto:', data);
        if (data) {
          // Verificar si se especificó una versión específica
          const versionParam = searchParams.get('version')
          if (versionParam) {
            const versionNum = parseInt(versionParam)
            if (versionNum !== data.version) {
              // Buscar la versión específica en el histórico
              const versionEspecifica = data.versiones?.find(v => v.version === versionNum)
              if (versionEspecifica) {
                // Usar la versión específica pero con el ID principal
                setPresupuesto({
                  ...versionEspecifica,
                  id: data.id, // Mantener el ID principal
                  numero: data.numero // Mantener el número principal
                })
              } else {
                setPresupuesto(data)
              }
            } else {
              setPresupuesto(data)
            }
          } else {
            setPresupuesto(data)
          }
        } else {
          // Presupuesto no encontrado
          router.push('/presupuestos/lista')
        }
      }
    } catch (error) {
      console.error('Error al cargar el presupuesto:', error)
      router.push('/presupuestos/lista')
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
  
  if (!presupuesto) {
    return null
  }
  
  return (
    <div>
      <PresupuestoForm presupuestoInicial={presupuesto} />
    </div>
  )
} 