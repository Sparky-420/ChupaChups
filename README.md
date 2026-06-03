# Calculadora de Longaniza

App web/PWA simple para calcular cantidades de una receta de longaniza y preparar premix de curado. Está pensada para usarse en navegador móvil, funcionar offline y servir como base para empaquetarla después como app Android.

## Qué calcula

- Receta principal por peso de carne.
- Premix aplicado al lote de carne en `g/kg`.
- Desglose de un lote de premix para fabricar.
- Resultados en porcentaje, gramos y kilogramos.

## Fórmulas actuales

No se cambiaron los valores base de las recetas; solo se cambió la forma de capturarlos para que sean porcentajes legibles:

- `1.5%` equivale al decimal original `0.015`.
- `0.4%` equivale al decimal original `0.004`.

La fórmula de premix que existía en la app se conserva como valor por defecto y ahora es editable:

- Sal: 85%
- Sal de cura: 6%
- Azúcar: 9%

> Nota: durante la revisión se detectó una inconsistencia con el ejemplo solicitado de `85% sal`, `4% sal de cura`, `11% azúcar`. La app no fija una única fórmula; permite editar la composición y valida que sume 100%.

## Cómo abrir el proyecto

Opción rápida:

1. Abre `index.html` directamente en un navegador moderno.
2. Para probar correctamente la PWA y el service worker, sirve la carpeta con un servidor local.

Ejemplo con Python:

```bash
python3 -m http.server 8080
```

Luego abre:

```text
http://localhost:8080
```

## Uso básico

1. Selecciona la receta.
2. Ingresa el peso de carne, dosis de premix y porcentaje de agua.
3. Ajusta ingredientes si lo necesitas.
4. Presiona **Calcular receta**.
5. En la sección de premix, ajusta la fórmula y calcula el premix para carne o para fabricar.
6. Usa **Restaurar valores por defecto** para volver a los valores iniciales.

La última configuración se guarda automáticamente en `localStorage` del navegador.

## Funcionamiento offline

La app registra `sw.js`, que guarda en caché los archivos principales:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- íconos PNG

Después de cargarla una vez desde un servidor, puede abrirse sin conexión desde el navegador/PWA instalada.

## Empaquetado futuro como Android

Próximos pasos sugeridos para crear una APK sin migrar la app:

1. Revisar el manifest con Lighthouse y corregir advertencias PWA.
2. Probar instalación en Chrome Android como PWA.
3. Usar Trusted Web Activity con Bubblewrap para generar un proyecto Android.
4. Configurar `assetlinks.json` si se publica en un dominio propio.
5. Generar keystore de firma Android.
6. Compilar APK/AAB desde el proyecto generado.
7. Probar permisos, modo offline y comportamiento de impresión en Android.

## Estructura

```text
index.html     # Estructura HTML
styles.css     # Diseño responsive e impresión
app.js         # Cálculos, validaciones, localStorage y PWA
sw.js          # Caché offline
manifest.json  # Metadata PWA
```
