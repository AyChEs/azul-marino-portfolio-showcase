# BUILD_REPORT — Noor del Conocimiento

_2026-06-10 · rama `claude/dazzling-bardeen-yrt6b8`_

## Qué pasó en esta sesión

1. **Confusión inicial resuelta**: la sesión arrancó sobre `AyChEs/azul-marino-portfolio-showcase`,
   que solo contenía un portfolio Vite. La app avanzada vivía en el repo público
   `AyChEs-0/azul-marino-portfolio-showcase`. Se construyó primero una versión desde cero
   (commit `9d2ff7e`, conservada en el historial) y, por instrucción del usuario, se descartó
   en favor de la app avanzada.
2. **Base adoptada**: la app del repo de referencia (Expo **SDK 54**, RN 0.79, expo-router 5,
   i18next, **507 preguntas verificadas**, proxy server-side de Claude con rate-limit y
   sanitización anti-inyección, filtro `verified && !flag` en producción).
3. **Borrado del portfolio**: el proyecto Vite/Lovable se eliminó de la raíz del repo
   (recuperable desde el historial git). El repo ahora contiene solo Noor.

## Mejoras portadas sobre la base

- **`scripts/validate-questions.ts`** (+ `npm run validate:questions` + `prebuild:check`):
  gate de build adaptado al esquema real (source, correctAnswer ∈ options, 4 opciones únicas,
  es/en/ar completos, IDs únicos). Resultado actual: **507/507 válidas, 0 excluidas**.
- **Tests Jest** (`__tests__/validate-questions.test.ts`): 9 tests del validador + el banco real.
- **Endurecimiento de `lib/ai.ts`**: el camino directo con `EXPO_PUBLIC_ANTHROPIC_API_KEY`
  ahora está bloqueado con `__DEV__` — imposible que la clave pública se use en producción.
- **Docs**: `CONTENT_SOURCES.md` (auditoría + QA pendiente), `PRIVACY.md` (+ Data Safety),
  `STORE_LISTING.md`, `RELEASE_CHECKLIST.md`, README raíz, `feature-graphic.png` (1024×500).

## Pendiente (decisiones del usuario)

1. **Registro del árabe del banco**: parte del texto `ar` de las preguntas está en darija
   (p. ej. id 1) y la UI en MSA — unificar o separar `ma` como cuarto idioma (CONTENT_SOURCES §QA).
2. Desplegar el endpoint de feedback + `ANTHROPIC_API_KEY` como EAS Secret.
3. Publicar PRIVACY.md en URL pública; Data Safety + IARC.
4. `eas build --platform android --profile production` (requiere tu cuenta EAS).
5. Revisión externa por erudito (recomendada).

## Verificación local

| Check | Resultado |
|---|---|
| `npm run validate:questions` | ✅ 507 válidas, 0 excluidas |
| `npm test` | ✅ |
| `npm run type-check` | ver nota en RELEASE_CHECKLIST (SDK 54) |
