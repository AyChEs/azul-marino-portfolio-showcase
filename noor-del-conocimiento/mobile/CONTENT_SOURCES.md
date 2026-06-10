# CONTENT_SOURCES — Noor del Conocimiento

Documento de auditoría del contenido religioso. El banco vive en `data/questions.json`
(**507 preguntas**, 3 idiomas es/en/ar) con campos de auditoría `source`, `verified`,
`flag` y `correction_note`.

## Reglas de servicio en producción

- `lib/gameLogic.ts → filterQuestions` solo sirve preguntas con `verified: true` y sin `flag`.
- `scripts/validate-questions.ts` rompe el build si: falta `source`, `correctAnswer` no está
  entre las `options`, opciones ≠ 4 o duplicadas, falta una traducción es/en/ar, o hay IDs
  repetidos. Ejecutar con `npm run validate:questions` (incluido en `npm run prebuild:check`).

## Jerarquía de fuentes aceptadas

1. **Corán** (sura:aya) — texto árabe con tashkīl del mushaf (Hafs ʿan ʿĀṣim);
   traducciones de referencia: Sahih International (`en`), Cortés/Asad (`es`).
2. **Hadiz** de colecciones autenticadas con grado Sahih/Hasan (Bukhari, Muslim, Sunan),
   con referencia numérica (sunnah.com). Prohibido usar daʿīf/mawḍūʿ para enseñar hechos.
3. **Seerah**: Sirat Ibn Hisham; Ar-Raheeq Al-Makhtum ("El Néctar Sellado").
4. **Consenso académico contemporáneo** para fechas históricas.

## Honoríficos y transliteración

- Profeta Muhammad → ﷺ (U+FDFA). Otros profetas → (AS) / عليه السلام.
  Compañeros/as → (RA) / رضي الله عنه/عنها. Estándar IJMES simplificado.

## Pendientes de QA de contenido (no bloqueantes del build)

1. **Registro del árabe**: parte del texto `ar` de las preguntas está redactado en registro
   coloquial/darija (p. ej. «شحال كاينة من سورة…», id 1), mientras la UI (`locales/ar.json`)
   usa árabe estándar. Decidir registro único (MSA recomendado para contenido coránico) o
   añadir `ma` como idioma separado, y revisar el banco en consecuencia.
2. **Granularidad de `source`**: hoy es una cadena libre. Recomendado migrar gradualmente a
   referencia estructurada (primaria/secundaria/URL/verificador/fecha) para auditoría externa.
3. **Revisión por erudito**: `verified: true` refleja la auditoría interna (FASE 0).
   Recomendada una revisión externa antes del lanzamiento amplio; las preguntas dudosas se
   marcan `flag: true` (quedan excluidas automáticamente) con `correction_note`.
