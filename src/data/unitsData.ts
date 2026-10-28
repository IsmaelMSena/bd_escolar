// Contenido curricular completo de las 10 Unidades de Aprendizaje Progresivas
// Módulo: Bases de Datos y SQL para Escuela Secundaria (MySQL)

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ActivityDefinition {
  id: string;
  title: string;
  instruction: string;
  hint: string;
  type: 'sql-editor' | 'drag-drop' | 'fill-blanks' | 'data-fill';
  defaultQuery?: string;
  expectedSqlKeywords?: string[];
  expectedResultColumns?: string[];
  expectedRowCount?: number;
  expectedSampleRows?: Record<string, any>[];
  solutionSql?: string;
  explanation: string;
  interactiveOptions?: string[];
  correctAnswers?: Record<string, string>;
}

export interface LearningUnit {
  id: number;
  number: number;
  title: string;
  shortTitle: string;
  badge: string;
  summary: string;
  intro: string;
  theorySections: {
    heading: string;
    content: string;
    bulletPoints?: string[];
    callout?: {
      type: 'tip' | 'warning' | 'info' | 'key';
      title: string;
      text: string;
    };
  }[];
  sqlExamples?: {
    title: string;
    description: string;
    sql: string;
    partsExplanation?: { token: string; desc: string }[];
    expectedTableResult?: {
      headers: string[];
      rows: (string | number)[][];
    };
  }[];
  activity: ActivityDefinition;
  checkQuestions: QuizQuestion[];
  synthesis: {
    keyIdeas: string[];
    takeaway: string;
  };
}

export const LEARNING_UNITS: LearningUnit[] = [
  // =========================================================================
  // UNIDAD 1: ¿QUÉ ES UNA BASE DE DATOS?
  // =========================================================================
  {
    id: 1,
    number: 1,
    title: '¿Qué es una base de datos?',
    shortTitle: 'Conceptos iniciales',
    badge: 'Fundamentos',
    summary: 'Descubrí qué es una base de datos relacional, cómo organiza la información en tablas, registros y campos, y por qué reemplazó a las fichas en papel en las escuelas.',
    intro: 'En esta primera unidad vas a comprender qué es una base de datos, cómo se estructura la información en filas y columnas, y por qué una escuela divide sus datos en distintas tablas para no repetir información.',
    theorySections: [
      {
        heading: '1. El problema del papel y el desorden de datos',
        content: 'Imaginate una escuela con 500 estudiantes. Cada uno tiene nombre, apellido, fecha de nacimiento, curso asignado, materias que cursa y calificaciones. Si guardáramos todo en carpetas de cartón o en una única planilla de cálculo gigante, buscar a un alumno, cambiarlo de división o saber qué materias tiene sería lentísimo y propicio a errores.',
        callout: {
          type: 'info',
          title: '¿Qué es una base de datos?',
          text: 'Una base de datos es un conjunto estructurado y organizado de información digital que permite almacenar datos, consultarlos a gran velocidad y modificarlos con total seguridad.'
        }
      },
      {
        heading: '2. Bases de datos relacionales y tablas',
        content: 'La mayoría de los sistemas que usamos a diario (redes sociales, bancos, escuelas) utilizan bases de datos relacionales. En ellas, los datos se organizan en tablas que se conectan o relacionan entre sí.',
        bulletPoints: [
          'Tabla: Es la cuadrícula que reúne información sobre un tema específico (por ejemplo, la tabla Alumnos).',
          'Campo o Columna: Es cada una de las columnas verticales. Define una característica o propiedad que comparten todos los elementos (por ejemplo: nombre, apellido, email).',
          'Registro o Fila: Es cada fila horizontal completa. Reúne todos los datos de un elemento individual (por ejemplo: la fila con los datos de Ana Pérez).'
        ]
      },
      {
        heading: '3. Diferencia entre Tabla, Registro, Campo y Dato',
        content: 'Para no confundirlos jamás en clase, recordá esta regla visual sencilla:',
        bulletPoints: [
          'La Tabla completa es como un archivero con nombre: Alumnos.',
          'Una Columna (Campo) es el rótulo de lo que se anota: "apellido".',
          'Una Fila (Registro) es la ficha completa de una persona: id 1, Ana, Pérez, ana@escuela.com.',
          'Una Celda (Dato o Valor) es el casillero puntual: "Ana".'
        ],
        callout: {
          type: 'key',
          title: '¿Por qué varias tablas en lugar de una sola?',
          text: 'Si pusiéramos en una sola tabla el alumno, el curso y todas las materias, tendríamos que repetir el nombre del curso y de cada materia cientos de veces. Al separarlo en tablas especializadas (Cursos, Materias, Alumnos, Inscripciones), cada dato se escribe una sola vez.'
        }
      }
    ],
    activity: {
      id: 'act_u1',
      title: 'Actividad 1: Diferenciar Campo, Registro y Tabla',
      instruction: 'Analizá los siguientes elementos de una escuela y determiná si corresponden a una Tabla, un Campo (columna) o un Registro (fila):',
      hint: 'Pensá si se trata del conjunto entero, de una columna que define una propiedad o de la fila de una persona específica.',
      type: 'drag-drop',
      explanation: '"Alumnos" es la Tabla completa. "email" es un Campo (columna). "Ana Pérez, ana@escuela.com" es un Registro (fila completa con los datos de un estudiante).',
      interactiveOptions: [
        'Tabla Alumnos',
        'Campo email',
        'Registro de Ana Pérez'
      ]
    },
    checkQuestions: [
      {
        id: 'u1_q1',
        question: '¿Qué representa una fila horizontal completa en una tabla escolar?',
        options: [
          'Un registro con todos los datos individuales de un estudiante.',
          'Un campo que define el tipo de dato.',
          'Una base de datos entera.'
        ],
        correctIndex: 0,
        explanation: 'Cada fila horizontal completa representa un registro individual.'
      },
      {
        id: 'u1_q2',
        question: '¿Por qué conviene separar la información escolar en distintas tablas?',
        options: [
          'Para evitar repetir información innecesariamente y prevenir inconsistencias.',
          'Porque las bases de datos solo permiten guardar 10 filas por tabla.',
          'Para que nadie pueda encontrar los datos de los alumnos.'
        ],
        correctIndex: 0,
        explanation: 'Separar en tablas especializadas elimina la duplicación de datos (redundancia).'
      }
    ],
    synthesis: {
      keyIdeas: [
        'Una base de datos relacional organiza la información en tablas conectadas entre sí.',
        'Cada tabla tiene columnas (campos que definen propiedades) y filas (registros individuales).',
        'Cada celda contiene un dato o valor específico.',
        'Dividir los datos en tablas temáticas evita repetir información y previene errores.'
      ],
      takeaway: 'Una base de datos escolar reemplaza el caos de papeles por tablas ordenadas y vinculadas digitalmente.'
    }
  },

  // =========================================================================
  // UNIDAD 2: CONOCER LAS TABLAS DE LA BASE DE DATOS ESCOLAR
  // =========================================================================
  {
    id: 2,
    number: 2,
    title: 'Conocer las tablas de la base de datos escolar',
    shortTitle: 'Tablas principales',
    badge: 'Modelo de Datos',
    summary: 'Conocé las tablas Cursos, Materias, Alumnos e Inscripciones con sus columnas y datos de ejemplo reales.',
    intro: 'En esta unidad vas a explorar en detalle la estructura de las tablas que utilizaremos a lo largo de todo el curso para gestionar nuestra escuela.',
    theorySections: [
      {
        heading: '1. Las cuatro tablas principales de nuestra escuela',
        content: 'Para administrar las divisiones, los estudiantes y las materias, definimos cuatro tablas iniciales:',
        bulletPoints: [
          'Tabla Cursos: Almacena las divisiones o años escolares (id_curso, nombre, anio).',
          'Tabla Materias: Almacena las asignaturas dictadas (id_materia, nombre).',
          'Tabla Alumnos: Almacena los datos personales de los chicos (id_alumno, nombre, apellido, email).',
          'Tabla Inscripciones: Registra qué alumno está matriculado en qué curso y en qué fecha (id_inscripcion, id_alumno, id_curso, fecha).'
        ]
      },
      {
        heading: '2. ¿Por qué Inscripciones necesita identificar alumno y curso?',
        content: 'La tabla Inscripciones es el puente que une a los estudiantes con las divisiones escolares. No guarda el nombre de la persona ni el nombre del curso en texto, sino sus números identificadores (id_alumno e id_curso).',
        callout: {
          type: 'tip',
          title: 'Ejemplo de Inscripción',
          text: 'Si Ana Pérez tiene id_alumno = 1 y el curso "1 A" tiene id_curso = 1, la fila en Inscripciones guarda (id_inscripcion: 1, id_alumno: 1, id_curso: 1, fecha: 2026-03-01). Con solo dos números queda registrado formalmente que Ana asiste a 1 A.'
        }
      },
      {
        heading: '3. Registros de ejemplo en la escuela',
        content: 'Nuestra base de datos de práctica contiene los siguientes registros de prueba:',
        bulletPoints: [
          'Cursos: (1, 1 A, 1), (2, 1 B, 1), (3, 2 A, 2)',
          'Materias: (1, Matemática), (2, Informática), (3, Historia)',
          'Alumnos: (1, Ana Pérez, ana@escuela.com), (2, Juan López, juan@escuela.com), (3, María Gómez, maria@escuela.com)',
          'Inscripciones: Ana en 1 A, Juan en 1 A, María en 1 B.'
        ]
      }
    ],
    activity: {
      id: 'act_u2',
      title: 'Actividad 2: Completar una Inscripción Escolar',
      instruction: 'A partir de los datos: Alumno "Juan López" (id_alumno = 2) y Curso "1 A" (id_curso = 1), ¿cómo debe registrarse su fila en la tabla Inscripciones?',
      hint: 'Recordá que la tabla Inscripciones requiere: id_inscripcion, id_alumno, id_curso y fecha.',
      type: 'fill-blanks',
      explanation: 'La inscripción vincula id_alumno = 2 con id_curso = 1, asignándole su propio id_inscripcion numérico y la fecha de matriculación.',
      correctAnswers: {
        id_alumno: '2',
        id_curso: '1'
      }
    },
    checkQuestions: [
      {
        id: 'u2_q1',
        question: '¿Qué columnas componen la tabla Cursos en nuestro modelo escolar?',
        options: [
          'id_curso, nombre, anio.',
          'nombre_alumno, apellido, curso.',
          'id_materia, nota_final.'
        ],
        correctIndex: 0,
        explanation: 'La tabla Cursos almacena id_curso, nombre y anio.'
      },
      {
        id: 'u2_q2',
        question: '¿Qué función cumple la tabla Inscripciones?',
        options: [
          'Registrar qué alumno pertenece a qué curso y en qué fecha.',
          'Guardar los sueldos de los docentes.',
          'Modificar el nombre de la escuela.'
        ],
        correctIndex: 0,
        explanation: 'Inscripciones vincula formalmente al estudiante con su división escolar.'
      }
    ],
    synthesis: {
      keyIdeas: [
        'Cursos guarda las divisiones escolares (id_curso, nombre, anio).',
        'Materias guarda las asignaturas (id_materia, nombre).',
        'Alumnos guarda los datos de contacto personales (id_alumno, nombre, apellido, email).',
        'Inscripciones conecta alumnos con cursos mediante sus identificadores numéricos.'
      ],
      takeaway: 'Con estas tablas la escuela tiene perfectamente separados los estudiantes, los cursos y las matrículas.'
    }
  },

  // =========================================================================
  // UNIDAD 3: CLAVE PRIMARIA Y CLAVE FORÁNEA
  // =========================================================================
  {
    id: 3,
    number: 3,
    title: 'Clave primaria y clave foránea',
    shortTitle: 'Claves e Integridad',
    badge: 'Arquitectura Relacional',
    summary: 'Descubrí qué es una PRIMARY KEY y una FOREIGN KEY, por qué no usamos nombres para identificar filas y qué es la integridad referencial.',
    intro: 'Las claves son los cimientos de cualquier base de datos relacional. En esta unidad vas a aprender cómo distinguir de forma unívoca a cada registro y cómo crear puentes seguros entre tablas.',
    theorySections: [
      {
        heading: '1. Clave Primaria (PRIMARY KEY)',
        content: 'La clave primaria es un campo (o conjunto de campos) cuyo valor es único e irrepetible en toda la tabla. Ninguna fila puede tener la clave primaria vacía (NULL) ni duplicar el valor de otra fila.',
        bulletPoints: [
          'Ana Pérez tiene id_alumno = 1.',
          'Juan López tiene id_alumno = 2.'
        ],
        callout: {
          type: 'warning',
          title: '¿Por qué no identificar por nombre y apellido?',
          text: 'En una escuela puede haber dos alumnos llamados "Juan Gómez" (homónimos). Además, un apellido puede escribirse con error ortográfico ("Gonzales" vs "González"). El identificador numérico nunca cambia y garantiza que jamás confundamos dos personas.'
        }
      },
      {
        heading: '2. Clave Foránea (FOREIGN KEY)',
        content: 'Una clave foránea es una columna de una tabla que almacena el valor de la clave primaria de otra tabla. Es el puente que une dos tablas y garantiza la integridad de los datos.',
        callout: {
          type: 'key',
          title: 'El problema de los datos huérfanos',
          text: '¿Qué pasaría si en Inscripciones pudiéramos anotar un id_alumno = 999 cuando en la escuela solo hay 3 alumnos? La base de datos tendría una inscripción sin estudiante real. La restricción FOREIGN KEY prohíbe esto e impide guardar registros huérfanos.'
        }
      }
    ],
    activity: {
      id: 'act_u3',
      title: 'Actividad 3: Reconocer Claves Primarias y Foráneas',
      instruction: 'En la tabla Inscripciones (id_inscripcion, id_alumno, id_curso, fecha), indicá cuál es la Clave Primaria (PK) y cuáles son las Claves Foráneas (FK).',
      hint: 'La PK identifica a la inscripción en sí misma. Las FKs apuntan a Alumnos y Cursos.',
      type: 'drag-drop',
      explanation: 'id_inscripcion es la PRIMARY KEY propia de la inscripción. id_alumno e id_curso son FOREIGN KEYs que apuntan a las tablas Alumnos y Cursos.',
      interactiveOptions: [
        'PK: id_inscripcion',
        'FK: id_alumno',
        'FK: id_curso'
      ]
    },
    checkQuestions: [
      {
        id: 'u3_q1',
        question: '¿Qué característica fundamental debe cumplir una Clave Primaria?',
        options: [
          'Debe ser única para cada fila y no puede ser nula (NULL).',
          'Debe contener siempre el nombre de la escuela.',
          'Debe cambiar todos los días automáticamente.'
        ],
        correctIndex: 0,
        explanation: 'Una clave primaria identifica de forma exclusiva e irrepetible a cada registro.'
      },
      {
        id: 'u3_q2',
        question: '¿Qué evita una restricción de Clave Foránea (FOREIGN KEY)?',
        options: [
          'Evita que se guarden referencias a registros que no existen en la tabla principal.',
          'Evita que los alumnos puedan ver sus notas.',
          'Obliga a que todos los cursos tengan el mismo nombre.'
        ],
        correctIndex: 0,
        explanation: 'La clave foránea asegura la integridad referencial impidiendo registros huérfanos.'
      }
    ],
    synthesis: {
      keyIdeas: [
        'PRIMARY KEY (PK): Identificador único que distingue a cada fila sin ambigüedades.',
        'FOREIGN KEY (FK): Campo que guarda la clave primaria de otra tabla para relacionarlas.',
        'Integridad referencial: Regla de seguridad que impide vincular datos con registros inexistentes.'
      ],
      takeaway: 'Las claves primarias identifican filas y las claves foráneas construyen los puentes entre tablas.'
    }
  },

  // =========================================================================
  // UNIDAD 4: RELACIONES ENTRE TABLAS (Y LA 5TA TABLA CURSO_MATERIA)
  // =========================================================================
  {
    id: 4,
    number: 4,
    title: 'Relaciones entre tablas: Uno a Muchos y Muchos a Muchos',
    shortTitle: 'Relaciones y Curso_Materia',
    badge: 'Modelado Relacional',
    summary: 'Comprendé las relaciones 1:N y N:M. Descubrí por qué introducimos la quinta tabla Curso_Materia para vincular cursos y asignaturas.',
    intro: 'En la realidad escolar no todas las relaciones funcionan igual. En esta unidad vas a aprender la diferencia entre relaciones uno a muchos y muchos a muchos, incorporando la quinta tabla de nuestro sistema: Curso_Materia.',
    theorySections: [
      {
        heading: '1. Relación Uno a Muchos (1:N)',
        content: 'Ocurre cuando un registro de una tabla se relaciona con muchos registros de otra tabla, pero cada uno de estos últimos pertenece a un solo registro de la primera.',
        bulletPoints: [
          'Un Curso puede tener muchos Alumnos inscriptos.',
          'Pero en un período escolar, cada alumno pertenece a un único curso.',
          'En nuestro modelo, la tabla Inscripciones representa esta relación uno a muchos entre Cursos y Alumnos.'
        ]
      },
      {
        heading: '2. Relación Muchos a Muchos (N:M)',
        content: 'Analicemos qué pasa entre Cursos y Materias: Un curso tiene muchas materias (Matemática, Informática, Historia...) y a su vez, una materia se dicta en muchos cursos (Matemática se da en 1 A, en 1 B y en 2 A).',
        callout: {
          type: 'warning',
          title: '¿Por qué NO poner las materias en un solo campo?',
          text: 'Si en la tabla Cursos pusiéramos un campo "materias" con el texto "Matemática, Informática, Historia", sería imposible consultar qué cursos tienen Informática, no podríamos ordenar, ni calcular promedios ni garantizar que los nombres estén bien escritos.'
        }
      },
      {
        heading: '3. La solución profesional: la quinta tabla Curso_Materia',
        content: 'Para resolver una relación muchos a muchos, las bases de datos relacionales crean una tabla intermedia. En nuestra escuela la llamamos Curso_Materia.',
        bulletPoints: [
          'id_curso (FK apuntando a Cursos)',
          'id_materia (FK apuntando a Materias)',
          'Clave primaria compuesta: La combinación de ambos campos (id_curso, id_materia) es la PK, lo que asegura que un curso no tenga dos veces asignada la misma materia.'
        ],
        callout: {
          type: 'key',
          title: 'El modelo completo de 5 tablas',
          text: 'Con Curso_Materia nuestro sistema escolar queda compuesto por 5 tablas perfectamente estructuradas: Cursos, Materias, Alumnos, Inscripciones y Curso_Materia.'
        }
      }
    ],
    activity: {
      id: 'act_u4',
      title: 'Actividad 4: Asignar Materias a un Curso',
      instruction: 'Si el curso "1 B" (id_curso = 2) dicta las materias Matemática (id_materia = 1) e Historia (id_materia = 3), ¿qué dos filas deben agregarse en la tabla Curso_Materia?',
      hint: 'Cada fila de Curso_Materia combina un id_curso con un id_materia.',
      type: 'fill-blanks',
      explanation: 'Las dos filas son (2, 1) para Matemática y (2, 3) para Historia.',
      correctAnswers: {
        fila1: '2, 1',
        fila2: '2, 3'
      }
    },
    checkQuestions: [
      {
        id: 'u4_q1',
        question: '¿Qué tipo de relación existe entre Cursos y Materias?',
        options: [
          'Muchos a muchos (N:M), porque un curso tiene varias materias y una materia se da en varios cursos.',
          'Uno a uno (1:1), porque cada curso solo puede tener una única materia en toda su historia.',
          'Ninguna relación.'
        ],
        correctIndex: 0,
        explanation: 'Es una relación muchos a muchos, que se resuelve con la tabla intermedia Curso_Materia.'
      },
      {
        id: 'u4_q2',
        question: '¿Cuál es la Clave Primaria de la tabla intermedia Curso_Materia?',
        options: [
          'La clave primaria compuesta por (id_curso, id_materia).',
          'El nombre del profesor.',
          'El año escolar.'
        ],
        correctIndex: 0,
        explanation: 'La combinación de ambos identificadores forma una clave primaria compuesta irrepetible.'
      }
    ],
    synthesis: {
      keyIdeas: [
        'Relación 1:N: Un curso tiene muchos alumnos (se modela con Inscripciones).',
        'Relación N:M: Un curso tiene muchas materias y una materia se da en varios cursos.',
        'La relación N:M se resuelve con la tabla intermedia Curso_Materia.',
        'Nuestro sistema escolar completo cuenta oficialmente con 5 tablas relacionadas.'
      ],
      takeaway: 'Las relaciones conectan las 5 tablas sin duplicar datos y modelan la vida real de la escuela.'
    }
  },

  // =========================================================================
  // UNIDAD 5: ¿QUÉ ES SQL?
  // =========================================================================
  {
    id: 5,
    number: 5,
    title: '¿Qué es SQL? El lenguaje de las bases de datos',
    shortTitle: 'Introducción a SQL',
    badge: 'Lenguaje SQL',
    summary: 'Aprendé qué es SQL, para qué se utiliza, la compatibilidad con MySQL y el propósito de cada una de sus instrucciones principales.',
    intro: 'Hasta acá diseñamos la arquitectura y las relaciones de nuestra escuela. Ahora vamos a conocer el idioma con el que le daremos órdenes al motor de base de datos: SQL.',
    theorySections: [
      {
        heading: '1. ¿Qué es SQL?',
        content: 'SQL significa Structured Query Language (Lenguaje de Consulta Estructurado). Es el estándar mundial para comunicarse con sistemas gestores de bases de datos relacionales como MySQL, PostgreSQL, MariaDB o SQLite.',
        bulletPoints: [
          'Permite crear bases de datos y tablas.',
          'Permite insertar, actualizar y borrar datos.',
          'Permite consultar y recuperar información filtrada y combinada.'
        ]
      },
      {
        heading: '2. Las instrucciones principales que aprenderemos',
        content: 'A lo largo de las siguientes unidades trabajaremos con las siguientes instrucciones de MySQL paso a paso:',
        bulletPoints: [
          'CREATE DATABASE y USE: Para crear y activar la base de datos de la escuela.',
          'CREATE TABLE: Para definir cada una de las 5 tablas con sus columnas y claves.',
          'INSERT INTO: Para cargar los registros escolares.',
          'SELECT y FROM: Para consultar y recuperar información.',
          'WHERE: Para filtrar resultados según una condición.',
          'ORDER BY: Para ordenar resultados alfabética o numéricamente.',
          'INNER JOIN y LEFT JOIN: Para unir tablas relacionadas.',
          'COUNT y GROUP BY: Para calcular estadísticas como la cantidad de alumnos por división.'
        ],
        callout: {
          type: 'tip',
          title: 'Reglas de escritura en SQL',
          text: 'Por convención, las palabras clave de SQL se escriben en MAYÚSCULAS (CREATE, SELECT, FROM) y los nombres de tablas y campos en minúsculas o CamelCase. Cada sentencia termina con un punto y coma (;).'
        }
      }
    ],
    activity: {
      id: 'act_u5',
      title: 'Actividad 5: Relacionar Instrucciones SQL con su Función',
      instruction: 'Emparejá mentalmente cada comando SQL con su objetivo escolar:',
      hint: 'SELECT consulta, INSERT carga datos, CREATE TABLE crea la estructura.',
      type: 'drag-drop',
      explanation: 'CREATE TABLE crea tablas, INSERT INTO agrega filas, SELECT consulta información y WHERE filtra condiciones.',
      interactiveOptions: [
        'CREATE TABLE: Crear estructura',
        'INSERT INTO: Guardar alumnos',
        'SELECT: Consultar registros',
        'WHERE: Filtrar por condición'
      ]
    },
    checkQuestions: [
      {
        id: 'u5_q1',
        question: '¿Qué significa la sigla SQL?',
        options: [
          'Structured Query Language (Lenguaje de Consulta Estructurado).',
          'Simple Question Line.',
          'Software Quick Level.'
        ],
        correctIndex: 0,
        explanation: 'SQL es el Lenguaje de Consulta Estructurado universal para bases de datos relacionales.'
      },
      {
        id: 'u5_q2',
        question: '¿Con qué carácter finaliza obligatoriamente cada instrucción SQL?',
        options: [
          'Con punto y coma (;).',
          'Con dos puntos (:).',
          'Con un signo de pregunta (?).'
        ],
        correctIndex: 0,
        explanation: 'El punto y coma (;) indica al motor de base de datos el fin de la instrucción.'
      }
    ],
    synthesis: {
      keyIdeas: [
        'SQL es el lenguaje universal para gestionar bases de datos relacionales.',
        'Utilizaremos sintaxis compatible con MySQL.',
        'Las palabras clave se escriben en mayúsculas por convención.',
        'Cada instrucción finaliza con punto y coma (;).'
      ],
      takeaway: 'Con SQL tenemos el poder de crear, cargar y consultar cualquier base de datos.'
    }
  },

  // =========================================================================
  // UNIDAD 6: CREAR LA BASE DE DATOS Y LAS CINCO TABLAS
  // =========================================================================
  {
    id: 6,
    number: 6,
    title: 'Crear la base de datos y las cinco tablas',
    shortTitle: 'CREATE TABLE en MySQL',
    badge: 'SQL DDL',
    summary: 'Aprendé a crear la base de datos Escuela y sus 5 tablas con tipos de datos MySQL (INT, VARCHAR, DATE), AUTO_INCREMENT y claves foráneas.',
    intro: 'En esta unidad vas a escribir el código SQL para crear la base de datos Escuela y cada una de sus cinco tablas respetando el orden correcto de dependencias.',
    theorySections: [
      {
        heading: '1. Crear y activar la base de datos',
        content: 'Lo primero que hacemos en MySQL es crear el espacio de trabajo y seleccionarlo:',
        callout: {
          type: 'key',
          title: 'Código SQL inicial',
          text: 'CREATE DATABASE Escuela;\nUSE Escuela;'
        }
      },
      {
        heading: '2. Tipos de datos y modificadores en MySQL',
        content: 'Al definir cada columna indicamos qué tipo de dato albergará y sus restricciones:',
        bulletPoints: [
          'INT: Números enteros (ej. 1, 2, 3).',
          'VARCHAR(n): Cadenas de texto de hasta "n" caracteres (ej. VARCHAR(50) para nombres).',
          'DATE: Fechas en formato Año-Mes-Día (ej. 2026-03-01).',
          'PRIMARY KEY: Declara la clave primaria.',
          'AUTO_INCREMENT: En MySQL genera automáticamente números correlativos (1, 2, 3...) sin necesidad de ingresarlos a mano.',
          'NOT NULL: El campo es obligatorio (no puede quedar vacío).',
          'FOREIGN KEY (campo) REFERENCES otra_tabla(campo): Establece la conexión entre tablas.'
        ]
      },
      {
        heading: '3. El orden correcto de creación de tablas',
        content: '¡Regla de oro de las bases de datos! No podés crear una tabla con una Clave Foránea que apunte a una tabla que todavía no existe.',
        bulletPoints: [
          '1.º Tablas independientes: Cursos, Materias y Alumnos (no dependen de nadie).',
          '2.º Tablas dependientes: Inscripciones (apunta a Alumnos y Cursos) y Curso_Materia (apunta a Cursos y Materias).'
        ]
      }
    ],
    sqlExamples: [
      {
        title: 'Creación completa de las 5 tablas en MySQL',
        description: 'Sentencias DDL ejecutadas en orden secuencial estricto:',
        sql: `CREATE DATABASE Escuela;
USE Escuela;

-- 1. Tabla Cursos
CREATE TABLE Cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    anio INT NOT NULL
);

-- 2. Tabla Materias
CREATE TABLE Materias (
    id_materia INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- 3. Tabla Alumnos
CREATE TABLE Alumnos (
    id_alumno INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL
);

-- 4. Tabla Inscripciones (relaciona Alumnos y Cursos)
CREATE TABLE Inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL,
    id_curso INT NOT NULL,
    fecha DATE NOT NULL,
    FOREIGN KEY (id_alumno) REFERENCES Alumnos(id_alumno),
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso)
);

-- 5. Tabla Curso_Materia (relación N:M con PK compuesta)
CREATE TABLE Curso_Materia (
    id_curso INT NOT NULL,
    id_materia INT NOT NULL,
    PRIMARY KEY (id_curso, id_materia),
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso),
    FOREIGN KEY (id_materia) REFERENCES Materias(id_materia)
);`
      }
    ],
    activity: {
      id: 'act_u6',
      title: 'Actividad 6: Definir la Tabla Alumnos con MySQL',
      instruction: 'Completá la sentencia SQL para crear la tabla Alumnos con su id auto-incremental como clave primaria, nombre y apellido obligatorios y email:',
      hint: 'Usá INT AUTO_INCREMENT PRIMARY KEY para el identificador y VARCHAR con NOT NULL para los textos.',
      type: 'sql-editor',
      defaultQuery: 'CREATE TABLE Alumnos (\n    id_alumno INT AUTO_INCREMENT PRIMARY KEY,\n    nombre VARCHAR(100) NOT NULL,\n    apellido VARCHAR(100) NOT NULL,\n    email VARCHAR(150) NOT NULL\n);',
      expectedSqlKeywords: ['CREATE', 'TABLE', 'Alumnos', 'id_alumno', 'PRIMARY', 'KEY'],
      solutionSql: 'CREATE TABLE Alumnos (\n    id_alumno INT AUTO_INCREMENT PRIMARY KEY,\n    nombre VARCHAR(100) NOT NULL,\n    apellido VARCHAR(100) NOT NULL,\n    email VARCHAR(150) NOT NULL\n);',
      explanation: 'Define la estructura de Alumnos asignando id_alumno como clave primaria auto-incremental y los campos de texto obligatorios.'
    },
    checkQuestions: [
      {
        id: 'u6_q1',
        question: '¿Qué hace la instrucción AUTO_INCREMENT en MySQL?',
        options: [
          'Genera números correlativos automáticos (1, 2, 3...) para cada nuevo registro.',
          'Borra la tabla si se llena.',
          'Ordena los textos alfabéticamente.'
        ],
        correctIndex: 0,
        explanation: 'AUTO_INCREMENT genera automáticamente el identificador de cada fila nueva.'
      },
      {
        id: 'u6_q2',
        question: '¿Por qué debemos crear la tabla Cursos antes que la tabla Inscripciones?',
        options: [
          'Porque Inscripciones tiene una clave foránea que referencia a Cursos, y el destino debe existir primero.',
          'Porque MySQL solo crea tablas por orden alfabético.',
          'Porque los cursos tienen más alumnos que las materias.'
        ],
        correctIndex: 0,
        explanation: 'Las tablas referenciadas deben existir previamente para poder declarar claves foráneas válidas.'
      }
    ],
    synthesis: {
      keyIdeas: [
        'CREATE DATABASE y USE inicializan el entorno de trabajo.',
        'Se usan tipos MySQL: INT, VARCHAR(n) y DATE.',
        'AUTO_INCREMENT genera números automáticos para las claves primarias.',
        'Las tablas maestras se crean primero y las dependientes con FOREIGN KEY después.'
      ],
      takeaway: 'La estructura de 5 tablas de la escuela ya está lista en la base de datos para recibir información.'
    }
  },

  // =========================================================================
  // UNIDAD 7: INSERTAR DATOS
  // =========================================================================
  {
    id: 7,
    number: 7,
    title: 'Insertar datos con INSERT INTO',
    shortTitle: 'INSERT INTO y dependencias',
    badge: 'SQL DML',
    summary: 'Aprendé a cargar registros en las 5 tablas con INSERT INTO, respetando las comillas en textos, formatos de fecha y las referencias foráneas.',
    intro: 'Una base de datos sin datos es como una escuela vacía antes del inicio de clases. En esta unidad vas a aprender a poblar las cinco tablas respetando la integridad referencial.',
    theorySections: [
      {
        heading: '1. La instrucción INSERT INTO',
        content: 'Para agregar filas a una tabla utilizamos INSERT INTO indicando la tabla, las columnas y los valores correspondientes:',
        bulletPoints: [
          'Textos (VARCHAR): Van siempre entre comillas simples (ej. \'1 A\', \'Ana\').',
          'Números (INT): Se escriben directamente sin comillas (ej. 1, 2).',
          'Fechas (DATE): Se escriben entre comillas simples en formato Año-Mes-Día (ej. \'2026-03-01\').'
        ]
      },
      {
        heading: '2. El orden lógico de carga',
        content: 'Al igual que al crear las tablas, no podés inscribir a un alumno en un curso si el alumno o el curso todavía no fueron cargados.',
        bulletPoints: [
          '1. Cursos (para que existan los id_curso 1, 2, 3).',
          '2. Materias (para que existan los id_materia 1, 2, 3).',
          '3. Alumnos (para que existan los id_alumno 1, 2, 3).',
          '4. Inscripciones (vincula alumnos existentes con cursos existentes).',
          '5. Curso_Materia (vincula cursos existentes con materias existentes).'
        ],
        callout: {
          type: 'warning',
          title: 'Cuidado con los identificadores AUTO_INCREMENT',
          text: 'En una base de datos recién creada, los id empiezan en 1, 2, 3. Pero en un sistema real en funcionamiento, siempre debés consultar primero qué identificadores existen antes de insertar registros relacionados.'
        }
      }
    ],
    sqlExamples: [
      {
        title: 'Carga de datos completa en MySQL',
        description: 'Inserción ordenada de todos los registros de demostración:',
        sql: `-- 1. Cursos
INSERT INTO Cursos (id_curso, nombre, anio) VALUES
(1, '1 A', 1),
(2, '1 B', 1),
(3, '2 A', 2);

-- 2. Materias
INSERT INTO Materias (id_materia, nombre) VALUES
(1, 'Matemática'),
(2, 'Informática'),
(3, 'Historia');

-- 3. Alumnos
INSERT INTO Alumnos (id_alumno, nombre, apellido, email) VALUES
(1, 'Ana', 'Pérez', 'ana@escuela.com'),
(2, 'Juan', 'López', 'juan@escuela.com'),
(3, 'María', 'Gómez', 'maria@escuela.com');

-- 4. Inscripciones (Ana y Juan en 1 A; María en 1 B)
INSERT INTO Inscripciones (id_inscripcion, id_alumno, id_curso, fecha) VALUES
(1, 1, 1, '2026-03-01'),
(2, 2, 1, '2026-03-01'),
(3, 3, 2, '2026-03-02');

-- 5. Curso_Materia (Asignación de materias por curso)
INSERT INTO Curso_Materia (id_curso, id_materia) VALUES
(1, 1), (1, 2), (1, 3), -- 1 A tiene Matemática, Informática e Historia
(2, 1), (2, 3),         -- 1 B tiene Matemática e Historia
(3, 1), (3, 2);         -- 2 A tiene Matemática e Informática`
      }
    ],
    activity: {
      id: 'act_u7',
      title: 'Actividad 7: Insertar un Nuevo Alumno con INSERT INTO',
      instruction: 'Escribí la sentencia SQL para insertar a un nuevo alumno: id 4, nombre "Lucas", apellido "Benítez", email "lucas@escuela.com":',
      hint: 'Recordá usar INSERT INTO Alumnos (...) VALUES (...); con comillas simples en los textos.',
      type: 'sql-editor',
      defaultQuery: "INSERT INTO Alumnos (id_alumno, nombre, apellido, email)\nVALUES (4, 'Lucas', 'Benítez', 'lucas@escuela.com');",
      expectedSqlKeywords: ['INSERT', 'INTO', 'Alumnos', 'VALUES', 'Lucas', 'Benítez'],
      solutionSql: "INSERT INTO Alumnos (id_alumno, nombre, apellido, email)\nVALUES (4, 'Lucas', 'Benítez', 'lucas@escuela.com');",
      explanation: 'Agrega una nueva fila respetando el orden de columnas y usando comillas simples para los textos.'
    },
    checkQuestions: [
      {
        id: 'u7_q1',
        question: 'En SQL, ¿cómo se deben escribir los valores de tipo texto y fechas?',
        options: [
          'Encerrados entre comillas simples (ej. \'Matemática\', \'2026-03-01\').',
          'Entre signos de pesos ($texto$).',
          'Sin ningún tipo de comillas.'
        ],
        correctIndex: 0,
        explanation: 'En SQL las cadenas de caracteres y fechas van siempre entre comillas simples.'
      },
      {
        id: 'u7_q2',
        question: 'Si intentás insertar una inscripción con id_curso = 99 y no existe ese curso, ¿qué hace MySQL?',
        options: [
          'Rechaza la inserción arrojando un error de violación de Clave Foránea.',
          'Crea el curso 99 automáticamente sin avisar.',
          'Borra todos los alumnos.'
        ],
        correctIndex: 0,
        explanation: 'La restricción FOREIGN KEY protege los datos impidiendo registrar valores inexistentes.'
      }
    ],
    synthesis: {
      keyIdeas: [
        'INSERT INTO agrega nuevas filas en una tabla.',
        'Los textos y fechas van entre comillas simples; los números sin comillas.',
        'Se deben cargar primero las tablas maestras antes que las tablas con claves foráneas.',
        'Las claves foráneas impiden insertar referencias huérfanas.'
      ],
      takeaway: 'Nuestras 5 tablas ya están pobladas con estudiantes, divisiones, materias e inscripciones.'
    }
  },

  // =========================================================================
  // UNIDAD 8: CONSULTAS BÁSICAS
  // =========================================================================
  {
    id: 8,
    number: 8,
    title: 'Consultas básicas con SELECT, WHERE y ORDER BY',
    shortTitle: 'SELECT y Filtros',
    badge: 'SQL DQL',
    summary: 'Aprendé a recuperar información con SELECT, elegir columnas específicas, filtrar condiciones con WHERE y ordenar con ORDER BY.',
    intro: 'Una vez cargados los datos, la tarea más habitual de un profesional es consultarlos. En esta unidad vas a dominar cómo recuperar exactamente la información que necesitás.',
    theorySections: [
      {
        heading: '1. La instrucción SELECT y el comodín asterisco (*)',
        content: 'SELECT indica qué columnas queremos ver y FROM indica de qué tabla leer. Si usamos el asterisco (*), le pedimos a la base de datos que nos devuelva todas las columnas existentes:',
        callout: {
          type: 'tip',
          title: 'Consultar todos los alumnos',
          text: 'SELECT * FROM Alumnos;'
        }
      },
      {
        heading: '2. Proyección de campos específicos',
        content: 'Si la secretaría escolar solo necesita una lista de nombres y apellidos, no hace falta traer el email ni el id. Se enumeran los campos separados por comas:',
        callout: {
          type: 'info',
          title: 'Elegir columnas',
          text: 'SELECT nombre, apellido FROM Alumnos;'
        }
      },
      {
        heading: '3. Filtrar registros con WHERE',
        content: 'La cláusula WHERE permite establecer una condición. Solo las filas que cumplan la condición serán incluidas en el resultado.',
        callout: {
          type: 'key',
          title: 'Buscar a Ana',
          text: "SELECT * FROM Alumnos WHERE nombre = 'Ana';"
        }
      },
      {
        heading: '4. Ordenar resultados con ORDER BY',
        content: 'Para generar listados ordenados alfabéticamente usamos ORDER BY con ASC (ascendente, de A a Z) o DESC (descendente):',
        callout: {
          type: 'tip',
          title: 'Listado alfabético por apellido',
          text: 'SELECT * FROM Alumnos ORDER BY apellido ASC;'
        }
      }
    ],
    sqlExamples: [
      {
        title: 'Ejemplos progresivos de consulta',
        description: 'Distintas formas de consultar la información escolar:',
        sql: `-- 1. Ver todos los cursos
SELECT * FROM Cursos;

-- 2. Ver todas las materias
SELECT * FROM Materias;

-- 3. Mostrar solamente nombre y apellido
SELECT nombre, apellido FROM Alumnos;

-- 4. Buscar un alumno puntual por nombre
SELECT * FROM Alumnos WHERE nombre = 'Ana';

-- 5. Listar alumnos ordenados por apellido
SELECT * FROM Alumnos ORDER BY apellido ASC;`,
        expectedTableResult: {
          headers: ['id_alumno', 'nombre', 'apellido', 'email'],
          rows: [
            [3, 'María', 'Gómez', 'maria@escuela.com'],
            [2, 'Juan', 'López', 'juan@escuela.com'],
            [1, 'Ana', 'Pérez', 'ana@escuela.com']
          ]
        }
      }
    ],
    activity: {
      id: 'act_u8',
      title: 'Actividad 8: Filtrar Alumnos por Apellido',
      instruction: 'Escribí la consulta SQL para mostrar todos los datos de los alumnos cuyo apellido sea "López":',
      hint: "Usá SELECT * FROM Alumnos WHERE apellido = 'López';",
      type: 'sql-editor',
      defaultQuery: "SELECT * FROM Alumnos WHERE apellido = 'López';",
      expectedSqlKeywords: ['SELECT', '*', 'FROM', 'Alumnos', 'WHERE', 'apellido', 'López'],
      expectedResultColumns: ['id_alumno', 'nombre', 'apellido', 'email'],
      expectedRowCount: 1,
      expectedSampleRows: [
        { id_alumno: 2, nombre: 'Juan', apellido: 'López', email: 'juan@escuela.com' }
      ],
      solutionSql: "SELECT * FROM Alumnos WHERE apellido = 'López';",
      explanation: 'Recupera únicamente el registro de Juan López aplicando el filtro exacto en el campo apellido.'
    },
    checkQuestions: [
      {
        id: 'u8_q1',
        question: '¿Qué significa el asterisco (*) en una sentencia SELECT * FROM Alumnos;?',
        options: [
          'Selecciona todas las columnas de la tabla.',
          'Multiplica las notas de los alumnos.',
          'Borra todas las filas de la tabla.'
        ],
        correctIndex: 0,
        explanation: 'El asterisco actúa como comodín para solicitar todas las columnas existentes.'
      },
      {
        id: 'u8_q2',
        question: '¿Para qué sirve la cláusula WHERE?',
        options: [
          'Para filtrar filas según una condición específica.',
          'Para crear una tabla nueva.',
          'Para cambiar el color de la pantalla.'
        ],
        correctIndex: 0,
        explanation: 'WHERE evalúa una condición booleana y devuelve solo las filas que la cumplen.'
      }
    ],
    synthesis: {
      keyIdeas: [
        'SELECT elige columnas y FROM especifica la tabla.',
        'El asterisco (*) devuelve todas las columnas.',
        'WHERE filtra los registros según una condición.',
        'ORDER BY apellido ASC ordena alfabéticamente.'
      ],
      takeaway: 'Con SELECT, WHERE y ORDER BY podés recuperar cualquier reporte escolar básico.'
    }
  },

  // =========================================================================
  // UNIDAD 9: UNIR TABLAS CON INNER JOIN
  // =========================================================================
  {
    id: 9,
    number: 9,
    title: 'Unir tablas con INNER JOIN',
    shortTitle: 'INNER JOIN en acción',
    badge: 'SQL Relacional',
    summary: 'Comprendé cómo combinar información de tablas relacionadas mediante INNER JOIN y ON, mostrando nombres reales en lugar de códigos numéricos.',
    intro: 'Esta unidad es fundamental: acá vas a descubrir el verdadero poder de las bases de datos relacionales al combinar dos o más tablas en una sola consulta coherente.',
    theorySections: [
      {
        heading: '1. ¿Por qué necesitamos JOIN?',
        content: 'Si consultamos la tabla Inscripciones, vemos números: id_alumno = 1 e id_curso = 1. Para una persona eso no es legible: queremos ver "Ana Pérez | 1 A". JOIN permite cruzar las tablas utilizando las claves foráneas para mostrar los textos reales en una sola tabla de resultados.',
        callout: {
          type: 'info',
          title: '¿Qué hace INNER JOIN?',
          text: 'INNER JOIN devuelve únicamente las filas donde existe una coincidencia exacta entre los campos especificados en la condición ON.'
        }
      },
      {
        heading: '2. Consulta 1: Alumnos y Cursos a través de Inscripciones',
        content: 'Partimos de la tabla intermedia Inscripciones y unimos tanto Alumnos como Cursos:',
        bulletPoints: [
          'FROM Inscripciones: Tabla pivote de partida.',
          'INNER JOIN Alumnos ON Inscripciones.id_alumno = Alumnos.id_alumno: Trae los datos de la persona.',
          'INNER JOIN Cursos ON Inscripciones.id_curso = Cursos.id_curso: Trae el nombre del curso.'
        ]
      },
      {
        heading: '3. Consulta 2: Materias de cada Curso a través de Curso_Materia',
        content: 'Para saber qué materias se dictan en cada curso, unimos Cursos y Materias a través de la tabla intermedia Curso_Materia:',
        callout: {
          type: 'tip',
          title: 'Materias de 1 A',
          text: 'Al agregar WHERE Cursos.nombre = \'1 A\', obtenemos exactamente las materias cursadas por esa división: Matemática, Informática e Historia.'
        }
      }
    ],
    sqlExamples: [
      {
        title: 'Consulta Alumnos y Cursos con INNER JOIN',
        description: 'Cruza Inscripciones, Alumnos y Cursos para mostrar el listado escolar completo:',
        sql: `SELECT
    Alumnos.nombre,
    Alumnos.apellido,
    Cursos.nombre AS curso
FROM Inscripciones
INNER JOIN Alumnos
    ON Inscripciones.id_alumno = Alumnos.id_alumno
INNER JOIN Cursos
    ON Inscripciones.id_curso = Cursos.id_curso;`,
        expectedTableResult: {
          headers: ['nombre', 'apellido', 'curso'],
          rows: [
            ['Ana', 'Pérez', '1 A'],
            ['Juan', 'López', '1 A'],
            ['María', 'Gómez', '1 B']
          ]
        }
      },
      {
        title: 'Consulta Materias por Curso con INNER JOIN',
        description: 'Cruza Curso_Materia, Cursos y Materias:',
        sql: `SELECT
    Cursos.nombre AS curso,
    Materias.nombre AS materia
FROM Curso_Materia
INNER JOIN Cursos
    ON Curso_Materia.id_curso = Cursos.id_curso
INNER JOIN Materias
    ON Curso_Materia.id_materia = Materias.id_materia;`,
        expectedTableResult: {
          headers: ['curso', 'materia'],
          rows: [
            ['1 A', 'Matemática'],
            ['1 A', 'Informática'],
            ['1 A', 'Historia'],
            ['1 B', 'Matemática'],
            ['1 B', 'Historia'],
            ['2 A', 'Matemática'],
            ['2 A', 'Informática']
          ]
        }
      }
    ],
    activity: {
      id: 'act_u9',
      title: 'Actividad 9: Consultar los Alumnos de 1 A con INNER JOIN',
      instruction: 'Completá la consulta con INNER JOIN agregando la cláusula WHERE para mostrar únicamente los alumnos que asisten a "1 A":',
      hint: "Agregá al final: WHERE Cursos.nombre = '1 A';",
      type: 'sql-editor',
      defaultQuery: `SELECT
    Alumnos.nombre,
    Alumnos.apellido,
    Cursos.nombre AS curso
FROM Inscripciones
INNER JOIN Alumnos
    ON Inscripciones.id_alumno = Alumnos.id_alumno
INNER JOIN Cursos
    ON Inscripciones.id_curso = Cursos.id_curso
WHERE Cursos.nombre = '1 A';`,
      expectedSqlKeywords: ['SELECT', 'FROM', 'Inscripciones', 'INNER', 'JOIN', 'WHERE', '1 A'],
      expectedResultColumns: ['nombre', 'apellido', 'curso'],
      expectedRowCount: 2,
      expectedSampleRows: [
        { nombre: 'Ana', apellido: 'Pérez', curso: '1 A' },
        { nombre: 'Juan', apellido: 'López', curso: '1 A' }
      ],
      solutionSql: `SELECT
    Alumnos.nombre,
    Alumnos.apellido,
    Cursos.nombre AS curso
FROM Inscripciones
INNER JOIN Alumnos
    ON Inscripciones.id_alumno = Alumnos.id_alumno
INNER JOIN Cursos
    ON Inscripciones.id_curso = Cursos.id_curso
WHERE Cursos.nombre = '1 A';`,
      explanation: 'Filtra el resultado combinado del JOIN devolviendo únicamente a los dos estudiantes inscriptos en 1 A (Ana y Juan).'
    },
    checkQuestions: [
      {
        id: 'u9_q1',
        question: '¿Qué función cumple la cláusula ON en un INNER JOIN?',
        options: [
          'Establece la condición de relación (qué columna de una tabla debe coincidir con la de la otra).',
          'Enciende la computadora.',
          'Elimina los datos duplicados.'
        ],
        correctIndex: 0,
        explanation: 'ON define la igualdad entre claves (ej. Inscripciones.id_alumno = Alumnos.id_alumno).'
      },
      {
        id: 'u9_q2',
        question: '¿Por qué en el JOIN vinculamos identificadores numéricos y no directamente los nombres de las personas?',
        options: [
          'Porque los números identificadores son únicos, precisos y nunca cambian, mientras que los nombres pueden repetirse.',
          'Porque MySQL no sabe comparar palabras.',
          'Para que la consulta sea más larga.'
        ],
        correctIndex: 0,
        explanation: 'Vincular claves primarias y foráneas numéricas garantiza exactitud e integridad total.'
      }
    ],
    synthesis: {
      keyIdeas: [
        'INNER JOIN combina filas de dos o más tablas cuando hay coincidencia.',
        'La cláusula ON indica qué claves se comparan.',
        'Permite reemplazar identificadores numéricos por nombres legibles.',
        'Podemos combinar varias tablas consecutivas en una sola consulta.'
      ],
      takeaway: 'INNER JOIN es la herramienta maestra para unir tablas y armar reportes escolares completos.'
    }
  },

  // =========================================================================
  // UNIDAD 10: CONSULTAS CON LEFT JOIN, GROUP BY Y COUNT
  // =========================================================================
  {
    id: 10,
    number: 10,
    title: 'Consultas avanzadas con LEFT JOIN, COUNT y GROUP BY',
    shortTitle: 'LEFT JOIN y Estadísticas',
    badge: 'SQL Avanzado',
    summary: 'Aprendé a conservar registros sin coincidencias con LEFT JOIN, agrupar datos con GROUP BY y calcular totales con COUNT.',
    intro: 'En esta última unidad vas a aprender a generar estadísticas escolares: cuántos alumnos hay por curso y por qué LEFT JOIN es crucial para no ignorar cursos vacíos.',
    theorySections: [
      {
        heading: '1. Diferencia entre INNER JOIN y LEFT JOIN',
        content: 'Si un curso nuevo (como "2 A") todavía no tiene ningún alumno inscripto, un INNER JOIN lo omitiría por completo porque no encuentra coincidencias en Inscripciones.',
        callout: {
          type: 'key',
          title: '¿Qué hace LEFT JOIN?',
          text: 'LEFT JOIN conserva todas las filas de la tabla de la izquierda (Cursos), aunque no tengan ninguna coincidencia en la tabla de la derecha (Inscripciones). En esos casos, rellena los campos con NULL.'
        }
      },
      {
        heading: '2. Funciones de agregación: COUNT() y GROUP BY',
        content: 'Para saber la cantidad de estudiantes por división necesitamos agrupar y contar:',
        bulletPoints: [
          'GROUP BY Cursos.id_curso, Cursos.nombre: Agrupa los registros que pertenecen al mismo curso.',
          'COUNT(Inscripciones.id_alumno): Cuenta cuántas inscripciones existen para ese curso.',
          '¿Por qué NO usar COUNT(*)? Porque COUNT(*) contaría 1 fila conservada por el LEFT JOIN aunque no haya alumnos. Al usar COUNT(Inscripciones.id_alumno), si el campo es NULL, cuenta exactamente 0.'
        ]
      }
    ],
    sqlExamples: [
      {
        title: 'Contar cuántos alumnos tiene cada curso',
        description: 'Uso de LEFT JOIN, GROUP BY y COUNT para reporte de secretaría:',
        sql: `SELECT
    Cursos.nombre AS curso,
    COUNT(Inscripciones.id_alumno) AS cantidad_alumnos
FROM Cursos
LEFT JOIN Inscripciones
    ON Cursos.id_curso = Inscripciones.id_curso
GROUP BY Cursos.id_curso, Cursos.nombre;`,
        expectedTableResult: {
          headers: ['curso', 'cantidad_alumnos'],
          rows: [
            ['1 A', 2],
            ['1 B', 1],
            ['2 A', 0]
          ]
        }
      }
    ],
    activity: {
      id: 'act_u10',
      title: 'Actividad 10: Contar Alumnos por Curso con LEFT JOIN',
      instruction: 'Ejecutá o escribí la consulta con LEFT JOIN y COUNT para calcular la matrícula de cada división escolar, observando cómo 2 A muestra 0 alumnos:',
      hint: 'Asegurate de incluir GROUP BY Cursos.id_curso, Cursos.nombre al final.',
      type: 'sql-editor',
      defaultQuery: `SELECT
    Cursos.nombre AS curso,
    COUNT(Inscripciones.id_alumno) AS cantidad_alumnos
FROM Cursos
LEFT JOIN Inscripciones
    ON Cursos.id_curso = Inscripciones.id_curso
GROUP BY Cursos.id_curso, Cursos.nombre;`,
      expectedSqlKeywords: ['SELECT', 'COUNT', 'FROM', 'Cursos', 'LEFT', 'JOIN', 'GROUP', 'BY'],
      expectedResultColumns: ['curso', 'cantidad_alumnos'],
      expectedRowCount: 3,
      expectedSampleRows: [
        { curso: '1 A', cantidad_alumnos: 2 },
        { curso: '1 B', cantidad_alumnos: 1 },
        { curso: '2 A', cantidad_alumnos: 0 }
      ],
      solutionSql: `SELECT
    Cursos.nombre AS curso,
    COUNT(Inscripciones.id_alumno) AS cantidad_alumnos
FROM Cursos
LEFT JOIN Inscripciones
    ON Cursos.id_curso = Inscripciones.id_curso
GROUP BY Cursos.id_curso, Cursos.nombre;`,
      explanation: 'Calcula los totales exactos: 1 A tiene 2 alumnos (Ana y Juan), 1 B tiene 1 (María) y 2 A tiene 0 alumnos gracias al LEFT JOIN.'
    },
    checkQuestions: [
      {
        id: 'u10_q1',
        question: '¿Por qué usamos LEFT JOIN en lugar de INNER JOIN para contar alumnos por curso?',
        options: [
          'Para que los cursos que aún no tienen alumnos inscriptos aparezcan en la lista con 0 en lugar de desaparecer.',
          'Porque LEFT JOIN es obligatorio en MySQL.',
          'Para que solo se muestren los alumnos de apellido A.'
        ],
        correctIndex: 0,
        explanation: 'LEFT JOIN conserva todos los cursos de la tabla izquierda aunque no tengan alumnos inscriptos.'
      },
      {
        id: 'u10_q2',
        question: '¿Por qué contamos COUNT(Inscripciones.id_alumno) en lugar de COUNT(*)?',
        options: [
          'Porque COUNT(*) contaría 1 fila para los cursos vacíos, mientras que COUNT(campo) ignora los valores NULL y da 0.',
          'Porque COUNT(*) no existe en bases de datos.',
          'Porque los alumnos tienen nombres largos.'
        ],
        correctIndex: 0,
        explanation: 'COUNT(columna) ignora los valores NULL, devolviendo correctamente 0 cuando no hay inscripciones.'
      }
    ],
    synthesis: {
      keyIdeas: [
        'LEFT JOIN conserva todas las filas de la tabla izquierda aunque no haya coincidencias.',
        'GROUP BY agrupa filas que comparten valores idénticos.',
        'COUNT(columna) calcula la cantidad de valores no nulos.',
        'Es la combinación ideal para generar estadísticas y reportes de gestión escolar.'
      ],
      takeaway: '¡Felicitaciones! Has completado el recorrido completo: desde qué es una tabla hasta consultas analíticas con JOIN y agrupaciones.'
    }
  }
];
