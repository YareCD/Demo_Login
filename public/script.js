document.getElementById("btn_inicio_sesion").addEventListener("click", login);
document.getElementById("btn_registrar").addEventListener("click", register);
window.addEventListener("resize",anchoPagina);
//declarar variables
var contenedor_loginRegister = document.querySelector(".contenedorLoginRegister");
var contenedor_login = document.querySelector(".contenedorLogin");
var contenedor_register = document.querySelector(".contenedorRegister");
var caja_login= document.querySelector(".cajaLogin");
var caja_register= document.querySelector(".cajaRegister");
var cajaTracera=document.querySelector(".cajaTracera");

function anchoPagina()
{
    if(window.innerWidth>850)
    {
        caja_login.style.display="block";
        caja_register.style.display="block";
    }
    else{
        caja_register.style.display="block";
        caja_register.style.opacity="1";
        caja_login.style.display="none";
        contenedor_login.style.display="block";
        contenedor_register.style.display="none";
        contenedor_loginRegister.style.left="0px";
    }
}
anchoPagina();

function login(){
    if(window.innerWidth>850)
    {
        contenedor_register.style.display="none";
        contenedor_loginRegister.style.left="10px";
        contenedor_login.style.display="block";
        caja_register.style.opacity="1";
        caja_login.style.opacity="0";
        cajaTracera.style.background="rgba(90, 2, 107, 0.6)";
    }
    else
    {
        contenedor_register.style.display="none";
        contenedor_loginRegister.style.left="0px";
        contenedor_login.style.display="block";
        caja_register.style.display="block";
        caja_login.style.display="none";
        cajaTracera.style.background="rgba(90, 2, 107, 0.6)";
    }
}

function register(){
    if(window.innerWidth>850)
    {
        contenedor_register.style.display="block";
        contenedor_loginRegister.style.left="410px";
        contenedor_login.style.display="none";
        caja_register.style.opacity="0";
        caja_login.style.opacity="1";
        cajaTracera.style.background="rgba(2, 69, 107, 0.6)";
    }
    else
    {
        contenedor_register.style.display="block";
        contenedor_loginRegister.style.left="0px";
        contenedor_login.style.display="none";
        caja_register.style.display="none";
        caja_login.style.display="block";
        caja_login.style.opacity="1";
        cajaTracera.style.background="rgba(2, 69, 107, 0.6)";
    }
}