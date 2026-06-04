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

La fórmula base de premix es editable y coincide con la fórmula solicitada:

- Sal: 85%
- Sal de cura: 4%
- Azúcar: 11%

La app bloquea los cálculos de premix si la composición editada no suma 100%.

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
tests/app.test.js # Verificaciones automáticas de cálculos y robustez
```

## Cómo probarla

### Verificaciones automáticas sin dependencias

Desde la raíz del proyecto ejecuta:

```bash
node tests/app.test.js
node --check app.js
node --check sw.js
python3 -m json.tool manifest.json > /dev/null
```

Para probar instalación y funcionamiento offline:

1. Inicia `python3 -m http.server 8080`.
2. Abre `http://localhost:8080` en Chrome.
3. Abre DevTools → **Application** → **Service Workers** y confirma que `sw.js` aparece activado.
4. Carga la app una vez, activa **Offline** en DevTools y recarga la página.
5. Calcula una receta, imprime el resumen y confirma que solo aparecen el encabezado del lote y la tabla de resultados.

## Pruebas manuales

Estos resultados sirven para verificar las fórmulas sin inventar valores nuevos. Para los lotes de carne se usa **Receta de su cagada**, agua al `5%` y dosis de premix a `17 g/kg`.

### Lote de carne de 20 kg

| Concepto | Cálculo | Resultado esperado |
|---|---:|---:|
| Guajillo 1.5% | 20 × 1.5% | 0.300 kg / 300 g |
| Pimentón 0.4% | 20 × 0.4% | 0.080 kg / 80 g |
| Especias 0.6% | 20 × 0.6% | 0.120 kg / 120 g |
| Ajo 0.6% | 20 × 0.6% | 0.120 kg / 120 g |
| Agua 5% | 20 × 5% | 1.000 kg / 1,000 g |
| Premix 17 g/kg | 20 × 17 | 0.340 kg / 340 g |

### Lote de carne de 60 kg

| Concepto | Cálculo | Resultado esperado |
|---|---:|---:|
| Guajillo 1.5% | 60 × 1.5% | 0.900 kg / 900 g |
| Pimentón 0.4% | 60 × 0.4% | 0.240 kg / 240 g |
| Especias 0.6% | 60 × 0.6% | 0.360 kg / 360 g |
| Ajo 0.6% | 60 × 0.6% | 0.360 kg / 360 g |
| Agua 5% | 60 × 5% | 3.000 kg / 3,000 g |
| Premix 17 g/kg | 60 × 17 | 1.020 kg / 1,020 g |

### Fabricar 1 kg de premix base

| Ingrediente | Porcentaje | Resultado esperado |
|---|---:|---:|
| Sal | 85% | 0.850 kg / 850 g |
| Sal de cura | 4% | 0.040 kg / 40 g |
| Azúcar | 11% | 0.110 kg / 110 g |
| **Total** | **100%** | **1.000 kg / 1,000 g** |

### Fabricar 5 kg de premix base

| Ingrediente | Porcentaje | Resultado esperado |
|---|---:|---:|
| Sal | 85% | 4.250 kg / 4,250 g |
| Sal de cura | 4% | 0.200 kg / 200 g |
| Azúcar | 11% | 0.550 kg / 550 g |
| **Total** | **100%** | **5.000 kg / 5,000 g** |

### Validaciones manuales

- Vacía cualquier campo numérico: el cálculo debe mostrar un error y no `NaN`.
- Escribe un valor negativo o texto: el cálculo debe mostrar un error.
- Cambia el premix para que no sume 100%: los cálculos de premix deben bloquearse con un mensaje.
- Guarda JSON inválido bajo la clave `longaniza-config-v3` en `localStorage` y recarga: la app debe iniciar con los valores por defecto.
