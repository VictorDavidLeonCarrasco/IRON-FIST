/* =====================================================================
   NIVEL 3 · IRON FIST
   Motor nuevo: 4 naves, meteoritos dinámicos, jefe con 3 fases,
   combos, power-ups, efectos y sonidos (WebAudio).
   ===================================================================== */
const OBJETIVO_NIVEL3 = 40;      // puntaje que se muestra como meta
const PUNTOS_JEFE_NIVEL3 = 35;   // al llegar aquí aparece el jefe
const TIEMPO_NIVEL3 = 60;
const VIDA_JEFE_NIVEL3 = 50;

let Tiempolvl3 = TIEMPO_NIVEL3;
let Puntajelvl3 = 0;
let vidasLvl3 = 3;
let pausadoLvl3 = false;
let terminadoLvl3 = false;
let juegoActivoLvl3 = false;
let iniciandoLvl3 = false;
let conteoTimerLvl3 = null;
let rafLvl3 = null;
let ultimoTsLvl3 = 0;
let tJuegoLvl3 = 0;          // reloj de la partida (segundos de juego)
let transcurridoLvl3 = 0;    // segundos que cuentan para el tiempo límite

const tableroNivel3 = document.querySelector('#NIVEL3 .Contenedorlvl3:not(.Cabezeralvl3)');
const raizNivel3 = document.getElementById('NIVEL3');
const naveJugadorLvl3 = document.getElementById('NaveJugadorLvl3');
const inicioLvl3 = document.getElementById('Startlvl3');
const planetaLvl3 = document.getElementById('Planetalvl3');
const limiteLvl3 = tableroNivel3.querySelector('.Limitelvl3');

// Los 4 meteoritos fijos del HTML antiguo ya no se usan (ahora se crean por código).
document.querySelectorAll('#NIVEL3 .Meteoritolvl3').forEach(function (m) { m.remove(); });

/* ---------------------------------------------------------------------
   NAVES (la 4ª, OMEGA, es la más poderosa)
   rot = giro para que la imagen mire a la IZQUIERDA (hacia donde dispara)
   --------------------------------------------------------------------- */
const NAVES_LVL3 = {
    interceptor: {
        img: "IMG/Nave_02_ok.png", rot: 0, nombre: "INTERCEPTOR", etiqueta: "EQUILIBRADA", color: "#35d6ff",
        cadencia: 0.30, dano: 1, atraviesa: 0, velocidad: 1100, lw: 34, lh: 4, angulos: [0],
        stats: { poder: 3, cadencia: 3, cobertura: 2 }
    },
    relampago: {
        img: "IMG/Nave_03.png", rot: -90, nombre: "RELÁMPAGO", etiqueta: "DISPARO RÁPIDO", color: "#8dff4a",
        cadencia: 0.15, dano: 1, atraviesa: 0, velocidad: 1500, lw: 24, lh: 3, angulos: [0],
        stats: { poder: 2, cadencia: 5, cobertura: 1 }
    },
    titan: {
        img: "IMG/Nave_04_ok.png", rot: 0, nombre: "TITÁN", etiqueta: "LÁSER PERFORANTE", color: "#ff8a3d",
        cadencia: 0.62, dano: 2, atraviesa: 2, velocidad: 900, lw: 54, lh: 9, angulos: [0],
        stats: { poder: 5, cadencia: 1, cobertura: 3 }
    },
    omega: {
        img: "IMG/Nave_5_ok.png", rot: 0, nombre: "OMEGA", etiqueta: "TRIPLE · PERFORANTE · BLINDADA", color: "#ffd54a",
        cadencia: 0.20, dano: 1, atraviesa: 3, velocidad: 1300, lw: 46, lh: 6, angulos: [-8, 0, 8],
        escudoInicial: true, elite: true,
        stats: { poder: 5, cadencia: 5, cobertura: 5 }
    }
};
const ORDEN_NAVES_LVL3 = ["interceptor", "relampago", "titan", "omega"];
const limpiaNaveLvl3 = {};

let naveActualLvl3 = "interceptor";
try {
    const guardada = localStorage.getItem("ironfist_nave3");
    if (guardada && NAVES_LVL3[guardada]) naveActualLvl3 = guardada;
} catch (e) { /* sin almacenamiento */ }

function candidatosNaveLvl3(id) {
    const base = NAVES_LVL3[id].img.replace(/\.[a-z0-9]+$/i, "");
    return [base + ".png", base + ".jpg", base + ".jpeg", base + ".webp"];
}

/* Nave dibujada (por si la imagen no existe) */
function svgNaveLvl3(id) {
    const c = NAVES_LVL3[id].color;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 70">' +
        '<polygon points="52,30 80,4 96,4 88,32" fill="' + c + '" opacity=".7"/>' +
        '<polygon points="52,40 80,66 96,66 88,38" fill="' + c + '" opacity=".7"/>' +
        '<path d="M4 35 L36 27 L94 25 L104 29 L104 41 L94 45 L36 43 Z" fill="' + c + '" stroke="#fff" stroke-width=".8"/>' +
        '<ellipse cx="44" cy="35" rx="14" ry="4.8" fill="#dff6ff"/></svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
function fuenteNaveLvl3(id) { return limpiaNaveLvl3[id] || svgNaveLvl3(id); }
function rotNaveLvl3(id) { return limpiaNaveLvl3[id] ? NAVES_LVL3[id].rot : 0; }

/* Quita el fondo: parte desde los bordes y borra lo que se parezca a los colores del borde */
function quitarFondoNaveLvl3(img) {
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


function cargarNaveLvl3(id, indice) {
    const lista = candidatosNaveLvl3(id);
    if (indice >= lista.length) return;
    const im = new Image();
    im.onload = function () {
        try { limpiaNaveLvl3[id] = quitarFondoNaveLvl3(im).toDataURL("image/png"); }
        catch (e) { limpiaNaveLvl3[id] = im.src; }
        aplicarImagenNaveLvl3(id);
    };
    im.onerror = function () { cargarNaveLvl3(id, indice + 1); };
    im.src = lista[indice];
}
function aplicarImagenNaveLvl3(id) {
    const t = selectorLvl3.querySelector('.TarjetaNaveLvl3[data-nave="' + id + '"] img');
    if (t) { t.src = fuenteNaveLvl3(id); t.style.rotate = rotNaveLvl3(id) + "deg"; }
    if (naveActualLvl3 === id) pintarNaveLvl3();
}

/* ---------------------------------------------------------------------
   ESTADO
   --------------------------------------------------------------------- */
let escalaLvl3 = 1;
let meteorosLvl3 = [];
let lasersLvl3 = [];
let itemsLvl3 = [];
let bolasLvl3 = [];
let posNaveLvl3 = { x: 0, y: 0 };
let ratonPrevYLvl3 = 0;
let inclinacionLvl3 = 0;
let mantenidoLvl3 = false;
let teclaDisparoLvl3 = false;
let proximoDisparoLvl3 = 0;
let proximoSpawnLvl3 = 0.6;
let acumSpawnLvl3 = 0;
let comboLvl3 = 0;
let ultimoKillLvl3 = -99;
let escudoLvl3 = false;
let triplesHastaLvl3 = 0;
let lentaHastaLvl3 = 0;
let invulnerableHastaLvl3 = 0;
let estadisticasLvl3 = { disparos: 0, aciertos: 0, destruidos: 0, comboMax: 0 };
let ultimoHtmlEfectosLvl3 = "";
let ultimoSegAlarmaLvl3 = -1;
let jefeLvl3 = null;

function nuevoJefeLvl3() {
    return { estado: "no", vida: VIDA_JEFE_NIVEL3, fase: 1, t: 0, x: 0, y: 0, tam: 200, destello: 0,
        proxFuego: 2, elemento: null, muerte: 0, proxExplosion: 0, aviso: 0 };
}
jefeLvl3 = nuevoJefeLvl3();

/* ---------------------------------------------------------------------
   SONIDO (WebAudio, no necesita archivos)
   --------------------------------------------------------------------- */
let ctxAudioLvl3 = null, gananciaLvl3 = null;
let volumenLvl3 = 0.7;
{ const s = document.getElementById("VolumenLvl3"); if (s) volumenLvl3 = parseFloat(s.value); }
function audioLvl3() {
    try {
        if (!ctxAudioLvl3) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            ctxAudioLvl3 = new AC();
            gananciaLvl3 = ctxAudioLvl3.createGain();
            gananciaLvl3.gain.value = volumenLvl3 * 0.7;
            gananciaLvl3.connect(ctxAudioLvl3.destination);
        }
        if (ctxAudioLvl3.state === "suspended") ctxAudioLvl3.resume();
        return ctxAudioLvl3;
    } catch (e) { return null; }
}
function tonoLvl3(f0, dur, tipo, vol, f1, retardo) {
    const ctx = audioLvl3(); if (!ctx) return;
    const t = ctx.currentTime + (retardo || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo || "square";
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(gananciaLvl3);
    o.start(t); o.stop(t + dur + 0.03);
}
function ruidoLvl3(dur, vol, corte) {
    const ctx = audioLvl3(); if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const f = ctx.createBufferSource(); f.buffer = buf;
    const filtro = ctx.createBiquadFilter(); filtro.type = "lowpass"; filtro.frequency.value = corte || 1200;
    const g = ctx.createGain(); g.gain.value = vol;
    f.connect(filtro); filtro.connect(g); g.connect(gananciaLvl3); f.start();
}
const sfxLvl3 = {
    laser: function (id) {
        if (id === "relampago") tonoLvl3(1500, 0.07, "sawtooth", 0.06, 600);
        else if (id === "titan") tonoLvl3(320, 0.24, "square", 0.1, 80);
        else if (id === "omega") {
            // Silbido agudo: el tono sube un instante y luego cae, con un armónico más suave
            tonoLvl3(2100, 0.07, "sine", 0.10, 3300);
            tonoLvl3(3300, 0.2, "sine", 0.09, 1500, 0.07);
            tonoLvl3(1050, 0.26, "sine", 0.05, 750);
        }
        else tonoLvl3(950, 0.12, "sawtooth", 0.07, 300);
    },
    golpe: function () { tonoLvl3(220, 0.08, "square", 0.08, 120); },
    golpeJefe: function () { tonoLvl3(140, 0.12, "sawtooth", 0.12, 60); },
    explosion: function () { ruidoLvl3(0.42, 0.32, 900); tonoLvl3(130, 0.3, "sine", 0.22, 40); },
    impacto: function () { ruidoLvl3(0.7, 0.5, 420); tonoLvl3(90, 0.55, "sine", 0.4, 30); },
    item: function () { tonoLvl3(520, 0.1, "triangle", 0.16); tonoLvl3(660, 0.1, "triangle", 0.16, 0, 0.09); tonoLvl3(880, 0.18, "triangle", 0.16, 0, 0.18); },
    escudo: function () { tonoLvl3(300, 0.35, "sine", 0.25, 1000); },
    alarma: function (urg) { tonoLvl3(urg ? 1100 : 820, 0.09, "square", 0.1); },
    sirena: function () { tonoLvl3(500, 0.5, "sawtooth", 0.12, 900); tonoLvl3(900, 0.5, "sawtooth", 0.12, 500, 0.5); },
    conteo: function (fin) { if (fin) tonoLvl3(880, 0.4, "square", 0.15, 1400); else tonoLvl3(440, 0.18, "square", 0.14); },
    combo: function (n) { tonoLvl3(560 + n * 55, 0.13, "triangle", 0.14); },
    elegir: function () { tonoLvl3(660, 0.07, "square", 0.09, 990); },
    fase: function () { tonoLvl3(200, 0.6, "sawtooth", 0.18, 60); ruidoLvl3(0.5, 0.25, 700); },
    fuego: function (fase) {
        // Rugido de furia: gruñido grave, chillido que cae y ráfaga de aire
        const furia = fase === 3;
        ruidoLvl3(furia ? 0.8 : 0.6, furia ? 0.34 : 0.26, 520);
        tonoLvl3(furia ? 85 : 110, 0.75, "sawtooth", 0.22, 38);
        tonoLvl3(furia ? 92 : 118, 0.75, "square", 0.10, 40);
        tonoLvl3(furia ? 1250 : 950, 0.5, "sawtooth", 0.07, 230, 0.04);
        if (furia) tonoLvl3(1700, 0.35, "sawtooth", 0.05, 300, 0.2);
    }
};

/* ---------------------------------------------------------------------
   UTILIDADES
   --------------------------------------------------------------------- */
function guardarLvl3(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { } }
function leerLvl3(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function distSegPuntoLvl3(x1, y1, x2, y2, px, py) {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
function reproducirLvl3(id) {
    try { const s = document.getElementById(id); s.currentTime = 0; s.play().catch(function () { }); } catch (e) { }
}
function xLimiteLvl3() { return limiteLvl3.offsetLeft; }

/* ---------------------------------------------------------------------
   ELEMENTOS DECORATIVOS Y HUD DENTRO DEL TABLERO
   --------------------------------------------------------------------- */
["c1", "c2", "c3"].forEach(function (capa) {
    const e = document.createElement("div");
    e.className = "EstrellasCapaLvl3 " + capa;
    tableroNivel3.insertBefore(e, tableroNivel3.firstChild);
});

const barraProgresoLvl3 = document.createElement("div");
barraProgresoLvl3.className = "BarraProgresoLvl3";
barraProgresoLvl3.innerHTML = '<div class="RellenoProgresoLvl3"></div><i class="MarcaJefeLvl3" title="Jefe final"></i>';
tableroNivel3.appendChild(barraProgresoLvl3);
const rellenoProgresoLvl3 = barraProgresoLvl3.firstChild;
barraProgresoLvl3.querySelector(".MarcaJefeLvl3").style.left = (PUNTOS_JEFE_NIVEL3 / OBJETIVO_NIVEL3 * 100) + "%";

const efectosHudLvl3 = document.createElement("div");
efectosHudLvl3.className = "EfectosLvl3";
tableroNivel3.appendChild(efectosHudLvl3);

const comboHudLvl3 = document.createElement("div");
comboHudLvl3.className = "ComboLvl3";
tableroNivel3.appendChild(comboHudLvl3);

const barreraLvl3 = document.createElement("div");   // escudo del planeta: barrera sobre la línea límite
barreraLvl3.className = "BarreraEscudoLvl3";
tableroNivel3.appendChild(barreraLvl3);

const barraJefeLvl3 = document.createElement("div");
barraJefeLvl3.className = "BarraJefeLvl3";
barraJefeLvl3.innerHTML = '<span class="NombreJefeLvl3">METEORITO COLOSAL</span>' +
    '<div class="PistaJefeLvl3"><div class="EstelaVidaJefeLvl3"></div><div class="RellenoVidaJefeLvl3"></div>' +
    '<i style="left:33.3%"></i><i style="left:66.6%"></i></div>';
tableroNivel3.appendChild(barraJefeLvl3);
const rellenoJefeLvl3 = barraJefeLvl3.querySelector(".RellenoVidaJefeLvl3");
const estelaJefeLvl3 = barraJefeLvl3.querySelector(".EstelaVidaJefeLvl3");

const propulsorLvl3 = document.createElement("div");
propulsorLvl3.className = "PropulsorLvl3";
tableroNivel3.insertBefore(propulsorLvl3, naveJugadorLvl3);

function pintarNaveLvl3() {
    const n = NAVES_LVL3[naveActualLvl3];
    naveJugadorLvl3.src = fuenteNaveLvl3(naveActualLvl3);
    naveJugadorLvl3.style.transform = "translate(-50%,-50%) rotate(" + (rotNaveLvl3(naveActualLvl3) + inclinacionLvl3).toFixed(1) + "deg)";
    naveJugadorLvl3.style.setProperty("--cn", n.color);
    tableroNivel3.style.setProperty("--cn", n.color);
}
function colocarNaveLvl3(x, y) {
    posNaveLvl3.x = x; posNaveLvl3.y = y;
    naveJugadorLvl3.style.left = x + "px";
    naveJugadorLvl3.style.top = y + "px";
    propulsorLvl3.style.left = x + "px";
    propulsorLvl3.style.top = y + "px";
}
function sincronizarPropulsorLvl3() {
    propulsorLvl3.style.opacity = naveJugadorLvl3.style.opacity === "1" ? "1" : "0";
    propulsorLvl3.style.setProperty("--an", (naveJugadorLvl3.offsetWidth || 60) + "px");
    propulsorLvl3.style.setProperty("--cn", NAVES_LVL3[naveActualLvl3].color);
    propulsorLvl3.style.transform = "rotate(" + inclinacionLvl3.toFixed(1) + "deg)";
}

/* ---------------------------------------------------------------------
   MENÚ DE SELECCIÓN DE NAVES (4 naves)
   --------------------------------------------------------------------- */
const selectorLvl3 = document.createElement("div");
selectorLvl3.className = "SelectorNavesLvl3";
selectorLvl3.id = "SelectorNavesLvl3";
(function construirSelector() {
    function pips(n) { let h = ""; for (let i = 1; i <= 5; i++) h += '<i class="' + (i <= n ? "on" : "") + '"></i>'; return h; }
    let tarjetas = "";
    ORDEN_NAVES_LVL3.forEach(function (id, indice) {
        const n = NAVES_LVL3[id];
        tarjetas +=
            '<button type="button" class="TarjetaNaveLvl3' + (n.elite ? " Elite" : "") + '" data-nave="' + id + '" style="--c:' + n.color + '" aria-pressed="false">' +
            '<span class="TeclaNaveLvl3">' + (indice + 1) + '</span>' +
            (n.elite ? '<span class="InsigniaEliteLvl3">★ ÉLITE</span>' : "") +
            '<img src="' + svgNaveLvl3(id) + '" alt="Nave ' + n.nombre + '" draggable="false">' +
            '<strong>' + n.nombre + '</strong><em>' + n.etiqueta + '</em>' +
            '<div class="StatsNaveLvl3">' +
            '<span>PODER</span><b>' + pips(n.stats.poder) + '</b>' +
            '<span>CADENCIA</span><b>' + pips(n.stats.cadencia) + '</b>' +
            '<span>COBERTURA</span><b>' + pips(n.stats.cobertura) + '</b></div></button>';
    });
    selectorLvl3.innerHTML =
        '<p class="TituloSelectorLvl3">ELIGE TU NAVE</p>' +
        '<div class="ListaNavesLvl3">' + tarjetas + '</div>' +
        '<p class="AyudaSelectorLvl3">Teclas 1-4 para elegir · Clic o mantener para disparar · P para pausar</p>';
    inicioLvl3.insertBefore(selectorLvl3, document.getElementById("Playlvl3"));
})();
function seleccionarNaveLvl3(id, silencio) {
    if (!NAVES_LVL3[id]) return;
    naveActualLvl3 = id;
    guardarLvl3("ironfist_nave3", id);
    selectorLvl3.querySelectorAll(".TarjetaNaveLvl3").forEach(function (t) {
        t.setAttribute("aria-pressed", t.dataset.nave === id ? "true" : "false");
    });
    pintarNaveLvl3();
    if (!silencio) sfxLvl3.elegir();
}
selectorLvl3.addEventListener("click", function (e) {
    const t = e.target.closest(".TarjetaNaveLvl3");
    if (t) seleccionarNaveLvl3(t.dataset.nave);
});

/* ---------------------------------------------------------------------
   MARCADORES
   --------------------------------------------------------------------- */
function actualizarVidasLvl3() {
    const ind = document.getElementById("VidasLvl3");
    ind.setAttribute("aria-label", vidasLvl3 + " vidas restantes");
    ind.querySelectorAll("span").forEach(function (c, i) {
        c.classList.toggle("VidaPerdidaLvl3", i >= vidasLvl3);
        c.textContent = i < vidasLvl3 ? "♥" : "♡";
    });
    tableroNivel3.classList.toggle("PeligroLvl3", vidasLvl3 === 1 && juegoActivoLvl3);
    const danoPlaneta = 3 - Math.max(0, Math.min(3, vidasLvl3));
    planetaLvl3.src = "IMG/planetas_lvl2/planeta_" + danoPlaneta + ".png";
}
function actualizarMarcadoresLvl3() {
    document.getElementById("Tiempolvl3").textContent = Tiempolvl3;
    document.getElementById("Puntajelvl3").textContent = Puntajelvl3 + " / " + OBJETIVO_NIVEL3;
    rellenoProgresoLvl3.style.width = Math.min(100, Puntajelvl3 / OBJETIVO_NIVEL3 * 100) + "%";
    const crit = juegoActivoLvl3 && Tiempolvl3 <= 10;
    raizNivel3.querySelector(".Tiempolvl3").classList.toggle("TiempoCriticoLvl3", crit);
}
function aplicarVolumenLvl3() {
    const v = Number(document.getElementById("VolumenLvl3").value);
    volumenLvl3 = v;
    if (gananciaLvl3) gananciaLvl3.gain.value = v * 0.7;
    ["Fondo_Ciberpunk", "Puntos_sound", "Punto2", "Punto3", "Punto4",
        "Perdiste_sound", "Triunfo", "Musica_Final", "Ganaste"].forEach(function (id) {
        const a = document.getElementById(id); if (a) a.volume = v;
    });
}
document.getElementById("VolumenLvl3").addEventListener("input", aplicarVolumenLvl3);

/* ---------------------------------------------------------------------
   EFECTOS VISUALES
   --------------------------------------------------------------------- */
function mostrarExplosionLvl3(x, y, tam) {
    const ex = document.createElement("img");
    ex.className = "ExplosionMeteoritoLvl3";
    ex.alt = "";
    ex.style.left = x + "px"; ex.style.top = y + "px"; ex.style.width = (tam || 110) + "px";
    ex.onerror = function () { ex.style.visibility = "hidden"; };
    tableroNivel3.appendChild(ex);
    let c = 1;
    ex.src = "IMG/explosion_lvl2/Explosion_001.png";
    const an = setInterval(function () {
        c++;
        if (c > 10) { clearInterval(an); ex.remove(); return; }
        ex.src = "IMG/explosion_lvl2/Explosion_" + String(c).padStart(3, "0") + ".png";
    }, 70);
}
function particulasLvl3(x, y, n, color, fuerza) {
    for (let i = 0; i < n; i++) {
        const p = document.createElement("span");
        p.className = "ParticulaLvl3";
        const a = Math.random() * Math.PI * 2, d = (0.4 + Math.random() * 0.6) * (fuerza || 70);
        p.style.left = x + "px"; p.style.top = y + "px";
        p.style.setProperty("--dx", Math.cos(a) * d + "px");
        p.style.setProperty("--dy", Math.sin(a) * d + "px");
        if (color) p.style.setProperty("--c", color);
        tableroNivel3.appendChild(p);
        setTimeout(function () { p.remove(); }, 650);
    }
}
function textoFlotanteLvl3(x, y, msg, clase) {
    const t = document.createElement("div");
    t.className = "TextoFlotanteLvl3 " + (clase || "");
    t.textContent = msg;
    t.style.left = x + "px"; t.style.top = y + "px";
    tableroNivel3.appendChild(t);
    setTimeout(function () { t.remove(); }, 1000);
}
function sacudirLvl3(fuerte) {
    tableroNivel3.classList.remove("SacudidaLvl3", "SacudidaFuerteLvl3");
    void tableroNivel3.offsetWidth;
    tableroNivel3.classList.add(fuerte ? "SacudidaFuerteLvl3" : "SacudidaLvl3");
}
function destelloDisparoLvl3(x, y, color) {
    const d = document.createElement("div");
    d.className = "DestelloLvl3";
    d.style.left = x + "px"; d.style.top = y + "px"; d.style.setProperty("--c", color);
    tableroNivel3.appendChild(d);
    setTimeout(function () { d.remove(); }, 160);
}
let temporizadorAvisoLvl3 = null;
function avisoLvl3(texto, clase, ms) {
    const viejo = tableroNivel3.querySelector(".AvisoLvl3");
    if (viejo) viejo.remove();
    clearTimeout(temporizadorAvisoLvl3);
    const a = document.createElement("div");
    a.className = "AvisoLvl3 " + (clase || "");
    a.innerHTML = texto;
    tableroNivel3.appendChild(a);
    temporizadorAvisoLvl3 = setTimeout(function () { a.remove(); }, ms || 1100);
}
function efectoImpactoPlanetaLvl3() {
    planetaLvl3.classList.remove("ImpactoPlanetaLvl3");
    void planetaLvl3.offsetWidth;
    planetaLvl3.classList.add("ImpactoPlanetaLvl3");
    setTimeout(function () { planetaLvl3.classList.remove("ImpactoPlanetaLvl3"); }, 480);
}

/* ---------------------------------------------------------------------
   METEORITOS (normal, rápido, grande)
   --------------------------------------------------------------------- */
const TIPOS_METEORITO_LVL3 = {
    normal: { tam: 74, vel: 1.00, hp: 1, pts: 1 },
    rapido: { tam: 50, vel: 1.65, hp: 1, pts: 1 },
    grande: { tam: 118, vel: 0.62, hp: 2, pts: 2 }
};
function dificultadLvl3() { return 1 + Math.min(0.35, tJuegoLvl3 / 130); }
function elegirTipoLvl3() {
    const r = Math.random(), t = tJuegoLvl3;
    if (t > 8 && r < 0.17) return "grande";
    if (t > 4 && r < 0.40) return "rapido";
    return "normal";
}
function calcularSpawnLvl3() {
    const base = Math.max(0.5, 1.05 - tJuegoLvl3 / 85);
    return base * (0.75 + Math.random() * 0.5);
}
function maxMeteoritosLvl3() { return Math.min(7, 4 + Math.floor(tJuegoLvl3 / 18)); }

function crearMeteoritoLvl3(W, H) {
    const clave = elegirTipoLvl3(), tipo = TIPOS_METEORITO_LVL3[clave];
    const tam = tipo.tam * escalaLvl3;
    const x0 = -tam;
    const y0 = tam * 0.55 + Math.random() * Math.max(10, H - tam * 1.1);
    const vx = W / 5.3 * tipo.vel * dificultadLvl3();
    const vy = (Math.random() * 2 - 1) * H * 0.035;
    const el = document.createElement("div");
    el.className = "MeteoritoLvl3 " + clave;
    el.style.width = tam + "px"; el.style.height = tam + "px";
    const estela = document.createElement("span");
    estela.className = "EstelaLvl3";
    estela.style.width = tam * 1.9 + "px"; estela.style.height = tam * 0.55 + "px";
    const img = document.createElement("img");
    img.src = "IMG/Metiorito.png"; img.alt = ""; img.draggable = false;
    el.appendChild(estela); el.appendChild(img);
    tableroNivel3.appendChild(el);
    meteorosLvl3.push({ el: el, img: img, x: x0, y: y0, vx: vx, vy: vy, tam: tam, r: tam * 0.42,
        hp: tipo.hp, pts: tipo.pts, giro: (Math.random() * 2 - 1) * 120, rot: Math.random() * 360, muerto: false });
}
function quitarMeteoritoLvl3(m) {
    m.muerto = true; m.el.remove();
    const i = meteorosLvl3.indexOf(m);
    if (i >= 0) meteorosLvl3.splice(i, 1);
}
function limpiarMeteoritosLvl3(conEfecto) {
    meteorosLvl3.slice().forEach(function (m) {
        if (conEfecto) { mostrarExplosionLvl3(m.x, m.y, m.tam * 1.5); particulasLvl3(m.x, m.y, 6, "#ffb347", m.tam); }
        quitarMeteoritoLvl3(m);
    });
    meteorosLvl3 = [];
}
function sumarPuntosLvl3(n) {
    const tope = jefeLvl3.estado === "no" ? PUNTOS_JEFE_NIVEL3 : OBJETIVO_NIVEL3;
    Puntajelvl3 = Math.min(tope, Puntajelvl3 + n);
    actualizarMarcadoresLvl3();
}
function destruirMeteoritoLvl3(m) {
    if (m.muerto || !juegoActivoLvl3) return;
    const x = m.x, y = m.y;
    quitarMeteoritoLvl3(m);
    estadisticasLvl3.destruidos++;
    if (tJuegoLvl3 - ultimoKillLvl3 <= 2.2) comboLvl3++; else comboLvl3 = 1;
    ultimoKillLvl3 = tJuegoLvl3;
    estadisticasLvl3.comboMax = Math.max(estadisticasLvl3.comboMax, comboLvl3);
    let bonus = comboLvl3 % 5 === 0 ? 1 : 0;
    sumarPuntosLvl3(m.pts + bonus);
    reproducirLvl3("Puntos_sound");
    sfxLvl3.explosion();
    mostrarExplosionLvl3(x, y, m.tam * 1.7);
    particulasLvl3(x, y, m.pts > 1 ? 16 : 10, "#ffb347", m.tam * 1.1);
    textoFlotanteLvl3(x, y - m.tam * 0.4, "+" + m.pts, "");
    if (comboLvl3 >= 2) {
        sfxLvl3.combo(comboLvl3);
        comboHudLvl3.textContent = "COMBO x" + comboLvl3;
        comboHudLvl3.classList.remove("visible"); void comboHudLvl3.offsetWidth; comboHudLvl3.classList.add("visible");
    }
    if (bonus) textoFlotanteLvl3(x, y - m.tam * 0.9, "¡BONUS +1!", "bonus");
    if (Math.random() < 0.14 && itemsLvl3.length < 2 && jefeLvl3.estado === "no") soltarItemLvl3(x, y);
    if (Puntajelvl3 >= PUNTOS_JEFE_NIVEL3 && jefeLvl3.estado === "no") iniciarAvisoJefeLvl3();
}
function danarMeteoritoLvl3(m, dano, volley) {
    if (m.muerto) return;
    if (volley && !volley.acierto) { volley.acierto = true; estadisticasLvl3.aciertos++; }
    m.hp -= dano;
    if (m.hp <= 0) destruirMeteoritoLvl3(m);
    else {
        m.el.classList.add("GolpeLvl3", "DanadoLvl3");
        setTimeout(function () { m.el.classList.remove("GolpeLvl3"); }, 90);
        particulasLvl3(m.x, m.y, 5, "#ffffff", m.tam * 0.7);
        sfxLvl3.golpe();
    }
}
function actualizarMeteoritosLvl3(dt, W, H) {
    const limite = xLimiteLvl3();
    meteorosLvl3.slice().forEach(function (m) {
        if (m.muerto) return;
        m.x += m.vx * dt; m.y += m.vy * dt; m.rot += m.giro * dt;
        if (m.y < m.r || m.y > H - m.r) m.vy = -m.vy;
        m.el.style.transform = "translate(" + (m.x - m.tam / 2) + "px," + (m.y - m.tam / 2) + "px)";
        m.img.style.transform = "rotate(" + m.rot + "deg)";
        if (m.x + m.r * 0.8 >= limite && juegoActivoLvl3) impactarPlanetaLvl3(m.x, m.y, m.tam, m);
    });
}
/* Un golpe al planeta: la barrera lo absorbe una vez, si no se pierde una vida */
function golpePlanetaLvl3(x, y) {
    comboLvl3 = 0;
    if (escudoLvl3) {
        escudoLvl3 = false;
        barreraLvl3.classList.remove("visible");
        sfxLvl3.escudo();
        textoFlotanteLvl3(x, y - 20, "¡ESCUDO ROTO!", "item");
        particulasLvl3(x, y, 12, "#6fe9ff", 80);
        return true;
    }
    vidasLvl3--;
    actualizarVidasLvl3();
    reproducirLvl3("Perdiste_sound");
    sfxLvl3.impacto();
    sacudirLvl3(true);
    efectoImpactoPlanetaLvl3();
    particulasLvl3(x, y, 14, "#ff5a3a", 90);
    if (vidasLvl3 <= 0) { perderNivel3("FIN DEL JUEGO"); return false; }
    avisoLvl3(["¡IMPACTO DETECTADO!", "¡VIDA PERDIDA!"][Math.floor(Math.random() * 2)], "malo", 1000);
    return false;
}
function impactarPlanetaLvl3(x, y, tam, m) {
    if (m) quitarMeteoritoLvl3(m);
    mostrarExplosionLvl3(x, y, tam * 1.7);
    golpePlanetaLvl3(x, y);
}

/* ---------------------------------------------------------------------
   DISPAROS DEL JUGADOR
   --------------------------------------------------------------------- */
function angulosActualesLvl3() {
    const n = NAVES_LVL3[naveActualLvl3];
    if (tJuegoLvl3 < triplesHastaLvl3 && n.angulos.length < 3) return [-10, 0, 10];
    return n.angulos;
}
function dispararLvl3() {
    if (!juegoActivoLvl3 || pausadoLvl3 || jefeLvl3.estado === "muriendo") return;
    if (tJuegoLvl3 < proximoDisparoLvl3) return;
    const n = NAVES_LVL3[naveActualLvl3];
    proximoDisparoLvl3 = tJuegoLvl3 + n.cadencia;
    const ancho = naveJugadorLvl3.offsetWidth || 60;
    const x0 = posNaveLvl3.x - ancho * 0.5, y0 = posNaveLvl3.y;
    const volley = { acierto: false };
    estadisticasLvl3.disparos++;
    sfxLvl3.laser(naveActualLvl3);
    destelloDisparoLvl3(x0, y0, n.color);
    // Disparo a quemarropa
    for (let i = 0; i < meteorosLvl3.length; i++) {
        const m = meteorosLvl3[i];
        if (Math.hypot(m.x - posNaveLvl3.x, m.y - posNaveLvl3.y) <= m.r + ancho * 0.3) { danarMeteoritoLvl3(m, n.dano, volley); break; }
    }
    if (!juegoActivoLvl3) return;
    angulosActualesLvl3().forEach(function (ang) {
        const el = document.createElement("div");
        el.className = "LaserLvl3";
        el.style.width = n.lw * escalaLvl3 + "px"; el.style.height = n.lh * Math.max(1, escalaLvl3 * 0.8) + "px";
        el.style.setProperty("--c", n.color);
        tableroNivel3.appendChild(el);
        const rad = (180 + ang) * Math.PI / 180;
        lasersLvl3.push({ el: el, x: x0, y: y0, px: x0, py: y0, vx: Math.cos(rad) * n.velocidad * escalaLvl3,
            vy: Math.sin(rad) * n.velocidad * escalaLvl3, ang: ang, w: n.lw * escalaLvl3, h: n.lh * Math.max(1, escalaLvl3 * 0.8),
            dano: n.dano, atraviesa: n.atraviesa, golpeados: [], volley: volley });
    });
}
function limpiarLasersLvl3() { lasersLvl3.forEach(function (l) { l.el.remove(); }); lasersLvl3 = []; }

function actualizarLasersLvl3(dt, W, H) {
    for (let i = lasersLvl3.length - 1; i >= 0; i--) {
        const l = lasersLvl3[i];
        l.px = l.x; l.py = l.y; l.x += l.vx * dt; l.y += l.vy * dt;
        let eliminado = false;
        // contra el jefe (no se atraviesa)
        if (jefeLvl3.estado === "activo") {
            const rj = jefeLvl3.tam * 0.42;
            if (distSegPuntoLvl3(l.px, l.py, l.x, l.y, jefeLvl3.x, jefeLvl3.y) <= rj + l.h * 0.5) {
                if (l.volley && !l.volley.acierto) { l.volley.acierto = true; estadisticasLvl3.aciertos++; }
                golpearJefeLvl3(l.dano, l.x, l.y);
                eliminado = true;
            }
        }
        // contra las bolas de fuego del jefe
        if (!eliminado) {
            for (let j = bolasLvl3.length - 1; j >= 0; j--) {
                const b = bolasLvl3[j];
                if (distSegPuntoLvl3(l.px, l.py, l.x, l.y, b.x, b.y) <= b.r + l.h * 0.5) {
                    particulasLvl3(b.x, b.y, 8, "#ff9a3a", 50); sfxLvl3.golpe();
                    b.el.remove(); bolasLvl3.splice(j, 1);
                    eliminado = true; break;
                }
            }
        }
        if (!eliminado) {
            for (let j = 0; j < meteorosLvl3.length; j++) {
                const m = meteorosLvl3[j];
                if (m.muerto || l.golpeados.indexOf(m) >= 0) continue;
                if (distSegPuntoLvl3(l.px, l.py, l.x, l.y, m.x, m.y) <= m.r + l.h * 0.5 + 2) {
                    l.golpeados.push(m);
                    danarMeteoritoLvl3(m, l.dano, l.volley);
                    if (!juegoActivoLvl3) return;
                    if (l.atraviesa > 0) l.atraviesa--; else { eliminado = true; break; }
                }
            }
        }
        if (!juegoActivoLvl3) return;
        if (eliminado || l.x < -80 || l.y < -80 || l.y > H + 80) { l.el.remove(); lasersLvl3.splice(i, 1); }
        else l.el.style.transform = "translate(" + (l.x - l.w / 2) + "px," + (l.y - l.h / 2) + "px) rotate(" + l.ang + "deg)";
    }
}

/* ---------------------------------------------------------------------
   POWER-UPS (escudo, múltiple, cámara lenta, reparación)
   --------------------------------------------------------------------- */
const ICONOS_ITEM_LVL3 = {
    escudo: '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z" fill="currentColor"/></svg>',
    triple: '<svg viewBox="0 0 24 24"><path d="M2 12h14M3 6l13 3M3 18l13-3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
    lenta: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>',
    reparar: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.800-8 11-8 11z" fill="currentColor"/></svg>'
};
const COLOR_ITEM_LVL3 = { escudo: "#6fe9ff", triple: "#ffd54a", lenta: "#c58bff", reparar: "#ff5d7a" };
function soltarItemLvl3(x, y) {
    const tipos = ["escudo", "triple", "lenta"];
    if (vidasLvl3 < 3) tipos.push("reparar", "reparar");
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const el = document.createElement("div");
    el.className = "ItemLvl3";
    el.style.setProperty("--c", COLOR_ITEM_LVL3[tipo]);
    el.innerHTML = ICONOS_ITEM_LVL3[tipo];
    tableroNivel3.appendChild(el);
    itemsLvl3.push({ el: el, tipo: tipo, x: x, y: y, edad: 0, fase: Math.random() * 6 });
}
function activarItemLvl3(it) {
    sfxLvl3.item();
    if (it.tipo === "escudo") { escudoLvl3 = true; barreraLvl3.classList.add("visible"); textoFlotanteLvl3(it.x, it.y - 20, "ESCUDO DEL PLANETA", "item"); }
    else if (it.tipo === "triple") { triplesHastaLvl3 = tJuegoLvl3 + 8; textoFlotanteLvl3(it.x, it.y - 20, "DISPARO MÚLTIPLE", "item"); }
    else if (it.tipo === "lenta") { lentaHastaLvl3 = tJuegoLvl3 + 5; textoFlotanteLvl3(it.x, it.y - 20, "CÁMARA LENTA", "item"); }
    else {
        if (vidasLvl3 < 3) { vidasLvl3++; actualizarVidasLvl3(); }
        textoFlotanteLvl3(it.x, it.y - 20, "+1 VIDA", "item");
    }
}
function actualizarItemsLvl3(dt, W) {
    for (let i = itemsLvl3.length - 1; i >= 0; i--) {
        const it = itemsLvl3[i];
        it.edad += dt;
        it.x += 28 * escalaLvl3 * dt;
        it.y += Math.sin(it.edad * 3 + it.fase) * 22 * dt;
        it.el.style.transform = "translate(" + (it.x - 19) + "px," + (it.y - 19) + "px)";
        it.el.classList.toggle("parpadeo", it.edad > 6.5);
        if (Math.hypot(it.x - posNaveLvl3.x, it.y - posNaveLvl3.y) < 46 * escalaLvl3) {
            activarItemLvl3(it); it.el.remove(); itemsLvl3.splice(i, 1);
        } else if (it.edad > 8.5 || it.x > W + 40) { it.el.remove(); itemsLvl3.splice(i, 1); }
    }
}
function actualizarEfectosHudLvl3() {
    let h = "";
    if (escudoLvl3) h += '<span class="ChipEfectoLvl3" style="--c:#6fe9ff">ESCUDO</span>';
    if (tJuegoLvl3 < triplesHastaLvl3) h += '<span class="ChipEfectoLvl3" style="--c:#ffd54a">MÚLTIPLE ' + Math.ceil(triplesHastaLvl3 - tJuegoLvl3) + 's</span>';
    if (tJuegoLvl3 < lentaHastaLvl3) h += '<span class="ChipEfectoLvl3" style="--c:#c58bff">LENTA ' + Math.ceil(lentaHastaLvl3 - tJuegoLvl3) + 's</span>';
    if (h !== ultimoHtmlEfectosLvl3) { efectosHudLvl3.innerHTML = h; ultimoHtmlEfectosLvl3 = h; }
    tableroNivel3.classList.toggle("ModoLentoLvl3", tJuegoLvl3 < lentaHastaLvl3);
    if (tJuegoLvl3 - ultimoKillLvl3 > 2.2) comboHudLvl3.classList.remove("visible");
    naveJugadorLvl3.classList.toggle("InvulnerableLvl3", tJuegoLvl3 < invulnerableHastaLvl3);
}

/* ---------------------------------------------------------------------
   JEFE FINAL: METEORITO COLOSAL (3 fases)
   --------------------------------------------------------------------- */
function limpiarJefeLvl3() {
    if (jefeLvl3.elemento) { jefeLvl3.elemento.remove(); }
    tableroNivel3.querySelectorAll(".JefeExplosionLvl3").forEach(function (e) { e.remove(); });
    bolasLvl3.forEach(function (b) { b.el.remove(); }); bolasLvl3 = [];
    barraJefeLvl3.classList.remove("visible");
    tableroNivel3.classList.remove("JefeEnCombateLvl3", "JefePausadoLvl3", "AlertaJefeLvl3");
    jefeLvl3 = nuevoJefeLvl3();
}
function iniciarAvisoJefeLvl3() {
    if (jefeLvl3.estado !== "no") return;
    jefeLvl3.estado = "aviso";
    jefeLvl3.aviso = 2.6;
    limpiarMeteoritosLvl3(true);
    itemsLvl3.forEach(function (i) { i.el.remove(); }); itemsLvl3 = [];
    tableroNivel3.classList.add("AlertaJefeLvl3");
    avisoLvl3("⚠ ALERTA ⚠<small>METEORITO COLOSAL APROXIMÁNDOSE</small>", "jefe", 2500);
    sfxLvl3.sirena();
    setTimeout(function () { if (jefeLvl3.estado === "aviso") sfxLvl3.sirena(); }, 1100);
}
function aparecerJefeLvl3() {
    const e = document.createElement("div");
    e.className = "JefeMeteoritoLvl3";
    e.innerHTML = '<img class="JefeRocaLvl3" src="IMG/Meteorito_Jefe.png" alt="Meteorito jefe final" draggable="false">' +
        '<svg class="JefeRayosLvl3" viewBox="0 0 100 100" aria-hidden="true"><path d="M4 40 L15 27 L7 19 L24 9 M76 8 L93 22 L83 30 L98 47 M95 65 L83 78 L90 88 L71 95 M26 95 L11 81 L19 70 L2 55"/></svg>' +
        '<span class="JefeVidaLvl3">' + VIDA_JEFE_NIVEL3 + '/' + VIDA_JEFE_NIVEL3 + '</span>';
    tableroNivel3.appendChild(e);
    jefeLvl3.elemento = e;
    jefeLvl3.estado = "activo";
    jefeLvl3.t = 0;
    jefeLvl3.tam = Math.min(280 * escalaLvl3, tableroNivel3.clientWidth * 0.34, tableroNivel3.clientHeight * 0.6);
    jefeLvl3.x = -jefeLvl3.tam * 0.8;
    jefeLvl3.y = tableroNivel3.clientHeight / 2;
    jefeLvl3.proxFuego = 99;
    tableroNivel3.classList.remove("AlertaJefeLvl3");
    tableroNivel3.classList.add("JefeEnCombateLvl3");
    barraJefeLvl3.classList.add("visible");
    rellenoJefeLvl3.style.width = "100%"; estelaJefeLvl3.style.width = "100%";
    sfxLvl3.fase();
}
function golpearJefeLvl3(dano, x, y) {
    if (jefeLvl3.estado !== "activo") return;
    jefeLvl3.vida = Math.max(0, jefeLvl3.vida - dano);
    jefeLvl3.destello = 0.1;
    jefeLvl3.x -= 5 * dano * escalaLvl3; // pequeño empujón hacia atrás
    sfxLvl3.golpeJefe();
    particulasLvl3(x, y, 5, "#ffcf6a", 55);
    const pct = jefeLvl3.vida / VIDA_JEFE_NIVEL3;
    jefeLvl3.elemento.querySelector(".JefeVidaLvl3").textContent = jefeLvl3.vida + "/" + VIDA_JEFE_NIVEL3;
    jefeLvl3.elemento.style.setProperty("--heridas", 1 - pct);
    jefeLvl3.elemento.classList.add("JefeImpactadoLvl3");
    rellenoJefeLvl3.style.width = (pct * 100) + "%";
    setTimeout(function () { estelaJefeLvl3.style.width = (jefeLvl3.vida / VIDA_JEFE_NIVEL3 * 100) + "%"; }, 350);
    const nueva = pct <= 0.333 ? 3 : pct <= 0.666 ? 2 : 1;
    if (jefeLvl3.vida <= 0) { matarJefeLvl3(); return; }
    if (nueva > jefeLvl3.fase) {
        jefeLvl3.fase = nueva;
        jefeLvl3.elemento.classList.add("Fase" + nueva);
        jefeLvl3.proxFuego = 0.8;
        sfxLvl3.fase(); sacudirLvl3(true);
        avisoLvl3("FASE " + nueva + "<small>" + (nueva === 2 ? "¡LANZA BOLAS DE FUEGO!" : "¡ESTÁ FURIOSO!") + "</small>", "jefe", 1600);
    }
}
function matarJefeLvl3() {
    jefeLvl3.estado = "muriendo";
    jefeLvl3.muerte = 2.0;
    jefeLvl3.proxExplosion = 0;
    bolasLvl3.forEach(function (b) { b.el.remove(); }); bolasLvl3 = [];
    limpiarLasersLvl3();
    barraJefeLvl3.classList.remove("visible");
    jefeLvl3.elemento.classList.add("JefeMuriendoLvl3");
    avisoLvl3("¡JEFE DERROTADO!", "victoria", 1800);
    sfxLvl3.sirena();
}
function dispararBolasJefeLvl3() {
    const n = jefeLvl3.fase === 3 ? 2 : 1;
    sfxLvl3.fuego(jefeLvl3.fase);
    for (let k = 0; k < n; k++) {
        const dx = posNaveLvl3.x - jefeLvl3.x, dy = posNaveLvl3.y - jefeLvl3.y;
        let ang = Math.atan2(dy, dx) + (n === 2 ? (k === 0 ? -0.18 : 0.18) : 0);
        const vel = (jefeLvl3.fase === 3 ? 360 : 290) * escalaLvl3;
        const r = 13 * escalaLvl3;
        const el = document.createElement("div");
        el.className = "BolaFuegoLvl3";
        el.style.width = el.style.height = r * 2 + "px";
        tableroNivel3.appendChild(el);
        bolasLvl3.push({ el: el, x: jefeLvl3.x + jefeLvl3.tam * 0.3, y: jefeLvl3.y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, r: r });
    }
}
function actualizarBolasLvl3(dt, W, H) {
    for (let i = bolasLvl3.length - 1; i >= 0; i--) {
        const b = bolasLvl3[i];
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.el.style.transform = "translate(" + (b.x - b.r) + "px," + (b.y - b.r) + "px)";
        if (b.x > W + 40 || b.y < -40 || b.y > H + 40) { b.el.remove(); bolasLvl3.splice(i, 1); continue; }
        const rn = (naveJugadorLvl3.offsetWidth || 60) * 0.28;
        if (tJuegoLvl3 >= invulnerableHastaLvl3 && Math.hypot(b.x - posNaveLvl3.x, b.y - posNaveLvl3.y) < b.r + rn) {
            b.el.remove(); bolasLvl3.splice(i, 1);
            herirNaveLvl3(b.x, b.y);
            if (!juegoActivoLvl3) return;
        }
    }
}
function herirNaveLvl3(x, y) {
    invulnerableHastaLvl3 = tJuegoLvl3 + 1.6;
    vidasLvl3--;
    actualizarVidasLvl3();
    reproducirLvl3("Perdiste_sound");
    sfxLvl3.impacto(); sacudirLvl3(true);
    mostrarExplosionLvl3(x, y, 90 * escalaLvl3);
    particulasLvl3(x, y, 12, "#ff7a3a", 80);
    comboLvl3 = 0;
    if (vidasLvl3 <= 0) { perderNivel3("NAVE DESTRUIDA"); return; }
    avisoLvl3("¡NAVE DAÑADA!", "malo", 1000);
}
function actualizarJefeLvl3(dt, W, H) {
    const j = jefeLvl3;
    if (j.estado === "aviso") {
        j.aviso -= dt;
        if (j.aviso <= 0) aparecerJefeLvl3();
        return;
    }
    if (j.estado === "muriendo") {
        j.muerte -= dt;
        j.proxExplosion -= dt;
        if (j.proxExplosion <= 0 && j.muerte > 0.5) {
            j.proxExplosion = 0.14;
            const ox = (Math.random() * 2 - 1) * j.tam * 0.35, oy = (Math.random() * 2 - 1) * j.tam * 0.35;
            mostrarExplosionLvl3(j.x + ox, j.y + oy, j.tam * (0.4 + Math.random() * 0.4));
            particulasLvl3(j.x + ox, j.y + oy, 6, "#ffb347", j.tam * 0.5);
            ruidoLvl3(0.25, 0.2, 800);
            if (Math.random() < 0.5) sacudirLvl3(false);
        }
        if (j.muerte <= 0.5 && !j.grande) {
            j.grande = true;
            j.elemento.classList.add("JefeDestruidoLvl3");
            const g = document.createElement("img");
            g.className = "JefeExplosionLvl3"; g.alt = "";
            g.style.left = j.x + "px"; g.style.top = j.y + "px"; g.style.width = j.tam * 2.2 + "px";
            g.src = "IMG/explosion_lvl2/Explosion_001.png";
            tableroNivel3.appendChild(g);
            j.gran = g;
            sfxLvl3.impacto(); sacudirLvl3(true);
            particulasLvl3(j.x, j.y, 30, "#ffd36a", j.tam * 1.2);
        }
        if (j.gran) {
            const c = Math.min(10, 1 + Math.floor((0.5 - Math.max(0, j.muerte)) / 0.05));
            j.gran.src = "IMG/explosion_lvl2/Explosion_" + String(c).padStart(3, "0") + ".png";
        }
        if (j.muerte <= 0) ganarNivel3();
        return;
    }
    if (j.estado !== "activo") return;
    j.t += dt;
    j.destello = Math.max(0, j.destello - dt);
    if (!j.destello) j.elemento.classList.remove("JefeImpactadoLvl3");
    const vel = W / 42 * (j.fase === 1 ? 1 : j.fase === 2 ? 1.2 : 1.4);
    const entrada = j.x < W * 0.08 ? 3 : 1;           // entra más rápido
    j.x += vel * entrada * dt;
    const amp = H * (j.fase === 1 ? 0.08 : j.fase === 2 ? 0.15 : 0.22);
    j.y = H / 2 + Math.sin(j.t * (0.8 + j.fase * 0.25)) * amp;
    if (j.fase >= 2) {
        j.proxFuego -= dt;
        if (j.proxFuego <= 0 && j.x > 0) { dispararBolasJefeLvl3(); j.proxFuego = j.fase === 3 ? 1.5 : 2.4; }
    }
    j.elemento.style.width = j.tam + "px"; j.elemento.style.height = j.tam + "px";
    j.elemento.style.left = j.x + "px"; j.elemento.style.top = j.y + "px";
    if (j.x + j.tam * 0.42 >= xLimiteLvl3()) {
        // El jefe alcanzó la Tierra: el planeta es destruido y se pierden todas las vidas
        mostrarExplosionLvl3(xLimiteLvl3() + j.tam * 0.3, j.y, j.tam * 1.8);
        particulasLvl3(xLimiteLvl3(), j.y, 24, "#ff7a3a", j.tam);
        efectoImpactoPlanetaLvl3();
        vidasLvl3 = 0;
        actualizarVidasLvl3();
        reproducirLvl3("Perdiste_sound");
        perderNivel3("PLANETA DESTRUIDO");
    }
}

/* ---------------------------------------------------------------------
   BUCLE PRINCIPAL
   --------------------------------------------------------------------- */
function bucleLvl3(ts) {
    rafLvl3 = requestAnimationFrame(bucleLvl3);
    if (!ultimoTsLvl3) ultimoTsLvl3 = ts;
    const dt = Math.min(0.05, (ts - ultimoTsLvl3) / 1000);
    ultimoTsLvl3 = ts;
    if (!juegoActivoLvl3 || pausadoLvl3) return;

    tJuegoLvl3 += dt;
    const W = tableroNivel3.clientWidth, H = tableroNivel3.clientHeight;
    const factor = tJuegoLvl3 < lentaHastaLvl3 ? 0.4 : 1;

    // Tiempo límite (se detiene mientras avisa o muere el jefe)
    if (jefeLvl3.estado !== "aviso" && jefeLvl3.estado !== "muriendo") transcurridoLvl3 += dt;
    Tiempolvl3 = Math.max(0, Math.ceil(TIEMPO_NIVEL3 - transcurridoLvl3));
    if (Tiempolvl3 <= 10 && Tiempolvl3 > 0 && Tiempolvl3 !== ultimoSegAlarmaLvl3) { ultimoSegAlarmaLvl3 = Tiempolvl3; sfxLvl3.alarma(Tiempolvl3 <= 5); }
    actualizarMarcadoresLvl3();
    if (Tiempolvl3 <= 0) { perderNivel3("TIEMPO AGOTADO"); return; }

    // Aparición de meteoritos (solo antes del jefe)
    if (jefeLvl3.estado === "no") {
        acumSpawnLvl3 += dt * factor;
        if (acumSpawnLvl3 >= proximoSpawnLvl3) {
            acumSpawnLvl3 = 0;
            proximoSpawnLvl3 = calcularSpawnLvl3();
            if (meteorosLvl3.length < maxMeteoritosLvl3()) crearMeteoritoLvl3(W, H);
        }
    }
    actualizarMeteoritosLvl3(dt * factor, W, H);
    if (!juegoActivoLvl3) return;
    actualizarLasersLvl3(dt, W, H);
    if (!juegoActivoLvl3) return;
    actualizarJefeLvl3(dt, W, H);
    if (!juegoActivoLvl3) return;
    actualizarBolasLvl3(dt, W, H);
    if (!juegoActivoLvl3) return;
    actualizarItemsLvl3(dt, W);

    if (mantenidoLvl3 || teclaDisparoLvl3) dispararLvl3();

    const dy = posNaveLvl3.y - ratonPrevYLvl3;
    ratonPrevYLvl3 = posNaveLvl3.y;
    inclinacionLvl3 += (Math.max(-14, Math.min(14, dy * 1.6)) - inclinacionLvl3) * 0.2;
    naveJugadorLvl3.style.transform = "translate(-50%,-50%) rotate(" + (rotNaveLvl3(naveActualLvl3) + inclinacionLvl3).toFixed(1) + "deg)";
    sincronizarPropulsorLvl3();
    actualizarEfectosHudLvl3();
    posicionarBarreraLvl3();
}
function posicionarBarreraLvl3() {
    barreraLvl3.style.left = xLimiteLvl3() + "px";
}
function iniciarBucleLvl3() {
    if (rafLvl3) cancelAnimationFrame(rafLvl3);
    ultimoTsLvl3 = 0;
    rafLvl3 = requestAnimationFrame(bucleLvl3);
}
function limpiarEntidadesLvl3() {
    limpiarMeteoritosLvl3(false);
    limpiarLasersLvl3();
    itemsLvl3.forEach(function (i) { i.el.remove(); }); itemsLvl3 = [];
    limpiarJefeLvl3();
    tableroNivel3.querySelectorAll(".ExplosionMeteoritoLvl3,.ParticulaLvl3,.TextoFlotanteLvl3,.AvisoLvl3,.DestelloLvl3").forEach(function (e) { e.remove(); });
}
function detenerMotorLvl3() {
    if (rafLvl3) cancelAnimationFrame(rafLvl3);
    rafLvl3 = null;
    limpiarEntidadesLvl3();
}

/* ---------------------------------------------------------------------
   FIN DE LA PARTIDA
   --------------------------------------------------------------------- */
function precisionLvl3() {
    return estadisticasLvl3.disparos ? Math.round(estadisticasLvl3.aciertos / estadisticasLvl3.disparos * 100) : 0;
}
function filaEstadisticasLvl3(extra) {
    return '<div class="EstadisticasLvl3">' +
        '<div><b>' + precisionLvl3() + '%</b><small>PRECISIÓN</small></div>' +
        '<div><b>' + estadisticasLvl3.destruidos + '</b><small>DESTRUIDOS</small></div>' +
        '<div><b>x' + estadisticasLvl3.comboMax + '</b><small>COMBO MÁX</small></div>' +
        (extra || '') + '</div>';
}
function finalizarBaseLvl3() {
    terminadoLvl3 = true;
    juegoActivoLvl3 = false;
    mantenidoLvl3 = false; teclaDisparoLvl3 = false;
    if (rafLvl3) cancelAnimationFrame(rafLvl3);
    rafLvl3 = null;
    limpiarLasersLvl3();
    naveJugadorLvl3.style.opacity = "0";
    sincronizarPropulsorLvl3();
    tableroNivel3.classList.remove("PeligroLvl3", "ModoLentoLvl3");
    raizNivel3.querySelector(".Tiempolvl3").classList.remove("TiempoCriticoLvl3");
    barreraLvl3.classList.remove("visible");
    efectosHudLvl3.innerHTML = ""; ultimoHtmlEfectosLvl3 = "";
    document.getElementById("Fondo_Ciberpunk").pause();
}
function ganarNivel3() {
    if (terminadoLvl3) return;
    registrarVictoriaMision(3);
    Puntajelvl3 = OBJETIVO_NIVEL3;
    actualizarMarcadoresLvl3();
    finalizarBaseLvl3();
    limpiarEntidadesLvl3();
    reproducirLvl3("Triunfo");
    planetaLvl3.style.setProperty("display", "none");

    const pantalla = document.getElementById("Ganaste_Pantallalvl3");
    let estrellas = 1;
    if (vidasLvl3 >= 2) estrellas++;
    if (Tiempolvl3 >= 8) estrellas++;
    const tiempoUsado = Math.round(transcurridoLvl3);
    const rec = parseFloat(leerLvl3("ironfist_record3") || "0");
    const nuevoRecord = !rec || tiempoUsado < rec;
    if (nuevoRecord) guardarLvl3("ironfist_record3", tiempoUsado);
    const viejo = pantalla.querySelector(".ResumenVictoriaLvl3");
    if (viejo) viejo.remove();
    const r = document.createElement("div");
    r.className = "ResumenVictoriaLvl3";
    r.innerHTML = '<div class="EstrellasLvl3" aria-label="' + estrellas + ' de 3 estrellas">' +
        [1, 2, 3].map(function (i) { return '<span class="' + (i <= estrellas ? "on" : "") + '" style="animation-delay:' + (0.3 + i * 0.25) + 's">★</span>'; }).join("") + '</div>' +
        filaEstadisticasLvl3('<div><b>' + tiempoUsado + 's</b><small>TIEMPO</small></div>') +
        '<p class="RecordLvl3">' + (nuevoRecord ? "★ ¡NUEVO RÉCORD! ★" : "Récord: " + rec + "s") + '</p>';
    pantalla.insertBefore(r, document.getElementById("VolverInicioNivel3"));
    pantalla.style.display = "flex";
    mostrarVolverInicio(true);
    document.getElementById("VerCreditosLvl3").hidden = false;
    document.getElementById("BotonReiniciarNivel1").hidden = false;
    document.getElementById("NEXT").hidden = true;
}
function perderNivel3(mensaje) {
    if (terminadoLvl3) return;
    finalizarBaseLvl3();
    limpiarEntidadesLvl3();
    sfxLvl3.impacto();
    document.querySelector("#NIVEL3 .Mensaje_Pauselvl3").textContent = mensaje;
    const resumen = document.getElementById("ResumenDerrotaLvl3");
    resumen.innerHTML = filaEstadisticasLvl3('<div><b>' + Puntajelvl3 + '</b><small>PUNTOS</small></div>');
    resumen.appendChild(botonCambiarNaveLvl3);
    resumen.style.display = "block";
    document.getElementById("Pausa_Pantallalvl3").classList.add("FinDerrotaLvl3");
    document.getElementById("Pausa_Pantallalvl3").style.display = "table";
    mostrarVolverInicio(true);
    document.getElementById("VerCreditosLvl3").hidden = true;
    document.getElementById("BotonReiniciarNivel1").hidden = false;
}

/* ---------------------------------------------------------------------
   INICIO / REINICIO DE LA PARTIDA
   --------------------------------------------------------------------- */
function prepararPartidaLvl3() {
    detenerMotorLvl3();
    jefeLvl3 = nuevoJefeLvl3();
    tJuegoLvl3 = 0; transcurridoLvl3 = 0; acumSpawnLvl3 = 0; proximoSpawnLvl3 = 0.5;
    comboLvl3 = 0; ultimoKillLvl3 = -99; proximoDisparoLvl3 = 0;
    triplesHastaLvl3 = 0; lentaHastaLvl3 = 0; invulnerableHastaLvl3 = 0;
    escudoLvl3 = !!NAVES_LVL3[naveActualLvl3].escudoInicial;
    barreraLvl3.classList.toggle("visible", escudoLvl3);
    estadisticasLvl3 = { disparos: 0, aciertos: 0, destruidos: 0, comboMax: 0 };
    ultimoHtmlEfectosLvl3 = ""; efectosHudLvl3.innerHTML = ""; ultimoSegAlarmaLvl3 = -1;
    comboHudLvl3.classList.remove("visible");
    Tiempolvl3 = TIEMPO_NIVEL3; Puntajelvl3 = 0; vidasLvl3 = 3;
    pausadoLvl3 = false; terminadoLvl3 = false; inclinacionLvl3 = 0;
    actualizarVidasLvl3();
    actualizarMarcadoresLvl3();
    document.getElementById("DialogoCreditosLvl3").close();
    ["BotonReiniciarNivel1", "NEXT", "ReiniciarTiempoLvl3", "VerCreditosLvl3"].forEach(function (id) { document.getElementById(id).hidden = true; });
    mostrarVolverInicio(false);
    document.getElementById("Ganaste_Pantallalvl3").style.display = "none";
    document.getElementById("Pausa_Pantallalvl3").style.display = "none";
    document.getElementById("ResumenDerrotaLvl3").style.display = "none";
    document.getElementById("Pausa_Pantallalvl3").classList.remove("FinDerrotaLvl3");
    planetaLvl3.style.setProperty("display", "block");
    ["Pantalla_Ovnislvl3", "Pantalla_Nodrizalvl3", "Pantalla_Ovnis2lvl3", "Proximolvl3"].forEach(function (id) { document.getElementById(id).style.display = "none"; });
    tableroNivel3.classList.remove("PausadoLvl3");
    const pausa = document.getElementById("Pauselvl3");
    pausa.textContent = "PAUSAR"; pausa.setAttribute("aria-pressed", "false");
    pintarNaveLvl3();
}
function JUEGOlvl3() {
    prepararPartidaLvl3();
    juegoActivoLvl3 = true;
    const W = tableroNivel3.clientWidth, H = tableroNivel3.clientHeight;
    colocarNaveLvl3(W * 0.85, H / 2);
    ratonPrevYLvl3 = H / 2;
    naveJugadorLvl3.style.opacity = "1";
    sincronizarPropulsorLvl3();
    posicionarBarreraLvl3();
    actualizarVidasLvl3();
    DETENER_JUEGOlvl3();
    iniciarBucleLvl3();
}
function reiniciarPorTiempoLvl3() {
    if (!terminadoLvl3) return;
    const audio = document.getElementById("Fondo_Ciberpunk");
    audio.currentTime = 0;
    audio.play().catch(function () { });
    JUEGOlvl3();
}
function cambiarNaveLvl3() {
    if (!terminadoLvl3) return;
    prepararPartidaLvl3();
    terminadoLvl3 = false; juegoActivoLvl3 = false; iniciandoLvl3 = false;
    naveJugadorLvl3.style.opacity = "0";
    inicioLvl3.classList.remove("StartSaliendo");
    inicioLvl3.style.display = "";
    document.getElementById("Contenedor_contadorlvl3").style.display = "none";
    mostrarVolverInicio(true);
}
document.getElementById("ReiniciarTiempoLvl3").addEventListener("click", reiniciarPorTiempoLvl3);

/* Contenedor del resumen de derrota + botón para cambiar de nave */
const botonCambiarNaveLvl3 = document.createElement("button");
(function () {
    const pant = document.getElementById("Pausa_Pantallalvl3");
    const r = document.createElement("div");
    r.id = "ResumenDerrotaLvl3"; r.className = "ResumenDerrotaLvl3"; r.style.display = "none";
    const b = botonCambiarNaveLvl3;
    b.type = "button"; b.id = "CambiarNaveLvl3"; b.className = "BotonCambiarNaveLvl3"; b.textContent = "CAMBIAR NAVE";
    b.addEventListener("click", cambiarNaveLvl3);
    r.appendChild(b);
    pant.appendChild(r);
})();

/* ---------------------------------------------------------------------
   CUENTA ATRÁS
   --------------------------------------------------------------------- */
function PLAYlvl3() {
    if (iniciandoLvl3 || juegoActivoLvl3) return;
    iniciandoLvl3 = true;
    audioLvl3();
    aplicarVolumenLvl3();
    const audio = document.getElementById("Fondo_Ciberpunk");
    audio.currentTime = 0;
    audio.play().catch(function () { });
    inicioLvl3.classList.add("StartSaliendo");
    const cont = document.getElementById("Contenedor_contadorlvl3");
    const num = document.getElementById("RGBlvl3");
    cont.style.display = "flex";
    const secuencia = ["3", "2", "1", "¡YA!"];
    let i = 0;
    function mostrar() {
        const fin = i === secuencia.length - 1;
        num.textContent = secuencia[i];
        num.classList.toggle("Final", fin);
        num.classList.remove("PulsoConteoLvl3"); void num.offsetWidth; num.classList.add("PulsoConteoLvl3");
        sfxLvl3.conteo(fin);
        i++;
        if (i < secuencia.length) conteoTimerLvl3 = setTimeout(mostrar, 900);
        else conteoTimerLvl3 = setTimeout(function () {
            conteoTimerLvl3 = null;
            cont.style.display = "none";
            inicioLvl3.style.display = "none";
            iniciandoLvl3 = false;
            JUEGOlvl3();
        }, 750);
    }
    conteoTimerLvl3 = setTimeout(mostrar, 450);
}

/* ---------------------------------------------------------------------
   PAUSA, VOLUMEN, PANTALLA COMPLETA Y TECLADO
   --------------------------------------------------------------------- */
function DETENER_JUEGOlvl3() {
    document.getElementById("Pauselvl3").onclick = function () {
        if (!juegoActivoLvl3 || terminadoLvl3) return;
        pausadoLvl3 = !pausadoLvl3;
        mantenidoLvl3 = false; teclaDisparoLvl3 = false;
        tableroNivel3.classList.toggle("JefePausadoLvl3", pausadoLvl3);
        tableroNivel3.classList.toggle("PausadoLvl3", pausadoLvl3);
        ultimoTsLvl3 = 0;
        mostrarVolverInicio(pausadoLvl3);
        document.getElementById("VerCreditosLvl3").hidden = true;
        const b = document.getElementById("Pauselvl3");
        b.textContent = pausadoLvl3 ? "REANUDAR" : "PAUSAR";
        b.setAttribute("aria-pressed", String(pausadoLvl3));
        document.querySelector("#NIVEL3 .Mensaje_Pauselvl3").innerHTML = "EL JUEGO ESTA<br>EN PAUSA";
        document.getElementById("ResumenDerrotaLvl3").style.display = "none";
        document.getElementById("Pausa_Pantallalvl3").classList.remove("FinDerrotaLvl3");
        document.getElementById("Pausa_Pantallalvl3").style.display = pausadoLvl3 ? "table" : "none";
        const a = document.getElementById("Fondo_Ciberpunk");
        if (pausadoLvl3) a.pause(); else a.play().catch(function () { });
    };
}
DETENER_JUEGOlvl3();
document.addEventListener("visibilitychange", function () {
    if (document.hidden && juegoActivoLvl3 && !pausadoLvl3) document.getElementById("Pauselvl3").click();
});
document.addEventListener("fullscreenchange", function () {
    if (!document.fullscreenElement && juegoActivoLvl3 && !pausadoLvl3) document.getElementById("Pauselvl3").click();
});
document.getElementById("PantallaCompletaLvl3").addEventListener("click", async function () {
    try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await raizNivel3.requestFullscreen();
    } catch (error) { console.warn("No se pudo cambiar la pantalla completa:", error); }
});
document.getElementById("VolverInicioNivel3").addEventListener("click", function () {
    window.location.hash = "inicio";
    window.location.reload();
});

document.addEventListener("keydown", function (e) {
    if (!raizNivel3 || raizNivel3.getClientRects().length === 0) return;
    const inicioVisible = inicioLvl3.style.display !== "none" && !iniciandoLvl3 && !juegoActivoLvl3 && !terminadoLvl3;
    if (inicioVisible) {
        const idx = ORDEN_NAVES_LVL3.indexOf(naveActualLvl3), n = ORDEN_NAVES_LVL3.length;
        if (e.key >= "1" && e.key <= "4") seleccionarNaveLvl3(ORDEN_NAVES_LVL3[parseInt(e.key, 10) - 1]);
        else if (e.key === "ArrowRight") seleccionarNaveLvl3(ORDEN_NAVES_LVL3[(idx + 1) % n]);
        else if (e.key === "ArrowLeft") seleccionarNaveLvl3(ORDEN_NAVES_LVL3[(idx + n - 1) % n]);
        else if (e.key === "Enter") PLAYlvl3();
        return;
    }
    if (!juegoActivoLvl3) return;
    if (e.key === "p" || e.key === "P") { e.preventDefault(); document.getElementById("Pauselvl3").click(); }
    else if (e.key === " " && !pausadoLvl3) { e.preventDefault(); teclaDisparoLvl3 = true; dispararLvl3(); }
});
document.addEventListener("keyup", function (e) { if (e.key === " ") teclaDisparoLvl3 = false; });

/* ---------------------------------------------------------------------
   CONTROL DE LA NAVE (ratón y táctil)
   --------------------------------------------------------------------- */
function posicionEnTableroLvl3(e) {
    const a = tableroNivel3.getBoundingClientRect();
    const ex = a.width / tableroNivel3.offsetWidth || 1, ey = a.height / tableroNivel3.offsetHeight || 1;
    return { x: (e.clientX - a.left - tableroNivel3.clientLeft * ex) / ex, y: (e.clientY - a.top - tableroNivel3.clientTop * ey) / ey };
}
function actualizarNaveJugadorLvl3(e) {
    if (!juegoActivoLvl3 || pausadoLvl3 || terminadoLvl3) return;
    const p = posicionEnTableroLvl3(e);
    const m = Math.max(naveJugadorLvl3.offsetWidth, naveJugadorLvl3.offsetHeight) / 2;
    colocarNaveLvl3(Math.max(m, Math.min(tableroNivel3.clientWidth - m, p.x)), Math.max(m, Math.min(tableroNivel3.clientHeight - m, p.y)));
    naveJugadorLvl3.style.opacity = "1";
}
tableroNivel3.addEventListener("pointermove", actualizarNaveJugadorLvl3);
tableroNivel3.addEventListener("pointerdown", function (e) {
    if (!juegoActivoLvl3 || pausadoLvl3) return;
    if (e.button !== undefined && e.button > 0) return;
    actualizarNaveJugadorLvl3(e);
    mantenidoLvl3 = true;
    dispararLvl3();
});
document.addEventListener("pointerup", function () { mantenidoLvl3 = false; });
document.addEventListener("pointercancel", function () { mantenidoLvl3 = false; });
tableroNivel3.addEventListener("contextmenu", function (e) { if (juegoActivoLvl3) e.preventDefault(); });

/* ---------------------------------------------------------------------
   ARRANQUE Y RESPONSIVE
   --------------------------------------------------------------------- */
seleccionarNaveLvl3(naveActualLvl3, true);
ORDEN_NAVES_LVL3.forEach(function (id) { cargarNaveLvl3(id, 0); });
actualizarVidasLvl3();
actualizarMarcadoresLvl3();
aplicarVolumenLvl3();
(function escalaResponsiveLvl3() {
    function ajustar() {
        const w = tableroNivel3.offsetWidth, h = tableroNivel3.offsetHeight;
        if (!w || !h) return;
        escalaLvl3 = Math.max(1, Math.min(2.4, Math.min(w / 1400, h / 620)));
        raizNivel3.style.setProperty("--e", escalaLvl3.toFixed(3));
        posicionarBarreraLvl3();
    }
    if (typeof ResizeObserver === "function") new ResizeObserver(ajustar).observe(tableroNivel3);
    window.addEventListener("resize", ajustar);
    document.addEventListener("fullscreenchange", function () { setTimeout(ajustar, 60); });
    ajustar();
})();

// Créditos finales: disponibles únicamente después de superar el nivel 3.
let animacionCreditosLvl3 = null;
let volumenAnteriorCreditosLvl3 = null;
function detenerCreditosLvl3() {
    if (animacionCreditosLvl3) {
        animacionCreditosLvl3.cancel();
        animacionCreditosLvl3 = null;
    }
    const musica = document.getElementById('Musica_Final');
    musica.pause();
    musica.currentTime = 0;
    if (volumenAnteriorCreditosLvl3 !== null) musica.volume = volumenAnteriorCreditosLvl3;
    volumenAnteriorCreditosLvl3 = null;
    document.body.classList.remove('creditos-activos');
}
function abrirCreditosLvl3() {
    if (!terminadoLvl3 || Puntajelvl3 < 40) return;
    const dialogo = document.getElementById('DialogoCreditosLvl3');
    if (dialogo.open) return;
    detenerCreditosLvl3();
    const secuencia = document.getElementById('SecuenciaCreditosLvl3');
    const final = document.getElementById('FinalCreditosLvl3');
    final.hidden = true;
    secuencia.style.visibility = 'visible';
    dialogo.showModal();
    document.body.classList.add('creditos-activos');
    const ventana = dialogo.querySelector('.CreditosVentana');
    animacionCreditosLvl3 = secuencia.animate([
        { transform: 'translateY(' + ventana.clientHeight + 'px)' },
        { transform: 'translateY(-' + secuencia.scrollHeight + 'px)' }
    ], { duration: 60000, easing: 'linear', fill: 'forwards' });
    const actual = animacionCreditosLvl3;
    actual.finished.then(() => {
        if (animacionCreditosLvl3 !== actual || !dialogo.open) return;
        secuencia.style.visibility = 'hidden';
        final.hidden = false;
    }).catch(() => {}); // Cerrar cancela la secuencia intencionalmente.
    ['Triunfo', 'Ganaste', 'Fondo_Ciberpunk'].forEach(id => document.getElementById(id).pause());
    const musica = document.getElementById('Musica_Final');
    volumenAnteriorCreditosLvl3 = musica.volume;
    musica.volume = Math.max(0, Math.min(1, Number(document.getElementById('VolumenLvl3').value))) * 0.5;
    musica.currentTime = 0;
    musica.play().catch(() => {});
}
document.addEventListener('DOMContentLoaded', () => {
    const dialogo = document.getElementById('DialogoCreditosLvl3');
    document.getElementById('VerCreditosLvl3').addEventListener('click', abrirCreditosLvl3);
    dialogo.addEventListener('close', detenerCreditosLvl3);
    dialogo.addEventListener('cancel', detenerCreditosLvl3);
    document.getElementById('VolverMenuCreditosLvl3').addEventListener('click', () => {
        dialogo.close();
        detenerCreditosLvl3();
        window.location.hash = 'inicio';
        window.location.reload();
    });
});

window.addEventListener('pagehide', detenerMotorLvl3);
