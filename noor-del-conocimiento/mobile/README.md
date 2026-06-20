# نور · Noor del Conocimiento — App móvil

App de trivia de conocimiento islámico construida con **Expo SDK 54** + **React Native 0.81**
+ **TypeScript estricto**. 100% offline, sin anuncios y sin recogida de datos.

> Visión general del proyecto, características y arquitectura: [README raíz](../../README.md).

## Desarrollo

```bash
npm install
npm start                # Expo dev server (Expo Go o dev build)
```

## Scripts

| Script | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo de Expo |
| `npm run type-check` | TypeScript estricto, sin emitir |
| `npm run validate:questions` | **Gate de contenido**: valida las 507 preguntas (fuentes, opciones, traducciones, IDs) |
| `npm test` | Tests Jest (validador, parser de fuentes, banco real) |
| `npm run prebuild:check` | Los tres anteriores en cadena — ejecútalo antes de cualquier build |
| `npm run lint` | ESLint |

## Estructura

```
app/                 # Pantallas (expo-router)
components/          # UI reutilizable + patrones decorativos
constants/           # Tokens de color y tipografías
context/             # LanguageContext (i18n + RTL)
data/questions.json  # Banco de 507 preguntas con metadatos de auditoría
lib/                 # gameLogic, storage, sources (parser de citas), i18n, types
locales/             # es.json · en.json · ar.json (i18next)
scripts/             # validate-questions.ts
__tests__/           # Jest
assets/              # Iconos, splash, feature graphic
```

## Reglas del banco de preguntas

- Solo se sirven preguntas `verified: true` sin `flag` (filtro en `lib/gameLogic.ts`).
- `scripts/validate-questions.ts` rompe el build ante: fuente ausente, `correctAnswer`
  fuera de las opciones, opciones ≠ 4 o duplicadas, traducciones incompletas, IDs repetidos.
- Detalles y jerarquía de fuentes: [CONTENT_SOURCES.md](CONTENT_SOURCES.md).

## Publicación (Android)

```bash
npm run prebuild:check
eas build --platform android --profile production    # .aab firmado
eas submit --platform android --profile production
```

Checklist completo: [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) ·
Ficha de Play Store: [STORE_LISTING.md](STORE_LISTING.md) ·
Privacidad: [PRIVACY.md](PRIVACY.md)
