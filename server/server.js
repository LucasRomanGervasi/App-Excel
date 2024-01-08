const express = require("express");
require("dotenv").config();
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const fs = require('fs');
const soap = require('soap');
const xml2js = require('xml2js');
const { createClient, WSSecurityCert } = soap;

const db = mysql.createPool({
  database: "railway",
  user: "root",
  host: "containers-us-west-190.railway.app",
  port: "7782",
  password: "fpBGPVooo4V5ad1TxiCs",
});

//const MYSQL_URL = 'mysql://root:fpBGPVooo4V5ad1TxiCs@containers-us-west-190.railway.app:7782/railway';

app.get("/", (req, res) => {
  return res.status(200).send("Backend Conectado");
});

app.post("/data", (req, res) => {
  const impoCompraVenta = req.body.impoCompraVenta;
  const archivoData = req.body.archivo;
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const {
    idusuario,
    idempresa,
    archivo,
    tipo,
    fechahasta,
    fechadesde,
    fechaupload,
  } = archivoData;
  const sqlArchivo = `INSERT INTO archivo ( idusuario, idempresa, archivo, tipo, fechahasta, fechadesde, fechaupload, ipupload) VALUES ( ${idusuario}, ${idempresa}, '${archivo}', '${tipo}', '${fechahasta}', '${fechadesde}', '${fechaupload}', '${clientIp}')`;

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
        tipo,
        serie,
        numero,
        RUTEmisor,
        razonsocial,
        domicilio,
        moneda,
        montonetoUYU,
        montoivaUYU,
        montoredondeoUYU,
        montototal,
        montoretperUYU,
        montoneto,
        montoiva,
        montoretper,
        montototaloriginal,
        emisor,
        notas
      } = data1;
      const sqlImpo = `INSERT INTO impo_compraventa ( idarchivo, fecha, tipoCFE, tipo, serie, numero, RUTEmisor, razonsocial, domicilio, moneda, montoNetoUYU,montoIvaUYU,montototal, montoRetPerUYU, montoneto ,montoiva, montoretper, montototaloriginal, emisor, montoredondeoUYU, notas) VALUES 
      ( ${idarchivo}, '${fecha}', '${tipoCFE}','${tipo}', '${serie}', ${numero}, '${RUTEmisor}',  '${razonsocial}', '${domicilio}', '${moneda}', ${montonetoUYU}, ${montoivaUYU},${montototal}, ${montoretperUYU}, ${montoneto},  ${montoiva},${montoretper},  ${montototaloriginal || 0}, ${emisor}, ${montoredondeoUYU || 0}, '${notas}')`;

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

// LA IDEA ES QUE NO HAYA ESTADOS DENTRO DEL SERVIDOR WEB, REST 

// let excelData = []

// app.post('/razonsocial', (req, res) => {
//   const data = req.body;

//   excelData = [];

//   for (let index = 0; index < data?.length; index++) {
//     if (data[index]) {
//       excelData.push(data[index])
//     }
//   }

//   return res.status(200).send({ mensaje: 'Estado recibido correctamente en el backend' });
// });

//API RAZON SOCIAL 
const crearCliente = (url, options) => {
  return new Promise((resolve, reject) => {
    createClient(url, options, (err, client) => {
      if (err) reject(err)
      resolve(client)
    })
  })
}


const url = 'https://serviciosdp.dgi.gub.uy:6491/RUTWSPGetEntidad/servlet/arutpersonagetentidad?wsdl'

const soapOptions = {
  envelopeKey: 'SOAP', // Prefijo del espacio de nombres del sobre SOAP
  forceSoap12Headers: false, // Establece esto como false para usar SOAP 1.0
};

const xsd = 'https://serviciosdp.dgi.gub.uy:6491/RUTWSPGetEntidad/servlet/arutpersonagetentidad.xsd1.xsd'

var securityOptions = {
  hasTimeStamp: false,
  signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
  digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
  canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
  signerOptions: {
    prefix: 'ds',
    attrs: { Id: 'SIG-C7F2874F2B188481A9169565362166845' },
    existingPrefixes: {
      wsse: 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd',
    }
  }
}

var privateKey = fs.readFileSync("clave.key");
var publicKey = fs.readFileSync("certificado.pem");
var password = 'hola123';

app.post("/razonsocial", async (req, res) => {
  let razonsocial = []

  const cliente = await crearCliente(url, soapOptions)
  var wsSecurity = new WSSecurityCert(privateKey, publicKey, password, securityOptions);
  cliente.setSecurity(wsSecurity);

  function parseaCadena(data) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(data, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }

  async function getInfoByRUT(item) {    
    let data
    try {
      await cliente.ExecuteAsync({ Ruc: item })
    }
    catch(err) {
      data = err.body
    }

    const result = await parseaCadena(data)

    if (!result) {
      throw Error('Error al llamar a la operación del servicio SOAP');
    }
    else if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body']) {
      const SOAPENV = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['WS_RUTPersonaGetEntidad.ExecuteResponse'][0]['Data'][0]

      const envparsed = await parseaCadena(SOAPENV)

      if (envparsed && envparsed['WS_Entidad']['RUC'][0]) {
        return {
          rut: envparsed['WS_Entidad']['RUC'][0],
          razonsocial: envparsed['WS_Entidad']['RazonSocial'][0],
          domicilio: `${envparsed['WS_Entidad']['WS_DomicilioFiscalPrincipal'][0]['Calle_Nom']} ${envparsed['WS_Entidad']['WS_DomicilioFiscalPrincipal'][0]['Dom_Pta_Nro']}`
        }
      } else {
        throw Error('No se encontro la entidad')
      }
    }
    else {
      throw Error('El resultado no esta bien formado')
    }
  }

  console.time('tiempototal')
  const excelData = req.body.data ?? []

  for (const item of excelData) {
    console.time('getInfoByRut')
    const data = await getInfoByRUT(item); // Esperar a que se complete la llamada SOAP
    console.timeEnd('getInfoByRut')

    if (data) {
      razonsocial.push(data);
    }
  }

  // Esperar a que todas las Promesas se resuelvan
  try {
    const razonsocialResults = await Promise.all(razonsocial);
    return res.status(200).json(razonsocialResults);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error al obtener la información de razón social' });
  } finally {
    console.timeEnd('tiempototal')
  }
});



// app.delete("/data", (req, res) => {
//   let operationsCompleted = 0;

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


const port = process.env.PORT || 3002;

app.listen(port , function () {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

// app.listen(3001 , function () {
//   console.log(`Servidor escuchando en el puerto ${port}`);
// });