/* =====================================================================
   IRON FIST - NIVEL 2  (versión mejorada)
   Solo afecta al nivel 2. Mantiene los mismos IDs y funciones públicas
   (reiniciarLvl2, iniciarJuegoLvl2, Habilitar_Siguienten_LVL, etc.).
   ===================================================================== */

const OBJETIVO_LVL2 = 25;
const TIEMPO_LVL2 = 60;

let Tiempolvl2 = TIEMPO_LVL2;
let iniciandoLvl2 = false;
let Puntajelvl2 = 0;
let Vidaslvl2 = 3;

let juegoActivoLvl2 = false;
let pausadoLvl2 = false;
let impactoEnProcesoLvl2 = false;
let colaImpactosLvl2 = [];

let intervaloTiempoLvl2;
let intervaloImpactosLvl2; // se conserva por compatibilidad (ya no se usa)
let temporizadorAvisoImpactoLvl2 = null;
let temporizadorDestelloPlanetaLvl2 = null;
let temporizadorConteoLvl2 = null;

// Botón "VOLVER AL INICIO" (lo define JavaScript.js): visible solo en pausa y al perder
function volverInicioVisibleLvl2(visible) {
    if (typeof mostrarVolverInicio === "function") mostrarVolverInicio(visible);
}

/* ---------------------------------------------------------------------
   ELEMENTOS DEL DOM
   --------------------------------------------------------------------- */
const tableroLvl2 = document.querySelector(
    "#NIVEL_02 .Contenedorlvl2:not(.Cabezeralvl2)"
);
const planetaLvl2 = document.getElementById("PlanetaLvl2");
const naveJugadorLvl2 = document.getElementById("NaveJugadorLvl2");
const inicioLvl2 = document.getElementById("Startlvl2");
const derrotaLvl2 = document.getElementById("PerdistePantallaLvl2");
const victoriaLvl2 = document.getElementById("GanastePantallaLvL2");
const cabTiempoLvl2 = document.querySelector("#NIVEL_02 .Tiempolvl2");

// Los 3 meteoritos fijos del HTML antiguo ya no se usan (ahora se crean por código).
["Meteioritolvl2", "Meteiorito2lvl2", "Meteiorito3lvl2"].forEach(function (id) {
    const viejo = document.getElementById(id);
    if (viejo) viejo.remove();
});

const imagenesPlanetaLvl2 = [
    "IMG/planetas_lvl2/planeta_0.png",
    "IMG/planetas_lvl2/planeta_1.png",
    "IMG/planetas_lvl2/planeta_2.png",
    "IMG/planetas_lvl2/planeta_3.png"
];

/* ---------------------------------------------------------------------
   NAVES (dibujadas con SVG, no necesitan archivos de imagen)
   --------------------------------------------------------------------- */
const NAVES_LVL2 = {
    interceptor: {
        img: "IMG/Nave_02_ok.png", rot: 0,
        nombre: "INTERCEPTOR", etiqueta: "EQUILIBRADA", color: "#35d6ff",
        paleta: { claro: "#d8f1ff", medio: "#4aa3ff", oscuro: "#1b4f9c", acento: "#00e5ff", cabina: "#3fb6ff", fuego: "#38d4ff" },
        cadencia: 0.30, dano: 1, atraviesa: 0, velocidad: 1100, lw: 34, lh: 4, angulos: [0],
        stats: { poder: 3, cadencia: 3, cobertura: 2 }
    },
    relampago: {
        img: "IMG/Nave_03.png", rot: -90,
        nombre: "RELÁMPAGO", etiqueta: "DISPARO RÁPIDO", color: "#8dff4a",
        paleta: { claro: "#eaffd8", medio: "#7edc3c", oscuro: "#2f7d1e", acento: "#f6ff3a", cabina: "#7dffb0", fuego: "#c6ff3a" },
        cadencia: 0.15, dano: 1, atraviesa: 0, velocidad: 1500, lw: 24, lh: 3, angulos: [0],
        stats: { poder: 2, cadencia: 5, cobertura: 1 }
    },
    titan: {
        img: "IMG/Nave_04_ok.png", rot: 0,
        nombre: "TITÁN", etiqueta: "LÁSER PERFORANTE", color: "#ff8a3d",
        paleta: { claro: "#ffe3c2", medio: "#ff8a3d", oscuro: "#8f2f10", acento: "#ffd23a", cabina: "#ffb86b", fuego: "#ff7a1a" },
        cadencia: 0.62, dano: 2, atraviesa: 2, velocidad: 900, lw: 54, lh: 9, angulos: [0],
        stats: { poder: 5, cadencia: 1, cobertura: 3 }
    }
};
const ORDEN_NAVES_LVL2 = ["interceptor", "relampago", "titan"];
const cacheSvgNavesLvl2 = {};

/* ---------------------------------------------------------------------
   IMÁGENES DE LAS NAVES (IMG/Nave_02.png, Nave_03..., Nave_5...)
   - Se prueban varias extensiones (png / jpg / jpeg / webp).
   - El fondo blanco, de cuadritos o de color se quita solo al cargar.
   - "rot" = giro para que la nave mire a la IZQUIERDA (donde dispara):
       -90 = la imagen original mira hacia ARRIBA
        90 = la imagen original mira hacia ABAJO
       180 = la imagen original mira a la DERECHA
         0 = la imagen original ya mira a la IZQUIERDA
   - Si no se encuentra ninguna imagen, se usa la nave dibujada en SVG.
   --------------------------------------------------------------------- */
const limpiaNaveLvl2 = {};

function candidatosNaveLvl2(id) {
    const base = NAVES_LVL2[id].img.replace(/\.[a-z0-9]+$/i, "");
    return [base + ".png", base + ".jpg", base + ".jpeg", base + ".webp", base + ".PNG", base + ".JPG"];
}

function fuenteNaveLvl2(id) {
    return limpiaNaveLvl2[id] || svgNaveLvl2(id);
}

function rotNaveLvl2(id) {
    return limpiaNaveLvl2[id] ? NAVES_LVL2[id].rot : 0;
}

function aplicarImagenNaveLvl2(id) {
    const t = selectorLvl2.querySelector('.TarjetaNaveLvl2[data-nave="' + id + '"] img');
    if (t) {
        t.src = fuenteNaveLvl2(id);
        t.style.rotate = rotNaveLvl2(id) + "deg";
    }
    if (naveActualLvl2 === id) {
        naveJugadorLvl2.src = fuenteNaveLvl2(id);
        naveJugadorLvl2.style.transform = "translate(-50%,-50%) rotate(" + (rotNaveLvl2(id) + inclinacionLvl2).toFixed(1) + "deg)";
    }
}

/* Quita el fondo: parte desde los bordes y borra lo que se parezca a los colores del borde */
function quitarFondoNaveLvl2(img) {
    const lado = 384;
    const esc = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(2, Math.round(img.naturalWidth * esc));
    const h = Math.max(2, Math.round(img.naturalHeight * esc));
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, w, h);
    const datos = cx.getImageData(0, 0, w, h);   // si el navegador lo bloquea, lanza error y se usa la imagen tal cual
    const d = datos.data;

    // ¿ya es transparente en las esquinas? entonces no hay nada que quitar
    const esquinas = [0, (w - 1), (h - 1) * w, h * w - 1];
    if (esquinas.every(function (p) { return d[p * 4 + 3] < 40; })) return cv;

    function dist(a, b) {
        return Math.abs(d[a] - d[b]) + Math.abs(d[a + 1] - d[b + 1]) + Math.abs(d[a + 2] - d[b + 2]);
    }

    // Colores dominantes del borde (para tableros de cuadritos suelen ser 2)
    const cubos = {};
    function anotar(p) {
        const k = (d[p * 4] >> 4) + "," + (d[p * 4 + 1] >> 4) + "," + (d[p * 4 + 2] >> 4);
        const c = cubos[k] || (cubos[k] = { n: 0, i: p * 4 });
        c.n++;
    }
    let total = 0;
    for (let x = 0; x < w; x++) { anotar(x); anotar((h - 1) * w + x); total += 2; }
    for (let y = 1; y < h - 1; y++) { anotar(y * w); anotar(y * w + w - 1); total += 2; }
    const paleta = Object.keys(cubos).map(function (k) { return cubos[k]; })
        .filter(function (c) { return c.n > total * 0.03; }).map(function (c) { return c.i; });

    const fuera = new Uint8Array(w * h);
    const pila = [];
    function intentar(p, desde) {
        if (fuera[p]) return;
        const i = p * 4;
        let ok = d[i + 3] < 40;
        if (!ok) {
            for (let k = 0; k < paleta.length; k++) if (dist(i, paleta[k]) <= 60) { ok = true; break; }
        }
        if (!ok && desde >= 0 && dist(i, desde * 4) <= 14) ok = true;   // degradados suaves
        if (ok) { fuera[p] = 1; pila.push(p); }
    }
    for (let x = 0; x < w; x++) { intentar(x, -1); intentar((h - 1) * w + x, -1); }
    for (let y = 0; y < h; y++) { intentar(y * w, -1); intentar(y * w + w - 1, -1); }
    while (pila.length) {
        const p = pila.pop();
        const x = p % w, y = (p / w) | 0;
        if (x > 0) intentar(p - 1, p);
        if (x < w - 1) intentar(p + 1, p);
        if (y > 0) intentar(p - w, p);
        if (y < h - 1) intentar(p + w, p);
    }

    // Huecos interiores del mismo tablero (entre alas): colores de la paleta, zonas grandes
    // (se detectan como regiones de color de fondo que no tocan el borde)
    const vis = new Uint8Array(w * h);
    for (let p0 = 0; p0 < w * h; p0++) {
        if (fuera[p0] || vis[p0]) continue;
        const i0 = p0 * 4;
        let esFondo = false;
        for (let k = 0; k < paleta.length; k++) if (dist(i0, paleta[k]) <= 30) { esFondo = true; break; }
        if (!esFondo) continue;
        const cola = [p0]; vis[p0] = 1;
        const region = [];
        while (cola.length) {
            const p = cola.pop(); region.push(p);
            const x = p % w, y = (p / w) | 0;
            const vecinos = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
            for (let v = 0; v < 4; v++) {
                const q = vecinos[v];
                if (q < 0 || vis[q] || fuera[q]) continue;
                let ok = false;
                for (let k = 0; k < paleta.length; k++) if (dist(q * 4, paleta[k]) <= 30) { ok = true; break; }
                if (ok) { vis[q] = 1; cola.push(q); }
            }
        }
        if (region.length > 120) region.forEach(function (p) { fuera[p] = 1; });
    }

    // Borrar y suavizar el borde (quita el halo claro)
    const copia = new Uint8Array(fuera);
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const p = y * w + x;
            if (copia[p]) continue;
            if (copia[p - 1] || copia[p + 1] || copia[p - w] || copia[p + w]) {
                let cerca = false;
                for (let k = 0; k < paleta.length; k++) if (dist(p * 4, paleta[k]) <= 110) { cerca = true; break; }
                if (cerca) d[p * 4 + 3] = 90;
            }
        }
    }
    for (let p = 0; p < w * h; p++) if (fuera[p]) d[p * 4 + 3] = 0;

    // Quitar motas sueltas (estrellas, restos del fondo): se conservan solo las piezas grandes
    const comp = new Int32Array(w * h);
    const tamanos = [0];
    let nComp = 0;
    for (let p0 = 0; p0 < w * h; p0++) {
        if (comp[p0] || d[p0 * 4 + 3] === 0) continue;
        nComp++;
        let tam = 0;
        const st = [p0]; comp[p0] = nComp;
        while (st.length) {
            const p = st.pop(); tam++;
            const x = p % w, y = (p / w) | 0;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                const q = ny * w + nx;
                if (!comp[q] && d[q * 4 + 3] !== 0) { comp[q] = nComp; st.push(q); }
            }
        }
        tamanos.push(tam);
    }
    const mayor = Math.max.apply(null, tamanos);
    for (let p = 0; p < w * h; p++) {
        if (comp[p] && tamanos[comp[p]] < mayor * 0.02) d[p * 4 + 3] = 0;
    }
    cx.putImageData(datos, 0, 0);

    // Recortar a la nave y dejarla en un cuadrado
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 < 0) return cv;
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1, s = Math.max(cw, ch);
    const sal = document.createElement("canvas");
    sal.width = s; sal.height = s;
    sal.getContext("2d").drawImage(cv, x0, y0, cw, ch, (s - cw) / 2, (s - ch) / 2, cw, ch);
    return sal;
}

function cargarNaveLvl2(id, indice) {
    const lista = candidatosNaveLvl2(id);
    if (indice >= lista.length) return;           // no hay imagen: se queda el SVG
    const im = new Image();
    im.onload = function () {
        try {
            limpiaNaveLvl2[id] = quitarFondoNaveLvl2(im).toDataURL("image/png");
        } catch (e) {
            limpiaNaveLvl2[id] = im.src;          // no se pudo limpiar: se usa tal cual
        }
        aplicarImagenNaveLvl2(id);
    };
    im.onerror = function () { cargarNaveLvl2(id, indice + 1); };
    im.src = lista[indice];
}

function precargarNavesLvl2() {
    ORDEN_NAVES_LVL2.forEach(function (id) { cargarNaveLvl2(id, 0); });
}

function svgNaveLvl2(id) {
    if (cacheSvgNavesLvl2[id]) return cacheSvgNavesLvl2[id];
    const c = NAVES_LVL2[id].paleta;
    let cuerpo = "";
    let llama = "";

    if (id === "interceptor") {
        cuerpo =
            '<polygon points="52,30 80,4 96,4 88,32" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<polygon points="52,40 80,66 96,66 88,38" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<path d="M4 35 L36 27 L94 25 L104 29 L104 41 L94 45 L36 43 Z" fill="url(#b)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<rect x="66" y="33.2" width="30" height="3.6" fill="' + c.acento + '" opacity=".9"/>' +
            '<ellipse cx="44" cy="35" rx="14" ry="4.8" fill="url(#c)" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>' +
            '<rect x="102" y="28" width="5" height="14" rx="1.5" fill="#1d2a40"/>';
        llama = ["106,30 118,35 106,40", "106,31 128,35 106,39"];
    } else if (id === "relampago") {
        cuerpo =
            '<polygon points="74,31 46,8 56,5 92,30" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<polygon points="74,39 46,62 56,65 92,40" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<polygon points="96,30 112,12 114,17 104,31" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<polygon points="96,40 112,58 114,53 104,39" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<path d="M2 35 L42 31 L100 29 L108 32 L108 38 L100 41 L42 39 Z" fill="url(#b)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<rect x="70" y="33.5" width="28" height="3" fill="' + c.acento + '"/>' +
            '<ellipse cx="58" cy="35" rx="11" ry="3.3" fill="url(#c)" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>' +
            '<rect x="106" y="29" width="4" height="12" rx="1" fill="#26361a"/>';
        llama = ["110,31 120,35 110,39", "110,32 130,35 110,38"];
    } else if (id === "titan") {
        cuerpo =
            '<rect x="30" y="2.5" width="42" height="5" rx="2" fill="#3a3f4d"/>' +
            '<rect x="30" y="62.5" width="42" height="5" rx="2" fill="#3a3f4d"/>' +
            '<polygon points="48,22 66,5 102,5 98,24" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<polygon points="48,48 66,65 102,65 98,46" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<rect x="0" y="29.5" width="24" height="4" rx="1.5" fill="#2e323d"/>' +
            '<rect x="0" y="36.5" width="24" height="4" rx="1.5" fill="#2e323d"/>' +
            '<path d="M8 29 L28 22 L94 20 L106 26 L106 44 L94 50 L28 48 L8 41 Z" fill="url(#b)" stroke="' + c.oscuro + '" stroke-width=".9"/>' +
            '<rect x="64" y="27" width="4" height="16" fill="' + c.oscuro + '" opacity=".55"/>' +
            '<rect x="74" y="25" width="4" height="20" fill="' + c.oscuro + '" opacity=".55"/>' +
            '<rect x="84" y="24" width="4" height="22" fill="' + c.oscuro + '" opacity=".55"/>' +
            '<rect x="34" y="30" width="24" height="10" rx="5" fill="url(#c)" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>' +
            '<rect x="104" y="24" width="6" height="22" rx="1.5" fill="#2b1a14"/>';
        llama = ["110,27 120,35 110,43", "110,26 130,35 110,44"];
    } else {
        cuerpo =
            '<path d="M56 28 C70 12 90 3 112 3 C100 13 96 22 98 30 Z" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<path d="M56 42 C70 58 90 67 112 67 C100 57 96 48 98 40 Z" fill="url(#w)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<path d="M4 35 L38 28 L70 25 L102 30 L102 40 L70 45 L38 42 Z" fill="url(#b)" stroke="' + c.oscuro + '" stroke-width=".8"/>' +
            '<circle cx="82" cy="35" r="8" fill="' + c.acento + '" opacity=".25"/>' +
            '<circle cx="82" cy="35" r="4.2" fill="' + c.acento + '"/>' +
            '<ellipse cx="42" cy="35" rx="11" ry="3.2" fill="url(#c)" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>' +
            '<rect x="100" y="30" width="4" height="10" rx="1" fill="#241038"/>';
        llama = ["104,31 118,35 104,39", "104,32 130,35 104,38"];
    }

    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 70">' +
        '<defs>' +
        '<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.claro + '"/><stop offset=".55" stop-color="' + c.medio + '"/><stop offset="1" stop-color="' + c.oscuro + '"/></linearGradient>' +
        '<linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c.medio + '"/><stop offset="1" stop-color="' + c.oscuro + '"/></linearGradient>' +
        '<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0fdff"/><stop offset="1" stop-color="' + c.cabina + '"/></linearGradient>' +
        '<linearGradient id="f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="' + c.fuego + '"/><stop offset="1" stop-color="' + c.fuego + '" stop-opacity="0"/></linearGradient>' +
        '</defs>' +
        '<polygon fill="url(#f)" points="' + llama[0] + '"><animate attributeName="points" dur=".16s" repeatCount="indefinite" values="' + llama[0] + ";" + llama[1] + ";" + llama[0] + '"/></polygon>' +
        cuerpo +
        '</svg>';

    cacheSvgNavesLvl2[id] = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    return cacheSvgNavesLvl2[id];
}

/* ---------------------------------------------------------------------
   ESTADO DE LA PARTIDA
   --------------------------------------------------------------------- */
let naveActualLvl2 = "interceptor";
try {
    const guardada = localStorage.getItem("ironfist_nave");
    if (guardada && NAVES_LVL2[guardada]) naveActualLvl2 = guardada;
} catch (e) { /* sin almacenamiento: se usa la nave por defecto */ }

let meteorosLvl2 = [];
let lasersLvl2 = [];
let itemsLvl2 = [];

let rafLvl2 = null;
let ultimoTsLvl2 = 0;
let tJuegoLvl2 = 0;
let proximoSpawnLvl2 = 1;
let acumSpawnLvl2 = 0;

let ratonLvl2 = { x: 0, y: 0, dentro: false };
let ratonPrevYLvl2 = 0;
let inclinacionLvl2 = 0;
let mantenidoLvl2 = false;
let proximoDisparoLvl2 = 0;

let comboLvl2 = 0;
let ultimoKillLvl2 = -99;

let escudoLvl2 = false;
let trepleHastaLvl2 = 0;
let lentaHastaLvl2 = 0;
let estadisticasLvl2 = { disparos: 0, aciertos: 0, destruidos: 0, comboMax: 0 };
let ultimoHtmlEfectosLvl2 = "";

/* ---------------------------------------------------------------------
   SONIDO (se genera con WebAudio, no necesita archivos)
   --------------------------------------------------------------------- */
let ctxAudioLvl2 = null;
let gananciaLvl2 = null;
let volumenLvl2 = 0.45;
{
    const slider = document.getElementById("VolumenLvl2");
    if (slider) volumenLvl2 = parseFloat(slider.value);
}

function audioLvl2() {
    try {
        if (!ctxAudioLvl2) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            ctxAudioLvl2 = new AC();
            gananciaLvl2 = ctxAudioLvl2.createGain();
            gananciaLvl2.gain.value = volumenLvl2;
            gananciaLvl2.connect(ctxAudioLvl2.destination);
        }
        if (ctxAudioLvl2.state === "suspended") ctxAudioLvl2.resume();
        return ctxAudioLvl2;
    } catch (e) {
        return null;
    }
}

function tonoLvl2(f0, dur, tipo, vol, f1, retardo) {
    const ctx = audioLvl2();
    if (!ctx) return;
    const t = ctx.currentTime + (retardo || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tipo || "square";
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(gananciaLvl2);
    o.start(t);
    o.stop(t + dur + 0.03);
}

function ruidoLvl2(dur, vol, corte) {
    const ctx = audioLvl2();
    if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const fuente = ctx.createBufferSource();
    fuente.buffer = buf;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = corte || 1200;
    const g = ctx.createGain();
    g.gain.value = vol;
    fuente.connect(filtro);
    filtro.connect(g);
    g.connect(gananciaLvl2);
    fuente.start();
}

const sfxLvl2 = {
    laser: function (id) {
        if (id === "relampago") tonoLvl2(1500, 0.07, "sawtooth", 0.06, 600);
        else if (id === "titan") tonoLvl2(320, 0.24, "square", 0.1, 80);
        else tonoLvl2(950, 0.12, "sawtooth", 0.07, 300);
    },
    golpe: function () { tonoLvl2(220, 0.08, "square", 0.08, 120); },
    explosion: function () { ruidoLvl2(0.42, 0.32, 900); tonoLvl2(130, 0.3, "sine", 0.22, 40); },
    impacto: function () { ruidoLvl2(0.7, 0.5, 420); tonoLvl2(90, 0.55, "sine", 0.4, 30); },
    item: function () { tonoLvl2(520, 0.1, "triangle", 0.16); tonoLvl2(660, 0.1, "triangle", 0.16, 0, 0.09); tonoLvl2(880, 0.18, "triangle", 0.16, 0, 0.18); },
    escudo: function () { tonoLvl2(300, 0.35, "sine", 0.25, 1000); },
    alarma: function (urgente) { tonoLvl2(urgente ? 1100 : 820, 0.09, "square", 0.1); },
    conteo: function (final) { if (final) tonoLvl2(880, 0.4, "square", 0.15, 1400); else tonoLvl2(440, 0.18, "square", 0.14); },
    combo: function (n) { tonoLvl2(560 + n * 55, 0.13, "triangle", 0.14); },
    elegir: function () { tonoLvl2(660, 0.07, "square", 0.09, 990); }
};

/* ---------------------------------------------------------------------
   UTILIDADES
   --------------------------------------------------------------------- */
function tipoNaveLvl2() {
    return NAVES_LVL2[naveActualLvl2];
}

function escalaLvl2(ancho) {
    return Math.max(0.85, Math.min(1.5, ancho / 1000));
}

function centroPlanetaLvl2() {
    return {
        x: planetaLvl2.offsetLeft + planetaLvl2.offsetWidth / 2,
        y: planetaLvl2.offsetTop + planetaLvl2.offsetHeight / 2,
        r: (planetaLvl2.offsetWidth / 2) * 0.88
    };
}

/* El escudo rodea al PLANETA: frena los meteoritos antes de que lo toquen */
function posicionarEscudoLvl2() {
    const pl = centroPlanetaLvl2();
    const radio = (pl.r / 0.88) * 1.28;
    anilloEscudoLvl2.style.width = (radio * 2) + "px";
    anilloEscudoLvl2.style.left = pl.x + "px";
    anilloEscudoLvl2.style.top = pl.y + "px";
}

function distSegPuntoLvl2(x1, y1, x2, y2, px, py) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function guardarLvl2(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* ignorar */ }
}

function leerLvl2(clave) {
    try {
        const v = localStorage.getItem(clave);
        return v ? JSON.parse(v) : null;
    } catch (e) {
        return null;
    }
}

/* ---------------------------------------------------------------------
   CAPAS DE FONDO Y ELEMENTOS DE HUD DENTRO DEL TABLERO
   --------------------------------------------------------------------- */
["c1", "c2", "c3"].forEach(function (capa) {
    const e = document.createElement("div");
    e.className = "EstrellasCapaLvl2 " + capa;
    tableroLvl2.insertBefore(e, tableroLvl2.firstChild);
});

const barraProgresoLvl2 = document.createElement("div");
barraProgresoLvl2.className = "BarraProgresoLvl2";
barraProgresoLvl2.innerHTML = '<div class="RellenoProgresoLvl2"></div>';
tableroLvl2.appendChild(barraProgresoLvl2);
const rellenoProgresoLvl2 = barraProgresoLvl2.firstChild;

const efectosHudLvl2 = document.createElement("div");
efectosHudLvl2.className = "EfectosLvl2";
tableroLvl2.appendChild(efectosHudLvl2);

const comboHudLvl2 = document.createElement("div");
comboHudLvl2.className = "ComboLvl2";
tableroLvl2.appendChild(comboHudLvl2);

/* Llama del propulsor: sigue a la nave (sirve para cualquier imagen) */
const propulsorLvl2 = document.createElement("div");
propulsorLvl2.className = "PropulsorLvl2";
tableroLvl2.insertBefore(propulsorLvl2, naveJugadorLvl2);

function sincronizarPropulsorLvl2() {
    propulsorLvl2.style.left = naveJugadorLvl2.style.left;
    propulsorLvl2.style.top = naveJugadorLvl2.style.top;
    propulsorLvl2.style.opacity = naveJugadorLvl2.style.opacity === "1" ? "1" : "0";
    propulsorLvl2.style.setProperty("--an", (naveJugadorLvl2.offsetWidth || 60) + "px");
    propulsorLvl2.style.setProperty("--cn", NAVES_LVL2[naveActualLvl2].color);
    propulsorLvl2.style.transform = "rotate(" + inclinacionLvl2.toFixed(1) + "deg)";
}
new MutationObserver(sincronizarPropulsorLvl2).observe(naveJugadorLvl2, { attributes: true, attributeFilter: ["style", "src"] });

const anilloEscudoLvl2 = document.createElement("div");
anilloEscudoLvl2.className = "AnilloEscudoLvl2";
tableroLvl2.appendChild(anilloEscudoLvl2);

/* ---------------------------------------------------------------------
   MENÚ DE SELECCIÓN DE NAVES
   --------------------------------------------------------------------- */
const selectorLvl2 = document.createElement("div");
selectorLvl2.className = "SelectorNavesLvl2";
selectorLvl2.id = "SelectorNavesLvl2";

(function construirSelector() {
    function pips(n) {
        let h = "";
        for (let i = 1; i <= 5; i++) h += '<i class="' + (i <= n ? "on" : "") + '"></i>';
        return h;
    }

    let tarjetas = "";
    ORDEN_NAVES_LVL2.forEach(function (id, indice) {
        const n = NAVES_LVL2[id];
        tarjetas +=
            '<button type="button" class="TarjetaNaveLvl2" data-nave="' + id + '" style="--c:' + n.color + '" aria-pressed="false">' +
            '<span class="TeclaNaveLvl2">' + (indice + 1) + '</span>' +
            '<img src="' + svgNaveLvl2(id) + '" alt="Nave ' + n.nombre + '" draggable="false">' +
            '<strong>' + n.nombre + '</strong>' +
            '<em>' + n.etiqueta + '</em>' +
            '<div class="StatsNaveLvl2">' +
            '<span>PODER</span><b>' + pips(n.stats.poder) + '</b>' +
            '<span>CADENCIA</span><b>' + pips(n.stats.cadencia) + '</b>' +
            '<span>COBERTURA</span><b>' + pips(n.stats.cobertura) + '</b>' +
            '</div></button>';
    });

    selectorLvl2.innerHTML =
        '<p class="TituloSelectorLvl2">ELIGE TU NAVE</p>' +
        '<div class="ListaNavesLvl2">' + tarjetas + '</div>' +
        '<p class="AyudaSelectorLvl2">Teclas 1-3 para elegir · Clic o mantener para disparar · P para pausar</p>';

    const botonJugar = document.getElementById("Playlvl2");
    inicioLvl2.insertBefore(selectorLvl2, botonJugar);
})();

function seleccionarNaveLvl2(id, silencio) {
    if (!NAVES_LVL2[id]) return;
    naveActualLvl2 = id;
    try { localStorage.setItem("ironfist_nave", id); } catch (e) { /* ignorar */ }
    selectorLvl2.querySelectorAll(".TarjetaNaveLvl2").forEach(function (t) {
        t.setAttribute("aria-pressed", t.dataset.nave === id ? "true" : "false");
    });
    naveJugadorLvl2.src = fuenteNaveLvl2(id);
    naveJugadorLvl2.style.transform = "translate(-50%,-50%) rotate(" + (rotNaveLvl2(id) + inclinacionLvl2).toFixed(1) + "deg)";
    naveJugadorLvl2.style.setProperty("--cn", NAVES_LVL2[id].color);
    tableroLvl2.style.setProperty("--cn", NAVES_LVL2[id].color);
    if (!silencio) sfxLvl2.elegir();
}

selectorLvl2.addEventListener("click", function (evento) {
    const tarjeta = evento.target.closest(".TarjetaNaveLvl2");
    if (tarjeta) seleccionarNaveLvl2(tarjeta.dataset.nave);
});

/* ---------------------------------------------------------------------
   MARCADORES
   --------------------------------------------------------------------- */
function ActualizarVidaslvl2() {
    for (let numeroVida = 1; numeroVida <= 3; numeroVida++) {
        const vida = document.getElementById("Vida" + numeroVida + "Lvl2");
        vida.classList.toggle("VidaPerdidaLvl2", numeroVida > Vidaslvl2);
    }
    planetaLvl2.src = imagenesPlanetaLvl2[Math.max(0, Math.min(3, 3 - Vidaslvl2))];
    tableroLvl2.classList.toggle("PeligroLvl2", Vidaslvl2 === 1 && juegoActivoLvl2);
}

function actualizarMarcadoresLvl2() {
    document.getElementById("Tiempolvl2").innerHTML = Tiempolvl2;
    document.getElementById("Puntajelvl2").innerHTML = Puntajelvl2 + " / " + OBJETIVO_LVL2;
    rellenoProgresoLvl2.style.width = Math.min(100, (Puntajelvl2 / OBJETIVO_LVL2) * 100) + "%";
}

/* ---------------------------------------------------------------------
   EFECTOS VISUALES
   --------------------------------------------------------------------- */
function mostrarExplosionLvl2(x, y, tam) {
    const explosion = document.createElement("img");
    explosion.className = "ExplosionMeteoritoLvl2";
    explosion.style.left = x + "px";
    explosion.style.top = y + "px";
    explosion.style.width = (tam || 110) + "px";
    explosion.onerror = function () { explosion.style.visibility = "hidden"; };
    tableroLvl2.appendChild(explosion);

    let cuadro = 1;
    explosion.src = "IMG/explosion_lvl2/Explosion_001.png";
    const animacion = setInterval(function () {
        cuadro++;
        if (cuadro > 10) {
            clearInterval(animacion);
            explosion.remove();
            return;
        }
        explosion.src = "IMG/explosion_lvl2/Explosion_" + String(cuadro).padStart(3, "0") + ".png";
    }, 70);
}

function particulasLvl2(x, y, cantidad, color, fuerza) {
    for (let i = 0; i < cantidad; i++) {
        const p = document.createElement("span");
        p.className = "ParticulaLvl2";
        const ang = Math.random() * Math.PI * 2;
        const dist = (0.4 + Math.random() * 0.6) * (fuerza || 70);
        p.style.left = x + "px";
        p.style.top = y + "px";
        p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
        p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
        if (color) p.style.setProperty("--c", color);
        tableroLvl2.appendChild(p);
        setTimeout(function () { p.remove(); }, 650);
    }
}

function textoFlotanteLvl2(x, y, mensaje, clase) {
    const t = document.createElement("div");
    t.className = "TextoFlotanteLvl2 " + (clase || "");
    t.textContent = mensaje;
    t.style.left = x + "px";
    t.style.top = y + "px";
    tableroLvl2.appendChild(t);
    setTimeout(function () { t.remove(); }, 1000);
}

function sacudirLvl2() {
    tableroLvl2.classList.remove("SacudidaLvl2");
    void tableroLvl2.offsetWidth;
    tableroLvl2.classList.add("SacudidaLvl2");
}

function destelloDisparoLvl2(x, y, color) {
    const d = document.createElement("div");
    d.className = "DestelloLvl2";
    d.style.left = x + "px";
    d.style.top = y + "px";
    d.style.setProperty("--c", color);
    tableroLvl2.appendChild(d);
    setTimeout(function () { d.remove(); }, 160);
}

function mostrarAvisoImpactoLvl2() {
    const avisoAnterior = tableroLvl2.querySelector(".AvisoImpactoLvl2");
    if (avisoAnterior) avisoAnterior.remove();
    if (temporizadorAvisoImpactoLvl2) {
        clearTimeout(temporizadorAvisoImpactoLvl2);
        temporizadorAvisoImpactoLvl2 = null;
    }

    const mensajes = ["¡IMPACTO DETECTADO!", "¡VIDA PERDIDA!"];
    const aviso = document.createElement("div");
    aviso.className = "AvisoImpactoLvl2";
    aviso.textContent = mensajes[Math.floor(Math.random() * mensajes.length)];
    tableroLvl2.appendChild(aviso);

    temporizadorAvisoImpactoLvl2 = setTimeout(function () {
        aviso.remove();
        temporizadorAvisoImpactoLvl2 = null;
    }, 1000);
}

function efectoImpactoPlanetaLvl2() {
    planetaLvl2.classList.remove("ImpactoPlanetaLvl2");
    void planetaLvl2.offsetWidth;
    planetaLvl2.classList.add("ImpactoPlanetaLvl2");

    if (temporizadorDestelloPlanetaLvl2) clearTimeout(temporizadorDestelloPlanetaLvl2);
    temporizadorDestelloPlanetaLvl2 = setTimeout(function () {
        planetaLvl2.classList.remove("ImpactoPlanetaLvl2");
        temporizadorDestelloPlanetaLvl2 = null;
    }, 450);
}

/* ---------------------------------------------------------------------
   METEORITOS (3 tipos: normal, rápido, grande)
   --------------------------------------------------------------------- */
const TIPOS_METEORITO_LVL2 = {
    normal: { tam: 66, dur: 6.5, hp: 1, pts: 1 },
    rapido: { tam: 44, dur: 3.8, hp: 1, pts: 1 },
    grande: { tam: 104, dur: 9.5, hp: 2, pts: 2 }
};

function elegirTipoLvl2() {
    const r = Math.random();
    if (tJuegoLvl2 > 12 && r < 0.16) return "grande";
    if (tJuegoLvl2 > 6 && r < 0.42) return "rapido";
    return "normal";
}

function dificultadLvl2() {
    return Math.max(0.72, 1 - tJuegoLvl2 * 0.0045) * (Puntajelvl2 >= 20 ? 0.88 : 1);
}

function maxMeteoritosLvl2() {
    return 3 + (Puntajelvl2 >= 8 ? 1 : 0) + (Puntajelvl2 >= 16 ? 1 : 0) + (Puntajelvl2 >= 21 ? 1 : 0);
}

function calcularSpawnLvl2() {
    let base = Math.max(1.05, 1.9 - tJuegoLvl2 * 0.0135);
    if (Puntajelvl2 >= 20) base *= 0.7; // oleada final
    return base * (0.85 + Math.random() * 0.3);
}

function crearMeteoritoLvl2(W, H) {
    const clave = elegirTipoLvl2();
    const tipo = TIPOS_METEORITO_LVL2[clave];
    const tam = tipo.tam * escalaLvl2(W);

    const x0 = -tam;
    const y0 = tam * 0.6 + Math.random() * Math.max(10, H - tam * 1.2);

    const pl = centroPlanetaLvl2();
    const ang = Math.random() * Math.PI * 2;
    const rr = Math.random() * pl.r * 0.6;
    const tx = pl.x + Math.cos(ang) * rr;
    const ty = pl.y + Math.sin(ang) * rr;
    const dur = tipo.dur * dificultadLvl2();
    const vx = (tx - x0) / dur;
    const vy = (ty - y0) / dur;

    const el = document.createElement("div");
    el.className = "MeteoritoLvl2 " + clave;
    el.style.width = tam + "px";
    el.style.height = tam + "px";

    const estela = document.createElement("span");
    estela.className = "EstelaLvl2";
    estela.style.width = tam * 1.9 + "px";
    estela.style.height = tam * 0.55 + "px";
    estela.style.transform = "translateY(-50%) rotate(" + (Math.atan2(vy, vx) * 180 / Math.PI) + "deg)";

    const img = document.createElement("img");
    img.src = "IMG/Metiorito.png";
    img.alt = "";
    img.draggable = false;

    el.appendChild(estela);
    el.appendChild(img);
    tableroLvl2.appendChild(el);

    meteorosLvl2.push({
        el: el, img: img, x: x0, y: y0, vx: vx, vy: vy, tam: tam, r: tam * 0.42,
        hp: tipo.hp, pts: tipo.pts, giro: (Math.random() * 2 - 1) * 120,
        rot: Math.random() * 360, muerto: false
    });
}

function quitarMeteoritoLvl2(m) {
    m.muerto = true;
    m.el.remove();
    const i = meteorosLvl2.indexOf(m);
    if (i >= 0) meteorosLvl2.splice(i, 1);
}

function detenerMeteoritosLvl2() {
    meteorosLvl2.slice().forEach(quitarMeteoritoLvl2);
    meteorosLvl2 = [];
}

function destruirMeteoritoLvl2(m) {
    if (m.muerto || !juegoActivoLvl2 || pausadoLvl2 || Vidaslvl2 <= 0) return;

    const x = m.x;
    const y = m.y;
    quitarMeteoritoLvl2(m);
    estadisticasLvl2.destruidos++;

    // Combo: matar varios seguidos (menos de 2.2 s entre uno y otro)
    if (tJuegoLvl2 - ultimoKillLvl2 <= 2.2) comboLvl2++; else comboLvl2 = 1;
    ultimoKillLvl2 = tJuegoLvl2;
    estadisticasLvl2.comboMax = Math.max(estadisticasLvl2.comboMax, comboLvl2);

    let ganados = m.pts;
    let bonus = 0;
    if (comboLvl2 % 5 === 0) bonus = 1; // cada 5 seguidos: +1 punto extra
    ganados += bonus;
    ganados = Math.min(ganados, OBJETIVO_LVL2 - Puntajelvl2);
    Puntajelvl2 += ganados;
    actualizarMarcadoresLvl2();

    try {
        const snd = document.getElementById("Puntos_sound");
        snd.currentTime = 0;
        snd.play().catch(function () {});
    } catch (e) { /* ignorar */ }
    sfxLvl2.explosion();

    mostrarExplosionLvl2(x, y, m.tam * 1.7);
    particulasLvl2(x, y, m.pts > 1 ? 16 : 10, "#ffb347", m.tam * 1.1);
    textoFlotanteLvl2(x, y - m.tam * 0.4, "+" + (m.pts), "");

    if (comboLvl2 >= 2) {
        sfxLvl2.combo(comboLvl2);
        comboHudLvl2.textContent = "COMBO x" + comboLvl2;
        comboHudLvl2.classList.remove("visible");
        void comboHudLvl2.offsetWidth;
        comboHudLvl2.classList.add("visible");
    }
    if (bonus) textoFlotanteLvl2(x, y - m.tam * 0.9, "¡BONUS +1!", "bonus");

    // A veces suelta un power-up
    if (Math.random() < 0.13 && itemsLvl2.length < 2) soltarItemLvl2(x, y);

    if (Puntajelvl2 >= OBJETIVO_LVL2) ganarLvl2();
}

function danarMeteoritoLvl2(m, dano, volley) {
    if (m.muerto) return;
    if (volley && !volley.acierto) {
        volley.acierto = true;
        estadisticasLvl2.aciertos++;
    }
    m.hp -= dano;
    if (m.hp <= 0) {
        destruirMeteoritoLvl2(m);
    } else {
        m.el.classList.add("GolpeLvl2", "DanadoLvl2");
        setTimeout(function () { m.el.classList.remove("GolpeLvl2"); }, 90);
        particulasLvl2(m.x, m.y, 5, "#ffffff", m.tam * 0.7);
        sfxLvl2.golpe();
    }
}

function actualizarMeteoritosLvl2(dt, W, H) {
    const pl = centroPlanetaLvl2();
    const radioImpacto = escudoLvl2 ? (pl.r / 0.88) * 1.28 : pl.r;
    if (escudoLvl2) posicionarEscudoLvl2();
    const lista = meteorosLvl2.slice();
    for (let i = 0; i < lista.length; i++) {
        const m = lista[i];
        if (m.muerto) continue;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.rot += m.giro * dt;
        m.el.style.transform = "translate(" + (m.x - m.tam / 2) + "px," + (m.y - m.tam / 2) + "px)";
        m.img.style.transform = "rotate(" + m.rot + "deg)";

        if (Math.hypot(m.x - pl.x, m.y - pl.y) <= radioImpacto + m.r * 0.8) {
            impactarPlanetaLvl2(m);
            if (!juegoActivoLvl2) return;
        } else if (m.x > W + 250 || m.y > H + 250 || m.y < -250) {
            quitarMeteoritoLvl2(m);
        }
    }
}

function impactarPlanetaLvl2(m) {
    const x = m.x;
    const y = m.y;
    quitarMeteoritoLvl2(m);
    mostrarExplosionLvl2(x, y, m.tam * 1.7);
    comboLvl2 = 0;

    if (escudoLvl2) {
        escudoLvl2 = false;
        anilloEscudoLvl2.classList.remove("visible");
        sfxLvl2.escudo();
        textoFlotanteLvl2(x, y - 20, "¡ESCUDO ROTO!", "item");
        particulasLvl2(x, y, 12, "#6fe9ff", 80);
        return;
    }

    Vidaslvl2--;
    ActualizarVidaslvl2();
    sfxLvl2.impacto();
    sacudirLvl2();
    efectoImpactoPlanetaLvl2();
    particulasLvl2(x, y, 14, "#ff5a3a", 90);

    const sinVidas = Vidaslvl2 <= 0;
    if (!sinVidas) mostrarAvisoImpactoLvl2();
    if (sinVidas) perderLvl2("vidas");
}

/* ---------------------------------------------------------------------
   DISPARO
   --------------------------------------------------------------------- */
function angulosActualesLvl2() {
    const nave = tipoNaveLvl2();
    if (tJuegoLvl2 < trepleHastaLvl2) {
        return [-10, 0, 10];
    }
    return nave.angulos;
}

function dispararLvl2() {
    if (!juegoActivoLvl2 || pausadoLvl2) return;
    if (tJuegoLvl2 < proximoDisparoLvl2) return;
    const nave = tipoNaveLvl2();
    proximoDisparoLvl2 = tJuegoLvl2 + nave.cadencia;

    const anchoNave = naveJugadorLvl2.offsetWidth || 60;
    const x0 = ratonLvl2.x - anchoNave * 0.5;
    const y0 = ratonLvl2.y;

    const volley = { acierto: false };
    estadisticasLvl2.disparos++;
    sfxLvl2.laser(naveActualLvl2);
    destelloDisparoLvl2(x0, y0, nave.color);

    // Disparo a quemarropa: si ya hay un meteorito bajo la nave, recibe el golpe de inmediato
    for (let i = 0; i < meteorosLvl2.length; i++) {
        const m = meteorosLvl2[i];
        if (Math.hypot(m.x - ratonLvl2.x, m.y - ratonLvl2.y) <= m.r + anchoNave * 0.3) {
            danarMeteoritoLvl2(m, nave.dano, volley);
            break;
        }
    }
    if (!juegoActivoLvl2) return; // el disparo a quemarropa pudo terminar la partida

    angulosActualesLvl2().forEach(function (ang) {
        const el = document.createElement("div");
        el.className = "LaserLvl2";
        el.style.width = nave.lw + "px";
        el.style.height = nave.lh + "px";
        el.style.setProperty("--c", nave.color);
        tableroLvl2.appendChild(el);

        const rad = (180 + ang) * Math.PI / 180;
        lasersLvl2.push({
            el: el, x: x0, y: y0, px: x0, py: y0,
            vx: Math.cos(rad) * nave.velocidad, vy: Math.sin(rad) * nave.velocidad,
            ang: ang, w: nave.lw, h: nave.lh, dano: nave.dano,
            atraviesa: nave.atraviesa, golpeados: [], volley: volley
        });
    });
}

function limpiarLasersLvl2() {
    lasersLvl2.forEach(function (l) { l.el.remove(); });
    lasersLvl2 = [];
}

function actualizarLasersLvl2(dt, W, H) {
    for (let i = lasersLvl2.length - 1; i >= 0; i--) {
        const l = lasersLvl2[i];
        l.px = l.x;
        l.py = l.y;
        l.x += l.vx * dt;
        l.y += l.vy * dt;

        let eliminado = false;
        for (let j = 0; j < meteorosLvl2.length; j++) {
            const m = meteorosLvl2[j];
            if (m.muerto || l.golpeados.indexOf(m) >= 0) continue;
            if (distSegPuntoLvl2(l.px, l.py, l.x, l.y, m.x, m.y) <= m.r + l.h * 0.5 + 2) {
                l.golpeados.push(m);
                danarMeteoritoLvl2(m, l.dano, l.volley);
                if (!juegoActivoLvl2) return;
                if (l.atraviesa > 0) {
                    l.atraviesa--;
                } else {
                    eliminado = true;
                    break;
                }
            }
        }

        if (eliminado || l.x < -80 || l.y < -80 || l.y > H + 80) {
            l.el.remove();
            lasersLvl2.splice(i, 1);
        } else {
            l.el.style.transform =
                "translate(" + (l.x - l.w / 2) + "px," + (l.y - l.h / 2) + "px) rotate(" + l.ang + "deg)";
        }
    }
}

/* ---------------------------------------------------------------------
   POWER-UPS
   --------------------------------------------------------------------- */
const ICONOS_ITEM_LVL2 = {
    escudo: '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z" fill="currentColor"/></svg>',
    triple: '<svg viewBox="0 0 24 24"><path d="M2 12h14M3 6l13 3M3 18l13-3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
    lenta: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>'
};
const COLOR_ITEM_LVL2 = { escudo: "#6fe9ff", triple: "#ffd54a", lenta: "#c58bff" };

function soltarItemLvl2(x, y) {
    const tipos = ["escudo", "triple", "lenta"];
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const el = document.createElement("div");
    el.className = "ItemLvl2";
    el.style.setProperty("--c", COLOR_ITEM_LVL2[tipo]);
    el.innerHTML = ICONOS_ITEM_LVL2[tipo];
    tableroLvl2.appendChild(el);
    itemsLvl2.push({ el: el, tipo: tipo, x: x, y: y, edad: 0, fase: Math.random() * 6 });
}

function activarItemLvl2(it) {
    sfxLvl2.item();
    if (it.tipo === "escudo") {
        escudoLvl2 = true;
        posicionarEscudoLvl2();
        anilloEscudoLvl2.classList.add("visible");
        textoFlotanteLvl2(it.x, it.y - 20, "ESCUDO DEL PLANETA", "item");
    } else if (it.tipo === "triple") {
        trepleHastaLvl2 = tJuegoLvl2 + 8;
        textoFlotanteLvl2(it.x, it.y - 20, "DISPARO MÚLTIPLE", "item");
    } else {
        lentaHastaLvl2 = tJuegoLvl2 + 5;
        textoFlotanteLvl2(it.x, it.y - 20, "CÁMARA LENTA", "item");
    }
}

function actualizarItemsLvl2(dt, W, H) {
    for (let i = itemsLvl2.length - 1; i >= 0; i--) {
        const it = itemsLvl2[i];
        it.edad += dt;
        it.x += 28 * dt;
        it.y += Math.sin(it.edad * 3 + it.fase) * 22 * dt;
        it.el.style.transform = "translate(" + (it.x - 19) + "px," + (it.y - 19) + "px)";
        it.el.classList.toggle("parpadeo", it.edad > 6.5);

        const recogido = ratonLvl2.dentro && Math.hypot(it.x - ratonLvl2.x, it.y - ratonLvl2.y) < 46;
        if (recogido) {
            activarItemLvl2(it);
            it.el.remove();
            itemsLvl2.splice(i, 1);
        } else if (it.edad > 8.5 || it.x > W + 40) {
            it.el.remove();
            itemsLvl2.splice(i, 1);
        }
    }
}

function actualizarEfectosHudLvl2() {
    let html = "";
    if (escudoLvl2) html += '<span class="ChipEfectoLvl2" style="--c:#6fe9ff">ESCUDO</span>';
    if (tJuegoLvl2 < trepleHastaLvl2) html += '<span class="ChipEfectoLvl2" style="--c:#ffd54a">MÚLTIPLE ' + Math.ceil(trepleHastaLvl2 - tJuegoLvl2) + 's</span>';
    if (tJuegoLvl2 < lentaHastaLvl2) html += '<span class="ChipEfectoLvl2" style="--c:#c58bff">LENTA ' + Math.ceil(lentaHastaLvl2 - tJuegoLvl2) + 's</span>';
    if (html !== ultimoHtmlEfectosLvl2) {
        efectosHudLvl2.innerHTML = html;
        ultimoHtmlEfectosLvl2 = html;
    }
    tableroLvl2.classList.toggle("ModoLentoLvl2", tJuegoLvl2 < lentaHastaLvl2);
    if (tJuegoLvl2 - ultimoKillLvl2 > 2.2) comboHudLvl2.classList.remove("visible");
}

/* ---------------------------------------------------------------------
   BUCLE PRINCIPAL
   --------------------------------------------------------------------- */
function bucleLvl2(ts) {
    rafLvl2 = requestAnimationFrame(bucleLvl2);
    if (!ultimoTsLvl2) ultimoTsLvl2 = ts;
    const dt = Math.min(0.05, (ts - ultimoTsLvl2) / 1000);
    ultimoTsLvl2 = ts;
    if (!juegoActivoLvl2 || pausadoLvl2) return;

    tJuegoLvl2 += dt;
    const W = tableroLvl2.clientWidth;
    const H = tableroLvl2.clientHeight;
    const factor = tJuegoLvl2 < lentaHastaLvl2 ? 0.4 : 1;

    acumSpawnLvl2 += dt * factor;
    if (acumSpawnLvl2 >= proximoSpawnLvl2) {
        acumSpawnLvl2 = 0;
        proximoSpawnLvl2 = calcularSpawnLvl2();
        if (meteorosLvl2.length < maxMeteoritosLvl2()) crearMeteoritoLvl2(W, H);
    }

    actualizarMeteoritosLvl2(dt * factor, W, H);
    if (!juegoActivoLvl2) return;
    actualizarLasersLvl2(dt, W, H);
    if (!juegoActivoLvl2) return;
    actualizarItemsLvl2(dt, W, H);

    if (mantenidoLvl2) dispararLvl2();

    // La nave se inclina un poco según se mueve arriba o abajo
    const dy = ratonLvl2.y - ratonPrevYLvl2;
    ratonPrevYLvl2 = ratonLvl2.y;
    inclinacionLvl2 += (Math.max(-14, Math.min(14, dy * 1.6)) - inclinacionLvl2) * 0.2;
    naveJugadorLvl2.style.transform = "translate(-50%,-50%) rotate(" + (rotNaveLvl2(naveActualLvl2) + inclinacionLvl2).toFixed(1) + "deg)";

    actualizarEfectosHudLvl2();
}

function iniciarBucleLvl2() {
    if (rafLvl2) cancelAnimationFrame(rafLvl2);
    ultimoTsLvl2 = 0;
    rafLvl2 = requestAnimationFrame(bucleLvl2);
}

function detenerBucleLvl2() {
    if (rafLvl2) cancelAnimationFrame(rafLvl2);
    rafLvl2 = null;
}

/* ---------------------------------------------------------------------
   FINAL DE LA PARTIDA
   --------------------------------------------------------------------- */
function Habilitar_Siguienten_LVL() {
    document.getElementById("BotonReiniciarNivel1").hidden = true;
    volverInicioVisibleLvl2(false);
    document.getElementById("NEXT").hidden = true;
    document.getElementById("NIVEL_01").style.display = "none";
    document.getElementById("NIVEL_02").style.display = "none";
    document.getElementById("NIVEL3").style.display = "block";
}

function precisionLvl2() {
    const e = estadisticasLvl2;
    return e.disparos ? Math.round((e.aciertos / e.disparos) * 100) + "%" : "--";
}

function filaEstadisticasLvl2(extra) {
    return (
        '<div><b>' + estadisticasLvl2.destruidos + '</b><small>DESTRUIDOS</small></div>' +
        '<div><b>' + precisionLvl2() + '</b><small>PRECISIÓN</small></div>' +
        '<div><b>x' + estadisticasLvl2.comboMax + '</b><small>MEJOR COMBO</small></div>'
    ) + (extra || "");
}

function prepararTarjetasFinalLvl2() {
    const tVictoria = victoriaLvl2.querySelector(".TarjetaTrofeoLvl2");
    if (tVictoria && !tVictoria.querySelector(".EstrellasLvl2")) {
        const progreso = tVictoria.querySelector(".ProgresoTrofeoLvl2");
        const bloque = document.createElement("div");
        bloque.innerHTML =
            '<div class="EstrellasLvl2" id="EstrellasLvl2"><span>★</span><span>★</span><span>★</span></div>' +
            '<div class="EstadisticasLvl2" id="EstadisticasVictoriaLvl2"></div>' +
            '<div class="RecordLvl2" id="RecordLvl2"></div>';
        progreso.parentNode.insertBefore(bloque, progreso.nextSibling);
    }

    const tDerrota = derrotaLvl2.querySelector(".TarjetaDerrotaLvl2");
    if (tDerrota && !tDerrota.querySelector(".EstadisticasLvl2")) {
        const p = tDerrota.querySelector("p");
        const est = document.createElement("div");
        est.className = "EstadisticasLvl2";
        est.id = "EstadisticasDerrotaLvl2";
        p.parentNode.insertBefore(est, p.nextSibling);

        const boton = document.getElementById("ReintentarLvl2");
        const cambiar = document.createElement("button");
        cambiar.type = "button";
        cambiar.id = "CambiarNaveLvl2";
        cambiar.className = "BotonCambiarNaveLvl2";
        cambiar.textContent = "CAMBIAR NAVE";
        cambiar.addEventListener("click", volverASeleccionLvl2);
        boton.parentNode.appendChild(cambiar);
    }
}
prepararTarjetasFinalLvl2();

function ganarLvl2() {
    if (!juegoActivoLvl2 || Vidaslvl2 <= 0) return;
    registrarVictoriaMision(2);

    juegoActivoLvl2 = false;
    mantenidoLvl2 = false;
    detenerBucleLvl2();
    limpiarLasersLvl2();
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);
    detenerMeteoritosLvl2();
    itemsLvl2.forEach(function (i) { i.el.remove(); });
    itemsLvl2 = [];
    anilloEscudoLvl2.classList.remove("visible");
    efectosHudLvl2.innerHTML = "";
    ultimoHtmlEfectosLvl2 = "";
    comboHudLvl2.classList.remove("visible");
    cabTiempoLvl2.classList.remove("TiempoCriticoLvl2");
    tableroLvl2.classList.remove("PeligroLvl2", "ModoLentoLvl2");

    naveJugadorLvl2.style.opacity = "0";
    document.getElementById("Fondo_Ciberpunk").pause();
    document.getElementById("Triunfo").play().catch(function () {});

    // Estrellas: 3 = sin perder vidas y con tiempo de sobra; 2 = máximo 1 vida perdida; 1 = resto
    const estrellas = (Vidaslvl2 === 3 && Tiempolvl2 >= 15) ? 3 : (Vidaslvl2 >= 2 ? 2 : 1);
    const spans = victoriaLvl2.querySelectorAll("#EstrellasLvl2 span");
    spans.forEach(function (s, i) {
        s.classList.toggle("on", i < estrellas);
        s.style.setProperty("--d", (0.25 + i * 0.25) + "s");
    });
    document.getElementById("EstadisticasVictoriaLvl2").innerHTML =
        filaEstadisticasLvl2() + '<div><b>' + Tiempolvl2 + 's</b><small>TIEMPO SOBRANTE</small></div>' +
        '<div><b>' + Vidaslvl2 + '/3</b><small>VIDAS</small></div>';

    const anterior = leerLvl2("ironfist_lvl2_record");
    const mejor = !anterior || estrellas > anterior.estrellas ||
        (estrellas === anterior.estrellas && Tiempolvl2 > anterior.tiempo);
    if (mejor) guardarLvl2("ironfist_lvl2_record", { estrellas: estrellas, tiempo: Tiempolvl2, nave: naveActualLvl2 });
    const rec = mejor ? { estrellas: estrellas, tiempo: Tiempolvl2 } : anterior;
    document.getElementById("RecordLvl2").textContent = mejor
        ? "¡NUEVO RÉCORD!"
        : "MEJOR: " + "★".repeat(rec.estrellas) + " · " + rec.tiempo + "s SOBRANTES";

    victoriaLvl2.style.display = "flex";
    volverInicioVisibleLvl2(true);
    document.getElementById("BotonReiniciarNivel1").hidden = false;
    document.getElementById("NEXT").hidden = false;
    document.getElementById("NEXT").onclick = Habilitar_Siguienten_LVL;
}

function perderLvl2(motivo) {
    if (!juegoActivoLvl2) return;

    juegoActivoLvl2 = false;
    mantenidoLvl2 = false;
    detenerBucleLvl2();
    limpiarLasersLvl2();
    colaImpactosLvl2 = [];
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);
    detenerMeteoritosLvl2();
    itemsLvl2.forEach(function (i) { i.el.remove(); });
    itemsLvl2 = [];
    anilloEscudoLvl2.classList.remove("visible");
    efectosHudLvl2.innerHTML = "";
    ultimoHtmlEfectosLvl2 = "";
    comboHudLvl2.classList.remove("visible");
    cabTiempoLvl2.classList.remove("TiempoCriticoLvl2");
    tableroLvl2.classList.remove("PeligroLvl2", "ModoLentoLvl2");

    derrotaLvl2.querySelector("p").textContent = motivo === "tiempo"
        ? "Se acabó el tiempo. No alcanzaste los " + OBJETIVO_LVL2 + " puntos."
        : "La Tierra perdió sus tres vidas.";
    document.getElementById("EstadisticasDerrotaLvl2").innerHTML =
        filaEstadisticasLvl2() ;

    naveJugadorLvl2.style.opacity = "0";
    document.getElementById("Fondo_Ciberpunk").pause();
    document.getElementById("Perdiste_sound").play().catch(function () {});

    derrotaLvl2.style.display = "flex";
    volverInicioVisibleLvl2(true);
}

/* ---------------------------------------------------------------------
   INICIO / REINICIO
   --------------------------------------------------------------------- */
function limpiarDecoracionLvl2() {
    tableroLvl2.querySelectorAll(
        ".ExplosionMeteoritoLvl2,.ParticulaLvl2,.TextoFlotanteLvl2,.DestelloLvl2,.AvisoImpactoLvl2"
    ).forEach(function (e) { e.remove(); });
}

function prepararPartidaLvl2() {
    document.getElementById("BotonReiniciarNivel1").hidden = true;
    volverInicioVisibleLvl2(false);
    detenerBucleLvl2();
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);
    detenerMeteoritosLvl2();
    limpiarLasersLvl2();
    itemsLvl2.forEach(function (i) { i.el.remove(); });
    itemsLvl2 = [];
    limpiarDecoracionLvl2();

    Tiempolvl2 = TIEMPO_LVL2;
    Puntajelvl2 = 0;
    Vidaslvl2 = 3;
    impactoEnProcesoLvl2 = false;
    colaImpactosLvl2 = [];
    pausadoLvl2 = false;
    mantenidoLvl2 = false;

    tJuegoLvl2 = 0;
    acumSpawnLvl2 = 0;
    proximoSpawnLvl2 = 1.0;
    proximoDisparoLvl2 = 0;
    comboLvl2 = 0;
    ultimoKillLvl2 = -99;
    escudoLvl2 = false;
    trepleHastaLvl2 = 0;
    lentaHastaLvl2 = 0;
    inclinacionLvl2 = 0;
    ultimoHtmlEfectosLvl2 = "";
    efectosHudLvl2.innerHTML = "";
    comboHudLvl2.classList.remove("visible");
    anilloEscudoLvl2.classList.remove("visible");
    estadisticasLvl2 = { disparos: 0, aciertos: 0, destruidos: 0, comboMax: 0 };

    if (temporizadorAvisoImpactoLvl2) {
        clearTimeout(temporizadorAvisoImpactoLvl2);
        temporizadorAvisoImpactoLvl2 = null;
    }
    if (temporizadorDestelloPlanetaLvl2) {
        clearTimeout(temporizadorDestelloPlanetaLvl2);
        temporizadorDestelloPlanetaLvl2 = null;
    }
    planetaLvl2.classList.remove("ImpactoPlanetaLvl2");
    tableroLvl2.classList.remove("PausadoLvl2", "PeligroLvl2", "ModoLentoLvl2", "SacudidaLvl2");
    cabTiempoLvl2.classList.remove("TiempoCriticoLvl2");

    derrotaLvl2.style.display = "none";
    victoriaLvl2.style.display = "none";
    document.getElementById("NEXT").hidden = true;
    document.getElementById("Pausa_Pantallalvl2").style.display = "none";
    document.getElementById("TextoPauselvl2").textContent = "PAUSAR";

    ActualizarVidaslvl2();
    actualizarMarcadoresLvl2();
}

function iniciarJuegoLvl2() {
    if (juegoActivoLvl2) return;
    clearInterval(intervaloTiempoLvl2);
    iniciandoLvl2 = false;
    juegoActivoLvl2 = true;
    pausadoLvl2 = false;
    impactoEnProcesoLvl2 = false;
    colaImpactosLvl2 = [];

    document.getElementById("Fondo_Ciberpunk").play().catch(function () {});
    ActualizarVidaslvl2();
    iniciarBucleLvl2();

    intervaloTiempoLvl2 = setInterval(function () {
        if (!juegoActivoLvl2 || pausadoLvl2) return;

        Tiempolvl2 = Math.max(0, Tiempolvl2 - 1);
        actualizarMarcadoresLvl2();

        // Últimos 10 segundos: el reloj parpadea en rojo y suena una alarma
        const critico = Tiempolvl2 > 0 && Tiempolvl2 <= 10;
        cabTiempoLvl2.classList.toggle("TiempoCriticoLvl2", critico);
        if (critico) sfxLvl2.alarma(Tiempolvl2 <= 3);

        if (Tiempolvl2 <= 0) perderLvl2("tiempo");
    }, 1000);
}

function reiniciarLvl2() {
    document.getElementById("Fondo_Ciberpunk").currentTime = 0;
    juegoActivoLvl2 = false;
    prepararPartidaLvl2();
    iniciarJuegoLvl2();
}

// Vuelve a la pantalla de elección de nave (sin recargar la página)
function volverASeleccionLvl2() {
    juegoActivoLvl2 = false;
    iniciandoLvl2 = false;
    if (temporizadorConteoLvl2) {
        clearTimeout(temporizadorConteoLvl2);
        temporizadorConteoLvl2 = null;
    }
    document.getElementById("Fondo_Ciberpunk").pause();
    document.getElementById("Fondo_Ciberpunk").currentTime = 0;
    prepararPartidaLvl2();
    naveJugadorLvl2.style.opacity = "0";

    inicioLvl2.classList.remove("SaliendoLvl2");
    document.getElementById("RGBlvl2").textContent = "";
    document.getElementById("Contenedor_contadorlvl2").style.display = "";
    inicioLvl2.style.display = "";
}

document.getElementById("ReintentarLvl2").onclick = reiniciarLvl2;

/* Cuenta regresiva 3 · 2 · 1 · ¡YA! */
function iniciarConteoLvl2() {
    if (iniciandoLvl2 || juegoActivoLvl2) return;
    iniciandoLvl2 = true;
    audioLvl2(); // desbloquea el audio con el clic del jugador

    prepararPartidaLvl2();
    const musica = document.getElementById("Fondo_Ciberpunk");
    musica.currentTime = 0;
    musica.play().catch(function () {});

    inicioLvl2.classList.add("SaliendoLvl2");
    const contenedor = document.getElementById("Contenedor_contadorlvl2");
    const numero = document.getElementById("RGBlvl2");
    contenedor.style.display = "";

    const secuencia = ["3", "2", "1", "¡YA!"];
    let i = 0;

    function mostrar() {
        const final = i === secuencia.length - 1;
        numero.textContent = secuencia[i];
        numero.classList.toggle("Final", final);
        numero.classList.remove("PulsoConteoLvl2");
        void numero.offsetWidth;
        numero.classList.add("PulsoConteoLvl2");
        sfxLvl2.conteo(final);
        i++;
        if (i < secuencia.length) {
            temporizadorConteoLvl2 = setTimeout(mostrar, 900);
        } else {
            temporizadorConteoLvl2 = setTimeout(function () {
                temporizadorConteoLvl2 = null;
                contenedor.style.display = "none";
                inicioLvl2.style.display = "none";
                iniciarJuegoLvl2();
            }, 750);
        }
    }
    temporizadorConteoLvl2 = setTimeout(mostrar, 450); // deja ver cómo se retira el menú
}

document.getElementById("Playlvl2").addEventListener("click", iniciarConteoLvl2);

/* ---------------------------------------------------------------------
   PAUSA, VOLUMEN, PANTALLA COMPLETA Y TECLADO
   --------------------------------------------------------------------- */
document.getElementById("Pauselvl2").addEventListener("click", function () {
    if (!juegoActivoLvl2) return;

    pausadoLvl2 = !pausadoLvl2;
    mantenidoLvl2 = false;
    volverInicioVisibleLvl2(pausadoLvl2);
    document.getElementById("TextoPauselvl2").innerHTML = pausadoLvl2 ? "REANUDAR" : "PAUSAR";
    document.getElementById("Pausa_Pantallalvl2").style.display = pausadoLvl2 ? "table" : "none";
    tableroLvl2.classList.toggle("PausadoLvl2", pausadoLvl2);

    if (pausadoLvl2) {
        document.getElementById("Fondo_Ciberpunk").pause();
        naveJugadorLvl2.style.opacity = "0";
    } else {
        document.getElementById("Fondo_Ciberpunk").play().catch(function () {});
    }
});

document.getElementById("VolumenLvl2").addEventListener("input", function (evento) {
    const volumen = parseFloat(evento.target.value);
    volumenLvl2 = volumen;
    if (gananciaLvl2) gananciaLvl2.gain.value = volumen;
    ["Fondo_Ciberpunk", "Puntos_sound", "Perdiste_sound", "Triunfo"].forEach(function (id) {
        document.getElementById(id).volume = volumen;
    });
});
["Fondo_Ciberpunk", "Puntos_sound", "Perdiste_sound", "Triunfo"].forEach(function (id) {
    document.getElementById(id).volume = volumenLvl2;
});

document.addEventListener("fullscreenchange", function () {
    if (!document.fullscreenElement && juegoActivoLvl2 && !pausadoLvl2) {
        document.getElementById("Pauselvl2").click();
    }
});

document.addEventListener("keydown", function (evento) {
    const nivel = document.getElementById("NIVEL_02");
    if (!nivel || nivel.getClientRects().length === 0) return; // el nivel 2 no está en pantalla (también vale en pantalla completa)

    const inicioVisible = inicioLvl2.style.display !== "none" && !iniciandoLvl2 && !juegoActivoLvl2;
    if (inicioVisible) {
        const idx = ORDEN_NAVES_LVL2.indexOf(naveActualLvl2);
        if (evento.key >= "1" && evento.key <= "3") {
            seleccionarNaveLvl2(ORDEN_NAVES_LVL2[parseInt(evento.key, 10) - 1]);
        } else if (evento.key === "ArrowRight") {
            seleccionarNaveLvl2(ORDEN_NAVES_LVL2[(idx + 1) % 3]);
        } else if (evento.key === "ArrowLeft") {
            seleccionarNaveLvl2(ORDEN_NAVES_LVL2[(idx + 2) % 3]);
        } else if (evento.key === "Enter") {
            iniciarConteoLvl2();
        }
        return;
    }

    if ((evento.key === "p" || evento.key === "P" || evento.key === "Escape") && juegoActivoLvl2) {
        evento.preventDefault();
        document.getElementById("Pauselvl2").click();
    }
});

/* ---------------------------------------------------------------------
   CONTROL DE LA NAVE (ratón y táctil)
   --------------------------------------------------------------------- */
function posicionEnTableroLvl2(evento) {
    const area = tableroLvl2.getBoundingClientRect();
    const escX = area.width / tableroLvl2.offsetWidth || 1;
    const escY = area.height / tableroLvl2.offsetHeight || 1;
    return {
        x: (evento.clientX - area.left - tableroLvl2.clientLeft * escX) / escX,
        y: (evento.clientY - area.top - tableroLvl2.clientTop * escY) / escY
    };
}

function moverNaveLvl2(evento) {
    const p = posicionEnTableroLvl2(evento);
    ratonLvl2.x = p.x;
    ratonLvl2.y = p.y;
    ratonLvl2.dentro = true;

    if (!juegoActivoLvl2 || pausadoLvl2) {
        naveJugadorLvl2.style.opacity = "0";
        return;
    }
    naveJugadorLvl2.style.left = p.x + "px";
    naveJugadorLvl2.style.top = p.y + "px";
    naveJugadorLvl2.style.opacity = "1";
}

tableroLvl2.addEventListener("pointermove", moverNaveLvl2);

tableroLvl2.addEventListener("pointerleave", function () {
    ratonLvl2.dentro = false;
    mantenidoLvl2 = false;
    naveJugadorLvl2.style.opacity = "0";
});

tableroLvl2.addEventListener("pointerdown", function (evento) {
    if (!juegoActivoLvl2 || pausadoLvl2) return;
    if (evento.button !== undefined && evento.button > 0) return;
    moverNaveLvl2(evento);
    mantenidoLvl2 = true;
    dispararLvl2();
});

document.addEventListener("pointerup", function () {
    mantenidoLvl2 = false;
});

tableroLvl2.addEventListener("contextmenu", function (evento) {
    if (juegoActivoLvl2) evento.preventDefault();
});

/* ---------------------------------------------------------------------
   ARRANQUE
   --------------------------------------------------------------------- */
seleccionarNaveLvl2(naveActualLvl2, true);
precargarNavesLvl2();
ActualizarVidaslvl2();
actualizarMarcadoresLvl2();

/* ---------------------------------------------------------------------
   RESPONSIVE: la interfaz crece cuando el tablero se agranda (pantalla completa, monitores grandes)
   --e = 1 en tamaños normales, hasta 2.4 en pantallas muy grandes
   --------------------------------------------------------------------- */
(function escalaResponsiveLvl2() {
    const raiz = document.getElementById("NIVEL_02");
    function ajustar() {
        const w = tableroLvl2.offsetWidth;
        const h = tableroLvl2.offsetHeight;
        if (!w || !h) return;
        const e = Math.max(1, Math.min(2.4, Math.min(w / 1400, h / 620)));
        raiz.style.setProperty("--e", e.toFixed(3));
    }
    if (typeof ResizeObserver === "function") new ResizeObserver(ajustar).observe(tableroLvl2);
    window.addEventListener("resize", ajustar);
    document.addEventListener("fullscreenchange", function () { setTimeout(ajustar, 60); });
    ajustar();
})();
