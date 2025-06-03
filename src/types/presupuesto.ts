export type OpcionGlobalPresupuesto = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  activada: boolean
}

export type Presupuesto = {
  opcionesGlobales?: OpcionGlobalPresupuesto[]
} 