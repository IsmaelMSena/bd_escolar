# MI PRIMERA BASE DE DATOS ESCOLAR
> **"De los datos a las consultas: construí tu primera base de datos con SQL"**

Aplicación web educativa interactiva en formato **presentación de diapositivas (slide deck)** para enseñar los fundamentos de bases de datos relacionales y el lenguaje SQL a estudiantes de nivel secundario.

---

## 🎯 1. Concepto: Presentación Interactiva (20 Diapositivas)

La experiencia pedagógica está diseñada como una presentación moderna, limpia y minimalista, donde **cada diapositiva aborda una única idea principal** acompañada de diagramas, tablas o fragmentos SQL interactivos:

- **Navegación fluida:** Botones "Anterior" y "Siguiente", índice desplegable de diapositivas, y atajos de teclado (`←` flecha izquierda, `→` flecha derecha, `Espacio`).
- **Sin sobrecarga cognitiva:** Se eliminaron bloques enciclopédicos, duraciones en minutos e información burocrática para el alumno.
- **Interactividad en contexto:** En las diapositivas de SQL, el estudiante puede hacer clic sobre cada cláusula (`SELECT`, `FROM`, `WHERE`, `JOIN`, etc.) para ver una explicación emergente instantánea sin abandonar la diapositiva.
- **Copiar código:** Todos los bloques SQL cuentan con un botón para copiar el código al portapapeles y probarlo en herramientas externas como SQLiteOnline o el entorno del aula.

---

## 🗄️ 2. El Modelo Escolar de 4 Tablas Relacionadas

En la **Diapositiva 1** (*"Una base de datos escolar"*), el alumno observa directamente el diagrama relacional completo modelado como en una herramienta profesional:

1. **`cursos`** (Superior Izquierda): `id_curso` (PK), `nombre_curso`
2. **`alumnos`** (Central Izquierda): `id_alumno` (PK), `nombre`, `apellido`, `id_curso` (FK → `cursos.id_curso`)
3. **`materias`** (Superior Derecha): `id_materia` (PK), `nombre_materia`
4. **`inscripciones`** (Central Derecha): `id_inscripcion` (PK), `id_alumno` (FK → `alumnos.id_alumno`), `id_materia` (FK → `materias.id_materia`)

El diagrama traza **líneas ortogonales reales en SVG** que conectan campo a campo con indicadores de cardinalidad de uno a muchos (1:N):
- `cursos.id_curso` ➔ `alumnos.id_curso` (Gutter Izquierdo)
- `alumnos.id_alumno` ➔ `inscripciones.id_alumno` (Corredor Central)
- `materias.id_materia` ➔ `inscripciones.id_materia` (Gutter Derecho)

Incluye interactividad por toque o clic para resaltar cualquier relación, su campo PK de origen, su campo FK de destino y su justificación didáctica.

---

## 📚 3. Estructura de los 6 Bloques Temáticos

### Bloque 1: El proyecto escolar y el concepto de base de datos
- **Diapositiva 1:** Presentación visual de las cuatro tablas escolares terminadas y sus relaciones.
- **Diapositiva 2:** Qué es una base de datos (del caos de las planillas sueltas a la organización relacional).
- **Diapositiva 3:** Qué es una tabla (columnas y filas ordenadas).
- **Diapositiva 4:** Campos, registros y valores (inspector interactivo por columnas, filas y celdas).

### Bloque 2: Las cuatro tablas escolares
- **Diapositiva 5:** Por qué dividimos la información (el problema de la redundancia y datos duplicados).
- **Diapositiva 6:** Las tablas `cursos` y `alumnos` (estructura y relación 1 a muchos).
- **Diapositiva 7:** Las tablas `materias` e `inscripciones` (resolución de relaciones muchos a muchos).
- **Diapositiva 8:** Claves primarias (identificadores únicos que nunca se repiten).
- **Diapositiva 9:** Claves foráneas (el puente que une dos tablas).

### Bloque 3: Creación de tablas e inserción de datos (SQL DDL y DML)
- **Diapositiva 10:** Qué es SQL (el idioma para dialogar con los motores de bases de datos).
- **Diapositiva 11:** `CREATE TABLE` (creación de las tablas `cursos` y `alumnos`).
- **Diapositiva 12:** `CREATE TABLE` (creación de `materias` e `inscripciones` con sus claves foráneas).
- **Diapositiva 13:** `INSERT INTO` (incorporación de registros, manejo de comillas y números).

### Bloque 4: Consultas básicas (SQL DQL)
- **Diapositiva 14:** Para qué consultamos una base de datos y cómo recuperar información.
- **Diapositiva 15:** `SELECT` y `FROM` (selección de columnas específicas vs asterisco `*`).
- **Diapositiva 16:** Filtrar con `WHERE` (condiciones exactas, textos y números).
- **Diapositiva 17:** Ordenar con `ORDER BY` (`ASC` / `DESC` para listados alfabéticos).

### Bloque 5: Relaciones entre tablas (JOIN)
- **Diapositiva 18:** Por qué necesitamos `JOIN` (devolver nombres legibles en vez de identificadores numéricos).
- **Diapositiva 19:** `INNER JOIN` en acción (consulta combinada entre `alumnos` y `cursos`).

### Bloque 6: Desafío final e integración
- **Diapositiva 20:** Desafíos de integración con 3 consignas prácticas y soluciones revelables para escribir consultas de gestión escolar.

---

## 🔒 4. Evaluaciones y Panel Docente Privado

- **Evaluaciones Formativas:** 5 evaluaciones de opción múltiple correspondientes a los núcleos temáticos, con corrección instantánea y retroalimentación pedagógica.
- **Panel Docente:** Acceso discreto mediante botón en el encabezado con clave PIN (`profe2025` o `admin`).
  - Registro de intentos con nombre, aula, puntaje y fecha.
  - Exportación de calificaciones a archivo CSV compatible con Excel.
  - Simulador de curso para pruebas docentes.

---

## 💻 5. Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción (carpeta /dist lista para GitHub Pages u hosting estático)
npm run build
```

---

## 📁 6. Arquitectura del Código

- `src/components/presentation/SlideDeckViewer.tsx`: Componente principal del visor de diapositivas con soporte de teclado y tabla de contenidos.
- `src/components/common/FourTablesDiagram.tsx`: Diagrama interactivo de las cuatro tablas escolares con conectores relacionales.
- `src/components/common/TableAnatomyInspector.tsx`: Inspector interactivo de campos, registros y valores.
- `src/components/common/InteractiveSqlBlock.tsx`: Bloque de código SQL con sintaxis coloreada, tokens explicativos clicables y copiado.
- `src/components/common/PracticeChallenges.tsx`: Consignas prácticas del desafío final con soluciones desplegables.
- `src/components/quiz/QuizRunner.tsx`: Evaluaciones breves de opción múltiple.
- `src/components/teacher/TeacherDashboard.tsx`: Panel privado docente con autenticación PIN y exportación CSV.
- `src/data/presentationData.ts`: Estructura y textos de las 20 diapositivas divididas en 6 bloques.
- `src/data/demoSchoolDb.ts`: Datos de ejemplo de las 4 tablas escolares (`cursos`, `alumnos`, `materias`, `inscripciones`).
- `src/data/quizzesData.ts`: Preguntas de evaluación alineadas al modelo de 4 tablas.
