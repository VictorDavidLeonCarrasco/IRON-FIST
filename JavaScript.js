
Tiempo = 70 //VARIBLE DE INICIO TIEMPO
Puntaje = 0 //VARIABLE DE INICIO PUNTOS
let vidasNivel1 = 3;
let vidasNivel1Impactadas = { Meteiorito: false, Meteiorito2: false };
let finDelJuegoNivel1 = false;
const volumenNivel1Default = 0.7;
const objetivoPuntosNivel1 = 15;
const segundosCuentaNivel1 = 3;
let intervaloCuentaNivel1 = null;
let Conteo = segundosCuentaNivel1;


// Combos y estadísticas del nivel 1, con las reglas del nivel 2.
let comboNivel1 = 0;
let ultimoMeteoritoNivel1 = -99;
let estadisticasNivel1 = { disparos: 0, aciertos: 0, destruidos: 0, comboMax: 0 };

function registrarDestruccionNivel1() {
    estadisticasNivel1.aciertos++;
    estadisticasNivel1.destruidos++;
    comboNivel1 = relojNivel1 - ultimoMeteoritoNivel1 <= 2.2 ? comboNivel1 + 1 : 1;
    ultimoMeteoritoNivel1 = relojNivel1;
    estadisticasNivel1.comboMax = Math.max(estadisticasNivel1.comboMax, comboNivel1);
    const bonus = comboNivel1 % 5 === 0 ? 1 : 0;
    const indicador = document.getElementById('ComboNivel1');
    if (comboNivel1 >= 2) {
        indicador.textContent = 'COMBO x' + comboNivel1 + (bonus ? ' · ¡BONUS +1!' : '');
        indicador.classList.remove('visible');
        void indicador.offsetWidth;
        indicador.classList.add('visible');
        if (typeof sfxLvl2 !== 'undefined') sfxLvl2.combo(comboNivel1);
    }
    return 1 + bonus;
}

function actualizarLogroNivel1() {
    const estrellas = vidasNivel1 === 3 && Tiempo >= 15 ? 3 : vidasNivel1 >= 2 ? 2 : 1;
    const bloqueEstrellas = document.getElementById('EstrellasNivel1');
    bloqueEstrellas.setAttribute('aria-label', estrellas + ' de 3 estrellas');
    bloqueEstrellas.querySelectorAll('span').forEach((estrella, i) => {
        estrella.classList.toggle('on', i < estrellas);
        estrella.style.setProperty('--d', (0.25 + i * 0.25) + 's');
    });
    const precision = estadisticasNivel1.disparos
        ? Math.round(estadisticasNivel1.aciertos / estadisticasNivel1.disparos * 100) + '%' : '--';
    const datos = [
        [estadisticasNivel1.destruidos, 'DESTRUIDOS'],
        [precision, 'PRECISIÓN'],
        ['x' + estadisticasNivel1.comboMax, 'MEJOR COMBO'],
        [Tiempo + 's', 'TIEMPO SOBRANTE'],
        [vidasNivel1 + '/3', 'VIDAS']
    ];
    document.getElementById('EstadisticasVictoriaNivel1').innerHTML = datos
        .map(([valor, etiqueta]) => '<div><b>' + valor + '</b><small>' + etiqueta + '</small></div>').join('');
    let anterior = null;
    try {
        const guardado = JSON.parse(localStorage.getItem('ironfist_lvl1_record'));
        if (guardado && Number.isInteger(guardado.estrellas) && guardado.estrellas >= 1 &&
            guardado.estrellas <= 3 && Number.isFinite(guardado.tiempo) && guardado.tiempo >= 0) anterior = guardado;
    } catch (error) { /* El logro funciona aunque el almacenamiento no esté disponible. */ }
    const mejor = !anterior || estrellas > anterior.estrellas ||
        (estrellas === anterior.estrellas && Tiempo > anterior.tiempo);
    const record = mejor ? { estrellas, tiempo: Tiempo } : anterior;
    if (mejor) {
        try { localStorage.setItem('ironfist_lvl1_record', JSON.stringify(record)); } catch (error) {}
    }
    document.getElementById('RecordNivel1').textContent = mejor ? '¡NUEVO RÉCORD!' :
        'MEJOR: ' + '★'.repeat(record.estrellas) + ' · ' + record.tiempo + 's SOBRANTES';
    document.getElementById('ComboNivel1').classList.remove('visible');
}

function actualizarPuntajeNivel1() {
    document.getElementById('Puntaje').textContent = `${Puntaje} / ${objetivoPuntosNivel1}`;
}

function alturaAleatoriaNivel1() {
    const tablero = document.querySelector('#NIVEL_01 > .Contenedor:not(.Cabezera)');
    const meteoritos = tablero.querySelectorAll('.Meteiorito');
    const alturaMeteorito = Math.max(...Array.from(meteoritos, meteorito => meteorito.offsetHeight));
    return Math.round(Math.random() * Math.max(0, tablero.clientHeight - alturaMeteorito));
}

function actualizarVidasNivel1() {
    const danoPlaneta = Math.max(0, Math.min(3, 3 - vidasNivel1));
    document.querySelector('#NIVEL_01 .Planeta').src = 'IMG/planetas_lvl2/planeta_' + danoPlaneta + '.png';
    const vidas = document.querySelectorAll('.VidaNivel1');
    vidas.forEach((vida, index) => {
        const restante = index < vidasNivel1;
        vida.classList.toggle('perdida', !restante);
        vida.textContent = restante ? '♥' : '♡';
    });
}

function aplicarVolumenNivel1(valor) {
    const volumen = Math.max(0, Math.min(1, valor / 100));
    const elementosAudio = [
        document.getElementById('Fondo_Ciberpunk'),
        document.getElementById('Perdiste_sound'),
        document.getElementById('Puntos_sound'),
        document.getElementById('Punto2'),
        document.getElementById('Punto3'),
        document.getElementById('Punto4'),
        document.getElementById('narracion'),
        document.getElementById('Triunfo'),
        document.getElementById('Ganaste'),
        document.getElementById('Musica_Final')
    ];

    elementosAudio.forEach((audio) => {
        if (audio) audio.volume = volumen;
    });

    const etiqueta = document.getElementById('PorcentajeVolumenNivel1');
    if (etiqueta) etiqueta.textContent = `${Math.round(volumen * 100)}%`;
}

function mostrarVolverInicio(visible) {
    document.getElementById('VolverInicio').hidden = !visible;
}

// Mantiene la navegación visible cuando cualquiera de los niveles ocupa la pantalla.
const navegacionNiveles = document.querySelector('.Contenedor_LVL');
const posicionNavegacionNiveles = document.createComment('Navegación de niveles');
navegacionNiveles.before(posicionNavegacionNiveles);
document.addEventListener('fullscreenchange', () => {
    const nivelCompleto = document.fullscreenElement;
    if (nivelCompleto && ['NIVEL_01', 'NIVEL_02', 'NIVEL3'].includes(nivelCompleto.id)) {
        nivelCompleto.appendChild(navegacionNiveles);
    } else {
        posicionNavegacionNiveles.after(navegacionNiveles);
    }
});

document.getElementById('VolverInicio').addEventListener('click', () => {
    window.location.hash = 'inicio';
    window.location.reload();
});

function mostrarFinJuegoNivel1() {
    document.getElementById('BotonReiniciarNivel1').hidden = true;
    document.getElementById('NEXT').hidden = true;
    mostrarVolverInicio(true);
    finDelJuegoNivel1 = true;
    detenerMotorNivel1();
    document.getElementById('Fondo_Ciberpunk').pause();
    const finOverlay = document.getElementById('FinJuegoNivel1');
    if (finOverlay) {
        finOverlay.style.display = 'flex';
    }
}

function reiniciarNivel1() {
    document.getElementById('BotonReiniciarNivel1').hidden = true;
    mostrarVolverInicio(false);
    document.getElementById('NEXT').hidden = true;
    detenerMotorNivel1();
    pausadoNivel1 = false;
    tableroNivel1.classList.remove('EfectosPausadosNivel1');
    document.getElementById('Pausa_Pantalla').style.display = 'none';
    document.getElementById('GANASTE_PANTALLA').style.display = 'none';
    clearTimeout(intervaloCuentaNivel1);
    intervaloCuentaNivel1 = null;
    document.getElementById('Pause').textContent = 'PAUSAR';
    vidasNivel1 = 3;
    finDelJuegoNivel1 = false;
    vidasNivel1Impactadas.Meteiorito = false;
    vidasNivel1Impactadas.Meteiorito2 = false;
    Tiempo = 70;
    Puntaje = 0;
    comboNivel1 = 0;
    ultimoMeteoritoNivel1 = -99;
    estadisticasNivel1 = { disparos: 0, aciertos: 0, destruidos: 0, comboMax: 0 };
    document.getElementById('ComboNivel1').classList.remove('visible');
    document.getElementById('Tiempo').innerHTML = Tiempo;
    actualizarPuntajeNivel1();
    actualizarVidasNivel1();
    const finOverlay = document.getElementById('FinJuegoNivel1');
    if (finOverlay) {
        finOverlay.style.display = 'none';
    }
    document.getElementById('Meteiorito').style.left = '-70%';
    document.getElementById('Meteiorito').style.transition = '0s';
    document.getElementById('Meteiorito2').style.left = '-70%';
    document.getElementById('Meteiorito2').style.transition = '0s';
    if (document.getElementById('Fondo_Ciberpunk')) {
        document.getElementById('Fondo_Ciberpunk').currentTime = 0;
    }
    document.getElementById('Start').style.display = 'flex';
    document.getElementById('Start').classList.remove('SaliendoConteoNivel1');
    document.getElementById('RGB').classList.remove('Final', 'PulsoConteoLvl2');
    document.getElementById('Contenedor_contador').style.display = 'table';
    document.getElementById('RGB').textContent = segundosCuentaNivel1;
    Conteo = segundosCuentaNivel1;
    document.getElementById('Contenedor_Mensaje_Star').style.left = '0%';
    document.getElementById('Contenedor_contador').style.display = 'none';
}

const controlVolumenNivel1 = document.getElementById('VolumenNivel1');
if (controlVolumenNivel1) {
    controlVolumenNivel1.addEventListener('input', (event) => {
        aplicarVolumenNivel1(event.target.value);
    });
}

const botonPantallaCompletaNivel1 = document.getElementById('PantallaCompletaNivel1');
if (botonPantallaCompletaNivel1) {
    botonPantallaCompletaNivel1.addEventListener('click', () => {
        const juegoNivel1 = document.getElementById('NIVEL_01');
        if (!document.fullscreenElement) {
            if (juegoNivel1 && juegoNivel1.requestFullscreen) juegoNivel1.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    });
}

['BotonReiniciarNivel1', 'BotonReintentarDerrotaNivel1'].forEach((id) => {
    const boton = document.getElementById(id);
    if (boton) boton.addEventListener('click', () => {
        const nivel2 = document.getElementById('NIVEL_02');
        const nivel3 = document.getElementById('NIVEL3');
        if (id === 'BotonReiniciarNivel1' && getComputedStyle(nivel3).display !== 'none') {
            reiniciarPorTiempoLvl3();
        } else if (id === 'BotonReiniciarNivel1' && getComputedStyle(nivel2).display !== 'none') {
            reiniciarLvl2();
        } else {
            reiniciarNivel1();
        }
    });
});

aplicarVolumenNivel1(volumenNivel1Default * 100);
actualizarVidasNivel1();


//FUNCION DE NARRACIONES

const audioNarracion = document.getElementById("narracion");
const botonNarracion = document.getElementById("Contenedor_narracion");
botonNarracion.addEventListener('click', Iniciar_narracion);

function actualizarControlNarracion() {
    const reproduciendo = !audioNarracion.paused && !audioNarracion.ended;
    const etiqueta = reproduciendo ? "Pausar narración" : "Reproducir narración";
    botonNarracion.setAttribute("aria-pressed", String(reproduciendo));
    botonNarracion.setAttribute("aria-label", etiqueta);
    botonNarracion.title = etiqueta;
}

async function Iniciar_narracion() {
    if (audioNarracion.paused) {
        try {
            await audioNarracion.play();
        } catch (error) {
            actualizarControlNarracion();
        }
    } else {
        audioNarracion.pause();
    }
}

["play", "pause", "ended"].forEach(evento => {
    audioNarracion.addEventListener(evento, actualizarControlNarracion);
});
// La intro se activa con un botón para evitar que el navegador la bloquee.
const introOverlay = document.getElementById("intro-overlay");
const introVideo = document.getElementById("intro-video");
const introAudio = document.getElementById("intro-audio");
const introPlayBtn = document.getElementById("intro-play");
const menuAudio = document.getElementById("menu-audio");
const introAudioCandidates = ["cinematicaAdio.mp3", "cinematicaAudio.mp3"];

const iniciarMenuAudio = async () => {
    if (!menuAudio) return;
    menuAudio.muted = false;
    menuAudio.volume = 0.45;
    menuAudio.loop = true;
    try {
        if (menuAudio.paused) {
            await menuAudio.play();
        }
    } catch (error) {}
};

const detenerMenuAudio = () => {
    if (!menuAudio) return;
    menuAudio.pause();
    menuAudio.currentTime = 0;
};

const activarMenuAudioEnInteraccion = () => {
    if (!menuAudio) return;
    iniciarMenuAudio();
};

if (introOverlay && introVideo) {
    document.body.classList.add("intro-active");

    if (introAudio) {
        const audioSrcActual = introAudio.getAttribute("src");
        if (!introAudioCandidates.includes(audioSrcActual)) {
            introAudio.setAttribute("src", introAudioCandidates[0]);
        }
    }

    const pausarIntro = () => {
        try { introVideo.pause(); } catch (error) {}
        if (introAudio) {
            try { introAudio.pause(); } catch (error) {}
        }
    };

    const ocultarIntro = () => {
        introOverlay.classList.add("hidden");
        document.body.classList.remove("intro-active");
        pausarIntro();
        if (menuAudio) {
            iniciarMenuAudio();
        }
    };

    const iniciarIntro = async () => {
        introVideo.muted = false;
        introVideo.volume = 1;

        if (introAudio) {
            introAudio.muted = false;
            introAudio.volume = 1;
        }

        try {
            await introVideo.play();
        } catch (error) {}

        if (introAudio) {
            try {
                introAudio.currentTime = 0;
                await introAudio.play();
            } catch (error) {}
        }
    };

    if (introPlayBtn) {
        introPlayBtn.addEventListener("click", async () => {
            detenerMenuAudio();
            await iniciarIntro();
        });
    }

    introVideo.addEventListener("ended", ocultarIntro);
    introAudio && introAudio.addEventListener("ended", ocultarIntro);

    document.addEventListener("keydown", (event) => {
        if (event.code === "Space" && !introOverlay.classList.contains("hidden")) {
            event.preventDefault();
            ocultarIntro();
        }
    });

    introVideo.addEventListener("click", ocultarIntro);
    if (window.location.hash === '#inicio') ocultarIntro();
}

if (menuAudio) {
    const botonJuego = document.getElementById("Juego");
    if (botonJuego) {
        botonJuego.addEventListener("click", detenerMenuAudio);
    }
}


Graficos = 1 //Este es el medidor de graficos

//En esta funcion cambio de fondo al presionar el CHEKBOX, para graurar los graficos dentro del juego
function Graficos_fondo(){
Contenedor_RQ = document.getElementById("Contenedor_RC")
if(Graficos == 1){
document.getElementById("Recursos").style.marginLeft = "60%"
document.getElementById("Fondo").style.background = "url(IMG/Fondo_Espacio2.jpg)"
document.getElementById("Fondo").style.backgroundAttachment = "fixed"
document.getElementById("Fondo").style.backgroundRepeat = "no-repeat"
document.getElementById("Fondo").style.backgroundSize = "100% 120%"
Graficos = 2}
else{
document.getElementById("Recursos").style.marginLeft = "0%"
document.getElementById("Fondo").style.backgroundImage = "url(IMG/Fondo_Espacio.gif) "
Graficos = 1
}
}






// Motor del primer nivel: posiciones y colisiones comparten las mismas coordenadas.
const tableroNivel1 = document.querySelector('#NIVEL_01 > .Contenedor:not(.Cabezera)');
const naveNivel1 = document.createElement('img');
naveNivel1.src = 'IMG/Nave_Movimiento.gif';
naveNivel1.className = 'NaveJugadorNivel1';
naveNivel1.alt = '';
naveNivel1.draggable = false;
tableroNivel1.appendChild(naveNivel1);
let jugandoNivel1 = false;
let pausadoNivel1 = false;
let frameNivel1 = null;
let ultimoFrameNivel1 = null;
let relojNivel1 = 0;
let cursorNivel1 = { x: 0, y: 0, dentro: false };
let disparosNivel1 = [];
let explosionesNivel1 = [];
const meteoritosNivel1 = ['Meteiorito', 'Meteiorito2'].map((id, i) => ({
    elemento: document.getElementById(id), x: -70, y: 0, espera: 1 + i * 0.8, activo: false,
    rot: Math.random() * 360, giro: (Math.random() * 2 - 1) * 120
}));
meteoritosNivel1.forEach(meteoro => {
    const estela = document.createElement('span');
    estela.className = 'EstelaMeteoritoNivel1';
    estela.setAttribute('aria-hidden', 'true');
    tableroNivel1.appendChild(estela);
    meteoro.estela = estela;
});
const imagenDisparoNivel1 = new Image();
imagenDisparoNivel1.src = 'IMG/disparo.png';
const mascarasNivel1 = new WeakMap();

function mascaraNivel1(imagen, ancho, alto) {
    if (!imagen.complete || !imagen.naturalWidth) return null;
    let guardada = mascarasNivel1.get(imagen);
    if (guardada && guardada.ancho === ancho && guardada.alto === alto) return guardada.datos;
    let datos = null;
    try {
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const contexto = canvas.getContext('2d', { willReadFrequently: true });
        if (contexto) {
            contexto.drawImage(imagen, 0, 0, ancho, alto);
            datos = contexto.getImageData(0, 0, ancho, alto).data;
        }
    } catch (error) {
        // Los archivos locales pueden impedir leer píxeles del canvas.
        // Conserva el resultado fallido para no repetirlo en cada subpaso.
        if (error.name !== 'SecurityError') throw error;
    }
    mascarasNivel1.set(imagen, { ancho, alto, datos });
    return datos;
}

function impactoNivel1(disparo, meteoro) {
    if (!disparo || !meteoro || !meteoro.elemento) return false;
    if (!Number.isFinite(disparo.x) || !Number.isFinite(disparo.y) || !Number.isFinite(meteoro.x) || !Number.isFinite(meteoro.y)) return false;
    const ancho = Number(meteoro.elemento.offsetWidth) || 0;
    const alto = Number(meteoro.elemento.offsetHeight) || 0;
    if (!ancho || !alto) return false;
    // Convierte el impacto a los píxeles de la roca antes de su giro.
    const angulo = (meteoro.rot || 0) * Math.PI / 180;
    const coseno = Math.cos(angulo);
    const seno = Math.sin(angulo);
    const centroX = meteoro.x + ancho / 2;
    const centroY = meteoro.y + alto / 2;
    const mitadAncho = (Math.abs(coseno) * ancho + Math.abs(seno) * alto) / 2;
    const mitadAlto = (Math.abs(seno) * ancho + Math.abs(coseno) * alto) / 2;
    const izquierda = Math.max(disparo.x, centroX - mitadAncho, 0);
    const derecha = Math.min(disparo.x + 42, centroX + mitadAncho);
    const arriba = Math.max(disparo.y, centroY - mitadAlto, 0);
    const abajo = Math.min(disparo.y + 18, centroY + mitadAlto);
    if (izquierda >= derecha || arriba >= abajo) return false;
    const bala = mascaraNivel1(imagenDisparoNivel1, 42, 18);
    const roca = mascaraNivel1(meteoro.elemento, ancho, alto);
    if (!bala || !roca) {
        // Mientras cargan las imágenes no hay un sprite visible que impactar.
        if (!imagenDisparoNivel1.complete || !imagenDisparoNivel1.naturalWidth ||
            !meteoro.elemento.complete || !meteoro.elemento.naturalWidth) return false;
        // Si no se pueden leer los píxeles, usa el solapamiento ya comprobado.
        return true;
    }
    // Ignora el margen transparente de ambos sprites, incluso en impactos de borde.
    for (let y = arriba; y < abajo; y++) {
        for (let x = izquierda; x < derecha; x++) {
            const bx = Math.floor(x - disparo.x);
            const dx = x - centroX;
            const dy = y - centroY;
            const my = Math.floor(coseno * dx + seno * dy + ancho / 2);
            const by = Math.floor(y - disparo.y);
            const myY = Math.floor(-seno * dx + coseno * dy + alto / 2);
            if (bx < 0 || bx >= 42 || by < 0 || by >= 18 || my < 0 || my >= ancho || myY < 0 || myY >= alto) continue;
            const b = (by * 42 + bx) * 4 + 3;
            const m = (myY * ancho + my) * 4 + 3;
            if (bala[b] > 32 && roca[m] > 32) return true;
        }
    }
    return false;
}

function sonidoNivel1(id) {
    const audio = document.getElementById(id);
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

function actualizarCursorNivel1() {
    const visible = jugandoNivel1 && !pausadoNivel1 && cursorNivel1.dentro;
    tableroNivel1.classList.toggle('JugandoNivel1', visible);
    naveNivel1.style.visibility = visible ? 'visible' : 'hidden';
    naveNivel1.style.left = cursorNivel1.x + 'px';
    naveNivel1.style.top = cursorNivel1.y + 'px';
}

function moverNaveNivel1(event) {
    const rect = tableroNivel1.getBoundingClientRect();
    cursorNivel1.x = (event.clientX - rect.left) * tableroNivel1.offsetWidth / rect.width - tableroNivel1.clientLeft;
    cursorNivel1.y = (event.clientY - rect.top) * tableroNivel1.offsetHeight / rect.height - tableroNivel1.clientTop;
    cursorNivel1.dentro = true;
    actualizarCursorNivel1();
}
tableroNivel1.addEventListener('pointermove', moverNaveNivel1);
tableroNivel1.addEventListener('pointerleave', () => {
    cursorNivel1.dentro = false;
    actualizarCursorNivel1();
});
tableroNivel1.addEventListener('click', event => {
    if (!jugandoNivel1 || pausadoNivel1 || event.button !== 0) return;
    moverNaveNivel1(event);
    const elemento = document.createElement('img');
    elemento.src = imagenDisparoNivel1.src;
    elemento.className = 'DisparoNivel1';
    elemento.alt = '';
    const disparo = { elemento, x: cursorNivel1.x - 70, y: cursorNivel1.y - 9 };
    elemento.style.left = disparo.x + 'px';
    elemento.style.top = disparo.y + 'px';
    tableroNivel1.appendChild(elemento);
    disparosNivel1.push(disparo);
    estadisticasNivel1.disparos++;
});

function detenerMotorNivel1() {
    jugandoNivel1 = false;
    cancelAnimationFrame(frameNivel1);
    frameNivel1 = null;
    ultimoFrameNivel1 = null;
    disparosNivel1.forEach(d => d.elemento.remove());
    explosionesNivel1.forEach(e => e.elemento.remove());
    disparosNivel1 = [];
    explosionesNivel1 = [];
    meteoritosNivel1.forEach(m => { m.estela.style.visibility = 'hidden'; });
    actualizarCursorNivel1();
}


// Efectos del nivel 2, actualizados por el motor del nivel 1 para respetar la pausa.
function crearEfectoMeteoritoNivel1(elemento, x, y, duracion, explosion = false) {
    elemento.style.left = x + 'px';
    elemento.style.top = y + 'px';
    tableroNivel1.appendChild(elemento);
    explosionesNivel1.push({ elemento, tiempo: duracion, duracion, explosion, cuadro: 1 });
}
function efectosDestruccionNivel1(x, y, tam) {
    const explosion = document.createElement('img');
    explosion.className = 'ExplosionMeteoritoLvl2';
    explosion.alt = '';
    explosion.src = 'IMG/explosion_lvl2/Explosion_001.png';
    explosion.style.width = tam * 1.7 + 'px';
    crearEfectoMeteoritoNivel1(explosion, x, y, 0.7, true);
    for (let i = 0; i < 10; i++) {
        const particula = document.createElement('span');
        particula.className = 'ParticulaLvl2';
        const angulo = Math.random() * Math.PI * 2;
        const distancia = (0.4 + Math.random() * 0.6) * tam * 1.1;
        particula.style.setProperty('--dx', Math.cos(angulo) * distancia + 'px');
        particula.style.setProperty('--dy', Math.sin(angulo) * distancia + 'px');
        particula.style.setProperty('--c', '#ffb347');
        crearEfectoMeteoritoNivel1(particula, x, y, 0.65);
    }
    textoPuntosNivel1(x, y - tam * 0.4, '+1');
}
function textoPuntosNivel1(x, y, mensaje, bonus = false) {
    const texto = document.createElement('div');
    texto.className = 'TextoFlotanteLvl2' + (bonus ? ' bonus' : '');
    texto.textContent = mensaje;
    crearEfectoMeteoritoNivel1(texto, x, y, 1);
}
function actualizarEfectosMeteoritosNivel1(dt) {
    explosionesNivel1 = explosionesNivel1.filter(efecto => {
        efecto.tiempo -= dt;
        if (efecto.tiempo <= 0) { efecto.elemento.remove(); return false; }
        if (efecto.explosion) {
            const cuadro = Math.min(10, 1 + Math.floor((efecto.duracion - efecto.tiempo) / 0.07));
            if (cuadro !== efecto.cuadro) {
                efecto.cuadro = cuadro;
                efecto.elemento.src = 'IMG/explosion_lvl2/Explosion_' + String(cuadro).padStart(3, '0') + '.png';
            }
        }
        return true;
    });
    meteoritosNivel1.forEach(meteoro => {
        const tam = meteoro.elemento.offsetWidth;
        meteoro.estela.style.left = meteoro.x + tam / 2 + 'px';
        meteoro.estela.style.top = meteoro.y + meteoro.elemento.offsetHeight / 2 + 'px';
        meteoro.estela.style.width = tam * 1.9 + 'px';
        meteoro.estela.style.height = tam * 0.55 + 'px';
        meteoro.estela.style.visibility = jugandoNivel1 && meteoro.activo ? 'visible' : 'hidden';
    });
}

function destruirMeteoritoNivel1(meteoro) {
    const x = meteoro.x + meteoro.elemento.offsetWidth / 2;
    const y = meteoro.y + meteoro.elemento.offsetHeight / 2;
    const tam = meteoro.elemento.offsetWidth;
    efectosDestruccionNivel1(x, y, tam);
    meteoro.estela.style.visibility = 'hidden';
    meteoro.activo = false;
    meteoro.espera = 0.65;
    meteoro.elemento.style.visibility = 'hidden';
    Puntaje = Math.min(objetivoPuntosNivel1, Puntaje + registrarDestruccionNivel1());
    actualizarPuntajeNivel1();
    sonidoNivel1('Puntos_sound');
    if (Puntaje >= objetivoPuntosNivel1) {
        finDelJuegoNivel1 = true;
        // Conserva la última explosión hasta completar su animación.
        jugandoNivel1 = false;
        actualizarCursorNivel1();
        document.getElementById('Fondo_Ciberpunk').pause();
        sonidoNivel1('Triunfo');
        actualizarLogroNivel1();
        document.getElementById('GANASTE_PANTALLA').style.display = 'flex';
        registrarVictoriaMision(1);
        mostrarVolverInicio(true);
        document.getElementById('BotonReiniciarNivel1').hidden = false;
        document.getElementById('NEXT').hidden = false;
        document.getElementById('NEXT').onclick = () => {
            document.getElementById('BotonReiniciarNivel1').hidden = true;
            mostrarVolverInicio(false);
            document.getElementById('NEXT').hidden = true;
            detenerMotorNivel1();
            document.getElementById('NIVEL_01').style.display = 'none';
            document.getElementById('NIVEL_02').style.display = 'block';
        };
    }
}

function pasoNivel1(dt) {
    const limite = tableroNivel1.querySelector('.Limite').offsetLeft;
    for (const meteoro of meteoritosNivel1) {
        if (!meteoro.activo) {
            meteoro.espera -= dt;
            if (meteoro.espera > 0) continue;
            meteoro.activo = true;
            meteoro.x = -meteoro.elemento.offsetWidth;
            meteoro.y = alturaAleatoriaNivel1();
            meteoro.elemento.style.visibility = 'visible';
        }
        meteoro.x += (limite + meteoro.elemento.offsetWidth) / 4 * dt;
        meteoro.rot = (meteoro.rot + meteoro.giro * dt) % 360;
    }
    for (const disparo of disparosNivel1) {
        disparo.x -= 720 * dt;
        for (const meteoro of [...meteoritosNivel1].sort((a, b) => b.x - a.x)) {
            if (meteoro.activo && impactoNivel1(disparo, meteoro)) {
                disparo.eliminado = true;
                destruirMeteoritoNivel1(meteoro);
                break;
            }
        }
        if (!jugandoNivel1) break;
    }
    disparosNivel1 = disparosNivel1.filter(disparo => {
        if (disparo.eliminado || disparo.x < -42) {
            disparo.elemento.remove();
            return false;
        }
        return true;
    });
    if (!jugandoNivel1) return;
    for (const meteoro of meteoritosNivel1) {
        if (meteoro.activo && meteoro.x + meteoro.elemento.offsetWidth >= limite) {
            meteoro.activo = false;
            meteoro.espera = 0.8;
            meteoro.elemento.style.visibility = 'hidden';
            vidasNivel1--;
            comboNivel1 = 0;
            document.getElementById('ComboNivel1').classList.remove('visible');
            actualizarVidasNivel1();
            sonidoNivel1('Perdiste_sound');
            if (vidasNivel1 <= 0) { mostrarFinJuegoNivel1(); return; }
        }
    }
}

function animarNivel1(ahora) {
    try {
        const dt = ultimoFrameNivel1 === null ? 0 : Math.min((ahora - ultimoFrameNivel1) / 1000, 0.05);
        ultimoFrameNivel1 = ahora;
        if (!pausadoNivel1) {
            if (jugandoNivel1) {
                relojNivel1 += dt;
                if (relojNivel1 - ultimoMeteoritoNivel1 > 2.2) document.getElementById('ComboNivel1').classList.remove('visible');
                Tiempo = Math.max(0, 70 - Math.floor(relojNivel1));
                document.getElementById('Tiempo').textContent = Tiempo;
                if (Tiempo === 0) { sonidoNivel1('Perdiste_sound'); mostrarFinJuegoNivel1(); return; }
                // Subpasos de como máximo 1 px relativo: una bala rápida no atraviesa una roca.
                const pasos = Math.max(1, Math.ceil(dt * (720 + tableroNivel1.clientWidth / 4)));
                for (let i = 0; i < pasos && jugandoNivel1; i++) pasoNivel1(dt / pasos);
                meteoritosNivel1.forEach(m => {
                    if (!m || !m.elemento) return;
                    m.elemento.style.left = m.x + 'px';
                    m.elemento.style.top = m.y + 'px';
                    m.elemento.style.transform = 'rotate(' + m.rot + 'deg)';
                });
                disparosNivel1.forEach(d => { if (d && d.elemento) d.elemento.style.left = d.x + 'px'; });
            }
            actualizarEfectosMeteoritosNivel1(dt);
        }
        if (jugandoNivel1 || explosionesNivel1.length) frameNivel1 = requestAnimationFrame(animarNivel1);
        else detenerMotorNivel1();
    } catch (error) {
        console.error('Error en el nivel 1:', error);
        if (jugandoNivel1) {
            frameNivel1 = requestAnimationFrame(animarNivel1);
        } else {
            detenerMotorNivel1();
        }
    }
}

function JUEGO() {
    detenerMotorNivel1();
    jugandoNivel1 = true;
    pausadoNivel1 = false;
    relojNivel1 = 0;
    meteoritosNivel1.forEach((m, i) => {
        m.activo = false;
        m.espera = 1 + i * 0.8;
        m.elemento.style.transition = 'none';
        m.elemento.style.visibility = 'hidden';
    });
    actualizarCursorNivel1();
    frameNivel1 = requestAnimationFrame(animarNivel1);
}

document.getElementById('Play').addEventListener('click', PLAY);
function PLAY() {
    if (intervaloCuentaNivel1 !== null || jugandoNivel1) return;
    reiniciarNivel1();
    sonidoNivel1('Fondo_Ciberpunk');
    if (typeof audioLvl2 === 'function') audioLvl2();
    const inicio = document.getElementById('Start');
    const contenedor = document.getElementById('Contenedor_contador');
    const numero = document.getElementById('RGB');
    inicio.classList.add('SaliendoConteoNivel1');
    contenedor.style.display = 'flex';
    const secuencia = ['3', '2', '1', '¡YA!'];
    let paso = 0;
    function mostrar() {
        const final = paso === secuencia.length - 1;
        numero.textContent = secuencia[paso];
        numero.classList.toggle('Final', final);
        numero.classList.remove('PulsoConteoLvl2');
        void numero.offsetWidth;
        numero.classList.add('PulsoConteoLvl2');
        if (typeof sfxLvl2 !== 'undefined') sfxLvl2.conteo(final);
        paso++;
        if (paso < secuencia.length) {
            intervaloCuentaNivel1 = setTimeout(mostrar, 900);
        } else {
            intervaloCuentaNivel1 = setTimeout(() => {
                intervaloCuentaNivel1 = null;
                contenedor.style.display = 'none';
                inicio.style.display = 'none';
                JUEGO();
            }, 750);
        }
    }
    intervaloCuentaNivel1 = setTimeout(mostrar, 450);
}

function pausarNivel1() {
    if (!jugandoNivel1) return;
    pausadoNivel1 = !pausadoNivel1;
    tableroNivel1.classList.toggle('EfectosPausadosNivel1', pausadoNivel1);
    mostrarVolverInicio(pausadoNivel1);
    ultimoFrameNivel1 = null;
    document.getElementById('Pause').textContent = pausadoNivel1 ? 'REANUDAR' : 'PAUSAR';
    document.getElementById('Pausa_Pantalla').style.display = pausadoNivel1 ? 'table' : 'none';
    const audio = document.getElementById('Fondo_Ciberpunk');
    if (pausadoNivel1) audio.pause();
    else audio.play().catch(() => {});
    actualizarCursorNivel1();
}
document.getElementById('Pause').addEventListener('click', pausarNivel1);
document.addEventListener('visibilitychange', () => {
    if (document.hidden && jugandoNivel1 && !pausadoNivel1) pausarNivel1();
});


//TRANSICIONES ENTRE PAGINAS----------------------------------------------------------------------------------



function Mover() {//TRANSICION DE LA PRIMERA SECCION A LA SEGUNDA
    detenerMenuAudio();
    document.body.classList.add("stage-2")
    document.getElementById("Fondo").style.backgroundImage = "url(IMG/Fondo_Espacio2.jpg)"

    var contenedor = document.getElementById("Seccion_01")
    contenedor.style.top = "-100%"
    contenedor.style.transition = "2s"
    function Desaparecer(){
    var contenedor = document.getElementById("Seccion_01")
    var Reglas = document.getElementById("Reglas")

    Reglas.style.top = "3%"
    Reglas.style.transition = "1s"
    contenedor.style.display = "none"


    }
    setTimeout(Desaparecer,1090)

}


function Mover_2(){
    var Reglas_Sacar = document.getElementById("Reglas") 


    Reglas_Sacar.style.top = "-100%"
    Reglas_Sacar.style.transition = "1.4s"



    function Desaparecer2(){
    var Reglas_Sacar = document.getElementById("Reglas")
    var contenedor_2 = document.getElementById("Seccion_2")
    var imagen = document.getElementById("Imagen")
    var mensaje = document.getElementById("Mensaje")
    var titulo = document.getElementById("Titulo_historia")
 
    Reglas_Sacar.style.display = "none"
    contenedor_2.style.top = "0%"

    imagen.style.left = "2%"
    imagen.style.transition = "2s"
    mensaje.style.right = "2%"
    mensaje.style.transition = "2s"
    titulo.style.left = "2%"
    titulo.style.transition = "1s"
    }
    setTimeout(Desaparecer2, 1260)



}


function Mover_3 (){//TRANSICION DE LA SEGUNDA SECCION A LA TERCERA 

var contenedor_2 = document.getElementById("Seccion_2")
var Supremo = document.getElementById("Seccion_suprema")
const narracion = document.getElementById("narracion");
if (narracion) narracion.pause();
if (contenedor_2) {
    contenedor_2.style.top = "-100%"
    contenedor_2.style.transition = "1.4s"
}
if (Supremo) Supremo.style.height = "160vh" //Le aumente para que no tape al contenedor del juego


    function abrirJuego(){
    var Seccion_Juego = document.getElementById("Seccion_Juego")
    var contenedor_2 = document.getElementById("Seccion_2")
    var juego = document.getElementById("Registraar")
    var Titulo_jugar = document.getElementById("Titulo_jugar")
    var Contenedor_juego = document.getElementById("Contenedor_Juego")
    var Cabezara = document.getElementById("Cabezera")

        if (Seccion_Juego) Seccion_Juego.style.left = "0%"
        if (contenedor_2) contenedor_2.style.display = "none"
        if (juego) {
            juego.style.top = "0%"
            juego.style.transition = "0s"
        }
        if (Titulo_jugar) {
            Titulo_jugar.style.left = "0%"
            Titulo_jugar.style.transition = "0.8s"
        }
        if (Contenedor_juego) {
            Contenedor_juego.style.left = "0%"
            Contenedor_juego.style.transition = "1.2s"
        }
        if (Cabezara) {
            Cabezara.style.left = "0%"
            Cabezara.style.transition = "1.2s"
        }
    }

    setTimeout(abrirJuego, 900)
}

// Solo las victorias reales desbloquean la seleccion de misiones.
const misionesGanadas = new Set();
try {
    const guardadas = JSON.parse(localStorage.getItem('ironfist_misiones_ganadas'));
    if (Array.isArray(guardadas)) {
        guardadas.filter(nivel => [1, 2, 3].includes(nivel)).forEach(nivel => misionesGanadas.add(nivel));
    }
} catch (error) {}

function misionesDesbloqueadas() {
    return [1, 2, 3].every(nivel => misionesGanadas.has(nivel));
}

function actualizarLogroMisiones() {
    const desbloqueado = misionesDesbloqueadas();
    const boton = document.getElementById('LogroMisiones');
    const estado = document.getElementById('EstadoLogroMisiones');
    if (boton) boton.disabled = !desbloqueado;
    if (estado) {
        estado.hidden = desbloqueado;
        estado.textContent = desbloqueado ? ''
            : 'Gana los tres niveles para desbloquear (' + misionesGanadas.size + '/3).';
    }
}

function registrarVictoriaMision(nivel) {
    if (![1, 2, 3].includes(nivel)) return;
    misionesGanadas.add(nivel);
    try {
        localStorage.setItem('ironfist_misiones_ganadas', JSON.stringify([...misionesGanadas]));
    } catch (error) {}
    actualizarLogroMisiones();
}

const selectorMisiones = document.getElementById('SelectorMisiones');
document.getElementById('LogroMisiones')?.addEventListener('click', () => {
    if (misionesDesbloqueadas() && selectorMisiones) selectorMisiones.showModal();
});
document.getElementById('CerrarSelectorMisiones')?.addEventListener('click', () => selectorMisiones.close());

selectorMisiones?.querySelectorAll('[data-mision]').forEach(boton => {
    boton.addEventListener('click', () => {
        if (!misionesDesbloqueadas()) return;
        const nivel = Number(boton.dataset.mision);
        selectorMisiones.close();
        detenerMenuAudio();
        document.body.classList.add('stage-2');
        document.getElementById('Fondo').style.backgroundImage = 'url(IMG/Fondo_Espacio2.jpg)';
        ['Seccion_01', 'Reglas', 'Seccion_2'].forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
        document.getElementById('Seccion_suprema').style.height = '160vh';
        document.getElementById('Seccion_Juego').style.left = '0%';
        ['NIVEL_01', 'NIVEL_02', 'NIVEL3'].forEach((id, indice) => {
            document.getElementById(id).style.display = indice + 1 === nivel ? 'block' : 'none';
        });
        if (nivel === 1) reiniciarNivel1();
        if (nivel === 2) prepararPartidaLvl2();
        if (nivel === 3) prepararPartidaLvl3();
        mostrarVolverInicio(true);
    });
});
actualizarLogroMisiones();

