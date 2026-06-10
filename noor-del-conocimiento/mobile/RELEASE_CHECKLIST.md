# RELEASE_CHECKLIST — Noor del Conocimiento

- [x] Banco de **507 preguntas** presente; `npm run validate:questions` pasa; 0 excluidas
      (todas `verified: true`, ninguna `flag`).
- [x] Filtro de producción activo (`filterQuestions` solo sirve verified && !flag).
- [x] 3 idiomas (es/en/ar) con auto-detección de dispositivo y RTL.
- [ ] Decidir registro del árabe del banco (MSA vs darija) — ver CONTENT_SOURCES.md §QA.
- [x] **Feedback de IA retirado por ahora** (decisión de producto) — la app es 100% offline,
      sin claves ni llamadas de red. El código vive en el historial git para reactivarlo.
- [ ] `npm audit` sin críticas/altas abiertas (revisar tras install final).
- [x] Tests verdes (`npm test`): validador + banco real de 507.
- [ ] `.aab` de producción: `eas build --platform android --profile production`.
- [x] Iconos/splash presentes + feature graphic (1024×500).
- [ ] Publicar PRIVACY.md en URL pública y enlazarla en Play Console.
- [ ] Data Safety form (respuestas en PRIVACY.md) + cuestionario IARC.
- [ ] Probar en dispositivo físico Android y pantalla pequeña (360 px).
- [ ] Revisión externa por erudito (recomendada antes del lanzamiento amplio).

## Comandos

```bash
cd noor-del-conocimiento/mobile
npm install
npm run prebuild:check          # type-check + validación del banco + tests
eas build --platform android --profile production
eas submit --platform android --profile production
```
