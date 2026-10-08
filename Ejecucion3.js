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



const OBJETIVO_NIVEL3 = 40;
const VIDA_JEFE_NIVEL3 = 50;
let jefeLvl3 = { aparecido: false, activo: false, derrotado: false, vida: 50, tiempo: 0, destello: 0, muerte: 0, elemento: null, explosion: null };
function limpiarJefeLvl3() {
    for (const elemento of [jefeLvl3.elemento, jefeLvl3.explosion]) {
        if (!elemento) continue;
        elemento.getAnimations().forEach(a => a.cancel());
        elemento.remove();
    }
    jefeLvl3.elemento = null;
    jefeLvl3.explosion = null;
    jefeLvl3.activo = false;
    tableroNivel3.classList.remove('JefeEnCombateLvl3', 'JefePausadoLvl3');
}
function iniciarJefeLvl3() {
    if (jefeLvl3.aparecido || Puntajelvl3 !== OBJETIVO_NIVEL3 - 5) return;
    jefeLvl3.aparecido = true;
    jefeLvl3.activo = true;
    meteoritosMotorLvl3.forEach(m => retirarMeteoritoLvl3(m));
    disparosLvl3.forEach(d => { d.eliminado = true; d.elemento.remove(); });
    disparosLvl3 = [];
    const elemento = document.createElement('div');
    elemento.className = 'JefeMeteoritoLvl3';
    elemento.innerHTML = '<img class="JefeRocaLvl3" src="IMG/Metiorito.png" alt="Meteorito jefe final">' +
        '<svg class="JefeGrietasLvl3" viewBox="0 0 100 100" aria-hidden="true"><path d="M20 12 L38 35 L30 49 L49 59 L44 90 M38 35 L60 25 L77 9 M49 59 L70 50 L85 65 M60 25 L58 43 L70 50 M10 63 L30 49"/></svg>' +
        '<svg class="JefeRayosLvl3" viewBox="0 0 100 100" aria-hidden="true"><path d="M4 40 L15 27 L7 19 L24 9 M76 8 L93 22 L83 30 L98 47 M95 65 L83 78 L90 88 L71 95 M26 95 L11 81 L19 70 L2 55"/></svg>' +
        '<span class="JefeVidaLvl3">50/50</span>';
    tableroNivel3.appendChild(elemento);
    jefeLvl3.elemento = elemento;
    jefeLvl3.x = -tableroNivel3.clientWidth * 0.4;
    jefeLvl3.tiempo = 0;
    tableroNivel3.classList.add('JefeEnCombateLvl3');
    actualizarJefeLvl3(0);
}
function laserTocaJefeLvl3(rect) {
    if (!jefeLvl3.activo || !jefeLvl3.elemento) return false;
    const roca = jefeLvl3.elemento.getBoundingClientRect();
    const cx = (roca.left + roca.right) / 2;
    const cy = (roca.top + roca.bottom) / 2;
    const rx = roca.width * 0.42;
    const ry = roca.height * 0.42;
    const x = Math.max(rect.left, Math.min(rect.right, cx));
    const y = Math.max(rect.top, Math.min(rect.bottom, cy));
    return rx > 0 && ry > 0 && ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}
function impactoJefeLvl3(disparo) {
    if (!jefeLvl3.activo || jefeLvl3.vida <= 0 || disparo.eliminado || pausadoLvl3 || !juegoActivoLvl3) return;
    disparo.eliminado = true;
    jefeLvl3.vida--;
    jefeLvl3.destello = 0.12;
    jefeLvl3.elemento.querySelector('.JefeVidaLvl3').textContent = jefeLvl3.vida + '/50';
    jefeLvl3.elemento.style.setProperty('--heridas', 1 - jefeLvl3.vida / 50);
    jefeLvl3.elemento.classList.add('JefeImpactadoLvl3');
    if (jefeLvl3.vida !== 0) return;
    jefeLvl3.activo = false;
    jefeLvl3.derrotado = true;
    jefeLvl3.muerte = 0.7;
    Puntajelvl3 += 5;
    document.getElementById('Puntajelvl3').textContent = Puntajelvl3 + ' / 40';
    const explosion = document.createElement('img');
    explosion.className = 'JefeExplosionLvl3';
    explosion.alt = '';
    explosion.src = 'IMG/explosion_lvl2/Explosion_001.png';
    explosion.style.left = jefeLvl3.elemento.style.left;
    explosion.style.top = jefeLvl3.elemento.style.top;
    explosion.style.width = jefeLvl3.tam * 2 + 'px';
    tableroNivel3.appendChild(explosion);
    jefeLvl3.explosion = explosion;
    // Conserva 0/50 brevemente sobre la gran explosión.
    jefeLvl3.elemento.classList.add('JefeDestruidoLvl3');
    limpiarDisparosLvl3();
    document.getElementById('Perdiste_sound').play().catch(() => {});
}
function actualizarJefeLvl3(dt) {
    if (jefeLvl3.derrotado && jefeLvl3.muerte > 0) {
        jefeLvl3.muerte = Math.max(0, jefeLvl3.muerte - dt);
        const cuadro = Math.min(10, 1 + Math.floor((0.7 - jefeLvl3.muerte) / 0.07));
        jefeLvl3.explosion.src = 'IMG/explosion_lvl2/Explosion_' + String(cuadro).padStart(3, '0') + '.png';
        if (!jefeLvl3.muerte) finalizarNivel3PorPuntos();
        return;
    }
    if (!jefeLvl3.activo) return;
    const W = tableroNivel3.clientWidth;
    const H = tableroNivel3.clientHeight;
    const tam = Math.min(280, W * 0.38, H * 0.6);
    jefeLvl3.tam = tam;
    jefeLvl3.tiempo += dt;
    // Avance lento y constante desde fuera del tablero hasta la Tierra.
    jefeLvl3.x += W / 12 * dt;
    const y = H / 2;
    const limite = document.querySelector('#NIVEL3 .Limitelvl3').offsetLeft;
    if (jefeLvl3.x + tam * 0.42 >= limite) {
        vidasLvl3--;
        actualizarVidasLvl3();
        document.getElementById('Perdiste_sound').play().catch(() => {});
        jefeLvl3.x = -tam;
        if (vidasLvl3 === 0) { perderNivel3('FIN DEL JUEGO'); return; }
    }
    jefeLvl3.elemento.style.width = tam + 'px';
    jefeLvl3.elemento.style.height = tam + 'px';
    jefeLvl3.elemento.style.left = jefeLvl3.x + 'px';
    jefeLvl3.elemento.style.top = y + 'px';
    jefeLvl3.destello = Math.max(0, jefeLvl3.destello - dt);
    if (!jefeLvl3.destello) jefeLvl3.elemento.classList.remove('JefeImpactadoLvl3');
}

function limpiarDisparosLvl3() {
    disparosLvl3.forEach(d => d.elemento.remove());
    disparosLvl3 = [];
}
function detenerMotorLvl3() {
    limpiarJefeLvl3();
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
    if (!jefeLvl3.derrotado || jefeLvl3.vida !== 0 || Puntajelvl3 !== OBJETIVO_NIVEL3 || terminadoLvl3) return;
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
    document.getElementById('VerCreditosLvl3').hidden = true;
    document.getElementById('BotonReiniciarNivel1').hidden = false;
}
function pasoMotorLvl3(dt) {
    const W = tableroNivel3.clientWidth;
    const H = tableroNivel3.clientHeight;
    const limite = document.querySelector('#NIVEL3 .Limitelvl3').offsetLeft;
    actualizarJefeLvl3(dt);
    if (!juegoActivoLvl3 || jefeLvl3.derrotado) return;
    for (const m of meteoritosMotorLvl3) {
        if (jefeLvl3.aparecido) break;
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
        if (d.eliminado) continue;
        d.x -= 900 * dt;
        d.elemento.style.left = d.x + 'px';
        const rect = d.elemento.getBoundingClientRect();
        if (laserTocaJefeLvl3(rect)) {
            impactoJefeLvl3(d);
            if (jefeLvl3.derrotado) return;
            continue;
        }
        const objetivo = meteoritosMotorLvl3.filter(m => m.activo).sort((a,b) => b.x - a.x)
            .find(m => rectangulosSeTocanLvl3(rect, m.elemento.getBoundingClientRect()));
        if (objetivo) {
            d.eliminado = true;
            retirarMeteoritoLvl3(objetivo);
            Puntajelvl3++;
            document.getElementById('Puntajelvl3').textContent = Puntajelvl3 + ' / 40';
            document.getElementById('Puntos_sound').play().catch(() => {});
            if (Puntajelvl3 === OBJETIVO_NIVEL3 - 5) { iniciarJefeLvl3(); break; }
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
        if (!jefeLvl3.derrotado) transcurridoLvl3 += dt;
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
    jefeLvl3 = { aparecido: false, activo: false, derrotado: false, vida: VIDA_JEFE_NIVEL3, tiempo: 0, destello: 0, muerte: 0, elemento: null, explosion: null };
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
    for (const id of ['Pantalla_Ovnislvl3','Pantalla_Nodrizalvl3','Pantalla_Ovnis2lvl3','Proximolvl3']) document.getElementById(id).style.display = 'none';
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
        tableroNivel3.classList.toggle('JefePausadoLvl3', pausadoLvl3);
        ultimoFrameLvl3 = null;
        mostrarVolverInicio(pausadoLvl3);
        document.getElementById('VerCreditosLvl3').hidden = true;
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
