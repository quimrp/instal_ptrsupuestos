'use client'

import { useState } from 'react'
import { Input } from '@/components/catalyst/input'
import { Button } from '@/components/catalyst/button'
import { Listbox, ListboxOption, ListboxLabel } from '@/components/catalyst/listbox'
import { Fieldset, Legend, FieldGroup, Field, Label, Description, ErrorMessage } from '@/components/catalyst/fieldset'
import { dataService } from '@/services/dataService'
import { 
  UserIcon,
  BuildingOfficeIcon,
  CheckIcon
} from '@heroicons/react/20/solid'

interface ClienteFormModalProps {
  onClienteCreado: (clienteId: string) => void
  onCancelar: () => void
}

type TipoCliente = 'particular' | 'empresa'

export function ClienteFormModal({ onClienteCreado, onCancelar }: ClienteFormModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    nif: '',
    direccion: '',
    telefono: '',
    email: '',
    tipoCliente: 'particular' as TipoCliente
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState(false)

  const tiposCliente: { value: TipoCliente; label: string; icon: any }[] = [
    { value: 'particular', label: 'Particular', icon: UserIcon },
    { value: 'empresa', label: 'Empresa', icon: BuildingOfficeIcon }
  ]

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {}
    
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    }
    
    if (formData.tipoCliente === 'particular' && !formData.apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios para particulares'
    }
    
    if (!formData.nif.trim()) {
      nuevosErrores.nif = 'El NIF/CIF es obligatorio'
    }
    
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio'
    }
    
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio'
    }
    
    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarFormulario()) {
      return
    }
    
    setGuardando(true)
    
    try {
      const datosCliente = {
        nombre: formData.nombre.trim(),
        apellidos: formData.tipoCliente === 'empresa' ? '' : formData.apellidos.trim(),
        nif: formData.nif.trim().toUpperCase(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim().toLowerCase(),
        tipoCliente: formData.tipoCliente
      }
      
      const cliente = await dataService.guardarCliente(datosCliente)
      onClienteCreado(cliente.id)
    } catch (error) {
      console.error('Error al guardar cliente:', error)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        {/* Tipo de cliente */}
        <Field>
          <Label>Tipo de cliente</Label>
          <Listbox 
            value={formData.tipoCliente} 
            onChange={(value) => {
              setFormData({...formData, tipoCliente: value})
              // Limpiar error de apellidos si cambia a empresa
              if (value === 'empresa' && errors.apellidos) {
                setErrors({...errors, apellidos: ''})
              }
            }}
          >
            {tiposCliente.map((tipo) => (
              <ListboxOption key={tipo.value} value={tipo.value}>
                <ListboxLabel className="flex items-center gap-2">
                  <tipo.icon className="h-4 w-4" />
                  {tipo.label}
                </ListboxLabel>
              </ListboxOption>
            ))}
          </Listbox>
        </Field>
        
        {/* Nombre y Apellidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <Label>
              {formData.tipoCliente === 'empresa' ? 'Razón social' : 'Nombre'} *
            </Label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              invalid={!!errors.nombre}
            />
            {errors.nombre && (
              <ErrorMessage>{errors.nombre}</ErrorMessage>
            )}
          </Field>
          
          {formData.tipoCliente === 'particular' && (
            <Field>
              <Label>Apellidos *</Label>
              <Input
                type="text"
                value={formData.apellidos}
                onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                invalid={!!errors.apellidos}
              />
              {errors.apellidos && (
                <ErrorMessage>{errors.apellidos}</ErrorMessage>
              )}
            </Field>
          )}
        </div>
        
        {/* NIF y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <Label>
              {formData.tipoCliente === 'empresa' ? 'CIF' : 'NIF'} *
            </Label>
            <Input
              type="text"
              value={formData.nif}
              onChange={(e) => setFormData({...formData, nif: e.target.value.toUpperCase()})}
              invalid={!!errors.nif}
              maxLength={9}
            />
            {errors.nif && (
              <ErrorMessage>{errors.nif}</ErrorMessage>
            )}
          </Field>
          
          <Field>
            <Label>Teléfono *</Label>
            <Input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              invalid={!!errors.telefono}
              maxLength={9}
            />
            {errors.telefono && (
              <ErrorMessage>{errors.telefono}</ErrorMessage>
            )}
          </Field>
        </div>
        
        {/* Email y Dirección */}
        <Field>
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            invalid={!!errors.email}
          />
          {errors.email && (
            <ErrorMessage>{errors.email}</ErrorMessage>
          )}
        </Field>
        
        <Field>
          <Label>Dirección</Label>
          <Input
            type="text"
            value={formData.direccion}
            onChange={(e) => setFormData({...formData, direccion: e.target.value})}
            placeholder="Opcional"
          />
        </Field>
      </FieldGroup>
      
      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancelar}
          outline
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={guardando}
          className="gap-2"
        >
          {guardando ? (
            <>Guardando...</>
          ) : (
            <>
              <CheckIcon className="h-4 w-4" />
              Crear Cliente
            </>
          )}
        </Button>
      </div>
    </form>
  )
} 