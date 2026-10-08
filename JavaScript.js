
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
    if (boton) boton.addEventListener('click', reiniciarNivel1);
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
    elemento: document.getElementById(id), x: -70, y: 0, espera: 1 + i * 0.8, activo: false
}));
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
    const izquierda = Math.max(disparo.x, meteoro.x, 0);
    const derecha = Math.min(disparo.x + 42, meteoro.x + ancho);
    const arriba = Math.max(disparo.y, meteoro.y, 0);
    const abajo = Math.min(disparo.y + 18, meteoro.y + alto);
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
            const my = Math.floor(x - meteoro.x);
            const by = Math.floor(y - disparo.y);
            const myY = Math.floor(y - meteoro.y);
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
    actualizarCursorNivel1();
}

function destruirMeteoritoNivel1(meteoro) {
    const explosion = document.createElement('img');
    explosion.src = 'IMG/explosion.png';
    explosion.className = 'ExplosionNivel1';
    explosion.alt = '';
    explosion.style.left = meteoro.x + meteoro.elemento.offsetWidth / 2 + 'px';
    explosion.style.top = meteoro.y + meteoro.elemento.offsetHeight / 2 + 'px';
    tableroNivel1.appendChild(explosion);
    explosionesNivel1.push({ elemento: explosion, tiempo: 0.4 });
    meteoro.activo = false;
    meteoro.espera = 0.65;
    meteoro.elemento.style.visibility = 'hidden';
    Puntaje++;
    actualizarPuntajeNivel1();
    sonidoNivel1('Puntos_sound');
    if (Puntaje >= objetivoPuntosNivel1) {
        finDelJuegoNivel1 = true;
        // Conserva la última explosión hasta completar su animación.
        jugandoNivel1 = false;
        actualizarCursorNivel1();
        document.getElementById('Fondo_Ciberpunk').pause();
        sonidoNivel1('Triunfo');
        document.getElementById('GANASTE_PANTALLA').style.display = 'flex';
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
                });
                disparosNivel1.forEach(d => { if (d && d.elemento) d.elemento.style.left = d.x + 'px'; });
            }
            explosionesNivel1 = explosionesNivel1.filter(e => {
                if (!e || !e.elemento) return false;
                e.tiempo -= dt;
                e.elemento.style.opacity = Math.min(1, e.tiempo / 0.15);
                if (e.tiempo <= 0) { e.elemento.remove(); return false; }
                return true;
            });
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

