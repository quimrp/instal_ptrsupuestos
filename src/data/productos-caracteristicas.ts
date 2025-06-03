import { type ProductoCaracteristicas } from '@/services/dataService'

export const productosCaracteristicas: Record<string, ProductoCaracteristicas> = {
  "ventana": {
    "nombre": "Ventana",
    "precioBase": 300,
    "caracteristicasPermanentes": {
      "marca": {
        "label": "Marca",
        "tipo": "select",
        "opciones": ["Cortizo", "Technal", "Schüco", "Reynaers"]
      },
      "serie": {
        "label": "Serie",
        "tipo": "select",
        "opciones": ["Serie 60", "Serie 70", "Serie 80"]
      },
      "ancho": {
        "label": "Ancho (mm)",
        "tipo": "number",
        "min": 500,
        "max": 3000
      },
      "alto": {
        "label": "Alto (mm)",
        "tipo": "number",
        "min": 500,
        "max": 2500
      }
    },
    "caracteristicasSeleccionables": {
      "persiana": {
        "label": "Persiana",
        "tipo": "select",
        "opciones": [
          { "valor": "Sin persiana", "precio": 0 },
          { "valor": "Persiana PVC", "precio": 150 },
          { "valor": "Persiana Aluminio", "precio": 250 },
          { "valor": "Persiana Motorizada", "precio": 450 }
        ],
        "incluyePrecio": true,
        "precioBase": 0,
        "activadaPorDefecto": false
      },
      "apertura": {
        "label": "Tipo de apertura",
        "tipo": "select",
        "opciones": [
          { "valor": "Abatible", "precio": 0 },
          { "valor": "Oscilobatiente", "precio": 120 },
          { "valor": "Corredera", "precio": 80 }
        ],
        "incluyePrecio": true,
        "precioBase": 0,
        "activadaPorDefecto": true
      },
      "cristal": {
        "label": "Tipo de cristal",
        "tipo": "select",
        "opciones": [
          { "valor": "Simple 4mm", "precio": 0 },
          { "valor": "Doble 4/16/4", "precio": 85 },
          { "valor": "Doble bajo emisivo", "precio": 120 },
          { "valor": "Triple", "precio": 180 }
        ],
        "incluyePrecio": true,
        "precioBase": 0,
        "activadaPorDefecto": true
      }
    }
  },
  "puerta": {
    "nombre": "Puerta",
    "precioBase": 450,
    "caracteristicasPermanentes": {
      "material": {
        "label": "Material",
        "tipo": "select",
        "opciones": ["Madera maciza", "MDF lacado", "Aluminio", "PVC"]
      },
      "ancho": {
        "label": "Ancho (mm)",
        "tipo": "number",
        "min": 700,
        "max": 1200
      },
      "alto": {
        "label": "Alto (mm)",
        "tipo": "number",
        "min": 2000,
        "max": 2400
      }
    },
    "caracteristicasSeleccionables": {
      "manilla": {
        "label": "Tipo de manilla",
        "tipo": "select",
        "opciones": [
          { "valor": "Manilla básica", "precio": 25 },
          { "valor": "Manilla roseta", "precio": 45 },
          { "valor": "Manilla electrónica", "precio": 250 }
        ],
        "incluyePrecio": true,
        "precioBase": 25,
        "activadaPorDefecto": true
      },
      "cerradura": {
        "label": "Cerradura de seguridad",
        "tipo": "select",
        "opciones": [
          { "valor": "Estándar", "precio": 0 },
          { "valor": "Seguridad 3 puntos", "precio": 120 },
          { "valor": "Seguridad 5 puntos", "precio": 220 }
        ],
        "incluyePrecio": true,
        "precioBase": 0,
        "activadaPorDefecto": false
      }
    }
  },
  "toldo": {
    "nombre": "Toldo",
    "precioBase": 200,
    "caracteristicasPermanentes": {
      "modelo": {
        "label": "Modelo",
        "tipo": "select",
        "opciones": ["Extensible", "Cofre", "Semicofre", "Punto recto"]
      },
      "ancho": {
        "label": "Ancho (mm)",
        "tipo": "number",
        "min": 2000,
        "max": 6000
      },
      "salida": {
        "label": "Salida (mm)",
        "tipo": "number",
        "min": 1500,
        "max": 4000
      }
    },
    "caracteristicasSeleccionables": {
      "motor": {
        "label": "Motorización",
        "tipo": "select",
        "opciones": [
          { "valor": "Manual", "precio": 0 },
          { "valor": "Motor con mando", "precio": 320 },
          { "valor": "Motor inteligente", "precio": 580 }
        ],
        "incluyePrecio": true,
        "precioBase": 0,
        "activadaPorDefecto": false
      },
      "sensor": {
        "label": "Sensores",
        "tipo": "select",
        "opciones": [
          { "valor": "Sin sensores", "precio": 0 },
          { "valor": "Sensor viento", "precio": 120 },
          { "valor": "Sensor viento + sol", "precio": 220 }
        ],
        "incluyePrecio": true,
        "precioBase": 0,
        "activadaPorDefecto": false
      }
    }
  },
  "mampara": {
    "nombre": "Mampara",
    "precioBase": 350,
    "caracteristicasPermanentes": {
      "tipo": {
        "label": "Tipo de mampara",
        "tipo": "select",
        "opciones": ["Frontal", "Angular", "Semicircular"]
      },
      "ancho": {
        "label": "Ancho (mm)",
        "tipo": "number",
        "min": 700,
        "max": 2000
      },
      "alto": {
        "label": "Alto (mm)",
        "tipo": "number",
        "min": 1850,
        "max": 2100
      }
    },
    "caracteristicasSeleccionables": {
      "cristal": {
        "label": "Tipo de cristal",
        "tipo": "select",
        "opciones": [
          { "valor": "Transparente 6mm", "precio": 0 },
          { "valor": "Transparente 8mm", "precio": 50 },
          { "valor": "Serigrafiado", "precio": 80 },
          { "valor": "Mate", "precio": 90 }
        ],
        "incluyePrecio": true,
        "precioBase": 0,
        "activadaPorDefecto": true
      },
      "tratamiento": {
        "label": "Tratamiento antical",
        "tipo": "select",
        "opciones": [
          { "valor": "Sin tratamiento", "precio": 0 },
          { "valor": "Tratamiento antical", "precio": 60 }
        ],
        "incluyePrecio": true,
        "precioBase": 0,
        "activadaPorDefecto": false
      },
      "perfileria": {
        "label": "Acabado perfilería",
        "tipo": "select",
        "opciones": [
          { "valor": "Cromado", "precio": 0 },
          { "valor": "Negro mate", "precio": 45 },
          { "valor": "Dorado", "precio": 85 }
        ],
        "incluyePrecio": true,
        "precioBase": 0,
        "activadaPorDefecto": true
      }
    }
  }
}

export default productosCaracteristicas 