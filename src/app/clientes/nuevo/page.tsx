'use client'

import { ClienteForm } from '@/components/clientes/ClienteForm'
import { Heading } from '@/components/catalyst/heading'

export default function NuevoClientePage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Heading className="mb-6">Nuevo Cliente</Heading>
      <ClienteForm />
    </div>
  )
} 