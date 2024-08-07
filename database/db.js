//realizar conexión con la base de datos

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect((error)=>{
    if(error){
        console.log('Hubo un error en la conexión de la DB: '+error);
        return;
    }
    console.log('Conexión realizada con exito a la DB');
});

//exportar el modulo y así utilizarlo en cualquier otro archivo del proyecto
module.exports = connection;
