// Datos oficiales del proyecto escolar: Modelo relacional de 5 tablas (MySQL)

export interface CursoItem {
  id_curso: number;
  nombre: string;
  anio: number;
}

export interface MateriaItem {
  id_materia: number;
  nombre: string;
}

export interface AlumnoItem {
  id_alumno: number;
  nombre: string;
  apellido: string;
  email: string;
}

export interface InscripcionItem {
  id_inscripcion: number;
  id_alumno: number;
  id_curso: number;
  fecha: string;
}

export interface CursoMateriaItem {
  id_curso: number;
  id_materia: number;
}

// 1. Cursos
export const DEMO_CURSOS: CursoItem[] = [
  { id_curso: 1, nombre: '1 A', anio: 1 },
  { id_curso: 2, nombre: '1 B', anio: 1 },
  { id_curso: 3, nombre: '2 A', anio: 2 }
];

// 2. Materias
export const DEMO_MATERIAS: MateriaItem[] = [
  { id_materia: 1, nombre: 'Matemática' },
  { id_materia: 2, nombre: 'Informática' },
  { id_materia: 3, nombre: 'Historia' }
];

// 3. Alumnos
export const DEMO_ALUMNOS: AlumnoItem[] = [
  { id_alumno: 1, nombre: 'Ana', apellido: 'Pérez', email: 'ana@escuela.com' },
  { id_alumno: 2, nombre: 'Juan', apellido: 'López', email: 'juan@escuela.com' },
  { id_alumno: 3, nombre: 'María', apellido: 'Gómez', email: 'maria@escuela.com' }
];

// 4. Inscripciones (Relación 1:N entre Alumnos y Cursos)
export const DEMO_INSCRIPCIONES: InscripcionItem[] = [
  { id_inscripcion: 1, id_alumno: 1, id_curso: 1, fecha: '2026-03-01' },
  { id_inscripcion: 2, id_alumno: 2, id_curso: 1, fecha: '2026-03-01' },
  { id_inscripcion: 3, id_alumno: 3, id_curso: 2, fecha: '2026-03-02' }
];

// 5. Curso_Materia (Relación N:M entre Cursos y Materias con PK compuesta)
export const DEMO_CURSO_MATERIA: CursoMateriaItem[] = [
  { id_curso: 1, id_materia: 1 }, // 1 A tiene Matemática
  { id_curso: 1, id_materia: 2 }, // 1 A tiene Informática
  { id_curso: 1, id_materia: 3 }, // 1 A tiene Historia
  { id_curso: 2, id_materia: 1 }, // 1 B tiene Matemática
  { id_curso: 2, id_materia: 3 }, // 1 B tiene Historia
  { id_curso: 3, id_materia: 1 }, // 2 A tiene Matemática
  { id_curso: 3, id_materia: 2 }  // 2 A tiene Informática
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
  Cursos: {
    name: 'Cursos',
    displayName: 'Tabla: Cursos',
    description: 'Almacena los cursos y divisiones de la institución educativa.',
    columns: [
      { name: 'id_curso', type: 'INT AUTO_INCREMENT', isPk: true, isFk: false },
      { name: 'nombre', type: 'VARCHAR(50) NOT NULL', isPk: false, isFk: false },
      { name: 'anio', type: 'INT NOT NULL', isPk: false, isFk: false }
    ]
  },
  Materias: {
    name: 'Materias',
    displayName: 'Tabla: Materias',
    description: 'Almacena las materias o asignaturas que se dictan en la escuela.',
    columns: [
      { name: 'id_materia', type: 'INT AUTO_INCREMENT', isPk: true, isFk: false },
      { name: 'nombre', type: 'VARCHAR(100) NOT NULL', isPk: false, isFk: false }
    ]
  },
  Alumnos: {
    name: 'Alumnos',
    displayName: 'Tabla: Alumnos',
    description: 'Guarda los datos personales y el correo electrónico de los estudiantes.',
    columns: [
      { name: 'id_alumno', type: 'INT AUTO_INCREMENT', isPk: true, isFk: false },
      { name: 'nombre', type: 'VARCHAR(100) NOT NULL', isPk: false, isFk: false },
      { name: 'apellido', type: 'VARCHAR(100) NOT NULL', isPk: false, isFk: false },
      { name: 'email', type: 'VARCHAR(150) NOT NULL', isPk: false, isFk: false }
    ]
  },
  Inscripciones: {
    name: 'Inscripciones',
    displayName: 'Tabla: Inscripciones',
    description: 'Registra en qué curso está inscripto cada estudiante y en qué fecha.',
    columns: [
      { name: 'id_inscripcion', type: 'INT AUTO_INCREMENT', isPk: true, isFk: false },
      { name: 'id_alumno', type: 'INT NOT NULL', isPk: false, isFk: true, references: 'Alumnos.id_alumno' },
      { name: 'id_curso', type: 'INT NOT NULL', isPk: false, isFk: true, references: 'Cursos.id_curso' },
      { name: 'fecha', type: 'DATE NOT NULL', isPk: false, isFk: false }
    ]
  },
  Curso_Materia: {
    name: 'Curso_Materia',
    displayName: 'Tabla: Curso_Materia',
    description: 'Modela la relación muchos a muchos: qué materias se dictan en cada curso escolar.',
    columns: [
      { name: 'id_curso', type: 'INT NOT NULL', isPk: true, isFk: true, references: 'Cursos.id_curso' },
      { name: 'id_materia', type: 'INT NOT NULL', isPk: true, isFk: true, references: 'Materias.id_materia' }
    ]
  }
};
