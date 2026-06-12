export interface SpecSection {
  n: number
  title: string
  required: boolean
  description: string
}

export const SECTIONS: ReadonlyArray<SpecSection> = Object.freeze([
  {
    n: 1,
    title: "Diagnóstico y Archivos Afectados",
    required: true,
    description: "Diagnóstico del problema y archivos afectados con rangos de líneas."
  },
  {
    n: 2,
    title: "Consenso con el Usuario",
    required: true,
    description: "Decisiones, aclaraciones y consensos alcanzados con el usuario."
  },
  {
    n: 3,
    title: "Propuesta de Solución",
    required: true,
    description: "Arquitectura y diseño técnico de la solución propuesta."
  },
  {
    n: 4,
    title: "Especificaciones de Comportamiento (BDD)",
    required: true,
    description: "Escenarios con cláusulas Dado/Cuando/Entonces/Y."
  },
  {
    n: 5,
    title: "Criterios de Aceptación",
    required: true,
    description: "Listado de criterios verificables con IDs CA<n>."
  }
])

export const SPEC_TITLE = "Especificación Técnica del Cambio"
