//Invocamos a la conexion de la DB
const connection = require('../database/db');

exports.update = (req, res)=>{
    const id = req.body.id;
    const nombre_completo= req.body.nombre_completo;
    const correo = req.body.correo;
    const usuario = req.body.usuario;
    const rol = req.body.rol;
    connection.query('UPDATE users SET ? WHERE id = ? ',[{nombre_completo:nombre_completo, correo:correo, usuario:usuario, rol:rol}, id], (error, results)=>{
      if(error){
        console.log(error);
      }
      else{
        res.redirect('tabla_crud');
      }
    });
  };

  exports.update_P = (req, res)=>{
    const id = req.body.id;
    const nombre= req.body.nombre;
    const precio = req.body.precio;
    const existencias = req.body.existencias;
    const estado = req.body.estado;
    connection.query('UPDATE productos SET ? WHERE id = ? ',[{nombre:nombre, precio:precio, existencias:existencias, estado:estado}, id], (error, results)=>{
      if(error){
        console.log(error);
      }
      else{
        console.log('Se ha actualizado la tabla de productos');
        res.redirect('tabla_productos');
      }
    });
  };


  exports.update_C = (req, res)=>{
    const id = req.body.id;
    const usuario_id= req.body.usuario_id;
    const producto_id = req.body.producto_id;
    const cantidad = req.body.cantidad;
    const total = req.body.total;
    const fecha = req.body.fecha;
    connection.query('UPDATE compras SET ? WHERE id = ? ',[{usuario_id:usuario_id, producto_id:producto_id, cantidad:cantidad, total:total, fecha:fecha}, id], (error, results)=>{
      if(error){
        console.log(error);
      }
      else{
        console.log('Se ha actualizado la tabla de compras');
        res.redirect('tabla_compras');
      }
    });
  };