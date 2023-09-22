const express = require("express");
require("dotenv").config();
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const fs = require('fs');
const soap = require('soap');


const db = mysql.createPool({
  database: "railway",
  user: "root",
  host: "containers-us-west-190.railway.app",
  port: "7782",
  password: "fpBGPVooo4V5ad1TxiCs",
});

//const MYSQL_URL = 'mysql://root:fpBGPVooo4V5ad1TxiCs@containers-us-west-190.railway.app:7782/railway',

app.get("/", (req, res) => {
  return res.status(200).send("Backend Conectado");
});


app.post("/data", (req, res) => {
  const impoCompraVenta = req.body.impoCompraVenta;
  const archivoData = req.body.archivo;

  const {
    idusuario,
    idempresa,
    archivo,
    tipo,
    fechahasta,
    fechadesde,
    fechaupload,
  } = archivoData;
  const sqlArchivo = `INSERT INTO archivo ( idusuario, idempresa, archivo, tipo, fechahasta, fechadesde, fechaupload) VALUES ( ${idusuario}, ${idempresa}, '${archivo}', '${tipo}', '${fechahasta}', '${fechadesde}', '${fechaupload}')`;

  db.query(sqlArchivo, (err, resultArchivo) => {
    if (err) {
      console.error("Error al insertar archivo en la base de datos:", err);
      return res.status(500).send("Error interno del servidor");
    }

    const idarchivo = resultArchivo.insertId;

    const insertionErrors = [];

    impoCompraVenta.forEach((data1, index) => {
      const {
        fecha,
        tipoCFE,
        serie,
        numero,
        RUTEmisor,
        moneda,
        montoneto,
        montoiva,
        montototal,
        montoretper,
        montocredFiscal,
      } = data1;
      console.log(fecha, "ACA ESTA LA FECHA");
      const sqlImpo = `INSERT INTO impo_compraventa ( idarchivo, fecha, tipoCFE, serie, numero, RUTEmisor, moneda, montoneto, montoiva, montototal, montoretper, montocredFiscal) VALUES ( ${idarchivo}, '${fecha}', '${tipoCFE}', '${serie}', ${numero}, '${RUTEmisor}', '${moneda}', ${montoneto}, ${montoiva}, ${montototal}, ${montoretper}, ${
        montocredFiscal || 0
      })`;

      db.query(sqlImpo, (err, resultImpo) => {
        if (err) {
          console.error(
            "Error al insertar impo_compraventa en la base de datos:",
            err
          );
          insertionErrors.push(err);
        } else {
          console.log("Dato insertado correctamente en la posición");
        }

        if (index === impoCompraVenta.length - 1) {
          if (insertionErrors.length > 0) {
            return res.status(500).send("Error interno del servidor");
          } else {
            console.log("Todos los datos insertados correctamente");
            return res
              .status(200)
              .send("Todos los datos insertados correctamente");
            }
          }
      });
    });
  });
});

  // Pedir datos de moneda_cotizacion

  app.get("/cotizacion-usd", (req, res) => {
    // Query SQL para obtener datos de la tabla "actualizas"
    const sqlQuery = "SELECT * FROM moneda_cotizacion";
    db.query(sqlQuery, (err, result) => {
      if (err) {
        console.error("Error al consultar la tabla moneda_cotizacion:", err);
        return res.status(500).send("Error interno del servidor");
      }
      // Aquí solo envía la respuesta JSON
      return res.status(200).json(result);
    });
  });  
  
//API RAZON SOCIAL 
// const crearCliente = (url, options) => {
//   return new Promise((resolve, reject) => {
//     soap.createClient(url, options, (err, client) => {
//       if (err) reject(err)
//       resolve(client)
//     })
//   })
// }

// const guardarResultado = (resultado) =>{
  
//   fs.writeFile("resultado.xml", resultado, (err) => {
//     if (err) {
//       console.error('Error al escribir el archivo XML:', err);
//     } else {
//       console.log('Archivo XML escrito exitosamente.');
//     }
//   });
// }

// const getInfoByRUT = async (ruc) => {

//   const url = 'https://serviciosdp.dgi.gub.uy:6491/RUTWSPGetEntidad/servlet/arutpersonagetentidad?wsdl'

//   const cliente = await crearCliente(url, {})

//   var privateKey = fs.readFileSync("clave.key");
//   var publicKey = fs.readFileSync("certificado.pem");
//   var password = 'nuevacontra'; 

//   var wsSecurity = new soap.WSSecurityCert(privateKey, publicKey, password);
//   console.log(wsSecurity)
//   cliente.setSecurity(wsSecurity);

//   console.log(cliente)

//   cliente.Execute({Ruc: ruc}, (err, result) => {
//     if (err) {
//       console.error('Error al llamar a la operación del servicio SOAP', err);
    
//       guardarResultado(err.body)
//       return 

//     }
//     console.log('Respuesta del servicio SOAP:', result);
//     guardarResultado(result)
//   });
    
// } 

const excelData = []
app.post('/razonsocial', (req, res) => {
  const data = req.body;
  for (let index = 4; index < data?.length; index++) {
    if(data[index]){
    excelData.push(data[index])
      }
     }
     console.log(excelData)
     return res.status(200).send({ mensaje: 'Estado recibido correctamente en el backend' });
    });

    
  app.get("/razonsocial", (req, res) => {
    if (!excelData) {
      console.error("Error al consultar la tabla moneda_cotizacion:", err);
      return res.status(500).send("Error interno del servidor");
    }
    // Aquí solo envía la respuesta JSON7
    for(let index = 0; index < excelData?.length; index++){
      if(excelData[index]['RUTEmisor']){
        console.log(excelData[index]['RUTEmisor'])
        getInfoByRUT(excelData[index]['RUTEmisor'])
      }
    }
    return res.status(200).json(excelData);
  });  
  
    

//   app.delete("/data", (req, res) => {
//     let operationsCompleted = 0;
    
//   // Eliminar datos de impo_compraventa
//   db.query("DELETE FROM impo_compraventa", (err, result) => {
//     if (err) {
//       console.error("Error al eliminar datos previos:", err);
//       return res.status(500).send("Error interno del servidor");
//     }
//     console.log("Datos de impo_compraventa eliminados correctamente");
//     operationsCompleted++;
//     checkAllOperationsCompleted();
//   });

//   // Eliminar datos de archivo
//   db.query("DELETE FROM archivo", (err, result) => {
//     if (err) {
//       console.error("Error al eliminar datos previos:", err);
//       return res.status(500).send("Error interno del servidor");
//     }
//     console.log("Datos de archivo eliminados correctamente");
//     operationsCompleted++;
//     checkAllOperationsCompleted();
//   });

//   function checkAllOperationsCompleted() {
//     if (operationsCompleted === 3) {
//       // Ajusta el número total de operaciones
//       return res.send("Operaciones completadas correctamente");
//     }
//   }
// });




const port = process.env.PORT || 3001;

app.listen(3001, "0.0.0.0", function () {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
