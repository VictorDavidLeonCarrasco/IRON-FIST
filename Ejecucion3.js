// Motor del nivel 3: movimiento, colisiones y aparición comparten el mismo reloj.
let Tiempolvl3 = 51;
let Puntajelvl3 = 0;
let vidasLvl3 = 3;
let pausadoLvl3 = false;
let terminadoLvl3 = false;
let juegoActivoLvl3 = false;
let iniciandoLvl3 = false;
let disparosLvl3 = [];
let frameLvl3 = null;
let ultimoFrameLvl3 = null;
let transcurridoLvl3 = 0;
let conteoTimerLvl3 = null;
const tableroNivel3 = document.querySelector('#NIVEL3 .Contenedorlvl3:not(.Cabezeralvl3)');
const naveJugadorLvl3 = document.getElementById('NaveJugadorLvl3');
const meteoritosMotorLvl3 = [...document.querySelectorAll('#NIVEL3 .Meteoritolvl3')].map(elemento => ({elemento, x: 0, y: 0, espera: 0, activo: false}));
function actualizarVidasLvl3() {
    const indicador = document.getElementById('VidasLvl3');
    indicador.setAttribute('aria-label', `${vidasLvl3} vidas restantes`);
    indicador.querySelectorAll('span').forEach((corazon, i) => {
        corazon.classList.toggle('VidaPerdidaLvl3', i >= vidasLvl3);
        corazon.textContent = i < vidasLvl3 ? '♥' : '♡';
    });
}

function aplicarVolumenLvl3() {
    const volumen = Number(document.getElementById('VolumenLvl3').value);
    ['Fondo_Ciberpunk', 'Puntos_sound', 'Punto2', 'Punto3', 'Punto4',
        'Perdiste_sound', 'Triunfo', 'Musica_Final', 'Ganaste'].forEach(id => {
        const audio = document.getElementById(id);
        if (audio) audio.volume = volumen;
    });
}
document.getElementById('VolumenLvl3').addEventListener('input', aplicarVolumenLvl3);
document.getElementById('PantallaCompletaLvl3').addEventListener('click', async () => {
    try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.getElementById('NIVEL3').requestFullscreen();
    } catch (error) {
        console.warn('No se pudo cambiar la pantalla completa:', error);
    }
});
document.getElementById('VolverInicioNivel3').addEventListener('click', () => {
    window.location.hash = 'inicio';
    window.location.reload();
});


function limpiarDisparosLvl3() {
    disparosLvl3.forEach(d => d.elemento.remove());
    disparosLvl3 = [];
}
function detenerMotorLvl3() {
    cancelAnimationFrame(frameLvl3);
    frameLvl3 = null;
    ultimoFrameLvl3 = null;
    limpiarDisparosLvl3();
}
function actualizarNaveJugadorLvl3(evento) {
    if (!juegoActivoLvl3 || pausadoLvl3 || terminadoLvl3) return;
    const rect = tableroNivel3.getBoundingClientRect();
    const margen = Math.max(naveJugadorLvl3.offsetWidth, naveJugadorLvl3.offsetHeight) / 2;
    const x = (evento.clientX - rect.left) * tableroNivel3.offsetWidth / rect.width - tableroNivel3.clientLeft;
    const y = (evento.clientY - rect.top) * tableroNivel3.offsetHeight / rect.height - tableroNivel3.clientTop;
    naveJugadorLvl3.style.left = Math.max(margen, Math.min(tableroNivel3.clientWidth - margen, x)) + 'px';
    naveJugadorLvl3.style.top = Math.max(margen, Math.min(tableroNivel3.clientHeight - margen, y)) + 'px';
    naveJugadorLvl3.style.opacity = '1';
}
tableroNivel3.addEventListener('pointermove', actualizarNaveJugadorLvl3);
function rectangulosSeTocanLvl3(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
function dispararLaserLvl3() {
    if (!juegoActivoLvl3 || pausadoLvl3 || terminadoLvl3) return;
    const laser = document.createElement('img');
    laser.src = 'laser_jugador.png';
    laser.className = 'LaserJugadorLvl3';
    laser.alt = '';
    laser.draggable = false;
    const nave = naveJugadorLvl3.getBoundingClientRect();
    const tablero = tableroNivel3.getBoundingClientRect();
    const escalaX = tableroNivel3.offsetWidth / tablero.width;
    const escalaY = tableroNivel3.offsetHeight / tablero.height;
    const disparo = {elemento: laser, x: (nave.left - tablero.left) * escalaX - tableroNivel3.clientLeft,
        y: ((nave.top + nave.bottom) / 2 - tablero.top) * escalaY - tableroNivel3.clientTop};
    laser.style.left = disparo.x + 'px';
    laser.style.top = disparo.y + 'px';
    tableroNivel3.appendChild(laser);
    disparosLvl3.push(disparo);
}
tableroNivel3.addEventListener('click', evento => {
    if (evento.button !== 0 || evento.target.closest('.Startlvl3, .Ganaste_Pantallalvl3, .Pausa_Pantallalvl3')) return;
    actualizarNaveJugadorLvl3(evento);
    dispararLaserLvl3();
});
function retirarMeteoritoLvl3(m, espera = 0.25) {
    m.activo = false;
    m.espera = espera;
    m.elemento.style.visibility = 'hidden';
}
function finalizarNivel3PorPuntos() {
    terminadoLvl3 = true;
    juegoActivoLvl3 = false;
    detenerMotorLvl3();
    meteoritosMotorLvl3.forEach(m => retirarMeteoritoLvl3(m));
    naveJugadorLvl3.style.opacity = '0';
    document.getElementById('Fondo_Ciberpunk').pause();
    document.getElementById('Triunfo').play().catch(() => {});
    document.getElementById('Planetalvl3')?.style.setProperty('display', 'none');
    document.getElementById('Ganaste_Pantallalvl3').style.display = 'flex';
    mostrarVolverInicio(true);
    document.getElementById('VerCreditosLvl3').hidden = false;
    document.getElementById('BotonReiniciarNivel1').hidden = false;
    document.getElementById('NEXT').hidden = true;
}
function perderNivel3(mensaje) {
    terminadoLvl3 = true;
    juegoActivoLvl3 = false;
    detenerMotorLvl3();
    naveJugadorLvl3.style.opacity = '0';
    document.getElementById('Fondo_Ciberpunk').pause();
    document.querySelector('#NIVEL3 .Mensaje_Pauselvl3').textContent = mensaje;
    document.getElementById('Pausa_Pantallalvl3').style.display = 'table';
    mostrarVolverInicio(true);
    document.getElementById('VerCreditosLvl3').hidden = false;
    document.getElementById('BotonReiniciarNivel1').hidden = false;
}
function pasoMotorLvl3(dt) {
    const W = tableroNivel3.clientWidth;
    const H = tableroNivel3.clientHeight;
    const limite = document.querySelector('#NIVEL3 .Limitelvl3').offsetLeft;
    for (const m of meteoritosMotorLvl3) {
        if (!m.activo) {
            m.espera -= dt;
            if (m.espera > 0) continue;
            m.x = -m.elemento.offsetWidth;
            m.y = Math.random() * Math.max(0, H - m.elemento.offsetHeight);
            m.activo = true;
            m.elemento.style.visibility = 'visible';
        }
        m.x += W / 4.5 * dt;
        m.elemento.style.left = m.x + 'px';
        m.elemento.style.top = m.y + 'px';
    }
    for (const d of disparosLvl3) {
        d.x -= 900 * dt;
        d.elemento.style.left = d.x + 'px';
        const rect = d.elemento.getBoundingClientRect();
        const objetivo = meteoritosMotorLvl3.filter(m => m.activo).sort((a,b) => b.x - a.x)
            .find(m => rectangulosSeTocanLvl3(rect, m.elemento.getBoundingClientRect()));
        if (objetivo) {
            d.eliminado = true;
            retirarMeteoritoLvl3(objetivo);
            Puntajelvl3++;
            document.getElementById('Puntajelvl3').textContent = Puntajelvl3 + ' / 40';
            document.getElementById('Puntos_sound').play().catch(() => {});
            if (Puntajelvl3 >= 40) { finalizarNivel3PorPuntos(); return; }
        }
    }
    disparosLvl3 = disparosLvl3.filter(d => {
        if (d.eliminado || d.x < -100) { d.elemento.remove(); return false; }
        return true;
    });
    for (const m of meteoritosMotorLvl3) {
        if (!m.activo || m.x + m.elemento.offsetWidth < limite) continue;
        retirarMeteoritoLvl3(m);
        vidasLvl3--;
        actualizarVidasLvl3();
        document.getElementById('Perdiste_sound').play().catch(() => {});
        if (vidasLvl3 === 0) { perderNivel3('FIN DEL JUEGO'); return; }
    }
}
function bucleMotorLvl3(ahora) {
    frameLvl3 = null;
    if (!juegoActivoLvl3) return;
    const dt = ultimoFrameLvl3 === null ? 0 : Math.min(0.05, (ahora - ultimoFrameLvl3) / 1000);
    ultimoFrameLvl3 = ahora;
    if (!pausadoLvl3) {
        transcurridoLvl3 += dt;
        Tiempolvl3 = Math.max(0, 51 - Math.floor(transcurridoLvl3));
        document.getElementById('Tiempolvl3').textContent = Tiempolvl3;
        if (!Tiempolvl3) { perderNivel3('TIEMPO AGOTADO'); return; }
        // Subpasos cortos para que un disparo no atraviese un meteorito entre cuadros.
        const pasos = Math.max(1, Math.ceil(dt * (900 + tableroNivel3.clientWidth / 4.5) / 4));
        for (let i = 0; i < pasos && juegoActivoLvl3; i++) pasoMotorLvl3(dt / pasos);
    }
    if (juegoActivoLvl3) frameLvl3 = requestAnimationFrame(bucleMotorLvl3);
}
function JUEGOlvl3() {
    detenerMotorLvl3();
    juegoActivoLvl3 = true;
    terminadoLvl3 = false;
    pausadoLvl3 = false;
    transcurridoLvl3 = 0;
    Tiempolvl3 = 51;
    Puntajelvl3 = 0;
    vidasLvl3 = 3;
    actualizarVidasLvl3();
    document.getElementById('Tiempolvl3').textContent = '51';
    document.getElementById('Puntajelvl3').textContent = '0 / 40';
    document.getElementById('DialogoCreditosLvl3').close();
    for (const id of ['BotonReiniciarNivel1', 'NEXT', 'ReiniciarTiempoLvl3', 'VerCreditosLvl3']) document.getElementById(id).hidden = true;
    mostrarVolverInicio(false);
    document.getElementById('Ganaste_Pantallalvl3').style.display = 'none';
    document.getElementById('Pausa_Pantallalvl3').style.display = 'none';
    document.getElementById('Planetalvl3')?.style.setProperty('display', 'block');
    for (const id of ['Pantalla_Ovnislvl3','Pantalla_Nodrizalvl3','Pantalla_Ovnis2lvl3','Pantalla_creditoslvl3','Creditoslvl3','Proximolvl3']) document.getElementById(id).style.display = 'none';
    meteoritosMotorLvl3.forEach((m,i) => {
        retirarMeteoritoLvl3(m, 0.2 + i * 0.7);
        m.elemento.style.transition = 'none';
    });
    naveJugadorLvl3.style.left = tableroNivel3.clientWidth * 0.85 + 'px';
    naveJugadorLvl3.style.top = tableroNivel3.clientHeight / 2 + 'px';
    naveJugadorLvl3.style.opacity = '1';
    const pausa = document.getElementById('Pauselvl3');
    pausa.textContent = 'PAUSAR';
    pausa.setAttribute('aria-pressed', 'false');
    DETENER_JUEGOlvl3();
    frameLvl3 = requestAnimationFrame(bucleMotorLvl3);
}
function reiniciarPorTiempoLvl3() {
    if (!terminadoLvl3) return;
    const audio = document.getElementById('Fondo_Ciberpunk');
    audio.currentTime = 0;
    audio.play().catch(() => {});
    JUEGOlvl3();
}
document.getElementById('ReiniciarTiempoLvl3').addEventListener('click', reiniciarPorTiempoLvl3);
function PLAYlvl3() {
    if (iniciandoLvl3 || juegoActivoLvl3) return;
    iniciandoLvl3 = true;
    aplicarVolumenLvl3();
    const audio = document.getElementById('Fondo_Ciberpunk');
    audio.currentTime = 0;
    audio.play().catch(() => {});
    const inicio = document.getElementById('Startlvl3');
    inicio.classList.add('StartSaliendo');
    const contador = document.getElementById('RGBlvl3');
    let numero = 3;
    contador.textContent = numero;
    document.getElementById('Contenedor_contadorlvl3').style.display = 'flex';
    function contar() {
        numero--;
        if (numero > 0) {
            contador.textContent = numero;
            conteoTimerLvl3 = setTimeout(contar, 1000);
        } else {
            conteoTimerLvl3 = null;
            inicio.style.display = 'none';
            iniciandoLvl3 = false;
            JUEGOlvl3();
        }
    }
    conteoTimerLvl3 = setTimeout(contar, 1000);
}
function DETENER_JUEGOlvl3() {
    document.getElementById('Pauselvl3').onclick = () => {
        if (!juegoActivoLvl3 || terminadoLvl3) return;
        pausadoLvl3 = !pausadoLvl3;
        ultimoFrameLvl3 = null;
        mostrarVolverInicio(pausadoLvl3);
        document.getElementById('VerCreditosLvl3').hidden = !pausadoLvl3;
        const boton = document.getElementById('Pauselvl3');
        boton.textContent = pausadoLvl3 ? 'REANUDAR' : 'PAUSAR';
        boton.setAttribute('aria-pressed', String(pausadoLvl3));
        document.querySelector('#NIVEL3 .Mensaje_Pauselvl3').innerHTML = 'EL JUEGO ESTA<br>EN PAUSA';
        document.getElementById('Pausa_Pantallalvl3').style.display = pausadoLvl3 ? 'table' : 'none';
        const audio = document.getElementById('Fondo_Ciberpunk');
        if (pausadoLvl3) audio.pause(); else audio.play().catch(() => {});
    };
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden && juegoActivoLvl3 && !pausadoLvl3) document.getElementById('Pauselvl3').click();
});

// La navegación se encuentra después de este script en el HTML.
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('VerCreditosLvl3').addEventListener('click', () => {
        const dialogo = document.getElementById('DialogoCreditosLvl3');
        if (!dialogo.open) dialogo.showModal();
    });
});
