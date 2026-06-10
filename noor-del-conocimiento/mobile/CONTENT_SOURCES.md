# CONTENT_SOURCES — Noor del Conocimiento

Documento de auditoría del contenido religioso (sección 6 del spec). Cada pregunta de
`data/questions.json` lleva metadatos `source` con referencia primaria (y secundaria si aplica).

## Jerarquía de fuentes aceptadas

1. **Corán** — citado como `Corán sura:aya`. Texto árabe con tashkīl según el mushaf
   (Hafs ʿan ʿĀṣim). Traducciones de referencia: Sahih International (`en`),
   Julio Cortés / Muhammad Asad (`es`). URLs: quran.com.
2. **Hadiz** — solo colecciones autenticadas con grado Sahih/Hasan:
   Sahih al-Bukhari, Sahih Muslim, los Sunan. Referencia numérica de sunnah.com.
   **Prohibido** usar hadices daʿīf o mawḍūʿ para enseñar hechos.
3. **Seerah** — Sirat Ibn Hisham; Ar-Raheeq Al-Makhtum ("El Néctar Sellado", Safi-ur-Rahman
   al-Mubarakpuri).
4. **Consenso académico contemporáneo** para fechas históricas (solo hechos consensuados).

## Fuentes por categoría (banco actual)

| Categoría | Fuentes usadas |
|---|---|
| Corán y General | Corán (estructura del mushaf, 2:127, 2:282, 4:163, 9, 96:1-5); Sahih al-Bukhari 3, 8, 756; Sahih Muslim 16, 394 |
| Profetas | Corán 2:127, 19:29-30, 19:53, 27:16, 37:142, 4:163; concordancias clásicas (Al-Muʿjam al-Mufahras) |
| Seerah | Sirat Ibn Hisham; Ar-Raheeq Al-Makhtum; Sahih al-Bukhari 3, 3653, 3818, 3906; Corán 3:123, 9:40 |

## Estándar de transliteración y honoríficos

- IJMES simplificado (sin diacríticos técnicos en UI; con macrones solo en citas formales).
- Profeta Muhammad → **ﷺ** (U+FDFA) en todos los idiomas.
- Otros profetas → (AS) en `es`/`en`; عليه السلام en `ar`/`ma`.
- Compañeros/as → (RA) en `es`/`en`; رضي الله عنه/عنها en `ar`/`ma`.
- Temas con desacuerdo entre escuelas → `sensitivity: "scholarly_difference"` y reformulación
  hacia el hecho consensuado; el banco actual no contiene ninguno.

## Estado de verificación

- `verified_by: "editorial_check_v1"` = verificado contra la fuente primaria citada durante el
  build (hechos incontrovertibles y estructurales). **Se recomienda una revisión externa por un
  erudito antes del lanzamiento amplio**; el pipeline lo soporta cambiando `verified_by`.
- `verified_by: "pending_scholar_review"` = excluido automáticamente de producción
  (`lib/questions.ts`) y detectado por `scripts/validate-questions.ts`.

## Importar el banco completo de 507 preguntas verificadas

El banco verificado de 507 preguntas mencionado en el spec **no estaba presente en este
repositorio**. Para importarlo: convertir cada pregunta al esquema de `data/questions.json`
(ver `lib/types.ts` → `Question`), incluir `source.primary` y `verified_by`/`verified_date`
reales, y ejecutar `npm run validate:questions`.
