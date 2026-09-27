let Tiempolvl2 = 61;
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
const limiteLvl2 = document.querySelector("#NIVEL_02 .Limitelvl2");
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
        Puntajelvl2 + " / 35";
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

    meteorito.style.transition = "2s";
    meteorito.style.left = "80%";
    meteorito.style.top = Math.round(Math.random() * 450) + "px";
}

function iniciarMeteoritosLvl2() {
    detenerMeteoritosLvl2();

    const esperas = [3500, 3000, 2200];
    const frecuencias = [2030, 2750, 2470];

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
    document.getElementById("NIVEL_01").style.display = "none";
    document.getElementById("NIVEL_02").style.display = "none";
    document.getElementById("NIVEL3").style.display = "block";
}

function ganarLvl2() {
    if (!juegoActivoLvl2) {
        return;
    }

    juegoActivoLvl2 = false;

    detenerMeteoritosLvl2();
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);

    meteoritosLvl2.forEach(retirarMeteoritoLvl2);

    naveJugadorLvl2.style.opacity = "0";

    document.getElementById("Fondo_Ciberpunk").pause();
    document.getElementById("Triunfo").play();

    victoriaLvl2.style.display = "flex";

    document.getElementById("NEXT").onclick =
        Habilitar_Siguienten_LVL;
}

function destruirMeteoritoLvl2(meteorito) {
    if (
        !juegoActivoLvl2 ||
        meteorito.dataset.bloqueado === "true"
    ) {
        return;
    }

    meteorito.dataset.bloqueado = "true";

    document.getElementById("Puntos_sound").play();

    Puntajelvl2 = Math.min(Puntajelvl2 + 5, 35);
    actualizarMarcadoresLvl2();

    mostrarExplosionLvl2(
        meteorito.offsetLeft,
        meteorito.offsetTop
    );

    setTimeout(function () {
        retirarMeteoritoLvl2(meteorito);
    }, 650);

    if (Puntajelvl2 >= 35) {
        ganarLvl2();
    }
}

function perderLvl2() {
    if (!juegoActivoLvl2) {
        return;
    }

    juegoActivoLvl2 = false;
    colaImpactosLvl2 = [];

    detenerMeteoritosLvl2();
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);

    naveJugadorLvl2.style.opacity = "0";

    document.getElementById("Fondo_Ciberpunk").pause();
    document.getElementById("Perdiste_sound").play();

    setTimeout(function () {
        meteoritosLvl2.forEach(retirarMeteoritoLvl2);
        derrotaLvl2.style.display = "flex";
    }, 1000);
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

    meteoritosLvl2.forEach(function (meteorito) {
        if (meteorito.dataset.bloqueado === "true") {
            return;
        }

        const rect = meteorito.getBoundingClientRect();

        const tocoPlaneta =
            rect.right >= planetaRect.left &&
            rect.left <= planetaRect.right &&
            rect.bottom >= planetaRect.top &&
            rect.top <= planetaRect.bottom;

        if (tocoPlaneta) {
            /* Lo detiene justo cuando toca el planeta. */
            meteorito.dataset.bloqueado = "true";
            meteorito.style.transition = "none";
            meteorito.style.left = meteorito.offsetLeft + "px";
            meteorito.style.top = meteorito.offsetTop + "px";

            /*
            Si llegaron varios meteoritos juntos, quedan guardados
            para contar el impacto 1, luego el 2 y después el 3.
            */
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

    setTimeout(function () {
        retirarMeteoritoLvl2(meteoritoImpactado);
        impactoEnProcesoLvl2 = false;

        if (!sinVidas) {
            revisarImpactoPlanetaLvl2();
        }
    }, 650);

    if (sinVidas) {
        /*
        planeta_3.png queda visible un momento y recién
        después aparece MISIÓN FALLIDA.
        */
        setTimeout(perderLvl2, 1000);
    }
}

function iniciarJuegoLvl2() {
    juegoActivoLvl2 = true;
    pausadoLvl2 = false;
    impactoEnProcesoLvl2 = false;
    colaImpactosLvl2 = [];

    document.getElementById("Fondo_Ciberpunk").play();

    iniciarMeteoritosLvl2();

    intervaloTiempoLvl2 = setInterval(function () {
        if (pausadoLvl2) {
            return;
        }

        Tiempolvl2--;
        actualizarMarcadoresLvl2();

        if (Tiempolvl2 <= 0) {
            perderLvl2();
        }
    }, 1000);

    intervaloImpactosLvl2 = setInterval(
        revisarImpactoPlanetaLvl2,
        20
    );
}

function reiniciarLvl2() {
    clearInterval(intervaloTiempoLvl2);
    clearInterval(intervaloImpactosLvl2);

    detenerMeteoritosLvl2();

    Tiempolvl2 = 61;
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

    meteoritosLvl2.forEach(retirarMeteoritoLvl2);

    ActualizarVidaslvl2();
    actualizarMarcadoresLvl2();

    iniciarJuegoLvl2();
}

document.getElementById("ReintentarLvl2").onclick = reiniciarLvl2;

document.getElementById("Playlvl2").addEventListener(
    "click",
    function () {
        document.getElementById("Fondo_Ciberpunk").play();

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
document.getElementById("TextoPauselvl2").innerHTML =
    pausadoLvl2 ? "▶️" : "⏸️";
        document.getElementById(
            "Pausa_Pantallalvl2"
        ).style.display = pausadoLvl2 ? "table" : "none";

        if (pausadoLvl2) {
            document.getElementById("Fondo_Ciberpunk").pause();

            detenerMeteoritosLvl2();

            meteoritosLvl2.forEach(function (meteorito) {
                meteorito.style.transition = "none";
                meteorito.style.left = meteorito.offsetLeft + "px";
                meteorito.style.top = meteorito.offsetTop + "px";
            });
        } else {
            document.getElementById("Fondo_Ciberpunk").play();
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

tableroLvl2.addEventListener("mousemove", function (evento) {
    if (!juegoActivoLvl2 || pausadoLvl2) {
        naveJugadorLvl2.style.opacity = "0";
        return;
    }

    const area = tableroLvl2.getBoundingClientRect();

    const limiteSeguro =
        limiteLvl2.offsetLeft -
        naveJugadorLvl2.offsetWidth / 2 -
        10;

    naveJugadorLvl2.style.left =
        Math.min(evento.clientX - area.left, limiteSeguro) + "px";

    naveJugadorLvl2.style.top =
        evento.clientY - area.top + "px";

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
        laser.style.left = "-80px";
    }, 20);

    const detectorLaser = setInterval(function () {
        const laserRect = laser.getBoundingClientRect();

        const objetivo = meteoritosLvl2.find(function (meteorito) {
            const rect = meteorito.getBoundingClientRect();

            return (
                meteorito.dataset.bloqueado !== "true" &&
                laserRect.left < rect.right &&
                laserRect.right > rect.left &&
                laserRect.top < rect.bottom &&
                laserRect.bottom > rect.top
            );
        });

        if (objetivo) {
            clearInterval(detectorLaser);
            destruirMeteoritoLvl2(objetivo);
            laser.remove();
        }
    }, 20);

    setTimeout(function () {
        clearInterval(detectorLaser);
        laser.remove();
    }, 1300);
});

ActualizarVidaslvl2();
actualizarMarcadoresLvl2();