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
- `0.6%` equivale al decimal `0.006`; **el ajo de la fórmula base es 0.6%, no 6% literal ni 0.5%**.

### Fórmula base por defecto

La **Receta actual (predeterminada)** es la opción seleccionada al abrir la app sin una configuración previa y usa estos valores sobre el peso de carne limpia:

- Guajillo: 1.5%
- Pimentón: 0.4%
- Especias/FABPSA: 0.6%
- Ajo: **0.6%** — equivale a 120 g por cada 20 kg de carne limpia.
- Agua: 5%
- Premix: 1.7%, capturado en la app como `17 g/kg`.

La **Receta del viejo (alternativa)** se conserva como opción separada y no es el valor predeterminado; puede mantener su ajo al `0.5%`.

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

La última configuración se guarda automáticamente en `localStorage` del navegador. Sin configuración guardada, el peso de carne inicia en `0` para evitar cálculos accidentales; **Restaurar valores por defecto** también lo regresa a `0`.

## Funcionamiento offline

La app registra `sw.js`, que guarda en caché los archivos principales:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- íconos PNG

Después de cargarla una vez desde un servidor, puede abrirse sin conexión desde el navegador/PWA instalada.

## Empaquetado Android

El proyecto Android de Capacitor ya está incluido para generar un APK debug sin migrar ni reescribir la app. Los pasos detallados de compilación, descarga e instalación están en la sección [APK Android con Capacitor](#apk-android-con-capacitor).

Como trabajo futuro para distribución pública quedaría generar un keystore, configurar una compilación release firmada, producir un AAB y completar las pruebas para Play Store.

## Estructura

```text
index.html     # Estructura HTML
styles.css     # Diseño responsive e impresión
app.js         # Cálculos, validaciones, localStorage y PWA
sw.js          # Caché offline
manifest.json          # Metadata PWA
package.json           # Scripts y dependencias de Capacitor
capacitor.config.json  # Nombre, appId y directorio web para Capacitor
scripts/build.js       # Copia la PWA a www/
android/               # Proyecto Android de Capacitor
.github/workflows/     # Compilación automática del APK debug
tests/                 # Verificaciones de cálculos y empaquetado
```

## Cómo probarla

### Verificaciones automáticas sin dependencias

Desde la raíz del proyecto ejecuta:

```bash
npm test
npm run build
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

Estos resultados sirven para verificar la fórmula base sin inventar valores nuevos. Para los lotes de carne se usa la receta seleccionada por defecto, agua al `5%` y premix al `1.7%` (`17 g/kg`). En particular, el ajo se prueba como `0.6%`: son 120 g para 20 kg y 360 g para 60 kg; no se interpreta como `6%`.

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


## APK Android con Capacitor

La PWA se empaqueta sin reescribirla mediante Capacitor. La aplicación Android usa:

- Nombre: **Calculadora de Longaniza**
- App ID/package: `com.sparky.longaniza`
- Tipo de compilación actual: APK `debug` instalable, sin firma release
- Archivos web generados: `www/` mediante `npm run build`

### Compilar localmente

Requisitos: Node.js 20 o posterior, Java 21, Gradle 8.11.1 y Android SDK con API 35.

Desde la raíz del proyecto:

```bash
npm install
npm run build
npx cap sync android
gradle -p android assembleDebug
```

También puedes ejecutar el flujo completo con:

```bash
npm run android:debug
```

El APK generado queda en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Cuando cambie cualquier archivo HTML, CSS, JavaScript, manifest o icono, vuelve a ejecutar `npm run cap:sync` antes de compilar Android.

### Compilar desde GitHub Actions

El workflow `.github/workflows/android-debug-apk.yml` instala Gradle mediante `gradle/actions/setup-gradle`, instala dependencias, ejecuta las pruebas, sincroniza Capacitor y compila el APK debug. El repositorio no incluye `gradle-wrapper.jar` ni otros binarios generados de Android.

1. Sube la rama a GitHub.
2. Abre la pestaña **Actions** del repositorio.
3. Selecciona **Android Debug APK**.
4. Presiona **Run workflow** y espera que termine correctamente.
5. Abre la ejecución terminada y descarga el artifact **calculadora-longaniza-debug-apk**.
6. Descomprime el artifact para obtener `app-debug.apk`.

### Instalar el APK en Android

1. Copia `app-debug.apk` al teléfono o descárgalo desde el artifact de GitHub Actions.
2. Abre el APK en Android.
3. Si Android lo solicita, permite temporalmente **Instalar apps desconocidas** para la aplicación que abrió el archivo.
4. Confirma la instalación.

Este APK debug es para uso personal y pruebas inmediatas. Todavía no está configurado ni firmado como release para Play Store.
