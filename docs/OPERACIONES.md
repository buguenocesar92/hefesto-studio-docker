# Operación de Hefesto

Regla del propietario: al tercer uso de un comando manual SSH o una edición manual de BD, automatizar mediante un script versionado; si es periódico, programarlo.

Registro de tareas repetidas: tarea, propósito, número de ejecuciones, responsable, script, frecuencia/zona horaria, recuperación y última comprobación. No se han ejecutado comandos SSH ni cambios manuales de BD en esta actualización. No se crean cronjobs ficticios.

## Contenido estático actual

- Caso KraftDo: `content/kraftdo.json` y `python3 scripts/build-kraftdo.py`.
- Ecosistema: `content/ecosystem.json`; los textos se publican en la portada. El script `scripts/build-ecosystem.py` documenta su generación.
- Ordenia, Public Lead Finder y servicios: `content/additional-projects.json`.
- Cotizador: prepara y descarga una solicitud local; no envía, no calcula importes ni guarda en BD.
- Bots y RAG: oferta de desarrollo. No hay backend de RAG ni proveedor IA conectado en esta web estática.

Para Laravel: modelos Project, Integration, Solution, QuoteRequest y KnowledgeDocument; mantener IDs estables. Añadir validación de cotizaciones en servidor, persistencia, estados y precios administrables. RAG: ingestión autorizada, fragmentación, embeddings, índice, permisos por documento, recuperación con fuentes y proveedor de generación configurable; no exponer claves en frontend. No activar envíos comerciales automáticamente.

## Edición Docker

Scripts versionados en `portable/scripts/`: setup, migraciones, seed de catálogo, backup y restore. Sin tareas periódicas instaladas hasta definir frecuencia, retención y alertas. CI en `.github/workflows/docker.yml` valida conectores y construye imagen; no despliega automáticamente.
