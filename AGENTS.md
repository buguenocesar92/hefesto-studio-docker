# Hefesto: reglas de trabajo

Preservar la portada original, catálogo y casos de estudio. Usar la identidad de Hefesto (grafito, papel cálido y acento naranja) en nuevas páginas. No presentar propuestas como integraciones activadas.

## Automatización operativa — instrucción de César

Si un comando manual por SSH o una edición manual en base de datos se repite más de dos veces, convertirlo en un script versionado antes de la siguiente ejecución. Si es periódico, convertirlo en una tarea programada.

Registrar el propósito y las ejecuciones en docs/OPERACIONES.md. Usar parámetros validados, modo de simulación cuando corresponda, registros sin secretos y ejecución idempotente. Los cambios de datos deben tener respaldo/recuperación y transacciones cuando sea posible. Una tarea programada necesita frecuencia, zona horaria America/Santiago, bloqueo de concurrencia y notificación de fallos. No programar tareas sin una necesidad y frecuencia definidas.
