# RELEASE_CHECKLIST — Noor del Conocimiento

- [x] `npm run validate:questions` pasa; **0 preguntas pending** en el banco de producción.
- [ ] **Importar el banco completo de 507 preguntas verificadas** (no estaba en el repo —
      ver CONTENT_SOURCES.md §Importar). El seed actual tiene 21 preguntas verificadas.
- [x] 4 idiomas (`es/en/ar/ma`) cargan; auto-detección implementada (`expo-localization`).
- [ ] Verificar RTL completo en dispositivo físico (forceRTL requiere reinicio de la app).
- [x] Sin claves en el bundle — la API key vive solo en `ANTHROPIC_API_KEY` del servidor
      (EAS Secret); `.env*` en `.gitignore`; grep de secretos limpio.
- [ ] `npm audit` sin críticas/altas abiertas (ejecutar tras `npm install` final).
- [x] Tests verdes (`npm test`): gameLogic + validate-questions + banco real.
- [ ] `.aab` de producción compila: `eas build --platform android --profile production`.
- [x] Iconos/splash generados (icon, adaptive-icon, splash-icon, favicon, feature-graphic).
- [ ] Publicar PRIVACY.md en una URL pública y enlazarla en Play Console y en `app/about.tsx`.
- [ ] Desplegar el endpoint `app/api/feedback+api.ts` (EAS Hosting / serverless) y poner su
      URL en `eas.json` → `EXPO_PUBLIC_FEEDBACK_API_URL` + `FEEDBACK_ALLOWED_ORIGINS`.
- [ ] Data Safety form (respuestas en PRIVACY.md) + cuestionario IARC.
- [ ] Probar en dispositivo físico Android y pantalla pequeña (360 px).
- [ ] Revisión externa por erudito del banco (recomendada antes de lanzamiento amplio).

## Comandos

```bash
cd noor-del-conocimiento/mobile
npm install
npm run prebuild:check          # typecheck + validate + tests
eas secret:create --scope project --name ANTHROPIC_API_KEY --value <key>
eas build --platform android --profile production
eas submit --platform android --profile production
```
