'use client'

import { useState, useEffect, useRef } from 'react'
import { Switch } from '@/components/catalyst/switch'
import { Button } from '@/components/catalyst/button'
import { type LineaPresupuesto, type CaracteristicaValor, type Presupuesto } from '@/services/dataService'
import { dataService } from '@/services/dataService'
import { Alert, AlertTitle, AlertDescription, AlertBody, AlertActions } from '@/components/catalyst/alert'

type PresupuestoClienteViewProps = {
  presupuesto: Presupuesto
  onGuardar: (presupuesto: Presupuesto) => void
}

export function PresupuestoClienteView({ presupuesto, onGuardar }: PresupuestoClienteViewProps) {
  const [lineas, setLineas] = useState<LineaPresupuesto[]>(presupuesto.lineas)
  const [modificado, setModificado] = useState(false)
  const [opcionesGlobales, setOpcionesGlobales] = useState(() => {
    if (presupuesto.opcionesGlobales && Array.isArray(presupuesto.opcionesGlobales)) {
      const inicial: Record<string, boolean> = {}
      presupuesto.opcionesGlobales.forEach(op => { inicial[op.id] = !!op.activada })
      return inicial
    }
    return {}
  })
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [mostrarAlertaSalir, setMostrarAlertaSalir] = useState(false)
  const [salidaPendiente, setSalidaPendiente] = useState<null | (() => void)>(null)

  useEffect(() => {
    console.log('=== Calculando Precios Iniciales ===')
    setLineas(lineasActuales => {
      return lineasActuales.map(linea => {
        const producto = dataService.getProductoCaracteristicas(linea.producto.id)
        if (!producto) {
          console.log('Producto no encontrado:', linea.producto.id)
          return linea
        }

        console.log('Procesando producto:', producto.nombre)
        console.log('Precio Base:', producto.precioBase)

        const precioBase = typeof producto.precioBase === 'number' ? producto.precioBase : 0

        const caracteristicasSeleccionables = linea.caracteristicasSeleccionables || {}

        const precioCaracteristicas = Object.entries(caracteristicasSeleccionables)
          .reduce((total, [nombre, caracteristica]) => {
            const config = producto.caracteristicasSeleccionables?.[nombre]
            if (!config || !caracteristica?.activada) return total

            let precioASumar = 0
            
            if (config.incluyePrecio) {
              if (caracteristica.precio !== undefined) {
                precioASumar = caracteristica.precio
              } else if (config.tipo === 'select' && config.opciones && caracteristica.valor) {
                const opcionSeleccionada = config.opciones.find(opt => opt.valor === caracteristica.valor)
                precioASumar = opcionSeleccionada ? opcionSeleccionada.precio : 0
              } else {
                precioASumar = config.precioBase || 0
              }
            }
            
            console.log(`Característica "${nombre}":`, {
              valor: caracteristica.valor,
              activada: caracteristica.activada,
              precio: precioASumar,
              config: config
            })
            
            return total + precioASumar
          }, 0)

        console.log('Suma características:', precioCaracteristicas)
        console.log('Precio Final:', precioBase + precioCaracteristicas, '(', precioBase, '+', precioCaracteristicas, ')')

        return {
          ...linea,
          caracteristicasSeleccionables: caracteristicasSeleccionables,
          precio: precioBase + precioCaracteristicas
        }
      })
    })
  }, [])

  useEffect(() => {
    if (!modificado) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      handleGuardar()
    }, 60000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [modificado, lineas, opcionesGlobales])

  const actualizarCaracteristicaSeleccionable = (lineaId: string, caracteristicaNombre: string, activada: boolean) => {
    setLineas(lineasActuales => {
      const nuevasLineas = lineasActuales.map(linea => {
        if (linea.id === lineaId) {
          const producto = dataService.getProductoCaracteristicas(linea.producto.id)
          const config = producto?.caracteristicasSeleccionables?.[caracteristicaNombre]
          if (!config) return linea

          const valorAnterior = linea.caracteristicasSeleccionables?.[caracteristicaNombre]?.valor
          let valor = valorAnterior
          let precio = linea.caracteristicasSeleccionables?.[caracteristicaNombre]?.precio

          if (activada && (valor === undefined || valor === '')) {
            if (config.tipo === 'select' && config.opciones && config.opciones.length > 0) {
              valor = config.opciones[0].valor
              precio = config.opciones[0].precio
            } else if (config.tipo === 'number') {
              valor = config.min || 0
              precio = config.precioBase
            } else {
              valor = ''
              precio = config.precioBase
            }
          }

          if (activada && config.incluyePrecio) {
            if (config.tipo === 'select' && config.opciones) {
              const opcion = config.opciones.find(opt => opt.valor === valor)
              precio = opcion ? opcion.precio : config.precioBase
            } else {
              precio = config.precioBase
            }
          } else if (!activada) {
            precio = undefined
          }

          const caracteristicasActualizadas = {
            ...(linea.caracteristicasSeleccionables || {}),
            [caracteristicaNombre]: {
              ...(linea.caracteristicasSeleccionables?.[caracteristicaNombre] || {}),
              activada,
              valor,
              precio
            }
          }

          const precioBase = typeof producto.precioBase === 'number' ? producto.precioBase : 0
          const precioCaracteristicas = Object.entries(caracteristicasActualizadas)
            .reduce((total, [_, caracteristica]) => {
              const precioASumar = caracteristica?.activada && caracteristica?.precio ? caracteristica.precio : 0
              return total + precioASumar
            }, 0)

          return {
            ...linea,
            caracteristicasSeleccionables: caracteristicasActualizadas,
            precio: precioBase + precioCaracteristicas
          }
        }
        return linea
      })
      setModificado(true)
      return nuevasLineas
    })
  }

  const handleSwitchGlobal = (id: string, checked: boolean) => {
    setOpcionesGlobales(prev => {
      setModificado(true)
      return { ...prev, [id]: checked }
    })
  }

  const handleGuardar = () => {
    const nuevasOpcionesGlobales = (presupuesto.opcionesGlobales || []).map(op => ({
      ...op,
      activada: !!opcionesGlobales[op.id]
    }))
    onGuardar({
      ...presupuesto,
      lineas,
      opcionesGlobales: nuevasOpcionesGlobales
    })
    setModificado(false)
  }

  const totalOpcionesGlobales = (presupuesto.opcionesGlobales || []).reduce(
    (sum, opcion) => sum + (opcionesGlobales[opcion.id] ? opcion.precio : 0),
    0
  )

  const totalPresupuesto = lineas.reduce((sum, linea) => sum + (linea.cantidad * linea.precio), 0) + totalOpcionesGlobales

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Presupuesto #{presupuesto.numero}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Seleccione las características adicionales que desea incluir
          </p>
        </div>
        {modificado && (
          <Button onClick={handleGuardar} className="bg-green-600 hover:bg-green-700">
            Guardar Cambios
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {lineas.map((linea) => {
          const producto = dataService.getProductoCaracteristicas(linea.producto.id)
          
          return (
            <div key={linea.id} className="bg-white dark:bg-zinc-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{linea.producto.nombre}</h2>
                  {linea.referencia && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Ref: {linea.referencia}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{linea.precio}€</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {linea.cantidad} unidad{linea.cantidad !== 1 ? 'es' : ''}
                  </p>
                  {producto?.precioBase && (
                    <p className="text-xs text-zinc-500">
                      (Base: {producto.precioBase}€)
                    </p>
                  )}
                </div>
              </div>

              {linea.caracteristicasPermanentes && Object.entries(linea.caracteristicasPermanentes).length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Características Incluidas:</h3>
                  <div className="space-y-2">
                    {Object.entries(linea.caracteristicasPermanentes || {}).map(([nombre, { valor, precio }]) => (
                      <div key={nombre} className="flex justify-between text-sm">
                        <span>{nombre}: {valor}</span>
                        {precio !== undefined && <span>+{precio}€</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {linea.caracteristicasSeleccionables && Object.entries(linea.caracteristicasSeleccionables).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Características Opcionales:</h3>
                  <div className="space-y-4">
                    {Object.entries(linea.caracteristicasSeleccionables || {}).map(([nombre, caracteristica]) => {
                      const config = producto?.caracteristicasSeleccionables?.[nombre]
                      if (!config) return null

                      let precioCaracteristica = 0
                      if (config.tipo === 'select' && config.opciones && caracteristica.valor) {
                        const opcion = config.opciones.find(opt => opt.valor === caracteristica.valor)
                        precioCaracteristica = opcion ? opcion.precio : config.precioBase
                      } else if (config.tipo === 'number' && caracteristica.valor !== undefined) {
                        precioCaracteristica = config.precioBase
                      } else {
                        precioCaracteristica = config.precioBase
                      }

                      return (
                        <div key={nombre} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{config.label}</p>
                            {config.incluyePrecio && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {caracteristica.valor
                                  ? `${caracteristica.valor}: +${precioCaracteristica}€`
                                  : `+${config.tipo === 'select' && config.opciones && config.opciones.length > 0 ? config.opciones[0].precio : config.precioBase}€`
                                }
                              </p>
                            )}
                          </div>
                          <Switch
                            checked={caracteristica.activada ?? false}
                            onChange={(checked) => actualizarCaracteristicaSeleccionable(linea.id, nombre, checked)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Opciones adicionales</h3>
          <div className="space-y-3">
            {(presupuesto.opcionesGlobales && presupuesto.opcionesGlobales.length > 0) ? (
              presupuesto.opcionesGlobales.map(opcion => (
                <div key={opcion.id} className="flex items-center justify-between">
                  <span>{opcion.nombre} <span className="text-zinc-500">+{opcion.precio}€</span></span>
                  <Switch
                    checked={!!opcionesGlobales[opcion.id]}
                    onChange={checked => handleSwitchGlobal(opcion.id, checked)}
                  />
                </div>
              ))
            ) : (
              <span className="text-zinc-500">No hay opciones adicionales configuradas para este presupuesto.</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Total</h2>
            <p className="text-2xl font-bold">
              {totalPresupuesto.toFixed(2)}€
            </p>
          </div>
          {modificado && (
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400 mr-2">Pulsa para guardar tu configuración personalizada del presupuesto.</span>
              <Button
                onClick={handleGuardar}
                className="bg-black hover:bg-zinc-800 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Guardar cambios
              </Button>
            </div>
          )}
        </div>
      </div>

      {mostrarAlertaSalir && (
        <Alert open size="md" onClose={() => setMostrarAlertaSalir(false)}>
          <AlertTitle>¿Quieres guardar los cambios?</AlertTitle>
          <AlertDescription>
            ¿Quieres guardar los cambios que has hecho en el presupuesto antes de salir?
          </AlertDescription>
          <AlertBody>
            <AlertActions>
              <Button onClick={() => {
                handleGuardar()
                setMostrarAlertaSalir(false)
                if (salidaPendiente) salidaPendiente()
              }} className="bg-green-600 hover:bg-green-700 text-white">
                Guardar cambios
              </Button>
              <Button onClick={() => {
                setMostrarAlertaSalir(false)
                if (salidaPendiente) salidaPendiente()
              }} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900">
                Descartar
              </Button>
            </AlertActions>
          </AlertBody>
        </Alert>
      )}
    </div>
  )
} 