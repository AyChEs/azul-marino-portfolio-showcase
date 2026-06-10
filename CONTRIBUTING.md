# Contribuir a Noor del Conocimiento

¡Gracias por tu interés! Hay dos formas de contribuir, y la **revisión de contenido** es tan
valiosa como el código.

## 🕌 Contribuir al contenido (preguntas)

El principio del proyecto: **ningún dato sin fuente verificable**.

1. Para señalar un error, abre un issue con la plantilla **"Reporte de contenido"**
   (o usa el botón *Reportar este dato* dentro de la app).
2. Para proponer preguntas nuevas, incluye **siempre**:
   - La fuente primaria: Corán (`sura:aya`), hadiz **Sahih/Hasan** con colección y número
     (p. ej. `Sahih al-Bukhari 1741`), u obra de Seerah reconocida.
   - Las 3 traducciones (`es`, `en`, `ar`) de pregunta, 4 opciones y explicación.
   - Honoríficos: ﷺ para el Profeta Muhammad, (AS) para otros profetas, (RA) para compañeros.
3. **No se aceptan**: hadices débiles (daʿīf) o fabricados (mawḍūʿ) como base de hechos,
   ni preguntas sobre puntos con desacuerdo entre escuelas formuladas con "única respuesta".
4. Jerarquía de fuentes y estándar completo: [CONTENT_SOURCES.md](noor-del-conocimiento/mobile/CONTENT_SOURCES.md).

Toda pregunta nueva pasa por `npm run validate:questions` (la CI lo ejecuta en cada PR) y
entra con `verified: false` hasta su revisión.

## 💻 Contribuir al código

```bash
cd noor-del-conocimiento/mobile
npm install
npm start                # desarrollo con Expo
npm run prebuild:check   # type-check + validación del banco + tests — debe pasar antes del PR
```

Pautas:
- TypeScript estricto; sin `any` salvo justificación.
- Cero strings visibles hardcodeados — todo desde `locales/`.
- Colores desde `constants/colors.ts`.
- La app debe seguir siendo **100% offline** y sin permisos adicionales.

## 🔀 Proceso de PR

1. Haz fork y crea una rama descriptiva (`fix/...`, `feat/...`, `content/...`).
2. Asegúrate de que la CI pasa.
3. Describe **qué** cambia y **por qué**; si tocas contenido, cita las fuentes en el PR.

## 📜 Conducta

Este es un proyecto sobre conocimiento religioso usado por familias: se espera trato
respetuoso en issues y PRs, y especial cuidado y humildad al discutir contenido islámico.
