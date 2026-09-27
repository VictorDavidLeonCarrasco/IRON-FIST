
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

function mostrarFinJuegoNivel1() {
    finDelJuegoNivel1 = true;
    detenerMotorNivel1();
    document.getElementById('Fondo_Ciberpunk').pause();
    const finOverlay = document.getElementById('FinJuegoNivel1');
    if (finOverlay) {
        finOverlay.style.display = 'flex';
    }
}

function reiniciarNivel1() {
    detenerMotorNivel1();
    pausadoNivel1 = false;
    document.getElementById('Pausa_Pantalla').style.display = 'none';
    document.getElementById('GANASTE_PANTALLA').style.display = 'none';
    clearInterval(intervaloCuentaNivel1);
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

const botonReiniciarNivel1 = document.getElementById('BotonReiniciarNivel1');
if (botonReiniciarNivel1) {
    botonReiniciarNivel1.addEventListener('click', () => {
        reiniciarNivel1();
        document.getElementById('Start').style.display = 'flex';
    });
}

aplicarVolumenNivel1(volumenNivel1Default * 100);
actualizarVidasNivel1();


//FUNCION DE NARRACIONES

Narracion = 1
document.getElementById("Contenedor_narracion").addEventListener('click',  Iniciar_narracion)

function Iniciar_narracion(){
    if(Narracion == 1){
    document.getElementById("narracion").play()
    document.getElementById("VOLUMEN").style.display = "none"
    document.getElementById("PAUSE").style.display = "table"
    Narracion = 2}
    else{
        document.getElementById("narracion").pause()
        document.getElementById("VOLUMEN").style.display = "table"
        document.getElementById("PAUSE").style.display = "none"
        Narracion = 1
    }
}

// La intro se activa con un botón para evitar que el navegador la bloquee.
const introOverlay = document.getElementById("intro-overlay");
const introVideo = document.getElementById("intro-video");
const introAudio = document.getElementById("intro-audio");
const introPlayBtn = document.getElementById("intro-play");
const introAudioCandidates = ["cinematicaAdio.mp3", "cinematicaAudio.mp3"];

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
    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const contexto = canvas.getContext('2d', { willReadFrequently: true });
    contexto.drawImage(imagen, 0, 0, ancho, alto);
    const datos = contexto.getImageData(0, 0, ancho, alto).data;
    mascarasNivel1.set(imagen, { ancho, alto, datos });
    return datos;
}

function impactoNivel1(disparo, meteoro) {
    const ancho = meteoro.elemento.offsetWidth;
    const alto = meteoro.elemento.offsetHeight;
    const izquierda = Math.max(disparo.x, meteoro.x, 0);
    const derecha = Math.min(disparo.x + 42, meteoro.x + ancho);
    const arriba = Math.max(disparo.y, meteoro.y, 0);
    const abajo = Math.min(disparo.y + 18, meteoro.y + alto);
    if (izquierda >= derecha || arriba >= abajo) return false;
    const bala = mascaraNivel1(imagenDisparoNivel1, 42, 18);
    const roca = mascaraNivel1(meteoro.elemento, ancho, alto);
    if (!bala || !roca) return false;
    // Ignora el margen transparente de ambos sprites, incluso en impactos de borde.
    for (let y = arriba; y < abajo; y++) {
        for (let x = izquierda; x < derecha; x++) {
            const b = (Math.floor(y - disparo.y) * 42 + Math.floor(x - disparo.x)) * 4 + 3;
            const m = (Math.floor(y - meteoro.y) * ancho + Math.floor(x - meteoro.x)) * 4 + 3;
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
        document.getElementById('NEXT').onclick = () => {
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
                m.elemento.style.left = m.x + 'px';
                m.elemento.style.top = m.y + 'px';
            });
            disparosNivel1.forEach(d => { d.elemento.style.left = d.x + 'px'; });
        }
        explosionesNivel1 = explosionesNivel1.filter(e => {
            e.tiempo -= dt;
            e.elemento.style.opacity = Math.min(1, e.tiempo / 0.15);
            if (e.tiempo <= 0) { e.elemento.remove(); return false; }
            return true;
        });
    }
    if (jugandoNivel1 || explosionesNivel1.length) frameNivel1 = requestAnimationFrame(animarNivel1);
    else detenerMotorNivel1();
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
    document.getElementById('Contenedor_Mensaje_Star').style.left = '-100%';
    document.getElementById('Contenedor_contador').style.display = 'table';
    intervaloCuentaNivel1 = setInterval(() => {
        Conteo--;
        document.getElementById('RGB').textContent = Conteo;
        if (Conteo <= 0) {
            clearInterval(intervaloCuentaNivel1);
            intervaloCuentaNivel1 = null;
            document.getElementById('Contenedor_contador').style.display = 'none';
            document.getElementById('Start').style.display = 'none';
            JUEGO();
        }
    }, 1000);
}

function pausarNivel1() {
    if (!jugandoNivel1) return;
    pausadoNivel1 = !pausadoNivel1;
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

document.getElementById("narracion").pause()
contenedor_2.style.top = "-100%"
contenedor_2.style.transition = "1.4s"
Supremo.style.height = "160vh" //Le aumente para que no tape al contenedor del juego


    function Desaparaceer3(){
    var Seccion_Juego = document.getElementById("Seccion_Juego")
    var contenedor_2 = document.getElementById("Seccion_2")
    var juego = document.getElementById("Registraar")
    var Titulo_jugar = document.getElementById("Titulo_jugar")
    var Contenedor_juego = document.getElementById("Contenedor_Juego")
    var Cabezara = document.getElementById("Cabezera")

        Seccion_Juego.style.left = "0%"
        contenedor_2.style.display = "none"
        juego.style.top = "0%"
        juego.style.transition = "0s"
        Titulo_jugar.style.left = "0%"
        Titulo_jugar.style.transition = "0.8s"
        Contenedor_juego.style.left = "0%"
        Contenedor_juego.style.transition = "1.2s"
        Cabezara.style.left = "0%"
        Cabezara.style.transition = "1.2s"
    }

    setTimeout(Desaparaceer3, 900)
}

//RELOJ


function Reloj_Tiempo(){
    var actualizar_Hora = function(){
        var Fecha = new Date(),
        Horas = Fecha.getHours(),
        ampm,
        Minutos = Fecha.getMinutes(),
        Segundos = Fecha.getSeconds(),
        diaSemana = Fecha.getDay(),
        dia = Fecha.getDate(),
        mes = Fecha.getMonth(),
        Año = Fecha.getFullYear();

        var pHoras = document.getElementById("Hora"),
            pAMPM = document.getElementById("AMPM"),
            pMinutos = document.getElementById("Minutos"),
            pSegundos = document.getElementById("Segundos"),
            pDia_Semana = document.getElementById("Dia_Semana"),
            pDia = document.getElementById("dia"),
            pMes = document.getElementById("mes"),
            pAño = document.getElementById("año");

            var semana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
            pDia_Semana.textContent = semana [diaSemana];
            pDia.textContent = dia
            var Mes_Actual = ['Enero', 'Febrero',
                 'Marzo', 'Abril', 'Mayo', 
                 'Junio', 'Julio', 'Agosto', 
                 'Septiembre', 'Octubre', 
                 'Nomviembre', 'Diciembre']
                 
            pMes.textContent = Mes_Actual[mes];
            pAño.textContent = Año

            if(Horas >= 12){
                Horas = Horas - 12;
                ampm = 'PM';
            }
            else{ampm = 'AM';}

            if(Horas == 0){
                Horas = 12;
            }
            if(Horas < 10){
                Horas = "0" + Horas
            }
            pHoras.textContent = Horas
            pAMPM.textContent = ampm
            if(Minutos < 10){
                Minutos = "0" + Minutos
            }
            pMinutos.textContent = Minutos
            if(Segundos < 10){
                Segundos = "0" + Segundos
            }
            pSegundos.textContent = Segundos
        };
    actualizar_Hora();
}


Reloj_Tiempo()

setInterval(Reloj_Tiempo, 1000)
