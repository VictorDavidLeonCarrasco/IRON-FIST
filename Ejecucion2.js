let Tiempolvl2 = 60;
let iniciandoLvl2 = false;
const lasersLvl2 = new Set();

function limpiarLasersLvl2() {
    lasersLvl2.forEach(limpiar => limpiar());
    lasersLvl2.clear();
}
let Puntajelvl2 = 0;
let Vidaslvl2 = 3;

let juegoActivoLvl2 = false;
let pausadoLvl2 = false;
let impactoEnProcesoLvl2 = false;
let colaImpactosLvl2 = [];

let intervaloTiempoLvl2;
let intervaloImpactosLvl2;
let temporizadoresMeteoritosLvl2 = [];
let intervalosMeteoritosLvl2 = [];

/* HALLAZGO 14 y 15: temporizadores del aviso de impacto y del destello del planeta. */
let temporizadorAvisoImpactoLvl2 = null;
let temporizadorDestelloPlanetaLvl2 = null;

const tableroLvl2 = document.querySelector(
    "#NIVEL_02 .Contenedorlvl2:not(.Cabezeralvl2)"
);

const planetaLvl2 = document.getElementById("PlanetaLvl2");
const naveJugadorLvl2 = document.getElementById("NaveJugadorLvl2");
const inicioLvl2 = document.getElementById("Startlvl2");
const derrotaLvl2 = document.getElementById("PerdistePantallaLvl2");
const victoriaLvl2 = document.getElementById("GanastePantallaLvL2");

const meteoritosLvl2 = [
    document.getElementById("Meteioritolvl2"),
    document.getElementById("Meteiorito2lvl2"),
    document.getElementById("Meteiorito3lvl2")
];

const imagenesPlanetaLvl2 = [
    "IMG/planetas_lvl2/planeta_0.png",
    "IMG/planetas_lvl2/planeta_1.png",
    "IMG/planetas_lvl2/planeta_2.png",
    "IMG/planetas_lvl2/planeta_3.png"
];

function ActualizarVidaslvl2() {
    for (let numeroVida = 1; numeroVida <= 3; numeroVida++) {
        const vida = document.getElementById(
            "Vida" + numeroVida + "Lvl2"
        );

        vida.classList.toggle(
            "VidaPerdidaLvl2",
            numeroVida > Vidaslvl2
        );
    }

    planetaLvl2.src = imagenesPlanetaLvl2[3 - Vidaslvl2];
}

function actualizarMarcadoresLvl2() {
    document.getElementById("Tiempolvl2").innerHTML = Tiempolvl2;
    document.getElementById("Puntajelvl2").innerHTML =
        Puntajelvl2 + " / 25"; // Actualizado: objetivo cambiado a 25 puntos
}

function detenerMeteoritosLvl2() {
    temporizadoresMeteoritosLvl2.forEach(clearTimeout);
    intervalosMeteoritosLvl2.forEach(clearInterval);

    temporizadoresMeteoritosLvl2 = [];
    intervalosMeteoritosLvl2 = [];
}

function retirarMeteoritoLvl2(meteorito) {
    meteorito.style.transition = "none";
    meteorito.style.left = "-500px";
    meteorito.dataset.bloqueado = "false";
}

function moverMeteoritoLvl2(meteorito) {
    if (
        !juegoActivoLvl2 ||
        pausadoLvl2 ||
        meteorito.dataset.bloqueado === "true"
    ) {
        return;
    }

    meteorito.style.transition = "6s"; /* Modificado: ahora cae más lento (6s) */
    meteorito.style.left = "80%";
    meteorito.style.top = Math.round(Math.random() * 450) + "px";
}

function iniciarMeteoritosLvl2() {
    detenerMeteoritosLvl2();

    const esperas = [3500, 3000, 2200];
    const frecuencias = [5000, 5500, 5200]; /* Modificado: más tiempo entre apariciones para acomodar la velocidad */

    meteoritosLvl2.forEach(function (meteorito, indice) {
        temporizadoresMeteoritosLvl2.push(
            setTimeout(function () {
                moverMeteoritoLvl2(meteorito);
            }, esperas[indice])
        );

        intervalosMeteoritosLvl2.push(
            setInterval(function () {
                moverMeteoritoLvl2(meteorito);
            }, frecuencias[indice])
        );
    });
}

function mostrarExplosionLvl2(x, y) {
    const explosion = document.createElement("img");

    explosion.className = "ExplosionMeteoritoLvl2";
    explosion.style.left = x + "px";
    explosion.style.top = y + "px";

    tableroLvl2.appendChild(explosion);

    let cuadro = 1;

    const animacion = setInterval(function () {
        explosion.src =
            "IMG/explosion_lvl2/Explosion_" +
            String(cuadro).padStart(3, "0") +
            ".png";

        cuadro++;

        if (cuadro > 10) {
            clearInterval(animacion);
            explosion.remove();
        }
    }, 70);
}

/*
HALLAZGO 14: Aviso visual temporal cuando un meteorito impacta el planeta.
Se muestra dentro del tablero, dura ~1s y se elimina solo.
No usa alert(), no reinicia el juego y no se duplica.
*/
function mostrarAvisoImpactoLvl2() {
    const avisoAnterior = tableroLvl2.querySelector(".AvisoImpactoLvl2");

    if (avisoAnterior) {
        avisoAnterior.remove();
    }

    if (temporizadorAvisoImpactoLvl2) {
        clearTimeout(temporizadorAvisoImpactoLvl2);
        temporizadorAvisoImpactoLvl2 = null;
    }

    const mensajesImpactoLvl2 = [
        "¡IMPACTO DETECTADO!",
        "¡VIDA PERDIDA!"
    ];

    const mensaje =
        mensajesImpactoLvl2[
            Math.floor(Math.random() * mensajesImpactoLvl2.length)
        ];

    const aviso = document.createElement("div");

    aviso.className = "AvisoImpactoLvl2";
    aviso.textContent = mensaje;

    tableroLvl2.appendChild(aviso);

    temporizadorAvisoImpactoLvl2 = setTimeout(function () {
        aviso.remove();
        temporizadorAvisoImpactoLvl2 = null;
    }, 1000);
}

/*
HALLAZGO 15: Efecto visual corto en el planeta al momento del impacto
(destello rojo). No mueve ni deforma el planeta de forma permanente:
solo agrega y luego quita una clase con una animación de "filter".
La imagen dañada actual (planeta_X.png) se conserva intacta.
*/
function efectoImpactoPlanetaLvl2() {
    planetaLvl2.classList.remove("ImpactoPlanetaLvl2");

    /* Fuerza un reflow para poder reiniciar la animación si llega otro impacto seguido. */
    void planetaLvl2.offsetWidth;

    planetaLvl2.classList.add("ImpactoPlanetaLvl2");

    if (temporizadorDestelloPlanetaLvl2) {
        clearTimeout(temporizadorDestelloPlanetaLvl2);
    }

    temporizadorDestelloPlanetaLvl2 = setTimeout(function () {
        planetaLvl2.classList.remove("ImpactoPlanetaLvl2");
        temporizadorDestelloPlanetaLvl2 = null;
    }, 450);
}

function Habilitar_Siguienten_LVL() {
    document.getElementById('NEXT').hidden = true;
    document.getElementById("NIVEL_01").style.display = "none";
    document.getElementById("NIVEL_02").style.display = "none";
    document.getElementById("NIVEL3").style.display = "block";
}

function ganarLvl2() {
    if (!juegoActivoLvl2 || Vidaslvl2 <= 0) {
        return;
    }

    juegoActivoLvl2 = false;
    limpiarLasersLvl2();

    detenerMeteoritosLvl2();
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);

    meteoritosLvl2.forEach(retirarMeteoritoLvl2);

    naveJugadorLvl2.style.opacity = "0";

    document.getElementById("Fondo_Ciberpunk").pause();
    document.getElementById("Triunfo").play();

    victoriaLvl2.style.display = "flex";
    document.getElementById('NEXT').hidden = false;

    document.getElementById("NEXT").onclick =
        Habilitar_Siguienten_LVL;
}

/* MODIFICADO: ahora acepta xImpacto/yImpacto opcionales.
   Si se pasan (por ejemplo, cuando lo destruye el láser), la explosión
   se dibuja justo en el punto de contacto en vez de en la esquina del meteorito. */
function destruirMeteoritoLvl2(meteorito, xImpacto, yImpacto) {
    if (
        !juegoActivoLvl2 ||
        pausadoLvl2 || Vidaslvl2 <= 0 ||
        meteorito.dataset.bloqueado === "true"
    ) {
        return;
    }

    meteorito.dataset.bloqueado = "true";

    document.getElementById("Puntos_sound").play();

    Puntajelvl2 = Math.min(Puntajelvl2 + 1, 25); // Modificado: suma de 1 en 1 y límite máximo de 25
    actualizarMarcadoresLvl2();

    const x = xImpacto !== undefined ? xImpacto : meteorito.offsetLeft;
    const y = yImpacto !== undefined ? yImpacto : meteorito.offsetTop;

    mostrarExplosionLvl2(x, y);

    retirarMeteoritoLvl2(meteorito);

    if (Puntajelvl2 >= 25) {
        ganarLvl2();
    }
}

function perderLvl2(motivo = "vidas") {
    if (!juegoActivoLvl2) {
        return;
    }

    juegoActivoLvl2 = false;
    limpiarLasersLvl2();
    colaImpactosLvl2 = [];
    derrotaLvl2.querySelector("p").textContent = motivo === "tiempo"
        ? "Se acabó el tiempo. No alcanzaste los 25 puntos."
        : "La Tierra perdió sus tres vidas.";

    detenerMeteoritosLvl2();
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);

    naveJugadorLvl2.style.opacity = "0";

    document.getElementById("Fondo_Ciberpunk").pause();
    document.getElementById("Perdiste_sound").play();

    meteoritosLvl2.forEach(retirarMeteoritoLvl2);
    derrotaLvl2.style.display = "flex";
    mostrarVolverInicio(true);
}

function revisarImpactoPlanetaLvl2() {
    if (
        !juegoActivoLvl2 ||
        pausadoLvl2 ||
        Vidaslvl2 <= 0
    ) {
        return;
    }

    const planetaRect = planetaLvl2.getBoundingClientRect();
    const centroPlanetaX = planetaRect.left + planetaRect.width / 2;
    const centroPlanetaY = planetaRect.top + planetaRect.height / 2;
    /* 0.95 = ajusta el radio al círculo visible, ignorando el borde transparente de la imagen */
    const radioPlaneta = (Math.min(planetaRect.width, planetaRect.height) / 2) * 0.95;

    meteoritosLvl2.forEach(function (meteorito) {
        if (meteorito.dataset.bloqueado === "true") {
            return;
        }

        const rect = meteorito.getBoundingClientRect();
        const centroMeteoritoX = rect.left + rect.width / 2;
        const centroMeteoritoY = rect.top + rect.height / 2;
        /* 0.85 = ajusta el radio a la roca visible del meteorito, ignorando su margen transparente */
        const radioMeteorito = (Math.min(rect.width, rect.height) / 2) * 0.85;

        const distancia = Math.hypot(
            centroMeteoritoX - centroPlanetaX,
            centroMeteoritoY - centroPlanetaY
        );

        const tocoPlaneta = distancia <= (radioPlaneta + radioMeteorito);

        if (tocoPlaneta) {
            /* Lo detiene justo cuando toca el planeta. */
            meteorito.dataset.bloqueado = "true";
            meteorito.style.transition = "none";
            meteorito.style.left = meteorito.offsetLeft + "px";
            meteorito.style.top = meteorito.offsetTop + "px";

            colaImpactosLvl2.push(meteorito);
        }
    });

    if (
        impactoEnProcesoLvl2 ||
        colaImpactosLvl2.length === 0
    ) {
        return;
    }

    impactoEnProcesoLvl2 = true;

    const meteoritoImpactado = colaImpactosLvl2.shift();

    Vidaslvl2--;
    ActualizarVidaslvl2();

    const sinVidas = Vidaslvl2 === 0;

    /* HALLAZGO 15: destello del planeta en todo impacto que resta una vida. */
    efectoImpactoPlanetaLvl2();

    /* HALLAZGO 14: aviso temporal, excepto si ya se perdió la última vida. */
    if (!sinVidas) {
        mostrarAvisoImpactoLvl2();
    }

    retirarMeteoritoLvl2(meteoritoImpactado);
    impactoEnProcesoLvl2 = false;

    if (sinVidas) {
        /*
        planeta_3.png queda visible un momento y recién
        después aparece MISIÓN FALLIDA.
        */
        perderLvl2("vidas");
    }
}

function iniciarJuegoLvl2() {
    if (juegoActivoLvl2) return;
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);
    iniciandoLvl2 = false;
    juegoActivoLvl2 = true;
    pausadoLvl2 = false;
    impactoEnProcesoLvl2 = false;
    colaImpactosLvl2 = [];

    document.getElementById("Fondo_Ciberpunk").play().catch(() => {});

    iniciarMeteoritosLvl2();

    intervaloTiempoLvl2 = setInterval(function () {
        if (!juegoActivoLvl2 || pausadoLvl2) {
            return;
        }

        Tiempolvl2 = Math.max(0, Tiempolvl2 - 1);
        actualizarMarcadoresLvl2();

        if (Tiempolvl2 <= 0) {
            perderLvl2("tiempo");
        }
    }, 1000);

    intervaloImpactosLvl2 = setInterval(
        revisarImpactoPlanetaLvl2,
        20
    );
}

function reiniciarLvl2() {
    mostrarVolverInicio(false);
    document.getElementById("Fondo_Ciberpunk").currentTime = 0;
    juegoActivoLvl2 = false;
    limpiarLasersLvl2();
    document.getElementById('NEXT').hidden = true;
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);

    detenerMeteoritosLvl2();

    Tiempolvl2 = 60;
    Puntajelvl2 = 0;
    Vidaslvl2 = 3;

    impactoEnProcesoLvl2 = false;
    colaImpactosLvl2 = [];

    /* Limpieza de HALLAZGO 14 y 15 al reiniciar el nivel. */
    if (temporizadorAvisoImpactoLvl2) {
        clearTimeout(temporizadorAvisoImpactoLvl2);
        temporizadorAvisoImpactoLvl2 = null;
    }

    const avisoResidual = tableroLvl2.querySelector(".AvisoImpactoLvl2");
    if (avisoResidual) {
        avisoResidual.remove();
    }

    if (temporizadorDestelloPlanetaLvl2) {
        clearTimeout(temporizadorDestelloPlanetaLvl2);
        temporizadorDestelloPlanetaLvl2 = null;
    }

    planetaLvl2.classList.remove("ImpactoPlanetaLvl2");

    derrotaLvl2.style.display = "none";
    victoriaLvl2.style.display = "none";
    document.getElementById("Pausa_Pantallalvl2").style.display = "none";
    document.getElementById("TextoPauselvl2").textContent = "PAUSAR";

    meteoritosLvl2.forEach(retirarMeteoritoLvl2);

    ActualizarVidaslvl2();
    actualizarMarcadoresLvl2();

    iniciarJuegoLvl2();
}

document.getElementById("ReintentarLvl2").onclick = reiniciarLvl2;

document.getElementById("Playlvl2").addEventListener(
    "click",
    function () {
        if (iniciandoLvl2 || juegoActivoLvl2) return;
        iniciandoLvl2 = true;
        document.getElementById("Fondo_Ciberpunk").currentTime = 0;
        document.getElementById("Fondo_Ciberpunk").play().catch(() => {});

        document.getElementById("Texolvl2").style.left = "-900px";
        document.getElementById("Playlvl2").style.left = "-900px";
        document.getElementById("Dificultad").style.left = "-900px";

        let conteo = 4;

        const contador = setInterval(function () {
            conteo--;

            document.getElementById("RGBlvl2").innerHTML = conteo;

            if (conteo === -1) {
                clearInterval(contador);

                document.getElementById(
                    "Contenedor_contadorlvl2"
                ).style.display = "none";

                inicioLvl2.style.display = "none";

                iniciarJuegoLvl2();
            }
        }, 1000);
    }
);

document.getElementById("Pauselvl2").addEventListener(
    "click",
    function () {
        if (!juegoActivoLvl2) {
            return;
        }

        pausadoLvl2 = !pausadoLvl2;
        mostrarVolverInicio(pausadoLvl2);
        document.getElementById("TextoPauselvl2").innerHTML =
            pausadoLvl2 ? "REANUDAR" : "PAUSAR";
        document.getElementById(
            "Pausa_Pantallalvl2"
        ).style.display = pausadoLvl2 ? "table" : "none";

        if (pausadoLvl2) {
            limpiarLasersLvl2();
            document.getElementById("Fondo_Ciberpunk").pause();

            detenerMeteoritosLvl2();

            meteoritosLvl2.forEach(function (meteorito) {
                const x = meteorito.offsetLeft;
                const y = meteorito.offsetTop;
                meteorito.style.transition = "none";
                meteorito.style.left = x + "px";
                meteorito.style.top = y + "px";
            });
        } else {
            document.getElementById("Fondo_Ciberpunk").play().catch(() => {});
            iniciarMeteoritosLvl2();
        }
    }
);

document.getElementById("VolumenLvl2").addEventListener(
    "input",
    function (evento) {
        const volumen = evento.target.value;

        [
            "Fondo_Ciberpunk",
            "Puntos_sound",
            "Perdiste_sound",
            "Triunfo"
        ].forEach(function (id) {
            document.getElementById(id).volume = volumen;
        });
    }
);

document.addEventListener("fullscreenchange", function () {
    if (
        !document.fullscreenElement &&
        juegoActivoLvl2 &&
        !pausadoLvl2
    ) {
        document.getElementById("Pauselvl2").click();
    }
});

/* Modificado: Movimiento libre de la nave por toda la pantalla sin restricciones */
tableroLvl2.addEventListener("mousemove", function (evento) {
    if (!juegoActivoLvl2 || pausadoLvl2) {
        naveJugadorLvl2.style.opacity = "0";
        return;
    }

    const area = tableroLvl2.getBoundingClientRect();

    naveJugadorLvl2.style.left = evento.clientX - area.left + "px";
    naveJugadorLvl2.style.top = evento.clientY - area.top + "px";
    naveJugadorLvl2.style.opacity = "1";
});

tableroLvl2.addEventListener("mouseleave", function () {
    naveJugadorLvl2.style.opacity = "0";
});

meteoritosLvl2.forEach(function (meteorito) {
    meteorito.addEventListener("click", function (evento) {
        evento.stopPropagation();
        destruirMeteoritoLvl2(meteorito);
    });
});

tableroLvl2.addEventListener("click", function (evento) {
    if (
        !juegoActivoLvl2 ||
        pausadoLvl2 ||
        evento.target.classList.contains("Meteioritolvl2")
    ) {
        return;
    }

    const laser = document.createElement("img");

    laser.src = "laser_jugador.png";
    laser.className = "LaserJugadorLvl2";

    laser.style.left =
        naveJugadorLvl2.offsetLeft -
        naveJugadorLvl2.offsetWidth / 2 -
        10 +
        "px";

    laser.style.top = naveJugadorLvl2.offsetTop + "px";

    tableroLvl2.appendChild(laser);

    setTimeout(function () {
        if (laser.isConnected) laser.style.left = "-80px";
    }, 20);

    let anteriorLaser = laser.getBoundingClientRect();
    const anteriores = new Map(meteoritosLvl2.map(m => [m, m.getBoundingClientRect()]));
    const detectorLaser = setInterval(function () {
        if (!juegoActivoLvl2 || pausadoLvl2) {
            limpiar();
            return;
        }
        const laserRect = laser.getBoundingClientRect();

        const objetivo = meteoritosLvl2.find(function (meteorito) {
            const rect = meteorito.getBoundingClientRect();
            const previo = anteriores.get(meteorito);
            anteriores.set(meteorito, rect);
            return meteorito.dataset.bloqueado !== "true" && rect.right > 0 &&
                colisionBarridaLvl2(anteriorLaser, laserRect, previo, rect);
        });
        anteriorLaser = laserRect;

        if (objetivo) {
            clearInterval(detectorLaser);
            destruirMeteoritoLvl2(objetivo);
            laser.remove();
        }
    }, 20);

    const caducidad = setTimeout(limpiar, 1300);
    function limpiar() {
        clearInterval(detectorLaser);
        clearTimeout(caducidad);
        laser.remove();
        lasersLvl2.delete(limpiar);
    }
    lasersLvl2.add(limpiar);
});

// Comprueba todo el trayecto relativo entre muestras, incluso si el láser
// atraviesa el meteorito completamente entre dos cuadros.
function colisionBarridaLvl2(a0, a1, b0, b1) {
    let entrada = 0;
    let salida = 1;
    for (const [min, max] of [["left", "right"], ["top", "bottom"]]) {
        const velocidad = (a1[min] - a0[min]) - (b1[min] - b0[min]);
        if (velocidad === 0) {
            if (a0[max] < b0[min] || a0[min] > b0[max]) return false;
        } else {
            const t1 = (b0[min] - a0[max]) / velocidad;
            const t2 = (b0[max] - a0[min]) / velocidad;
            entrada = Math.max(entrada, Math.min(t1, t2));
            salida = Math.min(salida, Math.max(t1, t2));
        }
    }
    return entrada <= salida;
}

ActualizarVidaslvl2();
actualizarMarcadoresLvl2();
