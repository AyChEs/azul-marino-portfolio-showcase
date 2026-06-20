<div align="center">

# نور · Noor del Conocimiento

**Trivia de conocimiento islámico — respetuosa, educativa y con cada respuesta respaldada por su fuente.**

[![Checks](https://github.com/AyChEs/azul-marino-portfolio-showcase/actions/workflows/check.yml/badge.svg)](https://github.com/AyChEs/azul-marino-portfolio-showcase/actions/workflows/check.yml)
![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Offline](https://img.shields.io/badge/100%25-offline-2ea44f)
![License](https://img.shields.io/badge/code-MIT-blue)

*507 preguntas verificadas · 3 idiomas · 0 anuncios · 0 recogida de datos*

</div>

---

## ✨ ¿Qué es Noor?

Noor del Conocimiento es una app móvil de preguntas y respuestas sobre el Islam para toda la
familia. Su principio rector: **ningún dato sin fuente**. Cada pregunta del banco cita su
referencia (Corán con sura:aya, hadices de colecciones auténticas con número, obras de Seerah
reconocidas) y la explicación verificada se muestra tras cada respuesta, con enlace directo a
[quran.com](https://quran.com) o [sunnah.com](https://sunnah.com) cuando la fuente lo permite.

## 🎮 Modos de juego

| Modo | Descripción |
|------|-------------|
| 🧳 **Musafir** | Solitario contrarreloj con vidas y comodines (50/50, +tiempo, saltar) |
| 🪑 **Majlis** | Multijugador local por turnos (2–6 jugadores) — ideal en familia |
| 📖 **Aprender** | Repaso sin reloj ni vidas: tarjeta, respuesta, explicación y fuente |

## 🌟 Características

- **507 preguntas verificadas** en 3 categorías: Corán y General, Profetas, Seerah
- **3 idiomas** (Español · English · العربية) con auto-detección del idioma del dispositivo y RTL
- **Fuente citada y tocable** en cada explicación
- **Botón "Reportar este dato"** en cada pregunta — auditoría comunitaria del contenido
- Racha diaria 🔥, récord personal y compartir resultado
- **100 % offline** — sin anuncios, sin analytics, sin recogida de datos ([política de privacidad](noor-del-conocimiento/mobile/PRIVACY.md))
- Pipeline de validación del banco que **rompe el build** ante cualquier inconsistencia

## 🚀 Empezar

```bash
git clone https://github.com/AyChEs/azul-marino-portfolio-showcase.git
cd azul-marino-portfolio-showcase/noor-del-conocimiento/mobile
npm install
npm start            # Expo dev server (escanea el QR con Expo Go)
```

Verificación completa antes de cualquier build:

```bash
npm run prebuild:check   # type-check + validación del banco + tests
```

Build de producción (Android App Bundle, requiere cuenta EAS):

```bash
eas build --platform android --profile production
```

## 🏗️ Arquitectura

```
noor-del-conocimiento/mobile/
├── app/                  # Pantallas (expo-router file-based)
│   ├── index.tsx         #   Selección de idioma (solo 1er arranque)
│   ├── home.tsx          #   Selección de modo / categoría / dificultad
│   ├── play.tsx          #   Partida (timer, vidas, comodines, explicación + fuente)
│   ├── learn.tsx         #   Modo Aprender (sin presión)
│   ├── game-over.tsx     #   Resultados + rango + compartir
│   ├── majlis-setup.tsx  #   Registro de jugadores
│   └── majlis-game-over.tsx
├── components/           # UI (NoorButton, NoorCard, AnswerOption, TimerBar…)
├── data/questions.json   # Banco de 507 preguntas con metadatos de auditoría
├── lib/                  # Lógica pura: gameLogic, storage, sources, i18n
├── locales/              # es / en / ar (i18next)
└── scripts/              # validate-questions.ts (gate de contenido)
```

**Stack:** Expo SDK 54 · React Native 0.81 · TypeScript estricto · expo-router ·
react-native-reanimated · i18next · AsyncStorage · EAS Build.

## 🔍 Integridad del contenido

El contenido religioso es la prioridad nº 1 del proyecto:

1. Cada pregunta lleva `source`, `verified` y `flag` — solo se sirven preguntas
   `verified && !flag`.
2. `npm run validate:questions` falla el build si falta una fuente, la respuesta correcta no
   está entre las opciones, faltan traducciones o hay IDs duplicados.
3. La CI ejecuta esta validación en **cada push**.
4. Jerarquía de fuentes, estándar de transliteración y pendientes de QA:
   [CONTENT_SOURCES.md](noor-del-conocimiento/mobile/CONTENT_SOURCES.md).

> 📌 *El contenido es educativo. Para cuestiones de práctica religiosa, consulta siempre a un
> erudito cualificado.*

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [CONTENT_SOURCES.md](noor-del-conocimiento/mobile/CONTENT_SOURCES.md) | Auditoría de fuentes y estándar de citación |
| [PRIVACY.md](noor-del-conocimiento/mobile/PRIVACY.md) | Política de privacidad (es/en) + Data Safety |
| [STORE_LISTING.md](noor-del-conocimiento/mobile/STORE_LISTING.md) | Materiales de la ficha de Google Play |
| [RELEASE_CHECKLIST.md](noor-del-conocimiento/mobile/RELEASE_CHECKLIST.md) | Checklist y comandos de publicación |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Cómo contribuir (código y contenido) |
| [SECURITY.md](SECURITY.md) | Cómo reportar vulnerabilidades |

## 🤝 Contribuir

Las contribuciones son bienvenidas — especialmente la **revisión de contenido** por personas
con formación en ciencias islámicas. Lee [CONTRIBUTING.md](CONTRIBUTING.md) y usa la plantilla
de *Reporte de contenido* para señalar cualquier dato cuestionable.

## 📄 Licencia

- **Código:** [MIT](LICENSE).
- **Banco de preguntas y textos** (`data/`, contenido educativo): © Ayman Essamadi.
  Uso educativo permitido con atribución; consulta antes de redistribución comercial.

---

<div align="center">

بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ

*Cada error es una oportunidad de aprender.*

</div>
