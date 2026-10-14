import { QuizQuestion } from '../types';

export const MODULE_QUIZZES: Record<number, QuizQuestion[]> = {
  // BLOQUE 1: COMPRENDEMOS QUÉ ESTAMOS VIENDO
  1: [
    {
      id: 'b1_q1',
      moduleId: 1,
      question: '¿Qué es una base de datos?',
      explanation: 'Una base de datos es un conjunto organizado de información digital que permite guardarla, consultarla y modificarla con rapidez y seguridad.',
      options: [
        'Un conjunto organizado de información para guardarla y consultarla eficientemente.',
        'Una carpeta física de cartón guardada en secretaría.',
        'Un programa para dibujar planos.'
      ],
      correctIndex: 0,
      conceptTag: 'Concepto de Base de Datos'
    },
    {
      id: 'b1_q2',
      moduleId: 1,
      question: 'En la tabla alumnos, ¿qué representa una FILA completa (por ejemplo, Lucía Pérez)?',
      explanation: 'Una fila horizontal completa representa un REGISTRO.',
      options: [
        'Un registro con todos los datos de un alumno.',
        'Un campo o columna.',
        'Una base de datos entera.'
      ],
      correctIndex: 0,
      conceptTag: 'Registros'
    },
    {
      id: 'b1_q3',
      moduleId: 1,
      question: 'En la tabla alumnos, ¿qué representa una COLUMNA vertical como "apellido"?',
      explanation: 'Una columna vertical define una propiedad común y se denomina CAMPO.',
      options: [
        'Un campo (columna que define una propiedad común).',
        'Un registro individual.',
        'Una base de datos entera.'
      ],
      correctIndex: 0,
      conceptTag: 'Campos'
    },
    {
      id: 'b1_q4',
      moduleId: 1,
      question: 'Si en el casillero de Lucía leemos "1", ¿qué es ese valor por sí solo?',
      explanation: 'El valor "1" es un DATO o valor elemental dentro de una celda.',
      options: [
        'Un dato o valor puntual.',
        'Una tabla completa.',
        'Una clave foránea de 4 tablas.'
      ],
      correctIndex: 0,
      conceptTag: 'Valores'
    },
    {
      id: 'b1_q5',
      moduleId: 1,
      question: '¿Por qué dividimos la escuela en cuatro tablas (cursos, alumnos, materias, inscripciones)?',
      explanation: 'Para especializar la información y evitar duplicar nombres repetidamente, previniendo errores.',
      options: [
        'Para guardar información especializada por tema y evitar repetir datos innecesariamente.',
        'Porque las bases de datos no permiten guardar más de 3 renglones.',
        'Porque cada profesor debe tener su propia computadora.'
      ],
      correctIndex: 0,
      conceptTag: 'Estructura en Tablas'
    }
  ],

  // BLOQUE 2: CONSTRUIMOS LAS TABLAS
  2: [
    {
      id: 'b2_q1',
      moduleId: 2,
      question: '¿Qué instrucción SQL se utiliza para crear una nueva tabla?',
      explanation: 'CREATE TABLE es la sentencia estándar de SQL para definir y crear tablas.',
      options: [
        'CREATE TABLE',
        'NEW TABLE',
        'MAKE TABLE'
      ],
      correctIndex: 0,
      conceptTag: 'CREATE TABLE'
    },
    {
      id: 'b2_q2',
      moduleId: 2,
      question: '¿Qué es una Clave Primaria (PRIMARY KEY)?',
      explanation: 'Es un campo único que no se puede repetir nunca en la misma tabla e identifica cada fila de manera inequívoca.',
      options: [
        'Un identificador único que no se repite e identifica a cada fila.',
        'La contraseña para encender el monitor.',
        'El nombre del estudiante en mayúsculas.'
      ],
      correctIndex: 0,
      conceptTag: 'PRIMARY KEY'
    },
    {
      id: 'b2_q3',
      moduleId: 2,
      question: '¿Qué es una Clave Foránea (FOREIGN KEY)?',
      explanation: 'La clave foránea permite relacionar un registro de una tabla con un registro de otra tabla mediante REFERENCES.',
      options: [
        'Un campo que hace referencia a la clave primaria de otra tabla para relacionar los registros.',
        'Un virus informático que viene de internet.',
        'Un archivo de texto plano.'
      ],
      correctIndex: 0,
      conceptTag: 'FOREIGN KEY'
    },
    {
      id: 'b2_q4',
      moduleId: 2,
      question: 'En la tabla alumnos, ¿a qué clave primaria apunta el campo "id_curso"?',
      explanation: 'Apunta a cursos.id_curso mediante REFERENCES cursos(id_curso).',
      options: [
        'A cursos.id_curso',
        'A materias.id_materia',
        'A inscripciones.id_inscripcion'
      ],
      correctIndex: 0,
      conceptTag: 'Relación con cursos'
    },
    {
      id: 'b2_q5',
      moduleId: 2,
      question: '¿Cuántas claves foráneas contiene la tabla "inscripciones"?',
      explanation: 'Contiene dos claves foráneas: id_alumno (que apunta a alumnos) e id_materia (que apunta a materias).',
      options: [
        'Dos claves foráneas: id_alumno e id_materia.',
        'Ninguna, solo texto.',
        'Cuatro claves foráneas.'
      ],
      correctIndex: 0,
      conceptTag: 'Múltiples Claves Foráneas'
    }
  ],

  // BLOQUE 3 Y 4: TIPOS DE DATOS Y RELACIONES
  3: [
    {
      id: 'b3_q1',
      moduleId: 3,
      question: '¿Qué tipo de dato SQL se utiliza para almacenar números enteros como 1, 2 o 15?',
      explanation: 'INTEGER se utiliza para guardar números enteros sin decimales.',
      options: [
        'INTEGER',
        'TEXT',
        'REAL'
      ],
      correctIndex: 0,
      conceptTag: 'Tipos de Datos'
    },
    {
      id: 'b3_q2',
      moduleId: 3,
      question: '¿Qué tipo de dato SQL se utiliza para palabras y textos como "Lucía"?',
      explanation: 'TEXT se utiliza para cadenas de texto alfanumérico.',
      options: [
        'TEXT',
        'INTEGER',
        'REAL'
      ],
      correctIndex: 0,
      conceptTag: 'Tipo TEXT'
    },
    {
      id: 'b3_q3',
      moduleId: 3,
      question: '¿Qué tipo de dato se usa para valores numéricos con decimales como 8.5?',
      explanation: 'REAL se utiliza para números con decimales.',
      options: [
        'REAL',
        'INTEGER',
        'BOOLEAN'
      ],
      correctIndex: 0,
      conceptTag: 'Tipo REAL'
    },
    {
      id: 'b3_q4',
      moduleId: 3,
      question: '¿Para qué sirve la instrucción JOIN en SQL?',
      explanation: 'JOIN permite combinar información de tablas relacionadas mediante una condición.',
      options: [
        'Para combinar datos de tablas relacionadas mediante una condición ON.',
        'Para borrar tablas de la base de datos.',
        'Para apagar la computadora.'
      ],
      correctIndex: 0,
      conceptTag: 'Concepto de JOIN'
    },
    {
      id: 'b3_q5',
      moduleId: 3,
      question: 'En la cláusula "JOIN alumnos ON inscripciones.id_alumno = alumnos.id_alumno", ¿qué indica ON?',
      explanation: 'ON establece la condición de coincidencia que vincula los registros de ambas tablas.',
      options: [
        'La condición que relaciona los registros mediante sus columnas coincidentes.',
        'Que la base de datos está encendida.',
        'El nombre del docente a cargo.'
      ],
      correctIndex: 0,
      conceptTag: 'Cláusula ON'
    }
  ],

  // BLOQUE 5 Y 6: INSERCIÓN Y CONSULTAS
  4: [
    {
      id: 'b4_q1',
      moduleId: 4,
      question: '¿Qué instrucción SQL se utiliza para insertar un nuevo registro?',
      explanation: 'INSERT INTO seguido del nombre de la tabla y los valores con VALUES.',
      options: [
        'INSERT INTO',
        'ADD ROW',
        'PUT DATA'
      ],
      correctIndex: 0,
      conceptTag: 'INSERT INTO'
    },
    {
      id: 'b4_q2',
      moduleId: 4,
      question: 'En SQL, ¿cómo deben escribirse los valores de texto como nombres o divisiones?',
      explanation: 'Los textos van siempre entre comillas simples, por ejemplo: \'1.º A\' o \'Lucía\'.',
      options: [
        'Entre comillas simples, como \'Lucía\'.',
        'Sin comillas, igual que los números.',
        'Entre barras diagonales /Lucía/.'
      ],
      correctIndex: 0,
      conceptTag: 'Comillas en SQL'
    },
    {
      id: 'b4_q3',
      moduleId: 4,
      question: '¿Cuál es el orden lógico para cargar los registros en nuestra escuela?',
      explanation: 'Primero cursos y materias (tablas maestras), luego alumnos y finalmente inscripciones.',
      options: [
        '1. cursos, 2. alumnos, 3. materias, 4. inscripciones.',
        '1. inscripciones primero, sin que existan alumnos.',
        'Cualquier orden aleatorio sin importar las claves foráneas.'
      ],
      correctIndex: 0,
      conceptTag: 'Orden de Inserción'
    },
    {
      id: 'b4_q4',
      moduleId: 4,
      question: '¿Qué hace la consulta "SELECT * FROM alumnos;"?',
      explanation: 'El asterisco (*) significa "todas las columnas", por lo que recupera todas las columnas y filas de alumnos.',
      options: [
        'Muestra todas las columnas y filas de la tabla alumnos.',
        'Borra a todos los alumnos del sistema.',
        'Cambia el nombre de la escuela.'
      ],
      correctIndex: 0,
      conceptTag: 'SELECT *'
    },
    {
      id: 'b4_q5',
      moduleId: 4,
      question: '¿Para qué sirve la cláusula WHERE en una consulta SQL?',
      explanation: 'WHERE permite establecer una condición para filtrar y obtener solo los registros que la cumplan.',
      options: [
        'Para filtrar los registros según una condición específica.',
        'Para ordenar los resultados de la A a la Z.',
        'Para cambiarle el color al texto.'
      ],
      correctIndex: 0,
      conceptTag: 'Cláusula WHERE'
    }
  ],

  // EVALUACIÓN GENERAL DE SÍNTESIS
  5: [
    {
      id: 'b5_q1',
      moduleId: 5,
      question: 'Para consultar únicamente los nombres y apellidos de los alumnos, ¿qué consulta usamos?',
      explanation: 'SELECT nombre, apellido FROM alumnos; especifica solo las dos columnas requeridas.',
      options: [
        'SELECT nombre, apellido FROM alumnos;',
        'SELECT * FROM alumnos;',
        'SHOW nombre, apellido;'
      ],
      correctIndex: 0,
      conceptTag: 'Proyección de Columnas'
    },
    {
      id: 'b5_q2',
      moduleId: 5,
      question: '¿Qué consulta permite ver a los alumnos que pertenecen al curso con id 1?',
      explanation: 'SELECT * FROM alumnos WHERE id_curso = 1; filtra exactamente los alumnos de ese curso.',
      options: [
        'SELECT * FROM alumnos WHERE id_curso = 1;',
        'SELECT curso = 1 FROM alumnos;',
        'FILTER id_curso = 1 FROM alumnos;'
      ],
      correctIndex: 0,
      conceptTag: 'Filtro con WHERE'
    },
    {
      id: 'b5_q3',
      moduleId: 5,
      question: '¿Por qué la clave foránea inscripciones.id_alumno exige que el alumno exista previamente?',
      explanation: 'Porque no podemos inscribir a un alumno inexistente; la clave foránea protege la coherencia (integridad referencial).',
      options: [
        'Para asegurar la coherencia y evitar registrar materias a alumnos que no existen.',
        'Porque SQL solo admite números pares.',
        'Para que la computadora ande más rápido.'
      ],
      correctIndex: 0,
      conceptTag: 'Integridad Referencial'
    },
    {
      id: 'b5_q4',
      moduleId: 5,
      question: '¿Qué significa el punto y coma (;) al final de cada instrucción SQL?',
      explanation: 'El punto y coma indica el final de la instrucción SQL.',
      options: [
        'Indica el final de la sentencia SQL.',
        'Indica un error de tipeo.',
        'Indica que la instrucción se repite diez veces.'
      ],
      correctIndex: 0,
      conceptTag: 'Sintaxis SQL'
    },
    {
      id: 'b5_q5',
      moduleId: 5,
      question: '¿Cuál es el recorrido pedagógico completo que aprendiste?',
      explanation: 'Comprender qué es una base de datos -> Definir las 4 tablas con PK y FK -> Crearlas con CREATE TABLE -> Insertar registros con INSERT INTO -> Consultar con SELECT, WHERE y JOIN.',
      options: [
        'Comprender la base de datos -> Definir tablas con PK y FK -> Crear tablas e insertar datos -> Consultar con SELECT, WHERE y JOIN.',
        'Copiar tablas en papel sin usar computadoras.',
        'Descargar programas de videojuegos.'
      ],
      correctIndex: 0,
      conceptTag: 'Síntesis Final'
    }
  ]
};
