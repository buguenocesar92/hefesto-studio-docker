# Caso KraftDo: contenido y migración a Laravel

El caso de estudio está integrado en la portada original y en `/proyectos/kraftdo/`.

- Fuente del caso: `content/kraftdo.json` (IDs estables, traducciones, categorías, URLs, stack y procedencia de imágenes).
- Generador estático: `python3 scripts/build-kraftdo.py`.
- Presentación: `dist/proyectos/kraftdo/case.css` y `case.js`.
- Tarjeta de portada: `dist/index.html`, estilos y comportamiento en `kraftdo-feature.css/js`.
- La tarjeta resumen de portada se mantiene estática; al cambiar el resumen del caso, actualizar sus atributos `data-unify-es/en` y el texto de respaldo.
- Imágenes locales en `dist/proyectos/kraftdo/assets`. Procedencia de cada fotografía en el JSON. No dependen de enlaces temporales de Instagram.

## Para Claude Code

Crear modelos Project, ProjectFeature, ProjectMedia y ProjectIntegration. Importar `content/kraftdo.json` mediante un seeder idempotente por `id`; conservar los IDs de funcionalidades. Guardar traducciones como campos JSON o tabla de traducciones. `first_client`, `first_custom_project` y `featured` pertenecen al proyecto. Mantener el orden de las funcionalidades. Añadir estados separados `implemented`, `configured`, `production_verified` por integración; no derivar que está activa solo porque existe código.

Convertir el HTML de salida a Blade y reemplazar bucles/textos por datos del modelo. Un controlador debe obtener el proyecto por slug (`kraftdo`). Reutilizar las mismas rutas, diseño, filtros, imágenes, preferencias y enlaces. El formulario de Hefesto sigue siendo el existente; este cambio solo precarga el contexto del proyecto, no agrega un envío nuevo ni una base de datos.

Las afirmaciones de primer cliente y primer proyecto a medida provienen de la indicación de César. Funcionalidades contrastadas con la conversación compartida y el código/documentación de KraftDo el 8 de octubre de 2026. No se publican conversaciones, datos de cuentas, secretos, métricas comerciales ni testimonios. No se afirma que Canva/Meta, Flow productivo, cotización API Starken o migración VPS estén ya activados. Stripe fue retirado de KraftDo: no añadirlo a este caso.

## Verificación

`node scripts/test-unified.cjs` conserva contenido y funciones de la web principal. `node scripts/test-kraftdo.cjs` comprueba filtros, traducciones, tema, enlaces/recursos y consulta contextual. Son pruebas de DOM, no una revisión visual de navegador.
