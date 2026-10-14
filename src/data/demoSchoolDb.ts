// Datos oficiales del proyecto escolar: 4 tablas relacionadas

export interface CursoItem {
  id_curso: number;
  nombre_curso: string;
}

export interface AlumnoItem {
  id_alumno: number;
  nombre: string;
  apellido: string;
  id_curso: number;
}

export interface MateriaItem {
  id_materia: number;
  nombre_materia: string;
}

export interface InscripcionItem {
  id_inscripcion: number;
  id_alumno: number;
  id_materia: number;
}

export const DEMO_CURSOS: CursoItem[] = [
  { id_curso: 1, nombre_curso: '1.º A' },
  { id_curso: 2, nombre_curso: '2.º A' },
  { id_curso: 3, nombre_curso: '3.º A' }
];

export const DEMO_ALUMNOS: AlumnoItem[] = [
  { id_alumno: 1, nombre: 'Lucía', apellido: 'Pérez', id_curso: 1 },
  { id_alumno: 2, nombre: 'Tomás', apellido: 'Gómez', id_curso: 2 },
  { id_alumno: 3, nombre: 'Sofía', apellido: 'Ruiz', id_curso: 1 }
];

export const DEMO_MATERIAS: MateriaItem[] = [
  { id_materia: 1, nombre_materia: 'Matemática' },
  { id_materia: 2, nombre_materia: 'Informática' },
  { id_materia: 3, nombre_materia: 'Lengua' }
];

export const DEMO_INSCRIPCIONES: InscripcionItem[] = [
  { id_inscripcion: 1, id_alumno: 1, id_materia: 2 },
  { id_inscripcion: 2, id_alumno: 1, id_materia: 1 },
  { id_inscripcion: 3, id_alumno: 2, id_materia: 2 },
  { id_inscripcion: 4, id_alumno: 3, id_materia: 3 }
];

// Metadatos de columnas y relaciones para visualizaciones
export interface TableMeta {
  name: string;
  displayName: string;
  description: string;
  columns: {
    name: string;
    type: string;
    isPk: boolean;
    isFk: boolean;
    references?: string;
  }[];
}

export const TABLES_META: Record<string, TableMeta> = {
  cursos: {
    name: 'cursos',
    displayName: 'Tabla: cursos',
    description: 'Registra las divisiones o años escolares disponibles.',
    columns: [
      { name: 'id_curso', type: 'INTEGER', isPk: true, isFk: false },
      { name: 'nombre_curso', type: 'TEXT', isPk: false, isFk: false }
    ]
  },
  alumnos: {
    name: 'alumnos',
    displayName: 'Tabla: alumnos',
    description: 'Guarda los datos personales y el curso de cada estudiante.',
    columns: [
      { name: 'id_alumno', type: 'INTEGER', isPk: true, isFk: false },
      { name: 'nombre', type: 'TEXT', isPk: false, isFk: false },
      { name: 'apellido', type: 'TEXT', isPk: false, isFk: false },
      { name: 'id_curso', type: 'INTEGER', isPk: false, isFk: true, references: 'cursos.id_curso' }
    ]
  },
  materias: {
    name: 'materias',
    displayName: 'Tabla: materias',
    description: 'Contiene las asignaturas dictadas en el colegio.',
    columns: [
      { name: 'id_materia', type: 'INTEGER', isPk: true, isFk: false },
      { name: 'nombre_materia', type: 'TEXT', isPk: false, isFk: false }
    ]
  },
  inscripciones: {
    name: 'inscripciones',
    displayName: 'Tabla: inscripciones',
    description: 'Relaciona a cada alumno con las materias en las que está inscripto.',
    columns: [
      { name: 'id_inscripcion', type: 'INTEGER', isPk: true, isFk: false },
      { name: 'id_alumno', type: 'INTEGER', isPk: false, isFk: true, references: 'alumnos.id_alumno' },
      { name: 'id_materia', type: 'INTEGER', isPk: false, isFk: true, references: 'materias.id_materia' }
    ]
  }
};
