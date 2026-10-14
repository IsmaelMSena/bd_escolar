// Datos y contenidos de las 20 Diapositivas de la Presentación Educativa

export interface SlideContent {
  slideNumber: number;
  blockNumber: number;
  blockTitle: string;
  title: string;
  subtitle?: string;
  explanation: string;
  type: 
    | 'four-tables-overview' 
    | 'single-table-focus' 
    | 'table-anatomy' 
    | 'data-types-table'
    | 'sql-code-interactive' 
    | 'er-relationships' 
    | 'join-explanation' 
    | 'insert-sequence'
    | 'practice-challenges'
    | 'text-concept';
  sqlSnippet?: {
    sql: string;
    generalExplanation?: string;
    parts?: { token: string; explanation: string }[];
  };
  highlightRelation?: 'all' | 'cursos-alumnos' | 'alumnos-inscripciones' | 'materias-inscripciones' | 'none';
  extraContent?: any;
}

export const SLIDES_DATA: SlideContent[] = [
  // =========================================================================
  // BLOQUE 1. COMPRENDEMOS QUÉ ESTAMOS VIENDO
  // =========================================================================
  {
    slideNumber: 1,
    blockNumber: 1,
    blockTitle: 'Bloque 1 · Comprendemos qué estamos viendo',
    title: 'Una base de datos escolar',
    subtitle: 'Cuatro tablas relacionadas para organizar cursos, alumnos, materias e inscripciones.',
    explanation: 'Observá el diagrama de la base de datos terminada: las líneas ortogonales conectan las claves primarias (PK) con las claves foráneas (FK) en relaciones de uno a muchos (1:N) para vincular los datos sin duplicarlos.',
    type: 'four-tables-overview',
    highlightRelation: 'all'
  },
  {
    slideNumber: 2,
    blockNumber: 1,
    blockTitle: 'Bloque 1 · Comprendemos qué estamos viendo',
    title: '¿Qué es una base de datos?',
    subtitle: 'El corazón digital de las organizaciones',
    explanation: 'Una base de datos es un conjunto organizado de información que permite guardarla, consultarla y modificarla con rapidez y seguridad. En lugar de fichas de papel, la escuela utiliza este sistema digital para encontrar a cualquier estudiante en milisegundos.',
    type: 'text-concept',
    extraContent: {
      points: [
        'Organiza datos sobre un mismo contexto (en este caso, nuestra escuela).',
        'Permite recuperar información sin revisar cientos de hojas físicas.',
        'Garantiza que la información esté protegida, ordenada y accesible.'
      ]
    }
  },
  {
    slideNumber: 3,
    blockNumber: 1,
    blockTitle: 'Bloque 1 · Comprendemos qué estamos viendo',
    title: '¿Qué es una tabla?',
    subtitle: 'La unidad básica de organización',
    explanation: 'Una tabla organiza información relacionada sobre un mismo tema en una cuadrícula de columnas y filas. Por ejemplo, la tabla alumnos reúne exclusivamente los datos de los estudiantes matriculados.',
    type: 'single-table-focus',
    extraContent: { tableName: 'alumnos' }
  },
  {
    slideNumber: 4,
    blockNumber: 1,
    blockTitle: 'Bloque 1 · Comprendemos qué estamos viendo',
    title: 'Las partes de una tabla',
    subtitle: 'Columnas, filas y celdas',
    explanation: 'En una tabla, cada columna es un campo, cada fila es un registro y cada casillero es un valor. Tocá los botones a continuación para identificar cada elemento.',
    type: 'table-anatomy'
  },
  {
    slideNumber: 5,
    blockNumber: 1,
    blockTitle: 'Bloque 1 · Comprendemos qué estamos viendo',
    title: '¿Por qué tenemos cuatro tablas?',
    subtitle: 'Especialización para evitar redundancias',
    explanation: 'Cada tabla guarda información sobre un tema específico: cursos guarda las divisiones, alumnos los datos personales, materias las asignaturas e inscripciones qué alumno cursa qué materia. Así evitamos repetir los nombres y prevenimos errores.',
    type: 'four-tables-overview',
    highlightRelation: 'none'
  },

  // =========================================================================
  // BLOQUE 2. CONSTRUIMOS LAS TABLAS
  // =========================================================================
  {
    slideNumber: 6,
    blockNumber: 2,
    blockTitle: 'Bloque 2 · Construimos las tablas',
    title: 'Antes de crear una tabla',
    subtitle: 'Definir la estructura y las columnas necesarias',
    explanation: 'Antes de escribir código, debemos planificar qué información queremos guardar y qué columnas necesitamos. Definir la estructura es como armar el casillero vacío antes de colocar los datos.',
    type: 'text-concept',
    extraContent: {
      points: [
        'Elegir un nombre claro para la tabla (ejemplo: cursos).',
        'Identificar qué datos guardará cada columna (id del curso, nombre).',
        'Decidir cuál será la columna que distinga a cada fila (Clave Primaria).'
      ]
    }
  },
  {
    slideNumber: 7,
    blockNumber: 2,
    blockTitle: 'Bloque 2 · Construimos las tablas',
    title: 'Creamos la tabla cursos',
    subtitle: 'La instrucción CREATE TABLE',
    explanation: 'Para crear una tabla le decimos su nombre y la lista de campos entre paréntesis. Tocá las palabras del código para leer qué hace cada parte.',
    type: 'sql-code-interactive',
    sqlSnippet: {
      sql: `CREATE TABLE cursos (
    id_curso INTEGER PRIMARY KEY,
    nombre_curso TEXT
);`,
      parts: [
        { token: 'CREATE TABLE', explanation: 'Instrucción SQL que indica la creación de una nueva tabla.' },
        { token: 'cursos', explanation: 'Nombre elegido para identificar la tabla en la base de datos.' },
        { token: 'id_curso', explanation: 'Nombre del primer campo: el identificador único del curso.' },
        { token: 'INTEGER', explanation: 'Tipo de dato que permite guardar únicamente números enteros.' },
        { token: 'PRIMARY KEY', explanation: 'Clave Primaria: indica que este campo identifica de forma única e irrepetible a cada fila.' },
        { token: 'nombre_curso', explanation: 'Nombre del segundo campo que guardará el nombre de la división escolar.' },
        { token: 'TEXT', explanation: 'Tipo de dato que permite guardar texto alfanumérico.' },
        { token: '( ... )', explanation: 'Los paréntesis encierran la definición de todas las columnas de la tabla.' },
        { token: ',', explanation: 'La coma separa la definición de una columna de la siguiente.' },
        { token: ';', explanation: 'El punto y coma finaliza la instrucción SQL.' }
      ]
    }
  },
  {
    slideNumber: 8,
    blockNumber: 2,
    blockTitle: 'Bloque 2 · Construimos las tablas',
    title: 'Creamos la tabla alumnos',
    subtitle: 'Incorporamos la primera Clave Foránea (FOREIGN KEY)',
    explanation: 'La clave foránea permite relacionar un registro de una tabla con un registro de otra tabla. Aquí alumnos.id_curso hace referencia a cursos.id_curso.',
    type: 'sql-code-interactive',
    sqlSnippet: {
      sql: `CREATE TABLE alumnos (
    id_alumno INTEGER PRIMARY KEY,
    nombre TEXT,
    apellido TEXT,
    id_curso INTEGER,
    FOREIGN KEY (id_curso)
        REFERENCES cursos(id_curso)
);`,
      generalExplanation: 'INTEGER indica el tipo de dato del campo, mientras que FOREIGN KEY y REFERENCES definen formalmente la relación con la tabla cursos.',
      parts: [
        { token: 'id_alumno INTEGER PRIMARY KEY', explanation: 'Clave primaria: número entero único para cada estudiante.' },
        { token: 'nombre TEXT, apellido TEXT', explanation: 'Campos de texto para los nombres personales.' },
        { token: 'id_curso INTEGER', explanation: 'Campo numérico que guardará a qué curso pertenece el alumno.' },
        { token: 'FOREIGN KEY (id_curso)', explanation: 'Declara que id_curso es una clave foránea (conexión con otra tabla).' },
        { token: 'REFERENCES cursos(id_curso)', explanation: 'Apunta a la clave primaria de la tabla cursos para asegurar que el curso exista.' }
      ]
    },
    highlightRelation: 'cursos-alumnos'
  },
  {
    slideNumber: 9,
    blockNumber: 2,
    blockTitle: 'Bloque 2 · Construimos las tablas',
    title: 'Creamos la tabla materias',
    subtitle: 'Definición de las asignaturas escolares',
    explanation: 'Esta tabla solo necesita dos columnas: su identificador único (id_materia) como clave primaria y el nombre de la asignatura (nombre_materia) como texto.',
    type: 'sql-code-interactive',
    sqlSnippet: {
      sql: `CREATE TABLE materias (
    id_materia INTEGER PRIMARY KEY,
    nombre_materia TEXT
);`,
      parts: [
        { token: 'id_materia', explanation: 'Identificador único de la materia (1, 2, 3).' },
        { token: 'INTEGER PRIMARY KEY', explanation: 'Asegura que no puedan existir dos materias con el mismo identificador.' },
        { token: 'nombre_materia TEXT', explanation: 'Texto con el nombre de la materia (Matemática, Informática, etc.).' }
      ]
    }
  },
  {
    slideNumber: 10,
    blockNumber: 2,
    blockTitle: 'Bloque 2 · Construimos las tablas',
    title: 'Creamos la tabla inscripciones',
    subtitle: 'La tabla que vincula alumnos con materias',
    explanation: 'Esta tabla relaciona alumnos con materias. Contiene dos claves foráneas distintas: una apunta a alumnos.id_alumno y la otra a materias.id_materia.',
    type: 'sql-code-interactive',
    sqlSnippet: {
      sql: `CREATE TABLE inscripciones (
    id_inscripcion INTEGER PRIMARY KEY,
    id_alumno INTEGER,
    id_materia INTEGER,
    FOREIGN KEY (id_alumno)
        REFERENCES alumnos(id_alumno),
    FOREIGN KEY (id_materia)
        REFERENCES materias(id_materia)
);`,
      generalExplanation: 'Una misma tabla puede contener múltiples claves foráneas para conectar varias tablas entre sí.',
      parts: [
        { token: 'id_inscripcion', explanation: 'Clave primaria propia de cada inscripción individual.' },
        { token: 'FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno)', explanation: 'Primera relación: indica a qué alumno corresponde esta inscripción.' },
        { token: 'FOREIGN KEY (id_materia) REFERENCES materias(id_materia)', explanation: 'Segunda relación: indica a qué materia está inscripto el alumno.' }
      ]
    },
    highlightRelation: 'all'
  },

  // =========================================================================
  // BLOQUE 3. CONOCEMOS LOS TIPOS DE DATOS
  // =========================================================================
  {
    slideNumber: 11,
    blockNumber: 3,
    blockTitle: 'Bloque 3 · Conocemos los tipos de datos',
    title: '¿Qué tipo de información guardamos?',
    subtitle: 'Los tres tipos de datos básicos suficientes para empezar',
    explanation: 'Cada campo tiene un tipo de dato que define qué valores puede almacenar. En nuestro proyecto escolar utilizamos únicamente estos tres tipos:',
    type: 'data-types-table'
  },

  // =========================================================================
  // BLOQUE 4. ¿CÓMO SE RELACIONAN LAS TABLAS?
  // =========================================================================
  {
    slideNumber: 12,
    blockNumber: 4,
    blockTitle: 'Bloque 4 · ¿Cómo se relacionan las tablas?',
    title: 'Las claves permiten establecer relaciones',
    subtitle: 'El puente entre Clave Primaria y Clave Foránea',
    explanation: 'La clave primaria identifica a un registro en su tabla, y la clave foránea guarda una referencia al registro relacionado en otra tabla. Observá las 3 conexiones en el diagrama:',
    type: 'er-relationships',
    highlightRelation: 'all'
  },
  {
    slideNumber: 13,
    blockNumber: 4,
    blockTitle: 'Bloque 4 · ¿Cómo se relacionan las tablas?',
    title: '¿Cómo consultamos información de varias tablas?',
    subtitle: 'El concepto fundamental de JOIN',
    explanation: 'JOIN permite combinar información de tablas relacionadas mediante una condición (ON). En lugar de ver códigos numéricos, obtenemos el nombre del alumno y de la materia en una sola consulta.',
    type: 'join-explanation',
    sqlSnippet: {
      sql: `SELECT alumnos.nombre, materias.nombre_materia
FROM inscripciones
JOIN alumnos
    ON inscripciones.id_alumno = alumnos.id_alumno
JOIN materias
    ON inscripciones.id_materia = materias.id_materia;`,
      generalExplanation: 'No basta con escribir JOIN: la palabra ON establece qué columna de una tabla debe coincidir con la de la otra.',
      parts: [
        { token: 'SELECT alumnos.nombre, materias.nombre_materia', explanation: 'Indica exactamente qué columnas queremos mostrar.' },
        { token: 'FROM inscripciones', explanation: 'Indica desde qué tabla intermedia comenzamos el recorrido.' },
        { token: 'JOIN alumnos', explanation: 'Incorpora la tabla alumnos a la consulta.' },
        { token: 'ON inscripciones.id_alumno = alumnos.id_alumno', explanation: 'Condición de relación: une cuando los identificadores de alumno coinciden.' },
        { token: 'JOIN materias', explanation: 'Incorpora la tabla materias a la consulta.' },
        { token: 'ON inscripciones.id_materia = materias.id_materia', explanation: 'Condición de relación: une cuando los identificadores de materia coinciden.' }
      ]
    }
  },

  // =========================================================================
  // BLOQUE 5. AGREGAMOS INFORMACIÓN
  // =========================================================================
  {
    slideNumber: 14,
    blockNumber: 5,
    blockTitle: 'Bloque 5 · Agregamos información',
    title: 'Las tablas ya tienen una estructura',
    subtitle: 'De la estructura vacía a los datos reales',
    explanation: 'Crear una tabla con CREATE TABLE solo define su casillero o estructura, pero inicialmente está vacía. Ahora comenzaremos a trabajar con la inserción de registros reales mediante INSERT INTO.',
    type: 'text-concept',
    extraContent: {
      points: [
        'CREATE TABLE construye el molde de la tabla (columnas y restricciones).',
        'INSERT INTO permite cargar los renglones (registros) uno por uno.',
        'Los datos agregados deben respetar los tipos de datos y las relaciones definidas.'
      ]
    }
  },
  {
    slideNumber: 15,
    blockNumber: 5,
    blockTitle: 'Bloque 5 · Agregamos información',
    title: 'Insertamos registros',
    subtitle: 'La instrucción INSERT INTO',
    explanation: 'Para agregar una fila usamos INSERT INTO indicando la tabla, las columnas y luego los datos con VALUES en el mismo orden.',
    type: 'sql-code-interactive',
    sqlSnippet: {
      sql: `INSERT INTO cursos (id_curso, nombre_curso)
VALUES (1, '1.º A');`,
      generalExplanation: 'Al insertar un alumno, el curso indicado en id_curso debe existir previamente en la tabla cursos para respetar la clave foránea.',
      parts: [
        { token: 'INSERT INTO cursos', explanation: 'Indica en qué tabla se insertará la nueva fila de datos.' },
        { token: '(id_curso, nombre_curso)', explanation: 'Lista de columnas que vamos a completar.' },
        { token: "VALUES (1, '1.º A')", explanation: 'Los valores a guardar: el 1 es numérico (sin comillas) y \'1.º A\' es texto (con comillas simples).' }
      ]
    }
  },
  {
    slideNumber: 16,
    blockNumber: 5,
    blockTitle: 'Bloque 5 · Agregamos información',
    title: '¿Cómo agregamos información a las cuatro tablas?',
    subtitle: 'El orden lógico de carga',
    explanation: 'Debemos cargar primero las tablas referenciadas antes de cargar las claves foráneas que apuntan a ellas. El orden recomendado es: 1. cursos, 2. alumnos, 3. materias, 4. inscripciones.',
    type: 'insert-sequence'
  },

  // =========================================================================
  // BLOQUE 6. HACEMOS CONSULTAS SENCILLAS
  // =========================================================================
  {
    slideNumber: 17,
    blockNumber: 6,
    blockTitle: 'Bloque 6 · Hacemos consultas sencillas',
    title: 'Nuestra primera consulta',
    subtitle: 'Recuperar todos los registros con SELECT *',
    explanation: 'SELECT indica qué queremos consultar y FROM qué tabla leer. El asterisco (*) significa que queremos ver todas las columnas de la tabla alumnos.',
    type: 'sql-code-interactive',
    sqlSnippet: {
      sql: `SELECT * FROM alumnos;`,
      parts: [
        { token: 'SELECT', explanation: 'Palabra clave que inicia una consulta para recuperar información.' },
        { token: '*', explanation: 'Comodín asterisco: solicita todas las columnas existentes en la tabla.' },
        { token: 'FROM alumnos', explanation: 'Indica la tabla de la que queremos extraer los datos.' },
        { token: ';', explanation: 'Terminación obligatoria de la sentencia SQL.' }
      ]
    }
  },
  {
    slideNumber: 18,
    blockNumber: 6,
    blockTitle: 'Bloque 6 · Hacemos consultas sencillas',
    title: 'Elegimos qué columnas queremos ver',
    subtitle: 'Proyección de campos específicos',
    explanation: 'Si no necesitamos todas las columnas, podemos enumerar únicamente los nombres de los campos que queremos ver, separados por una coma.',
    type: 'sql-code-interactive',
    sqlSnippet: {
      sql: `SELECT nombre, apellido
FROM alumnos;`,
      parts: [
        { token: 'SELECT nombre, apellido', explanation: 'Solo mostrará estas dos columnas en el resultado.' },
        { token: 'FROM alumnos', explanation: 'Tabla de origen de los datos.' }
      ]
    }
  },
  {
    slideNumber: 19,
    blockNumber: 6,
    blockTitle: 'Bloque 6 · Hacemos consultas sencillas',
    title: 'Buscamos información específica',
    subtitle: 'Filtrado de filas con WHERE',
    explanation: 'La cláusula WHERE permite establecer una condición para que la consulta devuelva solamente las filas que la cumplan.',
    type: 'sql-code-interactive',
    sqlSnippet: {
      sql: `SELECT *
FROM alumnos
WHERE id_curso = 1;`,
      parts: [
        { token: 'WHERE', explanation: 'Introduce la condición de filtro de registros.' },
        { token: 'id_curso = 1', explanation: 'Condición: solo traerá a los alumnos que pertenezcan al curso con id 1 (1.º A).' }
      ]
    }
  },
  {
    slideNumber: 20,
    blockNumber: 6,
    blockTitle: 'Bloque 6 · Hacemos consultas sencillas',
    title: 'Practicamos lo aprendido',
    subtitle: 'Tres desafíos para resolver con SELECT, FROM y WHERE',
    explanation: 'Leé cada consigna, pensá qué consulta escribirías y tocá el botón para comprobar la solución propuesta.',
    type: 'practice-challenges'
  }
];
