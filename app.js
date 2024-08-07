 //Invocamos a express y se asignan a constante que por lo general tienen el mismo nombre
 //El framework principal es express
 const express= require ('express');
 const app = express();

 // Agregar urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());//especificar que se va a trabajar con json
 
// invocar a dotenv
const dotenv = require('dotenv');
//configurar dotenv
/*. = ir a la raiz del proyecto 
   /env = busque la carpeta env
   /.env = y que todas las variables de entorno queden en
           el archivo .env*/
dotenv.config({path:'./env/.env'});

// Directorio public
app.use('/resources', express.static('public')); /* Cada vez que se llame resources
                invocara todo lo que esta en public*/

/* usando __dirname para cuando el proyecto se muda a otro equipo y 
asi se puede guardar en cualquier carpeta, este representa la ruta raíz
en este caso la carpeta public contiene los archivos static*/             
app.use('/resources', express.static(__dirname + '/public'));

// Establecer motor de plantillas ejs
app.set('view engine', 'ejs');

// invocar bcryptjs
const bcryptjs = require('bcryptjs');

// config. las variables de session
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}));

//invocar el modulo de conexion de la BD
const connection= require('./database/db');


//Establecer rutas

app.get('/login', (req,res)=>{
    res.render('login');
})

// Registro
app.post('/login', async (req, res) => {
  const nombre_completo = req.body.nombre_completo;
  const correo = req.body.correo;
  const usuario = req.body.usuario;
  const password = req.body.password;
  const rol = req.body.rol;
  let passwordHaash = await bcryptjs.hash(password, 8); // contraseña encriptada

  // Verificar si el usuario o correo ya existe
  connection.query('SELECT * FROM users WHERE usuario = ? OR correo = ?', [usuario, correo], async (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error en la base de datos');
    } else if (results.length > 0) {
      // Usuario o correo ya existe
      res.render('login', {
        alert: true,
        alertTitle: "Error",
        alertMessage: "El usuario o correo ya está ocupado",
        alertIcon: 'error',
        showConfirmButton: true,
        timer: false,
        ruta: 'login'
      });
    } else {
      // Insertar el nuevo usuario
      connection.query('INSERT INTO users SET ?', { nombre_completo: nombre_completo, correo: correo, usuario: usuario, contraseña: passwordHaash, rol: rol }, async (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error en la base de datos');
        } else {
          res.render('login', {
            alert: true,
            alertTitle: "REGISTRO",
            alertMessage: "Registro exitoso",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: ''
          });
        }
      });
    }
  });
});


    // Autentificación de usuarios
    app.post('/auth', async (req, res) => {
      const usuario = req.body.usuario;
      const password = req.body.password;
    
      if (usuario && password) {
        connection.query('SELECT * FROM users WHERE usuario = ?', [usuario], async (error, results) => {
          if (results.length == 0 || !(await bcryptjs.compare(password, results[0].contraseña))) {
            res.render('login', {
              alert: true,
              alertTitle: "Error",
              alertMessage: "DATOS INCORRECTOS",
              alertIcon: "error",
              showConfirmButton: true,
              timer: false,
              ruta: 'login'
            });
          } else {
            req.session.loggedin = true;
            req.session.nombre_completo = results[0].nombre_completo;
            req.session.usuario_id = results[0].id; // Asegúrate de que `id` es el ID numérico
            req.session.rol = results[0].rol; // Almacenar el rol en la sesión
            res.render('login', {
              alert: true,
              alertTitle: "SESIÓN INICIADA",
              alertMessage: "DATOS CORRECTOS",
              alertIcon: "success",
              showConfirmButton: false,
              timer: 1500,
              ruta: ''
            });
          }
        });
      }
    });
    

//Funcion para que solo los administradores puedan acceder al crud
function isAdmin(req, res, next) {
  if (req.session.loggedin && req.session.rol === 'admin') {
    next();
  } else {
    res.redirect('/');
  }
}

    //si ha iniciado sesion
    app.get('/', (req, res)=>{
      if(req.session.loggedin){
        res.render('index',{
          login: true,
          name: req.session.nombre_completo,
          rol: req.session.rol
        });
      }
      else{
        res.render('index', {
          login: false,
          name: 'Debe iniciar sesión'
        });
      }
    })

//botón para cerrar sesión 
app.get('/cerrar_sesion', (req, res)=>{
  req. session.destroy(()=>{
    res.redirect('/')
  })
})



//Mostrar los registros de la BD
app.get('/tabla_crud', isAdmin, (req, res) => {
  connection.query('SELECT * FROM users', (error, results) => {
    if (error) {
      throw error;
    } else {
      res.render('tabla_crud', { results: results });
    }
  });
});

//Ruta para editar registros y se necesita pasar el parametro de id para modificar uno en especifico
app.get('/editar/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
    if (error) {
      throw error;
    } else {
      res.render('editar', { usuarios: results[0] });
    }
  });
});


//modificar registro
const crud = require('./controladores/crud');
app.post('/update', isAdmin, crud.update);


//ruta para eliminar un registro
app.get('/delete/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error al eliminar el registro');
    } else {
      res.redirect('/tabla_crud');
    }
  });
});






// Ruta para mostrar los productos disponibles
app.get('/productos', (req, res) => {
  if (req.session.loggedin) {
    const usuario = {
      id: req.session.usuario_id,
      nombre: req.session.nombre_completo
    };

    connection.query('SELECT * FROM productos', (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error al obtener los productos');
      } else {
        //verificar los datos que se están pasando correctamente
        console.log('Productos:', results); 
        console.log('Usuario:', usuario); 
        res.render('productos', {
          productos: results,
          usuario: usuario
        });
      }
    });
  } else {
    res.redirect('/login');
  }
});




// Ruta para realizar una compra
app.post('/comprar', (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;

  
  connection.query('SELECT nombre, precio, existencias FROM productos WHERE id = ?', [producto_id], (error, results) => {
    if (error) {
      console.error('Error en la consulta de productos:', error);
      return res.status(500).send('Error en la consulta');
    }
    
    const { nombre, precio, existencias } = results[0];
    const total = precio * cantidad;

    // Registrar la compra 
    connection.query('INSERT INTO compras SET ?', { usuario_id, producto_id, cantidad, total }, (error) => {
      if (error) {
        console.error('Error al registrar la compra:', error);
        return res.status(500).send('Error al registrar la compra');
      }

      // Actualizar el stock
      connection.query('UPDATE productos SET existencias = existencias - ? WHERE id = ?', [cantidad, producto_id], (error) => {
        if (error) {
          console.error('Error al actualizar el stock:', error);
          return res.status(500).send('Error al actualizar el stock');
        }

        return res.render('productos', {
          alert: true,
          alertTitle: "COMPRA REALIZADA",
          alertMessage: `Has comprado ${cantidad} unidades de ${nombre} por un total de $${total}`,
          alertIcon: 'success',
          showConfirmButton: true,
          timer: false,
          ruta: 'productos'
        });
      });
    });
  });
});






//CURD PRODUCTOS
//Mostrar los registros de la BD
app.get('/tabla_productos', isAdmin, (req, res) => {
  connection.query('SELECT * FROM productos', (error, results) => {
    if (error) {
      throw error;
    } else {
      res.render('tabla_productos', { results: results });
    }
  });
});



//Ruta para editar registros y se necesita pasar el parametro de id para modificar uno en especifico
app.get('/edit_P/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM productos WHERE id = ?', [id], (error, results) => {
    if (error) {
      throw error;
    } else {
      res.render('edit_P', { productos: results[0] });
    }
  });
});

//modificar productos
app.post('/update_P', isAdmin, crud.update_P);



//renderizar la ruta para que se pueda visualizar
app.get('/agregar_P', (req, res) => {
  res.render('agregar_P');
});

app.post('/agregar_P', (req, res) => {
  
  const nombre= req.body.nombre;
  const precio = req.body.precio;
  const existencias = req.body.existencias;
  const estado = req.body.estado;

  // Verificar si el nombre ya existe
  connection.query('SELECT * FROM productos WHERE nombre = ?', [nombre], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error en la base de datos');
    } else if (results.length > 0) {
      res.render('agregar_P', {
        alert: true,
        alertTitle: "Error",
        alertMessage: "El nombre ya esta registrado",
        alertIcon: 'error',
        showConfirmButton: true,
        timer: false,
        ruta: 'agregar_P'
      });
    } else {
      // Insertar el nuevo producto
      connection.query('INSERT INTO productos SET ?', { nombre: nombre, precio: precio, existencias: existencias, estado: estado }, async (error, results) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error en la base de datos');
        } else {
          res.render('agregar_P', {
            alert: true,
            alertTitle: "REGISTRO EXITOSO",
            alertMessage: "Nuevo producto agregado",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: 'tabla_productos'
          });
        }
      });
    }
  });
});

//ruta para eliminar un registro
app.get('/delete_P/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM productos WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error al eliminar el producto');
    } else {
      res.redirect('/tabla_productos');
    }
  });
});


//CRUD COMPRAS
//Mostrar los registros de la BD
app.get('/tabla_compras', isAdmin, (req, res) => {
  connection.query('SELECT * FROM compras', (error, results) => {
    if (error) {
      throw error;
    } else {
      res.render('tabla_compras', { results: results });
    }
  });
});



//Ruta para editar registros y se necesita pasar el parametro de id para modificar uno en especifico
app.get('/edit_C/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  connection.query('SELECT * FROM compras WHERE id = ?', [id], (error, results) => {
    if (error) {
      throw error;
    } else {
      res.render('edit_C', { compras: results[0] });
    }
  });
});

//modificar productos
app.post('/update_C', isAdmin, crud.update_C);

//ruta para eliminar un registro
app.get('/delete_C/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM compras WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error al eliminar la compra');
    } else {
      res.redirect('/tabla_compras');
    }
  });
});

//servidor
 //req = request
 //res= response
 app.listen(3000,(req, res)=>{
    console.log('El servidor se esta ejecutando en http://localhost:3000');
 });