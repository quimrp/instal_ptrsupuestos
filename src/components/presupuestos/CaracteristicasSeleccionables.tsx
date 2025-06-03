'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/catalyst/switch'
import { Listbox, ListboxOption, ListboxLabel } from '@/components/catalyst/listbox'
import { Input } from '@/components/catalyst/input'
import { Label } from '@/components/catalyst/fieldset'
import { type CaracteristicaSeleccionable, type CaracteristicaValor } from '@/services/dataService'

type CaracteristicasSeleccionablesProps = {
  caracteristicas: Record<string, CaracteristicaSeleccionable>
  valores: Record<string, CaracteristicaValor>
  onUpdate: (nombre: string, valor: CaracteristicaValor) => void
}

export function CaracteristicasSeleccionables({ 
  caracteristicas, 
  valores, 
  onUpdate 
}: CaracteristicasSeleccionablesProps) {
  
  const handleToggle = (nombre: string, activada: boolean) => {
    const config = caracteristicas[nombre]
    const valorActual = valores[nombre]
    
    // Si se activa y no hay valor, establecer el valor por defecto
    let nuevoValor = valorActual?.valor
    let nuevoPrecio = valorActual?.precio
    
    if (activada && !nuevoValor) {
      if (config.tipo === 'select' && config.opciones && config.opciones.length > 0) {
        nuevoValor = config.opciones[0].valor
        nuevoPrecio = config.opciones[0].precio
      } else if (config.tipo === 'number') {
        nuevoValor = config.min || 0
        nuevoPrecio = config.precioBase
      } else {
        nuevoValor = ''
        nuevoPrecio = config.precioBase
      }
    }
    
    onUpdate(nombre, {
      valor: nuevoValor,
      precio: activada && config.incluyePrecio ? nuevoPrecio : undefined,
      activada
    })
  }
  
  const handleValueChange = (nombre: string, nuevoValor: any) => {
    const config = caracteristicas[nombre]
    const valorActual = valores[nombre]
    
    let nuevoPrecio = config.precioBase
    
    // Si es un select, buscar el precio de la opción seleccionada
    if (config.tipo === 'select' && config.opciones) {
      const opcionSeleccionada = config.opciones.find(opt => opt.valor === nuevoValor)
      if (opcionSeleccionada) {
        nuevoPrecio = opcionSeleccionada.precio
      }
    }
    
    onUpdate(nombre, {
      valor: nuevoValor,
      precio: config.incluyePrecio ? nuevoPrecio : undefined,
      activada: valorActual?.activada ?? true
    })
  }
  
  // Si no hay características, mostrar mensaje
  if (Object.keys(caracteristicas).length === 0) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400 italic p-4 text-center">
        Este producto no tiene características seleccionables disponibles.
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {Object.entries(caracteristicas).map(([nombre, config]) => {
        const valor = valores[nombre] || { valor: '', precio: undefined, activada: false }
        
        return (
          <div key={nombre} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={valor.activada ?? false}
                    onChange={(checked) => handleToggle(nombre, checked)}
                  />
                  <Label className="text-sm font-medium cursor-pointer" onClick={() => handleToggle(nombre, !valor.activada)}>
                    {config.label}
                  </Label>
                  {config.incluyePrecio && valor.activada && valor.precio !== undefined && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      +{valor.precio}€
                    </span>
                  )}
                </div>
                
                {valor.activada && (
                  <div className="mt-2 ml-9">
                    {config.tipo === 'select' && config.opciones ? (
                      <Listbox
                        value={valor.valor || ''}
                        onChange={(nuevoValor) => handleValueChange(nombre, nuevoValor)}
                        className="text-sm"
                      >
                        {config.opciones.map((opcion) => (
                          <ListboxOption key={opcion.valor} value={opcion.valor}>
                            <ListboxLabel className="flex justify-between">
                              <span>{opcion.valor}</span>
                              {config.incluyePrecio && (
                                <span className="text-sm text-zinc-600">{opcion.precio}€</span>
                              )}
                            </ListboxLabel>
                          </ListboxOption>
                        ))}
                      </Listbox>
                    ) : config.tipo === 'number' ? (
                      <Input
                        type="number"
                        value={valor.valor || 0}
                        onChange={(e) => handleValueChange(nombre, parseFloat(e.target.value) || 0)}
                        min={config.min}
                        max={config.max}
                        className="text-sm"
                      />
                    ) : (
                      <Input
                        type="text"
                        value={valor.valor || ''}
                        onChange={(e) => handleValueChange(nombre, e.target.value)}
                        className="text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 