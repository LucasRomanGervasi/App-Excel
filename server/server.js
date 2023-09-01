const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '192837465',
  port: 3306,
  database: 'appexcel'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conexión a la base de datos exitosa');
});

app.post('/data', (req, res) => {
  const impoCompraVenta = req.body.impoCompraVenta;
  const archivoData = req.body.archivo;

  const { idusuario, idempresa, archivo, tipo, fechahasta, fechadesde, fechaupload } = archivoData;
  const sqlArchivo = `INSERT INTO archivo ( idusuario, idempresa, archivo, tipo, fechahasta, fechadesde, fechaupload) VALUES ( ${idusuario}, ${idempresa}, '${archivo}', '${tipo}', '${fechahasta}', '${fechadesde}', '${fechaupload}')`;

  db.query(sqlArchivo, (err, resultArchivo) => {
    if (err) {
      console.error('Error al insertar archivo en la base de datos:', err);
      return res.status(500).send('Error interno del servidor');
    }

    const idarchivo = resultArchivo.insertId; 

    const insertionErrors = [];

    impoCompraVenta.forEach((data1, index) => {
      const { fecha, tipoCFE, serie, numero, RUTEmisor, moneda, montoneto, montoiva, montototal, montoretper, montocredFiscal } = data1;
      console.log(fecha, "ACA ESTA LA FECHA")
      const sqlImpo = `INSERT INTO impo_compraventa (id, idarchivo, fecha, tipoCFE, serie, numero, RUTEmisor, moneda, montoneto, montoiva, montototal, montoretper, montocredFiscal) VALUES (${index + 1},${idarchivo}, '${fecha}', '${tipoCFE}', '${serie}', ${numero}, '${RUTEmisor}', '${moneda}', ${montoneto}, ${montoiva}, ${montototal}, ${montoretper}, ${montocredFiscal || 0})`;

      db.query(sqlImpo, (err, resultImpo) => {
        if (err) {
          console.error('Error al insertar impo_compraventa en la base de datos:', err);
          insertionErrors.push(err);
        } else {
          console.log('Dato insertado correctamente en la posición', index);
        }

        if (index === impoCompraVenta.length - 1) {
          if (insertionErrors.length > 0) {
            return res.status(500).send('Error interno del servidor');
          } else {
            console.log('Todos los datos insertados correctamente');
            return res.status(200).send('Todos los datos insertados correctamente');
          }
        }
      });
    });
  });
});

app.delete('/data', (req, res) => {
  let operationsCompleted = 0;
  
  // Eliminar datos de impo_compraventa
  db.query('DELETE FROM impo_compraventa', (err, result) => {
    if (err) {
      console.error('Error al eliminar datos previos:', err);
      return res.status(500).send('Error interno del servidor');
    }
    console.log('Datos de impo_compraventa eliminados correctamente');
    operationsCompleted++;
    checkAllOperationsCompleted();
  });
  
  // Eliminar datos de archivo
  db.query('DELETE FROM archivo', (err, result) => {
    if (err) {
      console.error('Error al eliminar datos previos:', err);
      return res.status(500).send('Error interno del servidor');
    }
    console.log('Datos de archivo eliminados correctamente');
    operationsCompleted++;
    checkAllOperationsCompleted();
  });
  
  // Reiniciar el contador de auto-incremento de archivo
  db.query('ALTER TABLE archivo AUTO_INCREMENT = 1', (err, result) => {
    if (err) {
      console.error('Error al reiniciar el contador de auto-incremento:', err);
      return res.status(500).send('Error interno del servidor');
    }
    
    console.log('Contador de auto-incremento de archivo reiniciado correctamente');
    operationsCompleted++;
    checkAllOperationsCompleted();
  });

  function checkAllOperationsCompleted() {
    if (operationsCompleted === 3) { // Ajusta el número total de operaciones
      return res.send('Operaciones completadas correctamente');
    }
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});