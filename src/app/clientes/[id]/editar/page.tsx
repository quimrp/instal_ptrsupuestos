'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ClienteForm } from '@/components/clientes/ClienteForm'
import { dataService, type Cliente } from '@/services/dataService'
import { Heading } from '@/components/catalyst/heading'

export default function EditarClientePage() {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [cargando, setCargando] = useState(true)
  const params = useParams()
  const router = useRouter()
  
  useEffect(() => {
    cargarCliente()
  }, [params.id])
  
  const cargarCliente = () => {
    try {
      if (params.id && typeof params.id === 'string') {
        const data = dataService.getCliente(params.id)
        if (data) {
          setCliente(data)
        } else {
          // Cliente no encontrado
          router.push('/clientes')
        }
      }
    } catch (error) {
      console.error('Error al cargar cliente:', error)
      router.push('/clientes')
    } finally {
      setCargando(false)
    }
  }
  
  if (cargando) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center">Cargando cliente...</div>
      </div>
    )
  }
  
  if (!cliente) {
    return null
  }
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Heading className="mb-6">Editar Cliente</Heading>
      <ClienteForm clienteInicial={cliente} />
    </div>
  )
} 