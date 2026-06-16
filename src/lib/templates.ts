export interface NoteTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  title: string;
  content: string;
}

export function getDateStr(): string {
  return new Date().toLocaleDateString("es-ES");
}

export const TEMPLATES: NoteTemplate[] = [
  {
    id: "meeting",
    name: "Reunión",
    emoji: "📋",
    description: "Estructura para reuniones",
    title: `📋 Reunión: ${getDateStr()}`,
    content: `## Asistentes\n-\n\n## Orden del día\n1.\n\n## Acuerdos\n-\n\n## Próximos pasos\n-`,
  },
  {
    id: "diary",
    name: "Diario",
    emoji: "📔",
    description: "Entrada de diario personal",
    title: `📔 ${getDateStr()}`,
    content: `Hoy...\n\n## Reflexiones\n\n## Agradecimientos\n-`,
  },
  {
    id: "todo",
    name: "TODO List",
    emoji: "✅",
    description: "Lista de tareas pendientes",
    title: `✅ TODO: ${getDateStr()}`,
    content: `## Pendientes\n- [ ] \n\n## En progreso\n- [ ] \n\n## Completadas\n- [ ] `,
  },
  {
    id: "idea",
    name: "Idea",
    emoji: "💡",
    description: "Capturar una idea",
    title: "💡 ",
    content: `## Descripción\n\n## Motivación\n\n## Recursos\n-`,
  },
];
