# Simulador de Repaso para el Test de Conducir

App web estática para estudiar preguntas del examen teórico de conducir de forma simple, rápida y visual.

Está hecha únicamente con `HTML`, `CSS` y `JavaScript`, sin frameworks ni dependencias externas.

## Qué hace

La app permite:

- repasar preguntas de opción múltiple
- seleccionar una respuesta antes de revelar la correcta
- ver corrección visual inmediata:
  verde para la respuesta correcta y rojo para la incorrecta elegida
- marcar preguntas como `Ya la sé` o `Repasar`
- filtrar preguntas pendientes, dominadas o marcadas para revisión
- buscar preguntas por palabra clave
- mezclar el orden de las preguntas
- guardar el progreso en el navegador con `localStorage`
- mostrar imágenes asociadas a las preguntas cuando corresponde

## Estructura del proyecto

- `index.html`: estructura principal de la app
- `styles.css`: estilos visuales e interacción de estados
- `app.js`: lógica de renderizado, selección, corrección, filtros y guardado local
- `questions-data.js`: base de preguntas y respuestas
- `imagenes-test/`: imágenes utilizadas por las preguntas visuales

## Cómo usarla

1. Abrí `index.html` en tu navegador.
2. Elegí una respuesta para cada pregunta.
3. Tocá `Mostrar respuesta` para ver si acertaste.
4. Marcá la pregunta como `Ya la sé` o `Repasar` según necesites.
5. Usá los filtros y la búsqueda para concentrarte en lo que te falta estudiar.

## Características principales

- interfaz simple y rápida
- funcionamiento completamente local
- sin instalación ni build
- sin backend
- progreso persistente en el navegador
- compatible con material visual

## Objetivo

El objetivo de esta app es transformar un banco grande de preguntas en una herramienta de estudio más cómoda, donde sea posible descartar lo que ya está aprendido y enfocarse sólo en las preguntas que todavía necesitan repaso.

## Tecnologías

- HTML
- CSS
- JavaScript

## Nota

La app fue pensada para funcionar como un simulador de repaso local. Todo el contenido puede abrirse directamente desde archivos del sistema, sin servidor.
