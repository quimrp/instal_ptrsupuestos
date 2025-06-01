'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/catalyst/input'
import { Button } from '@/components/catalyst/button'
import { Listbox, ListboxOption, ListboxLabel } from '@/components/catalyst/listbox'
import { Fieldset, Legend, FieldGroup, Field, Label, Description, ErrorMessage } from '@/components/catalyst/fieldset'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { Heading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'
import { dataService, type Cliente } from '@/services/dataService'
import { 
  UserIcon,
  BuildingOfficeIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/20/solid'

interface ClienteFormProps {
  clienteInicial?: Cliente
}

type TipoCliente = 'particular' | 'empresa'

export function ClienteForm({ clienteInicial }: ClienteFormProps) {
  const router = useRouter()
  const esEdicion = !!clienteInicial
  
  const [formData, setFormData] = useState({
    nombre: clienteInicial?.nombre || '',
    apellidos: clienteInicial?.apellidos || '',
    nif: clienteInicial?.nif || '',
    calle: clienteInicial?.calle || '',
    poblacion: clienteInicial?.poblacion || '',
    codigoPostal: clienteInicial?.codigoPostal || '',
    provincia: clienteInicial?.provincia || '',
    telefono: clienteInicial?.telefono || '',
    email: clienteInicial?.email || '',
    tipoCliente: (clienteInicial?.tipoCliente || 'particular') as TipoCliente
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState(false)
  const [mostrarError, setMostrarError] = useState(false)
  const [mensajeError, setMensajeError] = useState('')

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
    } else if (!validarNIF(formData.nif)) {
      nuevosErrores.nif = 'El NIF/CIF no es válido'
    }
    
    if (!formData.calle.trim()) {
      nuevosErrores.calle = 'La calle es obligatoria'
    }
    
    if (!formData.poblacion.trim()) {
      nuevosErrores.poblacion = 'La población es obligatoria'
    }
    
    if (!formData.codigoPostal.trim()) {
      nuevosErrores.codigoPostal = 'El código postal es obligatorio'
    }
    
    if (!formData.provincia.trim()) {
      nuevosErrores.provincia = 'La provincia es obligatoria'
    }
    
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio'
    } else if (!validarTelefono(formData.telefono)) {
      nuevosErrores.telefono = 'El teléfono no es válido'
    }
    
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio'
    } else if (!validarEmail(formData.email)) {
      nuevosErrores.email = 'El email no es válido'
    }
    
    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const validarNIF = (nif: string): boolean => {
    // Validación básica de NIF/CIF
    const nifRegex = /^[A-Z0-9]{8,9}$/i
    return nifRegex.test(nif.replace(/\s/g, ''))
  }

  const validarTelefono = (telefono: string): boolean => {
    // Validación básica de teléfono español
    const telefonoRegex = /^[6789]\d{8}$/
    return telefonoRegex.test(telefono.replace(/\s/g, ''))
  }

  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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
        calle: formData.calle.trim(),
        poblacion: formData.poblacion.trim(),
        codigoPostal: formData.codigoPostal.trim(),
        provincia: formData.provincia.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim().toLowerCase(),
        tipoCliente: formData.tipoCliente
      }
      
      if (esEdicion && clienteInicial) {
        await dataService.actualizarCliente(clienteInicial.id, datosCliente)
      } else {
        await dataService.guardarCliente(datosCliente)
      }
      
      router.push('/clientes')
    } catch (error) {
      console.error('Error al guardar cliente:', error)
      setMensajeError('Ha ocurrido un error al guardar el cliente. Por favor, inténtalo de nuevo.')
      setMostrarError(true)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Fieldset>
          <Legend>Datos del Cliente</Legend>
          <Text className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Complete la información del cliente. Los campos marcados con * son obligatorios.
          </Text>
          
          <FieldGroup>
            {/* Tipo de cliente */}
            <Field>
              <Label>Tipo de cliente</Label>
              <Description>Seleccione si es un cliente particular o una empresa</Description>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <Label>
                  {formData.tipoCliente === 'empresa' ? 'Razón social' : 'Nombre'} *
                </Label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  invalid={!!errors.nombre}
                  placeholder={formData.tipoCliente === 'empresa' ? 'Ej: Construcciones ABC S.L.' : 'Ej: Juan'}
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
                    placeholder="Ej: García López"
                  />
                  {errors.apellidos && (
                    <ErrorMessage>{errors.apellidos}</ErrorMessage>
                  )}
                </Field>
              )}
            </div>
            
            {/* NIF y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <Label>
                  {formData.tipoCliente === 'empresa' ? 'CIF' : 'NIF'} *
                </Label>
                <Description>Documento de identificación fiscal</Description>
                <Input
                  type="text"
                  value={formData.nif}
                  onChange={(e) => setFormData({...formData, nif: e.target.value.toUpperCase()})}
                  invalid={!!errors.nif}
                  placeholder={formData.tipoCliente === 'empresa' ? 'Ej: B12345678' : 'Ej: 12345678A'}
                  maxLength={9}
                />
                {errors.nif && (
                  <ErrorMessage>{errors.nif}</ErrorMessage>
                )}
              </Field>
              
              <Field>
                <Label>Teléfono *</Label>
                <Description>Número de teléfono de contacto</Description>
                <Input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  invalid={!!errors.telefono}
                  placeholder="Ej: 666123456"
                  maxLength={9}
                />
                {errors.telefono && (
                  <ErrorMessage>{errors.telefono}</ErrorMessage>
                )}
              </Field>
            </div>
            
            {/* Email */}
            <Field>
              <Label>Email *</Label>
              <Description>Dirección de correo electrónico para comunicaciones</Description>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                invalid={!!errors.email}
                placeholder="Ej: cliente@email.com"
              />
              {errors.email && (
                <ErrorMessage>{errors.email}</ErrorMessage>
              )}
            </Field>
          </FieldGroup>
        </Fieldset>
        
        <Fieldset>
          <Legend>Dirección</Legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <Label>Calle *</Label>
              <Input
                type="text"
                value={formData.calle}
                onChange={(e) => setFormData({...formData, calle: e.target.value})}
                invalid={!!errors.calle}
                placeholder="Ej: Calle Mayor 123"
              />
              {errors.calle && (
                <ErrorMessage>{errors.calle}</ErrorMessage>
              )}
            </Field>
            <Field>
              <Label>Población *</Label>
              <Input
                type="text"
                value={formData.poblacion}
                onChange={(e) => setFormData({...formData, poblacion: e.target.value})}
                invalid={!!errors.poblacion}
                placeholder="Ej: Madrid"
              />
              {errors.poblacion && (
                <ErrorMessage>{errors.poblacion}</ErrorMessage>
              )}
            </Field>
            <Field>
              <Label>Código Postal *</Label>
              <Input
                type="text"
                value={formData.codigoPostal}
                onChange={(e) => setFormData({...formData, codigoPostal: e.target.value})}
                invalid={!!errors.codigoPostal}
                placeholder="Ej: 28001"
              />
              {errors.codigoPostal && (
                <ErrorMessage>{errors.codigoPostal}</ErrorMessage>
              )}
            </Field>
            <Field>
              <Label>Provincia *</Label>
              <Input
                type="text"
                value={formData.provincia}
                onChange={(e) => setFormData({...formData, provincia: e.target.value})}
                invalid={!!errors.provincia}
                placeholder="Ej: Madrid"
              />
              {errors.provincia && (
                <ErrorMessage>{errors.provincia}</ErrorMessage>
              )}
            </Field>
          </div>
        </Fieldset>
        
        {/* Botones */}
        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-700">
          <Button
            type="button"
            onClick={() => router.push('/clientes')}
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
                {esEdicion ? 'Actualizar Cliente' : 'Guardar Cliente'}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Dialog de error */}
      <Dialog open={mostrarError} onClose={() => setMostrarError(false)} size="sm">
        <DialogTitle className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
          Error al guardar
        </DialogTitle>
        <DialogDescription>
          {mensajeError}
        </DialogDescription>
        <DialogActions>
          <Button onClick={() => setMostrarError(false)}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
} 