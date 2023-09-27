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
  console.log(req.body)
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
        tipodecambiodelafecha,
        montoendolares,
        razonsocial,
        domicilio
      } = data1;
      console.log(data1['fecha'], "ACA ESTA LA FECHA");
      const sqlImpo = `INSERT INTO impo_compraventa ( idarchivo, fecha, tipoCFE, serie, numero, RUTEmisor, moneda, montoneto, montoiva, montototal, montoretper, montocredFiscal, tipocambiodelafecha, montoendolares, razonsocial, domicilio) VALUES ( ${idarchivo}, '${fecha}', '${tipoCFE}', '${serie}', ${numero}, '${RUTEmisor}', '${moneda}', ${montoneto}, ${montoiva}, ${montototal}, ${montoretper}, ${
        montocredFiscal || 0}, ${tipodecambiodelafecha}, ${montoendolares}, '${razonsocial}', '${domicilio}')`;

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
//  const crearCliente = (url, options) => {
//    return new Promise((resolve, reject) => {
//      soap.createClient(url, options, (err, client) => {
//        if (err) reject(err)
//        resolve(client)
//      })
//    })
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


let excelData = []
app.post('/razonsocial', (req, res) => {
  const data = req.body;
  excelData = [];
  for (let index = 0; index < data?.length; index++) {
    if(data[index]){
    excelData.push(data[index])
  }
}
return res.status(200).send({ mensaje: 'Estado recibido correctamente en el backend' });
});


// const llamarApiSoap = async () => {
//   const url = 'https://serviciosdp.dgi.gub.uy:6491/RUTWSPGetEntidad/servlet/arutpersonagetentidad?wsdl';
//   try {
//     const client = await soap.createClientAsync(url);

//     // Configura la operación que deseas llamar
//     const operation = client['WS_RUTPersonaGetEntidad.Execute'];

//     // Parámetros de la operación (si es necesario)
//     const args = {
//       RUT: '215070970018', // Cambia esto por el valor correcto
//     };

//     // Realiza la llamada SOAP
//     operation(args, (err, result, envelope, soapHeader) => {
//       if (err) {
//         console.error('Error en la llamada SOAP:', err);
//       } else {
//         // Maneja la respuesta aquí
//         console.log('Respuesta SOAP:', result);
//       }
//     });
//   } catch (error) {
//     console.error('Error al crear el cliente SOAP:', error);
//   }
// };

// // Llama a la función para realizar la llamada SOAP
// llamarApiSoap();

app.get("/razonsocial", (req, res) => {
    for(let index = 0; index < excelData?.length; index++){
      if(excelData[index]['RUTEmisor']){
        console.log(excelData[index]['RUTEmisor'])
      }
    }
    return res.status(200).json(excelData);
  });  
  
  // const getInfoByRUT = async (ruc) => {
  
  //   const url = 'https://serviciosdp.dgi.gub.uy:6491/RUTWSPGetEntidad/servlet/arutpersonagetentidad?wsdl'
  
  //   const cliente = await crearCliente(url, {})
  
  //   var privateKey = fs.readFileSync("clave.key");
  //   var publicKey = fs.readFileSync("certificado.pem");
  //   var password = 'nuevacontra'; 
  
  //   var wsSecurity = new soap.WSSecurityCert(privateKey, publicKey, password);
  //   cliente.setSecurity(wsSecurity);
    
  //   cliente.Execute({Ruc: ruc}, (err, result) => {
  //     if (err) {
  //       console.error('Error al llamar a la operación del servicio SOAP', err);
  //     }
  //     console.log('Respuesta del servicio SOAP:', result);
  //   });
      
  // } 
    

  app.delete("/data", (req, res) => {
    let operationsCompleted = 0;
    
  // Eliminar datos de impo_compraventa
  db.query("DELETE FROM impo_compraventa", (err, result) => {
    if (err) {
      console.error("Error al eliminar datos previos:", err);
      return res.status(500).send("Error interno del servidor");
    }
    console.log("Datos de impo_compraventa eliminados correctamente");
    operationsCompleted++;
    checkAllOperationsCompleted();
  });

  // Eliminar datos de archivo
  db.query("DELETE FROM archivo", (err, result) => {
    if (err) {
      console.error("Error al eliminar datos previos:", err);
      return res.status(500).send("Error interno del servidor");
    }
    console.log("Datos de archivo eliminados correctamente");
    operationsCompleted++;
    checkAllOperationsCompleted();
  });

  function checkAllOperationsCompleted() {
    if (operationsCompleted === 3) {
      // Ajusta el número total de operaciones
      return res.send("Operaciones completadas correctamente");
    }
  }
});


const port = process.env.PORT || 3001;

app.listen(3001, function () {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
