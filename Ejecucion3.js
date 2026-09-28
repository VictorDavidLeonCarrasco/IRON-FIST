
Tiempolvl3 = 51 //VARIBLE DE INICIO TIEMPO
Puntajelvl3 = 0 //VARIABLE DE INICIO PUNTOS
let vidasLvl3 = 3;
let pausadoLvl3 = false;
let terminadoLvl3 = false;
let animacionesPausadasLvl3 = [];
let juegoActivoLvl3 = false;
let disparosLvl3 = [];
let tableroNivel3 = null;
let naveJugadorLvl3 = null;

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

//CONTENEDOR QUE CONTIENE TOO EL JUEGO
//DE POR SI ESTA FUNCION NO SE EJECUTA HASTA QUE SE LA LLAMA, MAS ADELANTE LA LLAMAREMOS
//PARA QUE EL JUEGO INICIE UNA VEZ SE PRESIONE JUGAR
// NAVE DEL JUGADOR Y DISPARO DEL NIVEL 3.
// La nave sigue el puntero, queda orientada hacia la izquierda y dispara
// horizontalmente hacia los meteoritos que avanzan hacia la Tierra.
tableroNivel3 = document.querySelector('#NIVEL3 .Contenedorlvl3:not(.Cabezeralvl3)');
naveJugadorLvl3 = document.getElementById('NaveJugadorLvl3');

function actualizarNaveJugadorLvl3(evento) {
    if (!tableroNivel3 || !naveJugadorLvl3) return;
    if (!juegoActivoLvl3 || pausadoLvl3 || terminadoLvl3) {
        naveJugadorLvl3.style.opacity = '0';
        return;
    }

    const area = tableroNivel3.getBoundingClientRect();
    const mitadNave = naveJugadorLvl3.offsetWidth / 2;
    const xMin = area.width * 0.72;
    const xMax = area.width * 0.90;
    const yMin = mitadNave;
    const yMax = area.height - mitadNave;

    const x = Math.max(xMin, Math.min(xMax, evento.clientX - area.left));
    const y = Math.max(yMin, Math.min(yMax, evento.clientY - area.top));

    naveJugadorLvl3.style.left = `${x}px`;
    naveJugadorLvl3.style.top = `${y}px`;
    naveJugadorLvl3.style.opacity = '1';
}

if (tableroNivel3) {
    tableroNivel3.addEventListener('mousemove', actualizarNaveJugadorLvl3);
    tableroNivel3.addEventListener('mouseleave', () => {
        if (naveJugadorLvl3) naveJugadorLvl3.style.opacity = '0';
    });
}

function limpiarDisparosLvl3() {
    disparosLvl3.forEach(disparo => {
        if (disparo.elemento?.isConnected) disparo.elemento.remove();
        if (disparo.detector) clearInterval(disparo.detector);
    });
    disparosLvl3 = [];
}

function finalizarNivel3PorPuntos() {
    if (terminadoLvl3) return;
    terminadoLvl3 = true;
    juegoActivoLvl3 = false;

    clearInterval(Intervalo_Dirlvl3);
    clearInterval(Intervalo_Dir2lvl3);
    clearInterval(Intervalo_Dir3lvl3);
    clearInterval(Intervalo_Dir4lvl3);
    clearInterval(Restar_Tiempolvl3);
    limpiarDisparosLvl3();

    document.getElementById('Fondo_Ciberpunk').pause();
    document.getElementById('Triunfo').play().catch(() => {});
    if (naveJugadorLvl3) naveJugadorLvl3.style.opacity = '0';

    document.querySelectorAll('#NIVEL3 .Meteoritolvl3').forEach(elemento => {
        elemento.style.transition = '0s';
        elemento.style.left = '-150vw';
    });

    document.getElementById('Planetalvl3')?.style.setProperty('display', 'none');
    document.getElementById('Pantalla_Ovnislvl3').style.display = 'none';
    document.getElementById('Pantalla_Nodrizalvl3').style.display = 'none';
    document.getElementById('Pantalla_Ovnis2lvl3').style.display = 'none';
    document.getElementById('Pantalla_creditoslvl3').style.display = 'none';
    document.getElementById('Creditoslvl3').style.display = 'none';
    document.getElementById('Proximolvl3').style.display = 'none';
    document.getElementById('Startlvl3').style.display = 'none';

    document.getElementById('Ganaste_Pantallalvl3').style.display = 'flex';
    document.getElementById('Puntajelvl3').innerHTML = '40 / 40';
}

function impactoLaserNivel3(meteorito) {
    if (!meteorito || meteorito.dataset.impactado === 'true') return;
    meteorito.dataset.impactado = 'true';

    Puntajelvl3++;
    document.getElementById('Puntajelvl3').innerHTML = `${Puntajelvl3} / 40`;

    const sonidoId = ['Puntos_sound', 'Punto2', 'Punto3', 'Punto4'][Math.floor(Math.random() * 4)];
    document.getElementById(sonidoId)?.play().catch(() => {});

    meteorito.style.transition = 'none';
    meteorito.style.left = '-15%';
    meteorito.style.top = `${Math.round(Math.random() * 70)}%`;
    if (Puntajelvl3 >= 40) finalizarNivel3PorPuntos();
}

function dispararLaserLvl3() {
    if (!juegoActivoLvl3 || pausadoLvl3 || terminadoLvl3 || !naveJugadorLvl3 || !tableroNivel3) return;

    const laser = document.createElement('img');
    laser.src = 'laser_jugador.png';
    laser.className = 'LaserJugadorLvl3';
    laser.alt = '';

    const x = naveJugadorLvl3.offsetLeft - naveJugadorLvl3.offsetWidth / 2 - 8;
    const y = naveJugadorLvl3.offsetTop;
    laser.style.left = `${x}px`;
    laser.style.top = `${y}px`;
    tableroNivel3.appendChild(laser);

    const disparo = { elemento: laser, detector: null };
    disparosLvl3.push(disparo);

    let posicionX = x;
    disparo.detector = setInterval(() => {
        if (!juegoActivoLvl3 || pausadoLvl3 || terminadoLvl3 || !laser.isConnected) {
            clearInterval(disparo.detector);
            if (laser.isConnected) laser.remove();
            disparosLvl3 = disparosLvl3.filter(item => item !== disparo);
            return;
        }

        posicionX -= 18;
        laser.style.left = `${posicionX}px`;

        const laserRect = laser.getBoundingClientRect();
        const objetivo = [...document.querySelectorAll('#NIVEL3 .Meteoritolvl3')].find(meteorito => {
            if (meteorito.dataset.impactado === 'true') return false;
            const rect = meteorito.getBoundingClientRect();
            return rect.right < laserRect.left + 35 &&
                   rect.left < laserRect.right &&
                   rect.bottom > laserRect.top &&
                   rect.top < laserRect.bottom;
        });

        if (objetivo) {
            clearInterval(disparo.detector);
            if (laser.isConnected) laser.remove();
            disparosLvl3 = disparosLvl3.filter(item => item !== disparo);
            impactoLaserNivel3(objetivo);
            return;
        }

        if (posicionX < -80) {
            clearInterval(disparo.detector);
            if (laser.isConnected) laser.remove();
            disparosLvl3 = disparosLvl3.filter(item => item !== disparo);
        }
    }, 16);
}

if (tableroNivel3) {
    tableroNivel3.addEventListener('click', evento => {
        if (evento.target.closest('.Startlvl3, .Ganaste_Pantallalvl3, .Pausa_Pantallalvl3')) return;
        dispararLaserLvl3();
    });
}

function JUEGOlvl3() {
    juegoActivoLvl3 = true;
    terminadoLvl3 = false;
    pausadoLvl3 = false;
    limpiarDisparosLvl3();
    if (naveJugadorLvl3) naveJugadorLvl3.style.opacity = '0';

    //FUNCION QUE REDUCE EL TIEMPO Y RESETEAL EL RESULTADO UNA VEZ LLEGUE A 0
    function Tiempo_Disminurlvl3() { 
        if (pausadoLvl3 || terminadoLvl3) return;
        Tiempolvl3--;
        document.getElementById("Tiempolvl3").innerHTML = Tiempolvl3
        if (Tiempolvl3 == 0) {
            terminadoLvl3 = true;
            juegoActivoLvl3 = false;
            limpiarDisparosLvl3();
            if (naveJugadorLvl3) naveJugadorLvl3.style.opacity = '0';
            clearInterval(Restar_Tiempolvl3);
            document.getElementById('Fondo_Ciberpunk').pause();
            document.querySelector('#NIVEL3 .Mensaje_Pauselvl3').textContent = 'TIEMPO AGOTADO';
            document.getElementById('Pausa_Pantallalvl3').style.display = 'table';
            document.querySelectorAll('#NIVEL3 .Meteoritolvl3').forEach(elemento => {
                elemento.getAnimations().forEach(animacion => animacion.pause());
            });
        }
    }
    Restar_Tiempolvl3 = setInterval(Tiempo_Disminurlvl3, 1000)

    // Los puntos ahora se obtienen al destruir meteoritos con el láser.

    //ESTA FUNCION DIRIGE AL PRIMER METEORITO 1 A LA TIERRA 
    function Meteorito_Direccionlvl3() {
        if (pausadoLvl3 || terminadoLvl3) return;
        Distancia1lvl3 = 68
        Altura1lvl3 = Math.round(Math.random() * 70)

        document.getElementById("Meteoritolvl3").dataset.impactado = "false"
        document.getElementById("Meteoritolvl3").style.left = Distancia1lvl3 + "%"
        document.getElementById("Meteoritolvl3").style.top = Altura1lvl3 + "%"
        document.getElementById("Meteoritolvl3").style.transition = "3.2s"
    }

    setTimeout(Meteorito_Direccionlvl3, 2500)
    Intervalo_Dirlvl3 = setInterval(Meteorito_Direccionlvl3, 4800)

    //ESTA FUNCION DIRIGE AL METEORITO 2 A LA TIERRA         
    function Meteorito_Direccion2lvl3() {
        if (pausadoLvl3 || terminadoLvl3) return;
        Distancia2lvl3 = 68
        Altura2lvl3 = Math.round(Math.random() * 70)

        document.getElementById("Meteorito2lvl3").dataset.impactado = "false"
        document.getElementById("Meteorito2lvl3").style.left = Distancia2lvl3 + "%"
        document.getElementById("Meteorito2lvl3").style.top = Altura2lvl3 + "%"
        document.getElementById("Meteorito2lvl3").style.transition = "3.2s"
    }

    setTimeout(Meteorito_Direccion2lvl3, 3300)
    Intervalo_Dir2lvl3 = setInterval(Meteorito_Direccion2lvl3, 5200)

    //ESTA FUNCION DIRIGE AL METEORITO 3 A LA TIERRA
    function Meteorito_Direccion3lvl3() {
        if (pausadoLvl3 || terminadoLvl3) return;
        Distancia3lvl3 = 68
        Altura3lvl3 = Math.round(Math.random() * 70)

        document.getElementById("Meteorito3lvl3").dataset.impactado = "false"
        document.getElementById("Meteorito3lvl3").style.left = Distancia3lvl3 + "%"
        document.getElementById("Meteorito3lvl3").style.top = Altura3lvl3 + "%"
        document.getElementById("Meteorito3lvl3").style.transition = "3.2s"
    }

    setTimeout(Meteorito_Direccion3lvl3, 3300)
    Intervalo_Dir3lvl3 = setInterval(Meteorito_Direccion3lvl3, 5600)

    //ESTA FUNCION DIRIGE AL METEORITO 4 A LA TIERRA
    function Meteorito_Direccion4lvl3() {
        if (pausadoLvl3 || terminadoLvl3) return;
        Distancia4lvl3 = 68
        Altura4lvl3 = Math.round(Math.random() * 70)

        document.getElementById("Meteorito4lvl3").dataset.impactado = "false"
        document.getElementById("Meteorito4lvl3").style.left = Distancia4lvl3 + "%"
        document.getElementById("Meteorito4lvl3").style.top = Altura4lvl3 + "%"
        document.getElementById("Meteorito4lvl3").style.transition = "3.2s"
    }

    setTimeout(Meteorito_Direccion4lvl3, 3700)
    Intervalo_Dir4lvl3 = setInterval(Meteorito_Direccion4lvl3, 6000)



    // Los meteoritos ya no se destruyen al pasar el cursor: se destruyen con el láser.

    //ESTA FUNCION SE ENCARGA DE ALERTARTE UNA VEZ EL METEORITO CRUZE LA LINEA CON UN PERDISTE
    //TAMBIEN RESETEA LOS VALORES Y LLEVA A LOS METEORITOS FUERA DEL MAPA DE MANERA INSTANTANEA
    function perdistelvl3() {
        if (pausadoLvl3 || terminadoLvl3) return;
        const limite = document.querySelector('#NIVEL3 .Limitelvl3').offsetLeft;
        for (const meteorito of document.querySelectorAll('#NIVEL3 .Meteoritolvl3')) {
            if (meteorito.offsetLeft + meteorito.offsetWidth < limite) continue;
            meteorito.style.transition = 'none';
            meteorito.style.left = '-70%';
            vidasLvl3--;
            actualizarVidasLvl3();
            document.getElementById('Perdiste_sound').play().catch(() => {});
            if (vidasLvl3 === 0) {
                terminadoLvl3 = true;
                juegoActivoLvl3 = false;
                limpiarDisparosLvl3();
                if (naveJugadorLvl3) naveJugadorLvl3.style.opacity = '0';
                clearInterval(Restar_Tiempolvl3);
                document.getElementById('Fondo_Ciberpunk').pause();
                document.querySelector('#NIVEL3 .Mensaje_Pauselvl3').textContent = 'FIN DEL JUEGO';
                document.getElementById('Pausa_Pantallalvl3').style.display = 'table';
                document.querySelectorAll('#NIVEL3 .Meteoritolvl3').forEach(elemento => {
                    elemento.getAnimations().forEach(animacion => animacion.pause());
                });
                break;
            }
        }
    }
    setInterval(perdistelvl3, 16) // Comprueba el límite aproximadamente una vez por fotograma.
    //QUE NO SABEMOS CUANDO EL METEORITO VA A SUPERAR EL LIMITE
}



//LE DECIMOS QUE AL PRESIONAR EL BOTON JUGAR EJECUTARA LA FUNCION PLAY     

//ESTE ES EL CONTEO DE LA CUENTA REGRESIVA QUE SE DA DESPUEZ DE PRESINAR JUGAR
Conteolvl3 = 4 

//ESTA FUNCION EJECUTA UN CONJUNTO DE ACCIONES AL PRESIONAR JUGAR
function PLAYlvl3() {
    const botonPlay = document.getElementById('Playlvl3');
    if (!botonPlay || botonPlay.dataset.iniciado) return;
    botonPlay.dataset.iniciado = 'true';
    Puntajelvl3 = 0;
    vidasLvl3 = 3;
    actualizarVidasLvl3();
    document.getElementById('Puntajelvl3').innerHTML = '0 / 40';
    document.getElementById('Ganaste_Pantallalvl3').style.display = 'none';
    document.getElementById('Planetalvl3')?.style.setProperty('display', 'block');
    aplicarVolumenLvl3();
    document.getElementById("Fondo_Ciberpunk").currentTime = 0;
    document.getElementById("Fondo_Ciberpunk").play().catch(() => {});
    // Retira TODA la pantalla de preparación del Nivel 3.
    const startLvl3 = document.getElementById("Startlvl3");
    startLvl3.classList.add("StartSaliendo");
    document.getElementById("Textolvl3").style.left = "-150vw";
    document.getElementById("Playlvl3").style.left = "-150vw";
    document.getElementById("Dificultadlvl3").style.left = "-150vw";
    document.getElementById("Startlvl3").style.pointerEvents = "none";
    function ARRACARlvl3(){    
        JUEGOlvl3()}
    //INVOCA AL JUEGO UNA VEZ PASEN 4 SEGUNDO - OSEA UNA VEZ TERMINE EL CONTADOR
    tiempo_de_arranquelvl3 =  setTimeout(ARRACARlvl3, 4100)
    //ESTA FUNCION EJECUTA LA CUENTA REGRESIVA Y RETIRA LA PANTALLA START 
    function ESPERARlvl3() {
        function Cuenta_rglvl3() {
            Conteolvl3--;
            document.getElementById("RGBlvl3").innerHTML = Conteolvl3
            if (Conteolvl3 == -1) {
                clearInterval(cuentaLvl3);
                document.getElementById("Contenedor_contadorlvl3").style.display = "none"

                function Borrarlvl3() {
                    document.getElementById("Startlvl3").style.display = "none"

                    DETENER_JUEGOlvl3()
                } //HABILITA LA FUNCION DE PAUSE Y REANUDAR UNA VEZ CARGUE EL JUEGO
                setTimeout(Borrarlvl3, 500)
            }
        }
        const cuentaLvl3 = setInterval(Cuenta_rglvl3, 1000)
    }

    setTimeout(ESPERARlvl3, 350)
} //SE EJECUTARA EN UN LAPSO DE 350, DESPUES DE PRESIONAR EL BOTON


//ESTA FUNCION CONTIENE EL REANUDE Y PAUSE DEL BOTON
function DETENER_JUEGOlvl3() {
    document.getElementById('Pauselvl3').onclick = () => {
        if (terminadoLvl3) return;
        pausadoLvl3 = !pausadoLvl3;
        const boton = document.getElementById('Pauselvl3');
        boton.textContent = pausadoLvl3 ? 'REANUDAR' : 'PAUSAR';
        boton.setAttribute('aria-pressed', String(pausadoLvl3));
        document.getElementById('Pausa_Pantallalvl3').style.display = pausadoLvl3 ? 'table' : 'none';
        const audio = document.getElementById('Fondo_Ciberpunk');
        if (pausadoLvl3) {
            limpiarDisparosLvl3();
            if (naveJugadorLvl3) naveJugadorLvl3.style.opacity = '0';
            audio.pause();
            animacionesPausadasLvl3 = [];
            document.querySelectorAll('#NIVEL3 .Meteoritolvl3').forEach(elemento => {
                elemento.getAnimations().forEach(animacion => {
                    animacionesPausadasLvl3.push(animacion);
                    animacion.pause();
                });
            });
        } else {
            audio.play().catch(() => {});
            animacionesPausadasLvl3.forEach(animacion => animacion.play());
            animacionesPausadasLvl3 = [];
        }
    };
}
