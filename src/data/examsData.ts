import { ExamQuestion } from '../types';

export interface ModuleExamConfig {
  moduleId: number;
  moduleName: string;
  badge: string;
  durationMinutes: number; // 40
  passingScorePercentage: number; // 70
  totalQuestions: number; // 20
  instructions: string[];
  questions: ExamQuestion[];
}

export const MODULE_EXAMS: Record<number, ModuleExamConfig> = {
  // =========================================================================
  // EXAMEN INTEGRADOR — MÓDULO 1: Módulo 1: ¿Qué es una base de datos?
  // =========================================================================
  1: {
    moduleId: 1,
    moduleName: "Módulo 1: ¿Qué es una base de datos?",
    badge: "Fundamentos",
    durationMinutes: 40,
    passingScorePercentage: 70,
    totalQuestions: 20,
    instructions: [
      "Disponés de 40 minutos para responder 20 preguntas sobre los conceptos fundamentales de bases de datos.",
      "Leé con atención cada enunciado antes de seleccionar tu respuesta.",
      "Podés navegar entre preguntas hacia adelante y hacia atrás antes de entregar.",
      "Para aprobar necesitás al menos 14 respuestas correctas (70 %).",
      "Si se agota el tiempo, el examen se entregará automáticamente con las respuestas marcadas hasta ese momento."
],
    questions: [
      {
        id: "e1_q01",
        moduleId: 1,
        question: "¿Cuál de las siguientes afirmaciones define con mayor precisión qué es una base de datos?",
        options: [
          "Es un conjunto estructurado y organizado de información digital que permite consultar, guardar y modificar datos con rapidez y seguridad.",
          "Es un procesador de texto diseñado para escribir reglamentos escolares.",
          "Es un archivo temporal que se elimina automáticamente cada vez que se apaga la computadora."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "Una base de datos es un sistema estructurado para almacenar, gestionar y recuperar información digital de forma segura y eficiente."
      },
      {
        id: "e1_q02",
        moduleId: 1,
        question: "En el modelo relacional, ¿qué elemento representa una fila horizontal completa dentro de una tabla?",
        options: [
          "Un campo o propiedad.",
          "Un registro individual con los datos de un elemento específico.",
          "El tipo de dato de una columna."
        ],
        correctIndex: 1,
        category: "recognition",
        explanation: "Cada fila horizontal completa representa un registro (o tupla) que reúne todos los datos de una misma entidad."
      },
      {
        id: "e1_q03",
        moduleId: 1,
        question: "En la tabla Alumnos, ¿qué representa la columna vertical \"email\"?",
        options: [
          "Un registro completo de una alumna.",
          "Una base de datos independiente.",
          "Un campo, que define una característica común a todos los registros."
        ],
        correctIndex: 2,
        category: "recognition",
        explanation: "Las columnas verticales se denominan campos o atributos y definen qué característica se guarda en esa posición para cada registro."
      },
      {
        id: "e1_q04",
        moduleId: 1,
        question: "¿Qué es una celda dentro de una tabla de base de datos?",
        options: [
          "La intersección entre una fila y una columna que almacena un dato o valor atómico.",
          "El archivo físico en el disco rígido del servidor.",
          "El nombre general que recibe la tabla completa."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "La intersección entre una fila (registro) y una columna (campo) contiene un único valor de información denominado celda o dato."
      },
      {
        id: "e1_q05",
        moduleId: 1,
        question: "¿Cuál es el principal inconveniente de registrar toda la información escolar en una única planilla gigante sin dividirla en tablas?",
        options: [
          "Que las planillas digitales no permiten escribir letras con tilde.",
          "La redundancia de datos, la duplicación innecesaria y el alto riesgo de inconsistencias.",
          "Que las computadoras de la escuela se apagan si una planilla tiene más de 5 registros."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "Tener todo en una sola tabla provoca repetir cursos y preceptores en cada fila de alumno, generando inconsistencias si alguien modifica un valor en un lugar y no en otro."
      },
      {
        id: "e1_q06",
        moduleId: 1,
        question: "Si la secretaria cambia el nombre de un curso en una escuela que usa carpetas de papel, debe modificar decenas de fichas a mano. ¿Cómo resuelve este problema una base de datos relacional bien diseñada?",
        options: [
          "Obligando a los estudiantes a comprar carpetas nuevas.",
          "Eliminando a todos los alumnos que asisten a ese curso.",
          "Guardando los datos del curso una sola vez en una tabla especializada llamada Cursos y vinculándola mediante un identificador."
        ],
        correctIndex: 2,
        category: "scenario",
        explanation: "Al separar los datos en tablas temáticas, modificar el nombre del curso en su propia tabla actualiza la información para todo el sistema sin duplicaciones."
      },
      {
        id: "e1_q07",
        moduleId: 1,
        question: "¿Qué significa que la información en una base de datos sea \"consistente\"?",
        options: [
          "Que no tiene contradicciones ni datos opuestos sobre una misma entidad.",
          "Que ocupa exactamente el mismo espacio en megabytes que un archivo PDF.",
          "Que todos los nombres de los estudiantes empiezan con la misma letra."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "La consistencia asegura que los datos sean coherentes, exactos y sin discrepancias a lo largo de toda la base."
      },
      {
        id: "e1_q08",
        moduleId: 1,
        question: "Analizá el siguiente dato: \"ana@escuela.com\". En la arquitectura de bases de datos, ¿cómo se clasifica?",
        options: [
          "Es una tabla completa.",
          "Es un valor o dato elemental ubicado en una celda.",
          "Es un motor de base de datos."
        ],
        correctIndex: 1,
        category: "application",
        explanation: "\"ana@escuela.com\" es el contenido puntual de una celda específica correspondiente al campo email de un registro."
      },
      {
        id: "e1_q09",
        moduleId: 1,
        question: "¿Por qué no es recomendable colocar en una sola celda de la tabla Alumnos el texto \"Matemática, Historia, Informática, Física\"?",
        options: [
          "Porque las computadoras no saben leer la letra \"F\".",
          "Porque las bases de datos solo admiten números y prohíben las palabras.",
          "Porque viola el principio de datos atómicos y dificulta buscar o filtrar por una materia específica."
        ],
        correctIndex: 2,
        category: "error_detection",
        explanation: "Cada celda debe contener un valor atómico (indivisible). Poner listas de texto impide ordenar, filtrar y consultar materias eficientemente."
      },
      {
        id: "e1_q10",
        moduleId: 1,
        question: "¿Qué software de la siguiente lista es un Sistema Gestor de Bases de Datos Relacionales (SGBD / RDBMS)?",
        options: [
          "MySQL.",
          "Adobe Photoshop.",
          "VLC Media Player."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "MySQL es uno de los motores relacionales (RDBMS) más utilizados en el mundo y el estándar que empleamos en el curso."
      },
      {
        id: "e1_q11",
        moduleId: 1,
        question: "¿Qué rol cumple un Sistema Gestor de Bases de Datos (como MySQL)?",
        options: [
          "Diseñar diapositivas para exponer en clase.",
          "Administrar el almacenamiento físico, procesar consultas, controlar la seguridad y garantizar la integridad de los datos.",
          "Reparar el monitor si tiene píxeles quemados."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "El SGBD es el software intermediario que gestiona el almacenamiento, la seguridad, la concurrencia y la ejecución de instrucciones en la base de datos."
      },
      {
        id: "e1_q12",
        moduleId: 1,
        question: "Un preceptor anota a un alumno con el DNI \"34.555.123\" en una planilla y como \"34555123\" en otra. ¿Qué problema representa esta situación?",
        options: [
          "Un virus informático que borró los puntos.",
          "Un funcionamiento normal y deseable en las escuelas.",
          "Falta de consistencia y estandarización en el formato de los datos."
        ],
        correctIndex: 2,
        category: "scenario",
        explanation: "Guardar el mismo dato con formatos divergentes dificulta la búsqueda automática y genera inconsistencias."
      },
      {
        id: "e1_q13",
        moduleId: 1,
        question: "¿Verdadero o Falso? En una base de datos relacional, cada tabla debe tratar sobre un único tema o concepto bien delimitado (por ejemplo: Alumnos, Cursos, Materias).",
        options: [
          "Verdadero: Cada tabla debe tener una única responsabilidad temática para evitar redundancias.",
          "Falso: Conviene mezclar todos los datos en una sola tabla grande para no crear tantos archivos.",
          "Falso: Las bases de datos solo admiten dos tablas como máximo."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "El principio de diseño modular establece que cada tabla almacena información de una sola entidad conceptual."
      },
      {
        id: "e1_q14",
        moduleId: 1,
        question: "Si una tabla llamada Profesores tiene 25 registros y 4 campos, ¿cuántas filas horizontales de datos contiene?",
        options: [
          "100 filas.",
          "25 filas.",
          "4 filas."
        ],
        correctIndex: 1,
        category: "application",
        explanation: "La cantidad de registros equivale directamente a la cantidad de filas horizontales de datos (25 profesores)."
      },
      {
        id: "e1_q15",
        moduleId: 1,
        question: "¿Qué ventaja ofrece una base de datos digital frente a un archivo escolar de carpetas físicas ante un corte de luz o un siniestro?",
        options: [
          "Las computadoras nunca pueden fallar bajo ninguna circunstancia.",
          "La base de datos imprime automáticamente todas las fichas en cartulina.",
          "Permite implementar copias de seguridad (backups) automáticas y mecanismos de recuperación."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "Las bases de datos digitales permiten realizar copias de seguridad periódicas, replicación y planes de contingencia."
      },
      {
        id: "e1_q16",
        moduleId: 1,
        question: "En la jerarquía de organización de datos, ¿cuál es el orden correcto de lo más pequeño a lo más abarcativo?",
        options: [
          "Dato → Campo → Registro → Tabla → Base de datos.",
          "Base de datos → Registro → Campo → Dato.",
          "Tabla → Dato → Base de datos → Campo."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "Un dato elemental compone un campo; los campos de una entidad forman un registro; los registros forman una tabla; y el conjunto de tablas forma la base de datos."
      },
      {
        id: "e1_q17",
        moduleId: 1,
        question: "Un estudiante afirma: \"Una planilla de Excel y una base de datos relacional son exactamente lo mismo\". ¿Es correcta esta afirmación?",
        options: [
          "Sí, porque ambas muestran celdas con filas y columnas.",
          "No, porque una base de datos relacional ofrece integridad referencial estricta, control multiusuario concurrente y consultas complejas de alto rendimiento.",
          "Sí, porque MySQL fue creado por la misma empresa que hizo Excel."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "Aunque ambas muestran cuadrículas, los motores de bases de datos relacionales garantizan seguridad transaccional, integridad de relaciones y escalabilidad que una hoja de cálculo no posee."
      },
      {
        id: "e1_q18",
        moduleId: 1,
        question: "¿Qué ocurre si dos secretarias intentan modificar la nota de un alumno al mismo tiempo en una planilla de cálculo compartida sin control de concurrencia?",
        options: [
          "La computadora crea un nuevo curso automáticamente.",
          "El sistema apaga la pantalla por seguridad.",
          "Se pueden sobrescribir datos accidentalmente perdiendo información."
        ],
        correctIndex: 2,
        category: "scenario",
        explanation: "Sin gestión de concurrencia y transacciones, dos modificaciones simultáneas pueden pisarse mutuamente."
      },
      {
        id: "e1_q19",
        moduleId: 1,
        question: "En un sistema escolar, ¿cuál de los siguientes elementos representa una ENTIDAD que merece tener su propia tabla?",
        options: [
          "Alumnos.",
          "El color de la tiza que usa el profesor.",
          "El clic del mouse."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "Los Alumnos constituyen una entidad real y central de la escuela con múltiples propiedades a registrar (nombre, apellido, email)."
      },
      {
        id: "e1_q20",
        moduleId: 1,
        question: "¿Cuál es la conclusión principal sobre el almacenamiento de datos en la escuela secundaria moderna?",
        options: [
          "Que el papel es más rápido y seguro que cualquier sistema digital.",
          "Que una base de datos estructurada en tablas relacionadas garantiza acceso veloz, datos confiables y sin duplicaciones.",
          "Que no hace falta guardar los nombres de los estudiantes si aprueban las materias."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "La base de datos relacional es el estándar indispensable para organizar la gestión escolar de forma segura, confiable y escalable."
      }
    ]
  },
  // =========================================================================
  // EXAMEN INTEGRADOR — MÓDULO 2: Módulo 2: Conocer las tablas de la base de datos escolar
  // =========================================================================
  2: {
    moduleId: 2,
    moduleName: "Módulo 2: Conocer las tablas de la base de datos escolar",
    badge: "Modelo de Datos",
    durationMinutes: 40,
    passingScorePercentage: 70,
    totalQuestions: 20,
    instructions: [
      "Disponés de 40 minutos para responder 20 preguntas sobre las tablas y tipos de datos de nuestro sistema escolar.",
      "Recordá el esquema escolar de 5 tablas: Cursos, Materias, Alumnos, Inscripciones y Curso_Materia.",
      "Podés navegar entre preguntas hacia adelante y hacia atrás antes de entregar.",
      "Para aprobar necesitás al menos 14 respuestas correctas (70 %).",
      "Si se agota el tiempo, el examen se entregará automáticamente."
],
    questions: [
      {
        id: "e2_q01",
        moduleId: 2,
        question: "En nuestro modelo escolar, ¿cuáles son las columnas que componen la tabla Cursos?",
        options: [
          "id_curso, nombre, anio.",
          "id_alumno, apellido, nota.",
          "id_materia, profesor, aula."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "La tabla Cursos define el identificador id_curso, el nombre de la división (ej. \"1 A\") y el año lectivo (ej. 1)."
      },
      {
        id: "e2_q02",
        moduleId: 2,
        question: "¿Qué columnas contiene la tabla Alumnos en el diseño de nuestra base de datos?",
        options: [
          "id_curso, aula, division.",
          "id_alumno, nombre, apellido, email.",
          "id_materia, carga_horaria, nota_final."
        ],
        correctIndex: 1,
        category: "recognition",
        explanation: "La tabla Alumnos almacena los datos personales: id_alumno, nombre, apellido y email."
      },
      {
        id: "e2_q03",
        moduleId: 2,
        question: "¿Cuál es el objetivo principal de la tabla Inscripciones?",
        options: [
          "Guardar el inventario de computadoras de la sala de informática.",
          "Anotar únicamente las notas de los exámenes finales.",
          "Registrar qué alumno pertenece a qué curso y en qué fecha se matriculó."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "La tabla Inscripciones vincula un estudiante (id_alumno) con su curso asignado (id_curso) indicando la fecha."
      },
      {
        id: "e2_q04",
        moduleId: 2,
        question: "En MySQL, ¿qué tipo de dato es el más adecuado para almacenar el identificador numérico \"id_curso\"?",
        options: [
          "INT (número entero)",
          "VARCHAR(100)",
          "DATE"
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "Los identificadores numéricos correlativos se definen con el tipo de dato INT."
      },
      {
        id: "e2_q05",
        moduleId: 2,
        question: "Para almacenar el nombre o el apellido de un alumno (como \"Benítez\"), ¿qué tipo de dato SQL se utiliza habitualmente?",
        options: [
          "INT",
          "VARCHAR (cadena de caracteres de longitud variable)",
          "BOOLEAN"
        ],
        correctIndex: 1,
        category: "recognition",
        explanation: "VARCHAR permite almacenar texto alfanumérico con un límite máximo de caracteres."
      },
      {
        id: "e2_q06",
        moduleId: 2,
        question: "¿Qué formato estándar utiliza MySQL para guardar información en un campo de tipo DATE?",
        options: [
          "DD/MM/AAAA (ej. 25/05/2026)",
          "Nombre del mes en letras (ej. Marzo 1 del 26)",
          "AAAA-MM-DD (ej. 2026-03-01)"
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "El estándar ISO y de MySQL para campos DATE es Año-Mes-Día (AAAA-MM-DD)."
      },
      {
        id: "e2_q07",
        moduleId: 2,
        question: "Observá este registro de la tabla Alumnos: (2, \"Juan\", \"López\", \"juan@escuela.com\"). ¿A qué campo corresponde el valor \"López\"?",
        options: [
          "Al campo apellido.",
          "Al campo nombre.",
          "Al campo id_alumno."
        ],
        correctIndex: 0,
        category: "application",
        explanation: "\"López\" es el valor asignado a la columna apellido en ese registro."
      },
      {
        id: "e2_q08",
        moduleId: 2,
        question: "Si queremos saber cuántas materias se dictan en la institución escolar, ¿qué tabla debemos consultar directamente?",
        options: [
          "Alumnos.",
          "Materias.",
          "Inscripciones."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "La tabla Materias es el catálogo maestro con el listado de todas las asignaturas de la escuela."
      },
      {
        id: "e2_q09",
        moduleId: 2,
        question: "¿Por qué la tabla Alumnos no incluye directamente una columna con el nombre del curso como \"1 A\"?",
        options: [
          "Porque las computadoras no pueden escribir números con letras juntos.",
          "Porque los alumnos de secundaria no tienen cursos.",
          "Porque si el curso cambia de nombre, habría que actualizar cientos de registros de alumnos en lugar de uno solo en la tabla Cursos."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "Separar Alumnos de Cursos a través de Inscripciones evita la redundancia y facilita el mantenimiento de los datos."
      },
      {
        id: "e2_q10",
        moduleId: 2,
        question: "En la tabla Inscripciones, si encontramos la fila: (3, 3, 2, \"2026-03-02\"), ¿qué representa el segundo valor (id_alumno = 3)?",
        options: [
          "La referencia al alumno con id_alumno 3 (María Gómez).",
          "El número de documento de la preceptora.",
          "La cantidad de faltas de la alumna."
        ],
        correctIndex: 0,
        category: "application",
        explanation: "El valor 3 en id_alumno hace referencia a la fila correspondiente de la tabla Alumnos."
      },
      {
        id: "e2_q11",
        moduleId: 2,
        question: "¿Qué significa la restricción NOT NULL aplicada a una columna de una tabla?",
        options: [
          "Que el campo es opcional y puede quedar vacío.",
          "Que el campo es obligatorio y nunca puede guardarse sin un valor.",
          "Que la tabla solo acepta números negativos."
        ],
        correctIndex: 1,
        category: "recognition",
        explanation: "NOT NULL obliga a que cada nuevo registro tenga un valor explícito en esa columna, impidiendo datos incompletos."
      },
      {
        id: "e2_q12",
        moduleId: 2,
        question: "Un directivo quiere agregar el número de teléfono del tutor de los alumnos. ¿En qué tabla corresponde agregar esta nueva columna?",
        options: [
          "En la tabla Materias.",
          "En la tabla Curso_Materia.",
          "En la tabla Alumnos."
        ],
        correctIndex: 2,
        category: "scenario",
        explanation: "El teléfono del tutor es una propiedad vinculada a cada alumno, por lo que pertenece a la tabla Alumnos."
      },
      {
        id: "e2_q13",
        moduleId: 2,
        question: "Si la tabla Materias contiene: (1, \"Matemática\"), (2, \"Informática\") y (3, \"Historia\"), ¿cuántos campos y cuántos registros tiene?",
        options: [
          "Tiene 2 campos (id_materia, nombre) y 3 registros.",
          "Tiene 3 campos y 2 registros.",
          "Tiene 6 campos y 0 registros."
        ],
        correctIndex: 0,
        category: "application",
        explanation: "Tiene 2 columnas verticales (campos: id_materia y nombre) y 3 filas horizontales (registros)."
      },
      {
        id: "e2_q14",
        moduleId: 2,
        question: "¿Qué pasaría si intentamos guardar en una columna de tipo INT el texto \"Primer Año\"?",
        options: [
          "MySQL convertirá automáticamente el texto en una canción.",
          "MySQL rechazará la operación arrojando un error de tipo de dato incompatible.",
          "La base de datos borrará toda la escuela."
        ],
        correctIndex: 1,
        category: "error_detection",
        explanation: "Los motores de bases de datos imponen la regla estricta de tipos: no se puede guardar texto en un campo numérico INT."
      },
      {
        id: "e2_q15",
        moduleId: 2,
        question: "¿Cuál es la función del campo \"fecha\" en la tabla Inscripciones?",
        options: [
          "Guardar el cumpleaños del vicedirector.",
          "Registrar cuándo se inventó la computadora.",
          "Indicar la fecha exacta en la que el estudiante fue matriculado en ese curso escolar."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "Permite llevar una trazabilidad temporal de cuándo ocurrió la inscripción del estudiante."
      },
      {
        id: "e2_q16",
        moduleId: 2,
        question: "¿Por qué la tabla Cursos tiene un campo \"anio\" de tipo INT?",
        options: [
          "Para clasificar a qué nivel o año curricular pertenece la división (ej. 1 para 1.º año, 2 para 2.º año).",
          "Para contar cuántas computadoras hay en el aula.",
          "Para saber la edad del profesor de Educación Física."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "El campo anio permite filtrar y ordenar los cursos por nivel educativo de forma numérica."
      },
      {
        id: "e2_q17",
        moduleId: 2,
        question: "¿Cuál de los siguientes emails es válido para el campo email VARCHAR(150) de la tabla Alumnos?",
        options: [
          "34999123 (solo números sin arroba)",
          "lucas.benitez@escuela.com",
          "Un archivo de audio en MP3"
        ],
        correctIndex: 1,
        category: "application",
        explanation: "Es una cadena de texto que respeta la estructura de un correo electrónico válido."
      },
      {
        id: "e2_q18",
        moduleId: 2,
        question: "Si una escuela abre un nuevo turno tarde con el curso \"1 C\", ¿qué modificación debe hacerse en la base de datos?",
        options: [
          "Borrar la tabla Alumnos y empezar todo el año de nuevo.",
          "Cambiarle el nombre a la materia Matemática.",
          "Insertar una nueva fila en la tabla Cursos con su propio id_curso y nombre \"1 C\"."
        ],
        correctIndex: 2,
        category: "scenario",
        explanation: "Crear una nueva división simplemente requiere insertar un nuevo registro en la tabla Cursos."
      },
      {
        id: "e2_q19",
        moduleId: 2,
        question: "¿Qué información mínima necesitamos conocer para dar de alta una fila en la tabla Inscripciones?",
        options: [
          "El id_alumno, el id_curso y la fecha de inscripción.",
          "El nombre de la mascota del preceptor.",
          "El código postal de la provincia vecina."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "Inscribir requiere vincular quién se inscribe (id_alumno) con qué división cursa (id_curso) y la fecha."
      },
      {
        id: "e2_q20",
        moduleId: 2,
        question: "¿Por qué el modelo de tablas de nuestra escuela es considerado un modelo \"relacional\"?",
        options: [
          "Porque fue diseñado por familiares y parientes.",
          "Porque las tablas no están aisladas, sino interconectadas mediante identificadores comunes que relacionan los datos.",
          "Porque solo funciona si la escuela tiene internet satelital."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "Se llama relacional porque estructura la información en tablas conectadas lógicamente entre sí mediante claves."
      }
    ]
  },
  // =========================================================================
  // EXAMEN INTEGRADOR — MÓDULO 3: Módulo 3: Clave primaria y clave foránea
  // =========================================================================
  3: {
    moduleId: 3,
    moduleName: "Módulo 3: Clave primaria y clave foránea",
    badge: "Integridad Referencial",
    durationMinutes: 40,
    passingScorePercentage: 70,
    totalQuestions: 20,
    instructions: [
      "Disponés de 40 minutos para responder 20 preguntas sobre Claves Primarias (PK) y Claves Foráneas (FK).",
      "Recordá los conceptos de identificador único, integridad referencial y prevención de registros huérfanos.",
      "Podés navegar libremente entre las preguntas.",
      "Para aprobar necesitás al menos 14 respuestas correctas (70 %).",
      "El temporizador se detiene al entregar el examen."
],
    questions: [
      {
        id: "e3_q01",
        moduleId: 3,
        question: "¿Qué es una Clave Primaria (Primary Key o PK)?",
        options: [
          "Un campo (o conjunto de campos) que identifica de manera única e irrepetible a cada registro de una tabla.",
          "Una contraseña secreta para que los alumnos no entren a la sala de profesores.",
          "El nombre de la primera columna que se le ocurra al programador."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "La clave primaria identifica de forma exclusiva a cada fila, impidiendo duplicados en la tabla."
      },
      {
        id: "e3_q02",
        moduleId: 3,
        question: "¿Cuáles son las dos condiciones indispensables que debe cumplir toda Clave Primaria?",
        options: [
          "Debe ser de color azul y tener al menos 8 letras.",
          "Debe ser única (no repetirse en ninguna otra fila) y no puede ser nula (nunca NULL).",
          "Debe ser igual al nombre de la escuela."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "La regla de entidad de las bases de datos exige que una PK sea única y jamás contenga un valor nulo (NOT NULL)."
      },
      {
        id: "e3_q03",
        moduleId: 3,
        question: "En una escuela hay dos estudiantes que se llaman exactamente \"Santiago López\". ¿Por qué la base de datos no se confunde entre ellos?",
        options: [
          "Porque el sistema borra automáticamente al segundo alumno que se anote.",
          "Porque la computadora le cambia el apellido a uno de ellos.",
          "Porque cada uno tiene asignado un id_alumno numérico diferente como Clave Primaria única."
        ],
        correctIndex: 2,
        category: "scenario",
        explanation: "La clave primaria id_alumno garantiza que cada estudiante sea unívocamente identificable aunque compartan nombres."
      },
      {
        id: "e3_q04",
        moduleId: 3,
        question: "¿Qué es una Clave Foránea (Foreign Key o FK)?",
        options: [
          "Un campo en una tabla cuyos valores hacen referencia directa a la Clave Primaria de otra tabla.",
          "Una base de datos que fue creada en otro país.",
          "Un archivo de texto que no tiene relación con el sistema escolar."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "Una clave foránea es una columna que establece el vínculo con otra tabla al referenciar su clave primaria."
      },
      {
        id: "e3_q05",
        moduleId: 3,
        question: "En la tabla Inscripciones (id_inscripcion, id_alumno, id_curso, fecha), ¿cuál es la Clave Primaria propia de esa tabla?",
        options: [
          "id_alumno",
          "id_inscripcion",
          "id_curso"
        ],
        correctIndex: 1,
        category: "application",
        explanation: "id_inscripcion identifica de forma exclusiva a cada fila de inscripción."
      },
      {
        id: "e3_q06",
        moduleId: 3,
        question: "En la misma tabla Inscripciones, ¿qué papel cumplen las columnas id_alumno e id_curso?",
        options: [
          "Son claves primarias duplicadas.",
          "Son campos de texto sin importancia técnica.",
          "Son Claves Foráneas (FK) que apuntan a las tablas Alumnos y Cursos respectivamente."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "Ambos campos son claves foráneas que aseguran que el alumno y el curso existan en sus tablas de origen."
      },
      {
        id: "e3_q07",
        moduleId: 3,
        question: "¿Qué es la \"Integridad Referencial\" en una base de datos?",
        options: [
          "Una regla que impide que existan referencias a registros que no existen en la tabla principal.",
          "La velocidad de la conexión a internet.",
          "La cantidad máxima de monitores conectados al servidor."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "La integridad referencial garantiza la coherencia entre tablas, evitando claves foráneas que apunten a la nada."
      },
      {
        id: "e3_q08",
        moduleId: 3,
        question: "Si en la escuela solo existen los cursos con id_curso 1, 2 y 3, ¿qué ocurre si intentamos insertar en Inscripciones una fila con id_curso = 999?",
        options: [
          "MySQL crea automáticamente el curso 999 sin avisar.",
          "MySQL rechaza la inserción arrojando un error de violación de Clave Foránea (Foreign Key Constraint).",
          "La base de datos acepta el dato pero le cambia el nombre al director."
        ],
        correctIndex: 1,
        category: "error_detection",
        explanation: "La restricción FOREIGN KEY bloquea la operación porque el valor 999 no existe en la tabla referenciada Cursos."
      },
      {
        id: "e3_q09",
        moduleId: 3,
        question: "¿Qué es un \"registro huérfano\" en una base de datos?",
        options: [
          "Un alumno que no tiene computadora en su casa.",
          "Una tabla que no tiene nombre.",
          "Un registro que hace referencia mediante una clave foránea a un registro padre que ya no existe o fue eliminado."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "Un registro huérfano es aquel cuya FK apunta a un valor inexistente en la tabla principal."
      },
      {
        id: "e3_q10",
        moduleId: 3,
        question: "¿Por qué no es recomendable utilizar el nombre y apellido del alumno como Clave Primaria en la tabla Alumnos?",
        options: [
          "Porque los nombres pueden repetirse (homónimos) y además pueden modificarse legalmente o corregirse por errores de tipeo.",
          "Porque los textos no pueden guardarse en computadoras.",
          "Porque el abecedario solo tiene 27 letras."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "Los nombres no garantizan unicidad ni estabilidad temporal; por eso se prefieren identificadores numéricos."
      },
      {
        id: "e3_q11",
        moduleId: 3,
        question: "¿Qué significa que una clave primaria sea \"autoincremental\" (AUTO_INCREMENT en MySQL)?",
        options: [
          "Que el tamaño del texto se hace más grande cada día.",
          "Que el motor de base de datos genera automáticamente el siguiente número correlativo (1, 2, 3...) al insertar cada fila.",
          "Que las notas de los alumnos aumentan automáticamente a fin de año."
        ],
        correctIndex: 1,
        category: "recognition",
        explanation: "AUTO_INCREMENT delega en el motor la generación secuencial y sin huecos del próximo identificador único."
      },
      {
        id: "e3_q12",
        moduleId: 3,
        question: "¿Puede una misma tabla tener DOS Claves Primarias independientes y separadas?",
        options: [
          "Sí, todas las tablas tienen dos claves primarias obligatorias.",
          "Depende de si la computadora tiene dos teclados conectados.",
          "No: una tabla solo puede tener UNA única Clave Primaria (aunque esta puede ser compuesta por más de un campo)."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "Cada tabla tiene exactamente una sola clave primaria; si abarca múltiples columnas se denomina clave primaria compuesta."
      },
      {
        id: "e3_q13",
        moduleId: 3,
        question: "¿Puede una misma tabla tener MÁS DE UNA Clave Foránea?",
        options: [
          "Sí: una tabla puede tener tantas claves foráneas como relaciones necesite establecer con otras tablas (por ejemplo, Inscripciones tiene dos: id_alumno e id_curso).",
          "No, las tablas solo admiten una clave foránea como máximo.",
          "Solo los días hábiles."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "Una tabla puede contener múltiples claves foráneas apuntando a distintas tablas principales."
      },
      {
        id: "e3_q14",
        moduleId: 3,
        question: "En un diagrama relacional, ¿hacia dónde apunta la \"flecha\" o conector que une dos tablas?",
        options: [
          "Desde cualquier texto hacia el logo de la escuela.",
          "Desde la Clave Foránea (FK) de la tabla secundaria hacia la Clave Primaria (PK) de la tabla principal referenciada.",
          "Siempre hacia la derecha sin importar los campos."
        ],
        correctIndex: 1,
        category: "recognition",
        explanation: "La relación parte del campo foráneo que contiene el valor hacia la clave primaria de destino."
      },
      {
        id: "e3_q15",
        moduleId: 3,
        question: "Si intentamos eliminar de la tabla Cursos el curso con id_curso = 1, pero todavía hay 30 alumnos inscriptos en él en la tabla Inscripciones, ¿qué hace MySQL por defecto?",
        options: [
          "Borra toda la base de datos sin preguntar.",
          "Le cambia de curso a los 30 alumnos a un curso inventado.",
          "Bloquea la eliminación para proteger la integridad referencial y evitar registros huérfanos."
        ],
        correctIndex: 2,
        category: "scenario",
        explanation: "La restricción de clave foránea impide borrar el registro padre mientras existan registros hijos que lo referencien."
      },
      {
        id: "e3_q16",
        moduleId: 3,
        question: "¿Qué es una Clave Primaria Compuesta (Composite Primary Key)?",
        options: [
          "Una clave primaria formada por la unión de dos o más columnas que juntas garantizan la unicidad del registro.",
          "Una contraseña escrita con mayúsculas y minúsculas.",
          "Una clave que se rompió y fue arreglada con pegamento."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "Una PK compuesta combina dos o más atributos (por ejemplo: id_curso e id_materia en Curso_Materia) para formar un par único."
      },
      {
        id: "e3_q17",
        moduleId: 3,
        question: "En la tabla Alumnos, si intentamos insertar dos registros distintos con el mismo id_alumno = 1, ¿qué mensaje arrojará MySQL?",
        options: [
          "Operación exitosa, bienvenido a la escuela.",
          "Duplicate entry '1' for key 'PRIMARY'.",
          "El archivo no tiene suficiente tinta."
        ],
        correctIndex: 1,
        category: "error_detection",
        explanation: "MySQL prohíbe duplicar el valor de la clave primaria y genera el error \"Duplicate entry for key PRIMARY\"."
      },
      {
        id: "e3_q18",
        moduleId: 3,
        question: "¿Por qué las Claves Foráneas generalmente deben tener el mismo tipo de dato que la Clave Primaria a la que apuntan?",
        options: [
          "Solo por una cuestión estética del diagrama.",
          "Porque si no son del mismo tipo, la pantalla se pone en blanco.",
          "Para que los tipos sean compatibles en memoria y puedan compararse de forma exacta (por ejemplo, ambos INT)."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "Para establecer una relación válida, el campo FK debe tener un tipo de dato compatible con la PK referenciada."
      },
      {
        id: "e3_q19",
        moduleId: 3,
        question: "Analizá esta situación: una tabla de Calificaciones tiene id_calificacion (PK), id_alumno (FK) y nota. ¿Puede repetirse el valor de id_alumno en varias filas?",
        options: [
          "Sí: una Clave Foránea sí puede repetirse porque un mismo alumno puede tener muchas notas de distintas materias.",
          "No, ningún valor puede repetirse jamás.",
          "Solo si la nota es mayor a 7."
        ],
        correctIndex: 0,
        category: "application",
        explanation: "La clave foránea no tiene restricción de unicidad; un alumno puede aparecer en múltiples registros de calificaciones."
      },
      {
        id: "e3_q20",
        moduleId: 3,
        question: "En resumen, ¿cuál es la gran ventaja que aportan las PK y FK a un sistema escolar?",
        options: [
          "Hacen que las computadoras no consuman electricidad.",
          "Garantizan que cada dato sea identificable, evitan datos duplicados y protegen las relaciones impidiendo que la información quede descolgada o corrupta.",
          "Permiten que cualquier persona modifique las notas sin contraseña."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "Las claves primarias y foráneas son el pilar de la integridad, exactitud y coherencia de los datos en cualquier base relacional."
      }
    ]
  },
  // =========================================================================
  // EXAMEN INTEGRADOR — MÓDULO 4: Módulo 4: Relaciones entre tablas
  // =========================================================================
  4: {
    moduleId: 4,
    moduleName: "Módulo 4: Relaciones entre tablas",
    badge: "Relaciones 1:N y N:M",
    durationMinutes: 40,
    passingScorePercentage: 70,
    totalQuestions: 20,
    instructions: [
      "Disponés de 40 minutos para responder 20 preguntas sobre los tipos de relaciones (1:1, 1:N y N:M).",
      "Analizá cómo se conecta la escuela: Alumnos con Cursos (1:N) y Cursos con Materias (N:M).",
      "Podés navegar entre las preguntas y cambiar tu elección antes de entregar.",
      "Para aprobar necesitás al menos 14 respuestas correctas (70 %).",
      "Al finalizar el tiempo, se enviará el resultado automáticamente."
],
    questions: [
      {
        id: "e4_q01",
        moduleId: 4,
        question: "¿Qué tipo de relación existe entre Cursos y Alumnos en nuestro modelo escolar estándar?",
        options: [
          "Uno a Muchos (1:N), porque un curso tiene muchos alumnos, pero cada alumno pertenece a un único curso.",
          "Muchos a Muchos (N:M), porque un alumno va a todos los cursos al mismo tiempo.",
          "Uno a Uno (1:1), porque cada aula solo permite sentar a un alumno."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "La relación es de 1 a N: la división (1) alberga a múltiples estudiantes (N)."
      },
      {
        id: "e4_q02",
        moduleId: 4,
        question: "¿Qué tipo de relación existe en la realidad escolar entre Cursos y Materias?",
        options: [
          "Uno a Uno (1:1).",
          "Muchos a Muchos (N:M), porque un curso tiene muchas materias y una misma materia se dicta en muchos cursos.",
          "Ninguna relación, las materias no tienen nada que ver con los cursos."
        ],
        correctIndex: 1,
        category: "recognition",
        explanation: "Un curso tiene varias asignaturas (Matemática, Historia, etc.) y Matemática se dicta en varios cursos (1.º A, 1.º B, etc.)."
      },
      {
        id: "e4_q03",
        moduleId: 4,
        question: "¿Cómo se resuelve técnicamente en una base de datos relacional una relación Muchos a Muchos (N:M)?",
        options: [
          "Escribiendo todos los nombres de las materias separados por comas en una celda.",
          "Eliminando los cursos hasta que quede uno solo.",
          "Creando una tabla intermedia (o de unión) que descompone la relación N:M en dos relaciones 1:N."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "Las relaciones N:M se normalizan mediante una tabla intermedia que almacena los pares de claves foráneas."
      },
      {
        id: "e4_q04",
        moduleId: 4,
        question: "En nuestro diseño escolar, ¿cómo se llama la tabla intermedia que vincula Cursos con Materias?",
        options: [
          "Curso_Materia.",
          "Notas_Secretaría.",
          "Libro_De_Temas."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "La tabla intermedia se denomina convencionalmente Curso_Materia y reúne id_curso con id_materia."
      },
      {
        id: "e4_q05",
        moduleId: 4,
        question: "¿Cuál es la Clave Primaria de la tabla intermedia Curso_Materia?",
        options: [
          "El nombre de la preceptora.",
          "La clave primaria compuesta por (id_curso, id_materia).",
          "El año lectivo."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "La combinación de (id_curso, id_materia) es única para cada asignación de materia a un curso."
      },
      {
        id: "e4_q06",
        moduleId: 4,
        question: "Si el curso \"1 A\" (id_curso = 1) tiene la materia \"Matemática\" (id_materia = 1), ¿qué fila se guarda en Curso_Materia?",
        options: [
          "(id_curso: \"Primero\", id_materia: \"Números\")",
          "(id_curso: 99, id_materia: 88)",
          "(id_curso: 1, id_materia: 1)"
        ],
        correctIndex: 2,
        category: "application",
        explanation: "Cada fila de Curso_Materia asocia un par numérico: (1, 1)."
      },
      {
        id: "e4_q07",
        moduleId: 4,
        question: "¿Qué pasaría si intentamos insertar dos veces la misma fila (1, 1) en Curso_Materia?",
        options: [
          "MySQL arroja un error de clave primaria duplicada porque esa materia ya está asignada a ese curso.",
          "MySQL la acepta y el curso tiene dos profesores de Matemática en la misma hora.",
          "El sistema borra la materia Matemática."
        ],
        correctIndex: 0,
        category: "error_detection",
        explanation: "Al ser (id_curso, id_materia) la clave primaria compuesta, no se puede duplicar la misma asignación."
      },
      {
        id: "e4_q08",
        moduleId: 4,
        question: "¿Qué representa la \"cardinalidad\" en el diseño de bases de datos?",
        options: [
          "Los puntos cardinales (Norte, Sur, Este, Oeste) donde está ubicada la escuela.",
          "El número de registros de una tabla que pueden relacionarse con registros de otra tabla (1:1, 1:N, N:M).",
          "La cantidad de gigabytes de memoria RAM de la computadora."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "La cardinalidad especifica la proporción cuantitativa de la relación entre dos entidades."
      },
      {
        id: "e4_q09",
        moduleId: 4,
        question: "¿Cuál de los siguientes es un ejemplo de relación Uno a Uno (1:1) en una institución educativa?",
        options: [
          "Un curso y sus estudiantes.",
          "Un profesor y sus materias.",
          "Cada estudiante y su legajo administrativo oficial único."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "A cada alumno le corresponde un único legajo oficial y cada legajo pertenece a un único alumno."
      },
      {
        id: "e4_q10",
        moduleId: 4,
        question: "En una relación 1 a N entre Cursos y Alumnos, ¿en qué tabla debe ubicarse la Clave Foránea (FK)?",
        options: [
          "En el lado \"Muchos\" (N), que en nuestro modelo es la tabla Inscripciones vinculada a los alumnos.",
          "En la tabla Cursos.",
          "En ninguna de las dos."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "En las relaciones 1:N, la clave foránea siempre se ubica del lado del \"Muchos\" para apuntar al registro \"Uno\"."
      },
      {
        id: "e4_q11",
        moduleId: 4,
        question: "Si la escuela tiene 3 cursos y 3 materias, ¿cuántas combinaciones como máximo podrían existir en la tabla Curso_Materia si todos los cursos dictaran todas las materias?",
        options: [
          "6 combinaciones.",
          "9 combinaciones (3 cursos × 3 materias).",
          "3 combinaciones."
        ],
        correctIndex: 1,
        category: "application",
        explanation: "El producto de 3 cursos por 3 materias da un máximo posible de 9 asignaciones."
      },
      {
        id: "e4_q12",
        moduleId: 4,
        question: "¿Qué ventaja tiene usar la tabla intermedia Curso_Materia en lugar de crear columnas fijas \"materia_1\", \"materia_2\", \"materia_3\" en la tabla Cursos?",
        options: [
          "Ninguna, es mejor tener columnas fijas para ahorrar espacio.",
          "Hace que los exámenes sean más difíciles.",
          "Permite que un curso tenga 5, 10 o 15 materias de forma dinámica sin tener que cambiar la estructura de la base de datos."
        ],
        correctIndex: 2,
        category: "understanding",
        explanation: "El diseño normalizado con tabla intermedia es flexible y escalable ante cualquier cambio en el plan de estudios."
      },
      {
        id: "e4_q13",
        moduleId: 4,
        question: "En el diagrama de 5 tablas, ¿a qué dos tablas se conecta la tabla intermedia Curso_Materia mediante claves foráneas?",
        options: [
          "Se conecta a Cursos (mediante id_curso) y a Materias (mediante id_materia).",
          "Se conecta a Alumnos y a Preceptores.",
          "Se conecta a internet y al reloj del sistema."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "Curso_Materia tiene dos FKs: una apunta a Cursos y la otra apunta a Materias."
      },
      {
        id: "e4_q14",
        moduleId: 4,
        question: "Un docente propone: \"Pongamos en la tabla Materias el campo id_curso para saber a qué curso pertenece la materia\". ¿Por qué esta solución es incorrecta en la realidad escolar?",
        options: [
          "Porque a los profesores no les gusta la matemática.",
          "Porque una materia como \"Matemática\" se dicta en muchos cursos, por lo que no podríamos guardar múltiples cursos en un único campo entero sin duplicar la materia.",
          "Porque la palabra \"id_curso\" tiene muchas letras."
        ],
        correctIndex: 1,
        category: "error_detection",
        explanation: "Poner id_curso en Materias limitaría cada materia a un solo curso (1:N), imposibilitando que Matemática se dicte en 1.º A, 1.º B y 2.º A."
      },
      {
        id: "e4_q15",
        moduleId: 4,
        question: "Si se elimina una materia de la escuela (por ejemplo, \"Taller de Teatro\" con id_materia = 8), ¿qué debe ocurrir primero con sus asignaciones en Curso_Materia?",
        options: [
          "Deben cambiarse todas las materias por Educación Física.",
          "No se puede hacer nada y hay que cerrar la escuela.",
          "Deben eliminarse las filas correspondientes en Curso_Materia para no dejar referencias huérfanas antes de borrar la materia principal."
        ],
        correctIndex: 2,
        category: "scenario",
        explanation: "La integridad referencial exige dar de baja primero las asignaciones intermedias que dependían de esa materia."
      },
      {
        id: "e4_q16",
        moduleId: 4,
        question: "¿Qué símbolo visual suele utilizarse en los diagramas entidad-relación profesionales para representar el extremo \"Muchos\" de una relación 1 a N?",
        options: [
          "La notación de \"pata de gallo\" (crow's foot) o una letra \"N\" / \"M\" / \"∞\".",
          "Un signo de pregunta.",
          "Una cruz roja."
        ],
        correctIndex: 0,
        category: "recognition",
        explanation: "La pata de gallo (crow's foot) o la letra N/M simbolizan el extremo con cardinalidad múltiple."
      },
      {
        id: "e4_q17",
        moduleId: 4,
        question: "¿Cómo permite nuestro modelo escolar saber qué materias cursa una alumna determinada (como Ana Pérez)?",
        options: [
          "Adivinando según el color de su guardapolvo.",
          "Consultando a qué curso está inscripta Ana en Inscripciones, y luego consultando qué materias tiene asignadas ese curso en Curso_Materia.",
          "Preguntándole a la vicedirectora en el pasillo."
        ],
        correctIndex: 1,
        category: "application",
        explanation: "La base de datos conecta las tablas en cadena: Alumnos → Inscripciones → Cursos → Curso_Materia → Materias."
      },
      {
        id: "e4_q18",
        moduleId: 4,
        question: "En un sistema de biblioteca escolar, un alumno puede pedir prestados muchos libros a lo largo del año, y un mismo libro puede ser prestado a muchos alumnos distintos en distintas fechas. ¿Qué tipo de relación es?",
        options: [
          "Uno a Uno (1:1).",
          "Cero a Cero.",
          "Muchos a Muchos (N:M), que requerirá una tabla intermedia de Préstamos."
        ],
        correctIndex: 2,
        category: "scenario",
        explanation: "Es una relación N:M típica que se resuelve mediante la tabla intermedia Préstamos."
      },
      {
        id: "e4_q19",
        moduleId: 4,
        question: "¿Qué ocurriría si una escuela intentara modelar las relaciones sin usar claves foráneas, confiando solo en que los usuarios no se equivoquen al escribir?",
        options: [
          "Rápidamente se llenarían las tablas de nombres mal escritos, registros huérfanos y datos desconectados imposibles de consultar.",
          "El sistema funcionaría mucho mejor porque no habría reglas.",
          "La base de datos funcionaría igual sin ninguna diferencia."
        ],
        correctIndex: 0,
        category: "understanding",
        explanation: "Sin claves foráneas no hay integridad referencial; los errores de tipeo y desfasajes corromperían las relaciones."
      },
      {
        id: "e4_q20",
        moduleId: 4,
        question: "¿Cuál es la conclusión fundamental del Módulo 4 sobre las relaciones en bases de datos?",
        options: [
          "Las relaciones solo sirven para hacer dibujos lindos en los cuadernos.",
          "Las relaciones permiten conectar tablas individuales para representar fielmente el funcionamiento real de la escuela, usando 1:N para inscripciones y tablas intermedias para relaciones Muchos a Muchos (N:M).",
          "Es mejor no relacionar nada y guardar todo en archivos de texto plano."
        ],
        correctIndex: 1,
        category: "understanding",
        explanation: "Las relaciones 1:N y N:M con tablas intermedias permiten modelar sistemas complejos del mundo real de manera elegante, segura y sin redundancia."
      }
    ]
  }
};
