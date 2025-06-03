'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/catalyst/button'
import { 
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell
} from '@/components/catalyst/table'
import { Badge } from '@/components/catalyst/badge'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/20/solid'
import { dataService } from '@/services/dataService'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/catalyst/dialog'
import { useRouter } from 'next/navigation'

type Producto = {
  id: string
  nombre: string
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = () => {
    const productosDisponibles = dataService.getProductosDisponibles()
    setProductos(productosDisponibles)
    setCargando(false)
  }

  const contarCaracteristicas = (productoId: string) => {
    const caracteristicas = dataService.getProductoCaracteristicas(productoId)
    if (!caracteristicas) return 0
    const permanentes = Object.keys(caracteristicas.caracteristicasPermanentes || {}).length
    const seleccionables = Object.keys(caracteristicas.caracteristicasSeleccionables || {}).length
    return permanentes + seleccionables
  }

  const handleEliminarProducto = async (producto: Producto) => {
    try {
      setError(null)
      
      await dataService.eliminarProducto(producto.id)
      
      setMostrarConfirmacion(false)
      setProductoAEliminar(null)
      cargarProductos()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      setError(error instanceof Error ? error.message : 'Error al eliminar producto')
    }
  }

  if (cargando) {
    return (
      <div className="p-8">
        <div className="text-center">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Button 
          onClick={() => router.push('/dashboard/productos/nuevo')}
          className="gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Producto
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Nombre</TableHeader>
              <TableHeader>Características</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell className="font-medium">
                  {producto.nombre}
                </TableCell>
                <TableCell>
                  <Badge color="zinc">
                    {contarCaracteristicas(producto.id)} características
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => router.push(`/dashboard/productos/${producto.id}`)}
                      className="h-8 w-8 p-0"
                      title="Ver producto"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => router.push(`/dashboard/productos/${producto.id}/editar`)}
                      className="h-8 w-8 p-0"
                      title="Editar producto"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setProductoAEliminar(producto)
                        setMostrarConfirmacion(true)
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Eliminar producto"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={mostrarConfirmacion}
        onClose={() => {
          setMostrarConfirmacion(false)
          setProductoAEliminar(null)
          setError(null)
        }}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de que deseas eliminar el producto "{productoAEliminar?.nombre}"? Esta acción no se puede deshacer.
        </DialogDescription>
        <DialogActions>
          <Button
            onClick={() => {
              setMostrarConfirmacion(false)
              setProductoAEliminar(null)
              setError(null)
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => productoAEliminar && handleEliminarProducto(productoAEliminar)}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
} 