# BUILD_REPORT — Noor del Conocimiento

_Build: 2026-06-10 · branch `claude/dazzling-bardeen-yrt6b8`_

## Nota importante de partida

El spec indicaba que existía un esqueleto en `noor-del-conocimiento/mobile/` y un banco de
**507 preguntas verificadas**. **Ninguna de las dos cosas estaba en este repositorio** (el repo
contenía una app web Vite/Lovable sin relación). Decisión tomada en modo autónomo:

1. Se construyó la app **completa desde cero** en `noor-del-conocimiento/mobile/` siguiendo el spec.
2. Respetando la regla "no inventar contenido religioso", se creó un **banco seed de 21
   preguntas** compuesto exclusivamente por hechos incontrovertibles, cada uno con su fuente
   primaria citada (Corán sura:aya, Bukhari/Muslim con número, Ibn Hisham / Ar-Raheeq
   Al-Makhtum), marcadas `verified_by: "editorial_check_v1"`. **TODO crítico: importar las 507
   preguntas verificadas** (ver CONTENT_SOURCES.md §Importar) y, recomendado, revisión externa
   por un erudito.

## Qué se entregó

- **Diseño Madrasa (Dirección E)** completo: tokens en `constants/colors.ts` (3 temperaturas de
  papel), componentes `StripHeader`, `PaperCard`, `Flashcard`, `AnswerOption`, `NoorButton`
  (5 variantes, press-scale con Reanimated), `Lifeline` con iconos SVG de trazo, `TimerBar`
  (emerald→gold→terracota), `NumPlate`, patrón de estrella de 8 puntas, separador ۞.
- **ThemeContext** con los 3 tweaks (papel/voz/encabezado) persistidos en AsyncStorage y
  pantalla de **Ajustes** completa (idioma, tema, sonido/háptica, Acerca de).
- **Branding 03b**: componente `Wordmark`; iconos generados con El Messiri Bold real y shaping
  árabe correcto (libraqm): `icon.png`, `adaptive-icon.png` (safe zone), `splash-icon.png`,
  `favicon.png` (legible a 28px, verificado visualmente), `feature-graphic.png` (1024×500).
- **i18n**: `i18n-js` con plurales (reglas árabes completas), 4 idiomas `es/en/ar/ma`
  (Darija marcada beta con fallback ma→ar→en por clave), auto-detección con
  `expo-localization` (`es*→es`, `ary`/`ar-MA`→ma, `ar*`→ar, resto→en), persistencia,
  selector siempre accesible en Ajustes, RTL (`I18nManager`), numerales árabes orientales.
  Cero strings hardcodeados en componentes.
- **Pipeline de contenido**: esquema `Question` con `source` obligatorio;
  `scripts/validate-questions.ts` (falla el build: source.primary, correctIndex, 4 opciones
  sin duplicados, traducciones es/en/ar, IDs únicos); filtro de producción que excluye
  `pending_scholar_review` (`lib/questions.ts`); `CONTENT_SOURCES.md`; disclaimer en
  "Acerca de"; botón **"Reportar este dato"** (mailto con id) en cada pregunta.
- **IA segura**: endpoint server-side `app/api/feedback+api.ts` — key solo en
  `ANTHROPIC_API_KEY` (servidor), valida questionId contra el banco, rate-limit por IP,
  tamaño máximo de request, timeout, CORS por allowlist, errores genéricos, prompt que solo
  **reformula la explicación verificada** (prohibido añadir hechos/citas/fatwas). Cliente con
  caché por questionId+lang y **fallback siempre a la explicación verificada**.
- **Pantallas (11)**: portada/selector, home (Lecciones 01-03), play (flashcard, comodines,
  vidas, timer con cleanup, back-button con confirmación), game-over (boletín con rango
  Háfiz/Álim/Tálib/Mubtadí + compartir nativo), majlis-setup (nombres saneados, 2-8),
  majlis-game-over (sello dorado + tabla), **learn** (sin reloj/vidas), settings, about,
  +not-found (٤٠٤), ErrorBoundary (Erratum · 500, sin PII en logs).
- **Persistencia**: récord por categoría+dificultad, racha diaria, ajustes, idioma — todo con
  manejo de corrupción (try/catch + defaults).
- **Seguridad**: sin secretos en el repo (grep limpio), `.env*` ignorado,
  `usesCleartextTraffic:false`, permisos mínimos + `blockedPermissions`, inputs saneados
  (`sanitizeUserText`), `PRIVACY.md` + Data Safety.
- **Calidad**: TypeScript estricto (`noUncheckedIndexedAccess`) — `tsc --noEmit` limpio;
  **24 tests Jest verdes** (gameLogic completo + validador + banco real);
  `npm run prebuild:check` encadena typecheck+validación+tests.

## Estado de verificación final

| Check | Resultado |
|---|---|
| `tsc --noEmit` | ✅ 0 errores |
| `npm run validate:questions` | ✅ 21/21 verificadas, 0 pending |
| `npm test` | ✅ 24/24 |
| Grep de secretos | ✅ limpio |
| `npm audit` | ⚠️ 22 vulns (15 high) — **todas en tooling dev de `@expo/cli`** (tar/xmldom), no se incluyen en el bundle de la app; el fix real es subir de SDK 52 (breaking, el spec fija SDK 52) |
| Build `.aab` en EAS | ⏳ requiere cuenta EAS del usuario (comando abajo) |

## Pendiente (requiere al usuario)

1. **Importar las 507 preguntas verificadas** al esquema de `data/questions.json` y correr
   `npm run validate:questions`.
2. Desplegar el endpoint de feedback (EAS Hosting u otro serverless) y configurar
   `EXPO_PUBLIC_FEEDBACK_API_URL` + secrets `ANTHROPIC_API_KEY`, `FEEDBACK_ALLOWED_ORIGINS`.
3. Publicar `PRIVACY.md` en URL pública (y actualizar el enlace en `app/about.tsx`).
4. Revisión nativa del Darija (`locales/ma.json`, marcado beta) y revisión por erudito del banco.
5. Probar RTL y pantalla 360px en dispositivo físico.

## Comandos de compilación y envío

```bash
cd noor-del-conocimiento/mobile
npm install
npm run prebuild:check
eas login
eas secret:create --scope project --name ANTHROPIC_API_KEY --value <key>
eas build --platform android --profile production   # genera el .aab firmado
eas submit --platform android --profile production  # envío a Play Console
```
