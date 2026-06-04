const STORAGE_KEY = 'longaniza-config-v3';
const PERCENT_TOLERANCE = 0.000001;

const DEFAULTS = Object.freeze({
    receta_select: 'cagada',
    peso_carne: 0,
    dosis_premix: 17,
    agua_ratio: 5,
    tu_guajillo: 1.5,
    tu_pimenton: 0.4,
    tu_especias: 0.6,
    tu_ajo: 0.6,
    pa_guajillo: 1.5,
    pa_pimenton: 0.2,
    pa_especias: 0.4,
    pa_ajo: 0.5,
    premix_carne_kg: 20,
    premix_dosis: 14,
    premix_fabricar: 10,
    // Fórmula base solicitada; el usuario puede editarla si conserva una suma de 100%.
    premix_sal_pct: 85,
    premix_cura_pct: 4,
    premix_azucar_pct: 11
});

const RECIPE_FIELDS = {
    cagada: {
        nombre: 'Receta actual (predeterminada)',
        contenedor: 'receta_cagada',
        ingredientes: [
            ['guajillo', 'Guajillo', 'tu_guajillo'],
            ['pimenton', 'Pimentón', 'tu_pimenton'],
            ['especias', 'Especias (FABPSA)', 'tu_especias'],
            ['ajo', 'Ajo fresco', 'tu_ajo']
        ]
    },
    viejo: {
        nombre: 'Receta del viejo (alternativa)',
        contenedor: 'receta_viejo',
        ingredientes: [
            ['guajillo', 'Guajillo', 'pa_guajillo'],
            ['pimenton', 'Pimentón', 'pa_pimenton'],
            ['especias', 'Especias (FABPSA)', 'pa_especias'],
            ['ajo', 'Ajo fresco', 'pa_ajo']
        ]
    }
};

const ids = Object.keys(DEFAULTS);

function el(id) {
    return document.getElementById(id);
}

function readNumber(id) {
    const rawValue = el(id).value.trim();
    const value = Number(rawValue);
    if (rawValue === '' || !Number.isFinite(value) || value < 0) {
        throw new Error(`Revisa el campo "${labelFor(id)}": debe ser un número igual o mayor que cero.`);
    }
    return value;
}

function labelFor(id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent.trim();
    return id.replaceAll('_', ' ');
}

function formatKg(value) {
    return value.toLocaleString('es-MX', { maximumFractionDigits: 3, minimumFractionDigits: 3 });
}

function formatG(value) {
    return value.toLocaleString('es-MX', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

function formatPct(value) {
    return value.toLocaleString('es-MX', { maximumFractionDigits: 3, minimumFractionDigits: 1 });
}

function renderError(targetId, message) {
    el(targetId).innerHTML = `<p class="error">${message}</p>`;
}

function makeTable(headers, rows) {
    return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function isPremixTotalValid(total) {
    return Math.abs(total - 100) <= PERCENT_TOLERANCE;
}

function getPremixFormula() {
    const formula = [
        { nombre: 'Sal', porcentaje: readNumber('premix_sal_pct') },
        { nombre: 'Sal de cura', porcentaje: readNumber('premix_cura_pct') },
        { nombre: 'Azúcar', porcentaje: readNumber('premix_azucar_pct') }
    ];
    const suma = formula.reduce((total, item) => total + item.porcentaje, 0);
    if (!isPremixTotalValid(suma)) {
        throw new Error(`La fórmula del premix debe sumar 100%. Suma actual: ${formatPct(suma)}%.`);
    }
    return formula;
}

function calcular() {
    try {
        const pesoCarne = readNumber('peso_carne');
        const dosisPremix = readNumber('dosis_premix');
        const aguaPorcentaje = readNumber('agua_ratio');
        const seleccion = el('receta_select').value;
        const receta = RECIPE_FIELDS[seleccion];
        if (!receta) {
            throw new Error('Selecciona una receta válida.');
        }
        const rows = [];

        receta.ingredientes.forEach(([, nombre, inputId]) => {
            const porcentaje = readNumber(inputId);
            const kg = pesoCarne * (porcentaje / 100);
            rows.push([nombre, `${formatPct(porcentaje)}%`, formatKg(kg), formatG(kg * 1000)]);
        });

        const aguaKg = pesoCarne * (aguaPorcentaje / 100);
        rows.push(['Agua helada (Fase 2)', `${formatPct(aguaPorcentaje)}%`, formatKg(aguaKg), formatG(aguaKg * 1000)]);

        const premixG = pesoCarne * dosisPremix;
        rows.push(['Premix (Fase 1)', `${formatG(dosisPremix)} g/kg`, formatKg(premixG / 1000), formatG(premixG)]);

        el('resultados').innerHTML = `<section class="card print-card"><h2>Resultados: ${receta.nombre}</h2><p class="print-summary"><strong>Lote de carne:</strong> ${formatKg(pesoCarne)} kg · <strong>Agua:</strong> ${formatPct(aguaPorcentaje)}% · <strong>Premix:</strong> ${formatG(dosisPremix)} g/kg</p>${makeTable(['Ingrediente', 'Porcentaje o dosis', 'Kilogramos', 'Gramos'], rows)}</section>`;
        el('btn_imprimir').hidden = false;
        saveConfig();
    } catch (error) {
        renderError('resultados', error.message);
        el('btn_imprimir').hidden = true;
    }
}

function calcularPremixCarne() {
    try {
        const carneKg = readNumber('premix_carne_kg');
        const dosis = readNumber('premix_dosis');
        const totalPremixG = carneKg * dosis;
        const rows = [['Premix total', '100%', formatKg(totalPremixG / 1000), formatG(totalPremixG)]];

        getPremixFormula().forEach((item) => {
            const gramos = totalPremixG * (item.porcentaje / 100);
            rows.push([item.nombre, `${formatPct(item.porcentaje)}%`, formatKg(gramos / 1000), formatG(gramos)]);
        });

        el('resultado_premix_carne').innerHTML = makeTable(['Concepto', 'Porcentaje', 'Kilogramos', 'Gramos'], rows);
        saveConfig();
    } catch (error) {
        renderError('resultado_premix_carne', error.message);
    }
}

function calcularFabricarPremix() {
    try {
        const premixKg = readNumber('premix_fabricar');
        const totalG = premixKg * 1000;
        const rows = getPremixFormula().map((item) => {
            const gramos = totalG * (item.porcentaje / 100);
            return [item.nombre, `${formatPct(item.porcentaje)}%`, formatKg(gramos / 1000), formatG(gramos)];
        });

        el('resultado_premix_fabricar').innerHTML = makeTable(['Ingrediente', 'Porcentaje', 'Kilogramos', 'Gramos'], rows);
        saveConfig();
    } catch (error) {
        renderError('resultado_premix_fabricar', error.message);
    }
}

function actualizarVisibilidad() {
    const seleccion = el('receta_select').value;
    Object.entries(RECIPE_FIELDS).forEach(([key, receta]) => {
        el(receta.contenedor).hidden = key !== seleccion;
    });
}

function saveConfig() {
    const config = {};
    ids.forEach((id) => {
        config[id] = el(id).value;
    });

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
        console.warn('No se pudo guardar la configuración local.', error);
    }
}

function getSafeSavedConfig() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
        console.warn('Se ignoró una configuración local inválida.', error);
        return {};
    }
}

function isValidSavedValue(id, value) {
    if (id === 'receta_select') return Object.prototype.hasOwnProperty.call(RECIPE_FIELDS, value);
    if (value === '' || (typeof value !== 'string' && typeof value !== 'number')) return false;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0;
}

function loadConfig() {
    const saved = getSafeSavedConfig();
    ids.forEach((id) => {
        el(id).value = isValidSavedValue(id, saved[id]) ? saved[id] : DEFAULTS[id];
    });

    const premixSum = ['premix_sal_pct', 'premix_cura_pct', 'premix_azucar_pct']
        .reduce((total, id) => total + Number(el(id).value), 0);
    if (!isPremixTotalValid(premixSum)) {
        ['premix_sal_pct', 'premix_cura_pct', 'premix_azucar_pct'].forEach((id) => {
            el(id).value = DEFAULTS[id];
        });
    }
}

function restoreDefaults() {
    ids.forEach((id) => {
        el(id).value = DEFAULTS[id];
    });
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn('No se pudo borrar la configuración local.', error);
    }
    actualizarVisibilidad();
    actualizarSumaPremix();
    el('resultados').innerHTML = '';
    el('resultado_premix_carne').innerHTML = '';
    el('resultado_premix_fabricar').innerHTML = '';
    el('btn_imprimir').hidden = true;
}

function actualizarSumaPremix() {
    const suma = ['premix_sal_pct', 'premix_cura_pct', 'premix_azucar_pct']
        .map((id) => Number(el(id).value) || 0)
        .reduce((total, value) => total + value, 0);
    const target = el('premix_suma');
    target.textContent = `Suma actual: ${formatPct(suma)}%`;
    target.classList.toggle('error', !isPremixTotalValid(suma));
}

function imprimirResultados() {
    window.print();
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js', { scope: './' }).catch((error) => {
            console.warn('No se pudo registrar el service worker.', error);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    actualizarVisibilidad();
    actualizarSumaPremix();

    el('receta_select').addEventListener('change', () => {
        actualizarVisibilidad();
        saveConfig();
    });
    el('btn_calcular').addEventListener('click', calcular);
    el('btn_premix_carne').addEventListener('click', calcularPremixCarne);
    el('btn_fabricar_premix').addEventListener('click', calcularFabricarPremix);
    el('btn_imprimir').addEventListener('click', imprimirResultados);
    el('btn_restaurar').addEventListener('click', restoreDefaults);

    ids.forEach((id) => {
        el(id).addEventListener('input', () => {
            if (id.startsWith('premix_')) actualizarSumaPremix();
            saveConfig();
        });
    });

    registerServiceWorker();
});
