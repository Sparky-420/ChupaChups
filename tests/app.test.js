const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const elementIds = [
    'receta_select', 'peso_carne', 'dosis_premix', 'agua_ratio',
    'tu_guajillo', 'tu_pimenton', 'tu_especias', 'tu_ajo',
    'pa_guajillo', 'pa_pimenton', 'pa_especias', 'pa_ajo',
    'premix_carne_kg', 'premix_dosis', 'premix_fabricar',
    'premix_sal_pct', 'premix_cura_pct', 'premix_azucar_pct',
    'receta_cagada', 'receta_viejo', 'premix_suma', 'resultados',
    'resultado_premix_carne', 'resultado_premix_fabricar',
    'btn_imprimir', 'btn_calcular', 'btn_premix_carne',
    'btn_fabricar_premix', 'btn_restaurar'
];

function makeApp(savedValue = null, storageKey = 'longaniza-config-v3') {
    const elements = Object.fromEntries(elementIds.map((id) => {
        let value = '';
        return [id, {
            get value() { return value; },
            set value(nextValue) { value = String(nextValue); },
            hidden: false, innerHTML: '', textContent: '',
            addEventListener() {}, classList: { toggle() {} }
        }];
    }));
    const storage = new Map();
    if (savedValue !== null) storage.set(storageKey, savedValue);
    let onReady;
    let serviceWorkerRegistration;

    const context = {
        console: { log: console.log, warn() {} },
        document: {
            getElementById: (id) => elements[id],
            querySelector: () => null,
            addEventListener: (event, callback) => { if (event === 'DOMContentLoaded') onReady = callback; }
        },
        localStorage: {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => storage.set(key, value),
            removeItem: (key) => storage.delete(key)
        },
        navigator: {
            serviceWorker: {
                register: (path, options) => {
                    serviceWorkerRegistration = { path, options };
                    return Promise.resolve();
                }
            }
        },
        window: { print() {} }
    };

    vm.createContext(context);
    vm.runInContext(fs.readFileSync('app.js', 'utf8'), context);
    onReady();
    return { context, elements, getServiceWorkerRegistration: () => serviceWorkerRegistration };
}

function includesAll(text, snippets) {
    snippets.forEach((snippet) => assert.ok(text.includes(snippet), `Falta "${snippet}" en el resultado.`));
}

function assertResultRow(html, name, percentageOrDose, kilograms, grams) {
    const row = `<tr><td>${name}</td><td>${percentageOrDose}</td><td>${kilograms}</td><td>${grams}</td></tr>`;
    assert.ok(html.includes(row), `No se encontró la fila esperada: ${row}`);
}

{
    const { context, elements, getServiceWorkerRegistration } = makeApp('{json inválido');
    assert.equal(elements.receta_select.value, 'cagada');
    assert.equal(elements.tu_guajillo.value, '1.5');
    assert.equal(elements.tu_pimenton.value, '0.4');
    assert.equal(elements.tu_especias.value, '0.6');
    assert.equal(elements.tu_ajo.value, '0.6');
    assert.notEqual(elements.tu_ajo.value, '6');
    assert.notEqual(elements.tu_ajo.value, '0.5');
    assert.equal(elements.agua_ratio.value, '5');
    assert.equal(elements.dosis_premix.value, '17');
    assert.equal(elements.premix_sal_pct.value, '85');
    assert.equal(elements.premix_cura_pct.value, '4');
    assert.equal(elements.premix_azucar_pct.value, '11');
    assert.equal(getServiceWorkerRegistration().path, './sw.js');
    assert.equal(getServiceWorkerRegistration().options.scope, './');

    elements.peso_carne.value = '20';
    context.calcular();
    assertResultRow(elements.resultados.innerHTML, 'Guajillo', '1.5%', '0.300', '300.0');
    assertResultRow(elements.resultados.innerHTML, 'Pimentón', '0.4%', '0.080', '80.0');
    assertResultRow(elements.resultados.innerHTML, 'Especias (FABPSA)', '0.6%', '0.120', '120.0');
    assertResultRow(elements.resultados.innerHTML, 'Ajo fresco', '0.6%', '0.120', '120.0');
    assertResultRow(elements.resultados.innerHTML, 'Agua helada (Fase 2)', '5.0%', '1.000', '1,000.0');
    assertResultRow(elements.resultados.innerHTML, 'Premix (Fase 1)', '17.0 g/kg', '0.340', '340.0');

    elements.peso_carne.value = '60';
    context.calcular();
    assertResultRow(elements.resultados.innerHTML, 'Guajillo', '1.5%', '0.900', '900.0');
    assertResultRow(elements.resultados.innerHTML, 'Pimentón', '0.4%', '0.240', '240.0');
    assertResultRow(elements.resultados.innerHTML, 'Especias (FABPSA)', '0.6%', '0.360', '360.0');
    assertResultRow(elements.resultados.innerHTML, 'Ajo fresco', '0.6%', '0.360', '360.0');
    assertResultRow(elements.resultados.innerHTML, 'Agua helada (Fase 2)', '5.0%', '3.000', '3,000.0');
    assertResultRow(elements.resultados.innerHTML, 'Premix (Fase 1)', '17.0 g/kg', '1.020', '1,020.0');

    elements.receta_select.value = 'viejo';
    elements.peso_carne.value = '20';
    context.calcular();
    includesAll(elements.resultados.innerHTML, ['Receta del viejo', '0.300', '300.0', '0.040', '40.0', '0.080', '80.0', '0.100', '100.0']);

    elements.premix_carne_kg.value = '20';
    elements.premix_dosis.value = '14';
    context.calcularPremixCarne();
    includesAll(elements.resultado_premix_carne.innerHTML, ['0.280', '280.0', '0.238', '238.0', '0.011', '11.2', '0.031', '30.8']);

    elements.premix_fabricar.value = '1';
    context.calcularFabricarPremix();
    includesAll(elements.resultado_premix_fabricar.innerHTML, ['0.850', '850.0', '0.040', '40.0', '0.110', '110.0']);

    elements.premix_fabricar.value = '5';
    context.calcularFabricarPremix();
    includesAll(elements.resultado_premix_fabricar.innerHTML, ['4.250', '4,250.0', '0.200', '200.0', '0.550', '550.0']);

    elements.premix_cura_pct.value = '4.001';
    context.calcularFabricarPremix();
    assert.ok(elements.resultado_premix_fabricar.innerHTML.includes('debe sumar 100%'));

    for (const invalidValue of ['', '-1', 'texto']) {
        elements.peso_carne.value = invalidValue;
        context.calcular();
        assert.ok(elements.resultados.innerHTML.includes('debe ser un número igual o mayor que cero'));
    }
}

{
    const { elements } = makeApp('{datos viejos inválidos', 'longaniza-config-v2');
    assert.equal(elements.receta_select.value, 'cagada');
    assert.equal(elements.premix_cura_pct.value, '4');
}

{
    const badSavedData = JSON.stringify({ receta_select: 'inexistente', peso_carne: -20, premix_sal_pct: 85, premix_cura_pct: 6, premix_azucar_pct: 11 });
    const { elements } = makeApp(badSavedData);
    assert.equal(elements.receta_select.value, 'cagada');
    assert.equal(elements.peso_carne.value, '19.9');
    assert.equal(elements.premix_sal_pct.value, '85');
    assert.equal(elements.premix_cura_pct.value, '4');
    assert.equal(elements.premix_azucar_pct.value, '11');
}

console.log('Todas las verificaciones de cálculo y robustez pasaron.');
