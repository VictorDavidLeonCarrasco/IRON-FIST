
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
    clearInterval(Restar_Tiempo);
    clearInterval(Reanudar_trayectoria);
    clearInterval(Reanudar_trayectoria2);
    document.getElementById('Fondo_Ciberpunk').pause();
    const finOverlay = document.getElementById('FinJuegoNivel1');
    if (finOverlay) {
        finOverlay.style.display = 'flex';
    }
}

function reiniciarNivel1() {
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






//CONTENEDOR QUE CONTEIENE TOO EL JUEGO
//DE POR SI ESTA FUNCION NO SE EJECUTA HASTA QUE SE LA LLAMA, MAS ADELANTE LA LLAMAREMOS
//PARA QUE EL JUEGO INICIE UNA VEZ SE PRESIONE JUGAR
function JUEGO(){

    function Tiempo_Disminur(){ //FUNCION QUE REDUCE EL TIEMPO Y RESETEAL EL RESULTADO UNA VEZ LLEGUE A 0
        if (finDelJuegoNivel1) return;
        Tiempo--;
        document.getElementById("Tiempo").innerHTML = Tiempo
        if(Tiempo == 0){
            Tiempo = 70
            Puntaje = 0
            document.getElementById("Perdiste_sound").play()
            mostrarFinJuegoNivel1();
            document.getElementById("Tiempo").innerHTML = 70;
            actualizarPuntajeNivel1();} }
    
        Restar_Tiempo = setInterval(Tiempo_Disminur, 1000)

        //AÑADIMOS LA FUNCION AUMENTAR PUNTOS AL PASAR EL CURSOR SOBRE LOS METIORITOS
        document.getElementById("Meteiorito").addEventListener('mouseover', Aumentar_Puntos)
        document.getElementById("Meteiorito2").addEventListener('mouseover', Aumentar_Puntos)


        //FUNCION QUE UNICAMENTE AUMENTA PUNTOS Y RESETEA LAS VARIABLES AL LLEGAR A CIERTO LIMITE
        function Aumentar_Puntos(){
            if (finDelJuegoNivel1) return;
            Puntaje++;
            actualizarPuntajeNivel1();
            if(Puntaje >= objetivoPuntosNivel1){
                finDelJuegoNivel1 = true;
                Tiempo = 70


                document.getElementById("NEXT").addEventListener('click', Habilitar_Siguienten_LVL)
                function Habilitar_Siguienten_LVL(){
                document.getElementById("NIVEL_01").style.display = "none"
                document.getElementById("NIVEL_02").style.display = "block"}
                document.getElementById("Tiempo").innerHTML = 70
                actualizarPuntajeNivel1();
                document.getElementById("Triunfo").play()
                document.getElementById("Fondo_Ciberpunk").pause()
                document.getElementById("Puntos_sound").pause()
                document.getElementById("Punto2").pause()
                document.getElementById("GANASTE_PANTALLA").style.display = "flex"
                
                function Ganaste_Pantalla(){

                    clearInterval(Reanudar_trayectoria)
                    clearInterval(Reanudar_trayectoria2)
                    clearInterval(Restar_Tiempo)

                    document.getElementById("Meteiorito").style.left = "-70%"
                    document.getElementById("Meteiorito").style.transition = "0s"

                    document.getElementById("Meteiorito2").style.left = "-70%"
                    document.getElementById("Meteiorito2").style.transition = "0s"}
                    
                Desbloquear_Pantalla  =  setInterval(Ganaste_Pantalla, 1)


                    
                        }
                    }



        //ESTA FUNCION DIRIGE AL PRIMER METIORITO 1 A LA TIERRA 
        function Metiorito_Direccion(){
            if (finDelJuegoNivel1) return;
            Distancia1 = 80
            Altura1 = alturaAleatoriaNivel1()
            vidasNivel1Impactadas.Meteiorito = false;

            document.getElementById("Meteiorito").style.left = Distancia1 + "%"
            document.getElementById("Meteiorito").style.top = Altura1 + "px"}

            setTimeout(Metiorito_Direccion, 2000)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
            Reanudar_trayectoria = setInterval(Metiorito_Direccion, 2430)//LUEGO SE VA A LLAMAR A LOS METIORITOS CADA 2,4 SEGUNDOS


        //ESTA FUNCION DIRIGE AL PRIMER METIORITO 2 A LA TIERRA         
        function Metiorito_Direccion2(){
            if (finDelJuegoNivel1) return;
            Distancia2 = 80
            Altura2 = alturaAleatoriaNivel1()
            vidasNivel1Impactadas.Meteiorito2 = false;

            document.getElementById("Meteiorito2").style.left = Distancia2 + "%"
            document.getElementById("Meteiorito2").style.top = Altura2 + "px"}

            setTimeout(Metiorito_Direccion2, 2600)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
            Reanudar_trayectoria2 = setInterval(Metiorito_Direccion2, 2350)//LUEGO SE VA A LLAMAR A LOS METIORITOS CADA 2,3 SEGUNDOS


        //AQUI ADJUNTAMOS LA ACCION DE LA FUNCION EXPULZAR AL PASAR SOBRE EL METIORITO
        document.getElementById("Meteiorito").addEventListener('mouseover', Explulsar)
        document.getElementById("Meteiorito2").addEventListener('mouseover', Explulsar2)


        //ESTA ES LA FUNCION QUE EXPULSA AL METIRITO 1 DE MANERA ALEATORIA FUERA DEL MAPA
        function Explulsar (){
            document.getElementById("Puntos_sound").play()
            Distancia = "-500"
            Altura = alturaAleatoriaNivel1()

            document.getElementById("Meteiorito").style.left = Distancia + "px"
            document.getElementById("Meteiorito").style.top = Altura + "px"
            document.getElementById("Meteiorito").style.transition = "1.8s"}


        //ESTA ES LA FUNCION QUE EXPULSA AL METIRITO 2 DE MANERA ALEATORIA FUERA DEL MAPA
        function Explulsar2 (){
            document.getElementById("Punto2").play()
            Distancia = "-500"
            Altura = alturaAleatoriaNivel1()
    
            document.getElementById("Meteiorito2").style.left = Distancia + "px"
            document.getElementById("Meteiorito2").style.top = Altura + "px"
            document.getElementById("Meteiorito2").style.transition = "1.8s"}




        
        //ESTA FUNCION SE ENCARGA DE ALERTARTE UNA VEZ EL METIORITO CRUZE LA LINEA CON UN PERDISTE
        //TAMBIEN RESETEA LOS VALORES Y LLEVA A LOS METIORITOS FUERA DEL MAPA DE MANERA INSTANTANEA
        function perdiste (){
            if (finDelJuegoNivel1) return;
            if(document.getElementById("Meteiorito").offsetLeft > document.querySelector('#NIVEL_01 .Limite').offsetLeft && !vidasNivel1Impactadas.Meteiorito) {
                vidasNivel1Impactadas.Meteiorito = true;
                vidasNivel1--;
                actualizarVidasNivel1();
                document.getElementById("Perdiste_sound").play();
                document.getElementById("Meteiorito").style.left = "-70%";
                document.getElementById("Meteiorito").style.transition = "0s";

                if (vidasNivel1 <= 0) {
                    mostrarFinJuegoNivel1();
                    return;
                }
            }

            if(document.getElementById("Meteiorito2").offsetLeft > document.querySelector('#NIVEL_01 .Limite').offsetLeft && !vidasNivel1Impactadas.Meteiorito2) {
                vidasNivel1Impactadas.Meteiorito2 = true;
                vidasNivel1--;
                actualizarVidasNivel1();
                document.getElementById("Perdiste_sound").play();
                document.getElementById("Meteiorito2").style.left = "-70%";
                document.getElementById("Meteiorito2").style.transition = "0s";

                if (vidasNivel1 <= 0) {
                    mostrarFinJuegoNivel1();
                    return;
                }
            }
        
            else {
                document.getElementById("Meteiorito").style.transition = "2.4s"
                document.getElementById("Meteiorito2").style.transition = "2.4s"} }

        setInterval(perdiste, 1)//LE COLOCAMOS UNO PARA QUE SIEMPRE SE ESTE EJECUTANDO, DADO A 
        //QUE NO SABEMOS CUANDO EL METIORITO VA A SUPERAR EL LIMITE
        }

        
        //LE DECIMOS QUE AL PRECIONAR EL BOTON JUGAR EJECUTARA LA FUNCION PLAY     
        document.getElementById("Play").addEventListener('click', PLAY)

        // La cuenta visible controla tambien el momento de iniciar la partida.
        function PLAY() {
            if (intervaloCuentaNivel1 !== null) return;
            reiniciarNivel1();
            document.getElementById('Fondo_Ciberpunk').play();
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
                    DETENER_JUEGO();
                }
            }, 1000);
        }
            //ESTA FUNCION CONTIENE EL REANUDE Y PAUSE DEL BOTON
            function DETENER_JUEGO (){
                //INDICA QUE LA FUNCION DE PAUSE SE EJECUTARA UNA VEZ SE DE CLICK AL BOTON DE PAUSE        
                document.getElementById("Pause").addEventListener('click', PAUSE)
                //ESTA VARIABLE INDICA SI SE EJECUTA O NO EL DESPAUSEO
                Activo = 1 
                    //HACE QUE EL JUEGO SE DETENGA
                    function PAUSE(){ //Colocar la funcion de pausa y reanudar
                        //SI LLEGA A UNA EJECUTA LA FUNCION PAUSE
                        if (Activo == 1){
                        document.getElementById('Pause').textContent = 'REANUDAR';
                        
                        document.getElementById("Fondo_Ciberpunk").pause()
                        document.getElementById("Pausa_Pantalla").style.display = "table"
                        clearInterval(Restar_Tiempo)//BORRAMOS LA FUNCION DE TIEMPO
                        document.getElementById("Tiempo").innerHTML = Tiempo
                        clearInterval(Reanudar_trayectoria2)
                        clearInterval(Reanudar_trayectoria)

                            function Metiorito_detener (){   
                            document.getElementById("Meteiorito").style.left = document.getElementById("Meteiorito").offsetLeft + "px" 
                            document.getElementById("Meteiorito2").style.left = document.getElementById("Meteiorito2").offsetLeft + "px" 

                            document.getElementById("Meteiorito").style.top = document.getElementById("Meteiorito").offsetTop + "px" 
                            document.getElementById("Meteiorito2").style.top = document.getElementById("Meteiorito2").offsetTop + "px" }

                            Pusae_offf = setInterval(Metiorito_detener, 1) //LE ASEGNAMOS UNA ID, PARA BORRALO UNA VEZ SE DESPAUSEE
                            Activo = 2} //CAMBIAMOS EL VALOR PARA QUE AL VOLVER A DARLE CLICK EJECUTE LA CONDICIONAL DE REANUDAR

                        else { //LA FUNCION DE REANUDAR
                            document.getElementById('Pause').textContent = 'PAUSAR';
                            clearInterval(Pusae_offf) //BORRAMOS LA FUNCION, PARA QUE EL REANUDAR PUEDA EJECUTARSE DE NUEVO
                            document.getElementById("Pausa_Pantalla").style.display = "none"
                            document.getElementById("Fondo_Ciberpunk").play()
                            function Tiempo_Disminur(){//VOLVEMOS A CREAR LA FUNCION DE TIEMPO PARA QUE REANUEDE EL CONTEO
                                Tiempo--;
                                document.getElementById("Tiempo").innerHTML = Tiempo
                                if(Tiempo == 0){
                                    Tiempo = 71
                                    Puntaje = 0
                                document.getElementById("Perdiste_sound").play()    
                                alert("Lo lamento perdiste")
                                document.getElementById("Meteiorito").style.left = "-70%"
                                document.getElementById("Meteiorito").style.transition = "0s" //CREAR UNA FUNCION EN BASE A ESTO Y PASAR COMO REANUDAR EN GANASTE
                
                                document.getElementById("Meteiorito2").style.left = "-70%"
                                document.getElementById("Meteiorito2").style.transition = "0s"}
                                
                                else{
                                    document.getElementById("Meteiorito").style.transition = "2.4s"
                                    document.getElementById("Meteiorito2").style.transition = "2.4s"}}

                        Restar_Tiempo = setInterval(Tiempo_Disminur, 1000)
        
                        document.getElementById("Meteiorito").style.left = Distancia1 + "%"
                        document.getElementById("Meteiorito").style.top = Altura1 + "px"
                        document.getElementById("Meteiorito").style.transition = "2.4s"

                        document.getElementById("Meteiorito2").style.left = Distancia2 + "%"
                        document.getElementById("Meteiorito2").style.top = Altura2 + "px"
                        document.getElementById("Meteiorito2").style.transition = "2.4s"

                        
                        function Metiorito_Direccion(){
                            Distancia1 = 80
                            Altura1 = alturaAleatoriaNivel1()
                
                            document.getElementById("Meteiorito").style.left = Distancia1 + "%"
                            document.getElementById("Meteiorito").style.top = Altura1 + "px"}
                
                            setTimeout(Metiorito_Direccion, 2000)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
                            Reanudar_trayectoria = setInterval(Metiorito_Direccion, 2430)//LUEGO SE VA A LLAMAR A LOS METIORITOS CADA 2,4 SEGUNDOS
                
                
                        //ESTA FUNCION DIRIGE AL PRIMER METIORITO 2 A LA TIERRA         
                        function Metiorito_Direccion2(){
                            Distancia2 = 80
                            Altura2 = alturaAleatoriaNivel1()
                
                            document.getElementById("Meteiorito2").style.left = Distancia2 + "%"
                            document.getElementById("Meteiorito2").style.top = Altura2 + "px"}
                
                            setTimeout(Metiorito_Direccion2, 2000)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
                            Reanudar_trayectoria2 = setInterval(Metiorito_Direccion2, 2350)//LUEGO SE VA A LLAMAR A LOS METIORITOS CADA 2,3 SEGUNDOS





                        Activo = 1} } } //CAMBIAMOS EL VALOR DE NUEVO A 1 PARA QUE AL SIGUIENTE CLICK SE EJECUTE EL PAUSE  S



    





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
