import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import logo from "./images/asystax.png";
import { FaRegCircleXmark} from "react-icons/fa6";
import {AiOutlineCheckCircle} from "react-icons/ai";
import {BsFillInfoCircleFill} from "react-icons/bs";
import { getDate } from "./utils/getDate";
import { validateDate } from "./utils/validateDate";
import { getCloserDate } from "./utils/getCloserDate";
import axios from "axios";
import ReactLoading from "react-loading";
import View from "./components/View";
import { getOrderDataNew } from "./utils/getOrderDataNew";

function App() {
  const [excelFile, setExcelFile] = useState(null);
  const [excelDataCotizacion, setExcelDataCotizacion] = useState(null)
  const [excelDataRazonSocial, setExcelDataRazonSocial] = useState(null)
  const [excelFinal, setExcelFinal] = useState(null)
  const [excelFinalDowload, setExcelFinalDowload] = useState(null)
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [typeError, setTypeError] = useState(null);
  const [typeSuccess, setTypeSuccess] = useState(null);
  const [typeInfo, setTypeInfo] = useState(null);
  const [title, setTitle] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [impoCompraVenta, setimpoCompraVenta] = useState();
  const [archivo, setArchivo] = useState({});
  const [cotizacionUSD, setCotizacionUSD] = useState()
  const [razonSocial, setRazonSocial] = useState(null)
  const [loading, setLoading] = useState(false);
  const [fileName,setFileName] = useState(null);
  const [dataNew, setDataNew] = useState()

  //----------------------> TRANSFORMAR XLS EN JSON <-------------------------//  
  const handleFile = (e) => {
    setExcelData(null)
    setDataNew(null)
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    let selectedFile = e.target.files[0];
    setFile(e.target.files[0]?.name);
    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFile(e.target.result);
        };
      } else {
        setTypeError("Seleccione solo tipos de archivos de XLS y XLSX");
        setExcelData(null);
       setDataNew(null);
       setFileName(null);
       setExcelDataCotizacion(null);
       setExcelDataRazonSocial(null);
       setExcelFinal(null);
       setRazonSocial(null);
       setTypeInfo(null)
      }
    } else {
      console.log("Please select yout file");
    }
  };

//----------------------> ANALIZAR EXCEL <-------------------------//  
  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: "buffer" });
      const worksheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[worksheetName]);
      const file0 = Object.keys(data[0]);
      const file10 = data[3];
      const file11 = data[4];
      const A0 = Object.values(file0);
      const A10 = Object.values(file10);
      const A11 = Object.values(file11);
      const dataValues = [{ 'CFE Recibidos': data[0]['CFE Recibidos'], 'cant': data[0]['__EMPTY'] },
      { 'fechadesde': data[1]['CFE Recibidos'], 'valor':data[1]['__EMPTY'] },
      { 'fechahasta':  data[2]['CFE Recibidos'], 'valor': data[2]['__EMPTY']},
      { 'fecha': data[3]['CFE Recibidos'], 'tipoCFE': data[3]['__EMPTY'], 'serie': data[3]['__EMPTY_1'], 'numero' : data[3]['__EMPTY_2'], 'rutemisor' :  data[3]['__EMPTY_3'], 'moneda' :  data[3]['__EMPTY_4'],
      'montoneto':  data[3]['__EMPTY_5'],'ivaventas':  data[3]['__EMPTY_6'],'montototal':  data[3]['__EMPTY_7'],'montoRet/Per':  data[3]['__EMPTY_8'],'montoCredFiscal':  data[3]['__EMPTY_9']
      }]
      for (let index = 4; index < data?.length; index++) {
        if(data[index]){
          const  values = { 
            'fecha': data[index]['CFE Recibidos'],
            'tipoCFE':  data[index]['__EMPTY'],
            'serie':  data[index]['__EMPTY_1'],
            'numero':  data[index]['__EMPTY_2'],
            'RUTEmisor':  data[index]['__EMPTY_3'],
            'moneda':  data[index]['__EMPTY_4'],
            'montoneto':  data[index]['__EMPTY_5'].toFixed(2),
            'montoiva':  data[index]['__EMPTY_6'].toFixed(2),
            'montototal':  data[index]['__EMPTY_7'].toFixed(2),
            'montoretper':  data[index]['__EMPTY_8'].toFixed(2),
            'montocredfiscal':  data[index]['__EMPTY_9'].toFixed(2),
          }
          dataValues.push(values)
        }}
      if (A11.length < 11) {
        A11.unshift("");
      }
      setTitle(A0[0]);
      if (A0[0] === "CFE Recibidos" && A10[0] === "Fecha" && A11[0] !== "") {
        setExcelData(
          dataValues
        );
        setDataNew(dataValues)
      } else {
        setTypeError(
          "El archivo subido no es un tipo de archivo que podamos procesar, intentar nuevamente con otro archivo"
        );
        setExcelData(null);
        setDataNew(null);
        setFileName(null);
        setExcelDataCotizacion(null);
        setExcelDataRazonSocial(null);
        setExcelFinal(null)
        fileInputRef.current.value = "";
      }
    }
  };

  const valores = (excelData) => {
    if (excelData) {
      setExcelDataRazonSocial(null)
      setExcelDataCotizacion(null)
      setRazonSocial(null)
      setTypeError(null);
      setTypeInfo(null)
      const firstFourElements = excelData.slice(0, 4);
      const restOfArray = excelData.slice(4);
      //ISO ARCHIVO
      let fechadesde = Object.values(firstFourElements[1]);
      const [day, month, year] = fechadesde[1].split("/");
      const dateObjectFechaDesde = new Date(`${year}-${month}-${day}`);
      const isoFechaDesde = dateObjectFechaDesde.toISOString().substring(0, 10);
      let fechahasta = Object.values(firstFourElements[2]);
      const [day2, month2, year2] = fechahasta[1].split("/");
      const dateObject = new Date(`${year2}-${month2}-${day2}`);
      const isoFechaHasta = dateObject.toISOString().substring(0, 10);

      const parsedData = restOfArray.map((data) => {
        const values = Object.values(data);
        //ISO impoCompraVenta
        let isoDate = null;
        if (validateDate(values[0])) {
          const dateParts = values[0].split("/");
          const [day, month, year] = dateParts;
          const dateObject = new Date(`${year}-${month}-${day}`);
          isoDate = dateObject.toISOString().substring(0, 10);
        } else {
          setExcelData("");
          setDataNew(null)
          setTypeError(
            "Hay una fecha no encontrada, revisa el archivo"
          );
          setExcelData(null)
          setDataNew(null)
          setFileName(null)
          fileInputRef.current.value = "";
        }
        let nextIdImpo = 0;
        //REVICION
        return {
          id: nextIdImpo + 1,
          idarchivo: 1, //el id autonumérico obtenido al insertar un registro en tabla "archivo",
          fecha: isoDate, //formato ISO
          tipoCFE: values[1],
          serie: values[2],
          numero: values[3],
          RUTEmisor: values[4],
          moneda: values[5],
          montoneto:  values[6], //formato money
          montoiva: values[7], //formato money
          montototal:  values[8], //formato money
          montoretper: values[9], //formato money
          montocredfiscal: values[10], //formato money
        };
      });
      let nextId = 0;
      const archivo = {
        id: nextId + 1,
        idusuario: 1,
        idempresa: 1,
        archivo: file,
        tipo: title,
        fechadesde: isoFechaDesde,
        fechahasta: isoFechaHasta,
        fechaupload: getDate(),
      };
      if (typeError) {
        console.log("error");
      }
      setimpoCompraVenta([...parsedData]);
      setArchivo({ ...archivo });
    } else {
      console.log("error");
    }
  };


  //----------------------> BASE DE DATOS COTIZACION USD <-------------------------//  
    const getCotizacionUSD = () => {
      axios
      .get("https://app-excel-production.up.railway.app/cotizacion-usd")
      //.get("http://localhost:3001/cotizacion-usd")
      .then((response) => {
        setCotizacionUSD(response.data)
      })
      .catch((error) => {
        console.log("eeror")
        setLoading(false)
      });
    }
    
//----------------------> COTIZACION USD EXCEL <-------------------------//      
function valoresCotizacion() {
  const fechaCotizacion = [];
  const dataNewOrdenado = getOrderDataNew(dataNew)
  if(excelDataRazonSocial === dataNew){
    const excelCotizacionData = 
    [{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
    { 'fechadesde': dataNew[1]['fechadesde'], 'valor':dataNew[1]['valor'] },
    { 'fechahasta':  dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor']},
    { 'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'], 'serie': dataNew[3]['serie'], 'numero' : dataNew[3]['numero'], 'rutemisor' :  dataNew[3]['rutemisor'], 'razonsocial': 'Razon Social', 'domicilio': 'Domicilio','moneda' :  dataNew[3]['moneda'],
    'montoneto':  'Monto Neto UYU','ivaventas':  'IVA Ventas UYU','montototal': 'Monto Total UYU','montoRet/Per':  'Monto Ret/Per UYU','montoCredFiscal':  'Monto Cred. Fiscal UYU',
    'tipoCambio': "Tipo de Cambio de la Fecha", 'montototalorginal': 'Monto Total Original'
  }]
for (let index = 0; index < cotizacionUSD?.length; index++) {
  if(cotizacionUSD[index]['codigoiso_monedacotiz'] === 'USD'){
  var cotizacion = {
    'montoventa': cotizacionUSD[index]['montoventa'],
    'fecha': cotizacionUSD[index]['fecha'].slice(0,10)
  }
  fechaCotizacion.push(cotizacion);
}
}
    for (let index = 0; index < dataNewOrdenado?.length; index++) {
    const fechaBuscada = getCloserDate(fechaCotizacion, dataNewOrdenado[index]['fecha'].replace(/-/g, '/'))
    const resultado = fechaCotizacion.find(item => item.fecha.replace(/-/g, '/') === fechaBuscada);
    const montoendolares = dataNewOrdenado[index]['moneda'] === 'UYU'? dataNewOrdenado[index]['montototal'] : dataNewOrdenado[index]['montototal'] / resultado.montoventa;
    const montoneto=  dataNewOrdenado[index]['moneda'] === 'UYU'? dataNewOrdenado[index]['montoneto']:dataNewOrdenado[index]['montoneto'] * resultado.montoventa;
    const montoiva=  dataNewOrdenado[index]['moneda'] === 'UYU'? dataNewOrdenado[index]['montoiva']: dataNewOrdenado[index]['montoiva'] * resultado.montoventa;
    const montototalUYU=  dataNewOrdenado[index]['moneda'] === 'UYU'? dataNewOrdenado[index]['montototal']: dataNewOrdenado[index]['montototal'] * resultado.montoventa;
    const montoretper=  dataNewOrdenado[index]['moneda'] === 'UYU'?dataNewOrdenado[index]['montoretper']: dataNewOrdenado[index]['montoretper'] * resultado.montoventa;
    const montocredfiscal=  dataNewOrdenado[index]['moneda'] === 'UYU'? dataNewOrdenado[index]['montocredfiscal']:  dataNewOrdenado[index]['montocredfiscal']* resultado.montoventa;
    var nuevoImporte = {
      fecha: dataNewOrdenado[index]['fecha'],
    tipoCFE: dataNewOrdenado[index]['tipoCFE'],
    serie: dataNewOrdenado[index]['serie'],
    numero: dataNewOrdenado[index]['numero'],
    RUTEmisor: dataNewOrdenado[index]['RUTEmisor'],
    razonsocial: dataNewOrdenado[index]['razonsocial'],
    domicilio: dataNewOrdenado[index]['domicilio'],
    moneda: dataNewOrdenado[index]['moneda'],
    montoneto: Number(montoneto).toFixed(2),
    montoiva:  Number(montoiva).toFixed(2),
    montototal: Number(montototalUYU).toFixed(2),
    montoretper: Number(montoretper).toFixed(2),
    montocredfiscal: Number(montocredfiscal).toFixed(2),
    tipodecambiodelafecha:  dataNewOrdenado[index]['moneda'] === 'UYU' || dataNewOrdenado[index]['moneda'] === ""?  '1.00' : resultado.montoventa.replace(/(\.\d{2})\d+$/, '$1'),
    montototaloriginal:  dataNewOrdenado[index]['montototal'],
  };
  excelCotizacionData.push(nuevoImporte);
}
console.log(excelCotizacionData)
setExcelDataCotizacion(excelCotizacionData)
setDataNew(excelCotizacionData)
setExcelFinal(excelCotizacionData)
} else{
  const excelCotizacionData = 
  [{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
  { 'fechadesde': dataNew[1]['fechadesde'], 'valor':dataNew[1]['valor'] },
  { 'fechahasta':  dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor']},
  { 'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'], 'serie': dataNew[3]['serie'], 'numero' : dataNew[3]['numero'], 'rutemisor' :  dataNew[3]['rutemisor'], 'moneda' :  dataNew[3]['moneda'],
'montoneto':  'Monto Neto UYU','ivaventas':  'IVA Ventas UYU','montototal': 'Monto Total UYU','montoRet/Per':  'Monto Ret/Per UYU','montoCredFiscal':  'Monto Cred. Fiscal UYU',
  'tipoCambio': "Tipo de Cambio de la Fecha", 'montototalorginal': 'Monto Total Original'
}]
for (let index = 0; index < cotizacionUSD?.length; index++) {
  if(cotizacionUSD[index]['codigoiso_monedacotiz'] === 'USD'){
  var cotizacion = {
    'montoventa': cotizacionUSD[index]['montoventa'],
    'fecha': cotizacionUSD[index]['fecha'].slice(0,10)
  }
  fechaCotizacion.push(cotizacion);
}
}
for (let index = 0; index < dataNewOrdenado?.length; index++) {
const fechaBuscada = getCloserDate(fechaCotizacion, dataNewOrdenado[index]['fecha'].replace(/-/g, '/'))
const resultado = fechaCotizacion.find(item => item.fecha.replace(/-/g, '/') === fechaBuscada);
// const montoendolares = dataNewOrdenado[index]['moneda'] === 'UYU'?  dataNewOrdenado[index]['montototal'] : dataNewOrdenado[index]['montototal'] / resultado.montoventa;
const montoneto=  dataNewOrdenado[index]['moneda'] === 'UYU'? dataNewOrdenado[index]['montoneto']:dataNewOrdenado[index]['montoneto'] * resultado.montoventa;
const montoiva=  dataNewOrdenado[index]['moneda'] === 'UYU'? dataNewOrdenado[index]['montoiva']: dataNewOrdenado[index]['montoiva'] * resultado.montoventa;
const montototalUYU=  dataNewOrdenado[index]['moneda'] === 'UYU'? dataNewOrdenado[index]['montototal']: dataNewOrdenado[index]['montototal'] * resultado.montoventa;
const montoretper=  dataNewOrdenado[index]['moneda'] === 'UYU'?dataNewOrdenado[index]['montoretper']: dataNewOrdenado[index]['montoretper'] * resultado.montoventa;
const montocredfiscal=  dataNewOrdenado[index]['moneda'] === 'UYU'? dataNewOrdenado[index]['montocredfiscal']:  dataNewOrdenado[index]['montocredfiscal']* resultado.montoventa;
var nuevoImporte = {
  fecha: dataNewOrdenado[index]['fecha'],
  tipoCFE: dataNewOrdenado[index]['tipoCFE'],
    serie: dataNewOrdenado[index]['serie'],
    numero: dataNewOrdenado[index]['numero'],
    RUTEmisor: dataNewOrdenado[index]['RUTEmisor'],
    moneda: dataNewOrdenado[index]['moneda'],
    montoneto: Number(montoneto).toFixed(2),
    montoiva:  Number(montoiva).toFixed(2),
    montototalUYU: Number(montototalUYU).toFixed(2),
    montoretper: Number(montoretper).toFixed(2),
    montocredfiscal: Number(montocredfiscal).toFixed(2),
    tipodecambiodelafecha:  dataNewOrdenado[index]['moneda'] === 'UYU' || dataNewOrdenado[index]['moneda'] === ""?   '1.00' : resultado.montoventa.replace(/(\.\d{2})\d+$/, '$1'),
    montototaloriginal: dataNewOrdenado[index]['montototal'],
  };
  excelCotizacionData.push(nuevoImporte);
}
setExcelDataCotizacion(excelCotizacionData)
setDataNew(excelCotizacionData)
}
setTypeSuccess("Se calculó correctamente la cotización del monto en dolares")
const timer = setTimeout(() => {
  setTypeSuccess(null);
}, 4000);
return () => clearTimeout(timer)
}

//----------------------> BASE DE DATOS RAZON SOCIAL <-------------------------//  
const requestOptions = {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(dataNew)
};

const getRazonSocial = () => {
axios
.get("https://app-excel-production.up.railway.app/razonsocial")
//.get("http://localhost:3001/razonsocial")
.then((response) => {
setRazonSocial(response.data)
})
.catch((error) => {
console.log("eeror")
setLoading(false)
});
}
//----------------------> RAZON SOCIAL EXCEL <-------------------------//  
console.log(razonSocial)  
function valoresRazonSocial() {
if(razonSocial === null || razonSocial.length === 0 ){
    setTypeInfo(
      "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente"
      );
  }
  else{
  const dataNewOrdenado = getOrderDataNew(dataNew)
setTypeInfo(null)
if(excelDataCotizacion === dataNew ){
const excelRazonSocialValues = 
[{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
{ 'fechadesde': dataNew[1]['fechadesde'], 'valor':dataNew[1]['valor'] },
{ 'fechahasta':  dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor']},
{ 'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'], 'serie': dataNew[3]['serie'], 'numero' : dataNew[3]['numero'], 'rutemisor' :  dataNew[3]['rutemisor'], 'razonsocial': 'Razon Social', 'domicilio': 'Domicilio', 'moneda' :  dataNew[3]['moneda'],
'montoneto':  'Monto Neto UYU','ivaventas':  'IVA Ventas UYU', 'montototal': 'Monto Total UYU','montoRet/Per':  'Monto Ret/Per UYU','montoCredFiscal':  'Monto Cred. Fiscal UYU',
'tipoCambio': "Tipo de Cambio de la Fecha",'montototalorginal': 'Monto Total Original'
}]
for (let index = 0; index < dataNewOrdenado?.length; index++) {
  if (dataNewOrdenado[index]['RUTEmisor'] === razonSocial[index]['rut']) { 
    const razonSocialData = {
      nombre: razonSocial[index]['razonsocial'],
      domicilio: razonSocial[index]['domicilio']
    };    
    var nuevoImporte = {
  fecha: dataNewOrdenado[index]['fecha'],
  tipoCFE: dataNewOrdenado[index]['tipoCFE'],
  serie: dataNewOrdenado[index]['serie'],
  numero: dataNewOrdenado[index]['numero'],
  RUTEmisor: dataNewOrdenado[index]['RUTEmisor'],
  razonsocial: razonSocialData.nombre,
  domicilio: razonSocialData.domicilio,
  moneda: dataNewOrdenado[index]['moneda'],
  montoneto: dataNewOrdenado[index]['montoneto'],
  montoiva: dataNewOrdenado[index]['montoiva'],
  montototal: dataNewOrdenado[index]['montototalUYU'],
  montoretper: dataNewOrdenado[index]['montoretper'],
  montocredfiscal: dataNewOrdenado[index]['montocredfiscal'],
  tipodecambiodelafecha:dataNewOrdenado[index]['tipodecambiodelafecha'],
  montototalorginal: dataNewOrdenado[index]['montototaloriginal'],

};
excelRazonSocialValues.push(nuevoImporte);
}else{
  setTypeInfo(
    "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente"
    );
}}
var excelRazonSocial = excelRazonSocialValues
setExcelFinal(excelRazonSocial)
}else{
const excelRazonSocialValues = 
[{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
{ 'fechadesde': dataNew[1]['fechadesde'], 'valor':dataNew[1]['valor'] },
{ 'fechahasta':  dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor']},
{ 'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'], 'serie': dataNew[3]['serie'], 'numero' : dataNew[3]['numero'], 'rutemisor' :  dataNew[3]['rutemisor'], 'razonsocial': 'Razon Social', 'domicilio': 'Domicilio', 'moneda' :  dataNew[3]['moneda'],
'montoneto':  dataNew[3]['montoneto'],'ivaventas':  dataNew[3]['ivaventas'],'montototal':  dataNew[3]['montototal'],'montoRet/Per':  dataNew[3]['montoRet/Per'],'montoCredFiscal':  dataNew[3]['montoCredFiscal']
}]
for (let index = 4; index < dataNew?.length; index++) {
  if (dataNew[index]['RUTEmisor'] === razonSocial[index-4]['rut']) {
    const razonSocialData = {
      nombre: razonSocial[index-4]['razonsocial'],
      domicilio: razonSocial[index-4]['domicilio']
    };    
  var nuevoImporte = {
  fecha: dataNew[index]['fecha'],
  tipoCFE: dataNew[index]['tipoCFE'],
  serie: dataNew[index]['serie'],
  numero: dataNew[index]['numero'],
  RUTEmisor: dataNew[index]['RUTEmisor'],
  razonsocial: razonSocialData.nombre,
  domicilio: razonSocialData.domicilio,
  moneda: dataNew[index]['moneda'],
  montoneto: dataNew[index]['montoneto'],
  montoiva: dataNew[index]['montoiva'],
  montototal: dataNew[index]['montototal'],
  montoretper: dataNew[index]['montoretper'],
  montocredfiscal: dataNew[index]['montocredfiscal'],
};
excelRazonSocialValues.push(nuevoImporte);
}}
  var excelRazonSocial = excelRazonSocialValues
}
setExcelDataRazonSocial(excelRazonSocial)
setDataNew(excelRazonSocial)
setTypeSuccess("Se agregó correctamente la razon social")
const timer = setTimeout(() => {
setTypeSuccess(null);
}, 4000);
return () => clearTimeout(timer)
}
};
   //----------------------> REINICIAR VISTA EXCEL <-------------------------//  
  const reiniciarExcel = () => {
    setDataNew(excelData)
    setExcelDataCotizacion(null)
    setExcelDataRazonSocial(null)
    setExcelFinal(null)
    setExcelFinalDowload(null)
  };

   //----------------------> DESCARGAR XLS<-------------------------//  
  const descargarXLS = () => {
    setLoading(true);
    if(excelFinal === null){
      setTypeError("Error al descargar el archivo")
    }else{
        // Crear un libro de Excel
      const libro = XLSX.utils.book_new();
      // Crear una hoja de Excel
      const hoja = XLSX.utils.aoa_to_sheet([
        ["CFE Recibidos"],
        [],
        ...excelFinal.map((individualExcelData, index) => {
          if (index <= 3) {
            return Object.values(individualExcelData);
          } else {
            const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
              return i >= 8 ? Number(valor) : valor;
            });
            return valoresTransformados;
          }
        }),
        [],
        ["Total", "", "", "", "", "", "", "", { t : "n" , f : `=SUM(I7+I${excelFinal.length+2})` }, { t : "n" , f : `=SUM(J7+J${excelFinal.length+2})` } ]
      ]);
      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(libro, hoja, "CFE Recibidos");
      const timer = setTimeout(() => {
        XLSX.writeFile(libro, "CFE Recibidos.xlsx");
        setLoading(false);
        setTypeSuccess("Se descargó el archivo correctamente");
        setExcelFinalDowload("descargado");
  
        // Agregar otro setTimeout aquí
        setTimeout(() => {
          // Tu código aquí para el segundo setTimeout
        setTypeSuccess(null);
        }, 4000); // Por ejemplo, 2 segundos después del primer setTimeout
      }, 4000);
  
      setTypeSuccess(null);
  
      return () => clearTimeout(timer);
    }
  };

   //----------------------> ENVIAR BASE DE DATOS <-------------------------//  

   const addDataBase = () => {
    if (excelFinal) {
      setLoading(true);
      const restOfArray = excelFinal.slice(4);
      const parsedData = restOfArray.map((data) => {
        const values = Object.values(data);
        //ISO impoCompraVenta
        let isoDate = null;
        if (validateDate(values[0])) {
          const dateParts = values[0].split("/");
          const [day, month, year] = dateParts;
          const dateObject = new Date(`${year}-${month}-${day}`);
          isoDate = dateObject.toISOString().substring(0, 10);
          
          let nextIdImpo = 0;
          //REVICION
            return {
              id: nextIdImpo + 1,
              idarchivo: 1, //el id autonumérico obtenido al insertar un registro en tabla "archivo",
          fecha: isoDate, //formato ISO
          tipoCFE: values[1],
          serie: values[2],
          numero: values[3],
          RUTEmisor: values[4],
          razonsocial:values[5],
          domicilio:values[6],
          moneda: values[7],
          montoneto: values[8], //formato money
          montoiva: values[9], //formato money
          montototal: values[10], //formato money
          montoretper: values[11], //formato money
          montocredfiscal: values[12], //formato money
          tipodecambiodelafecha:values[13],
          montoendolares: values[14]
        };
      } 
      });
      if (typeError) {
        console.log("error");
      }
      axios
        .post("https://app-excel-production.up.railway.app/data", {
        //.post("http://localhost:3001/data", {
          impoCompraVenta: [...parsedData],
          archivo: archivo,
        })
      .then(() => {
        setTypeSuccess("Registrado correctamente");
        setFileName(null);
        setExcelData(null);
        setDataNew(null);
        setArchivo(null);
        setimpoCompraVenta(null);
        setLoading(false);
        setExcelFinalDowload(null)
        fileInputRef.current.value = "";
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
        setTypeInfo(
          "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente"
          );
          setLoading(false);
        });
  };
   }
  //----------------------> ELIMINAR BASE DE DATOS <-------------------------//  
  const deleteDataBase = () => {
    axios
      .delete("https://app-excel-production.up.railway.app/data")
      //.delete("http://localhost:3001/data")
      .then(() => {
        alert("Base de Datos eliminada")
        setTypeSuccess("Eliminado correctamente");
        setFileName(null);
        setExcelData(null);
        setArchivo(null);
        setimpoCompraVenta(null);
        setDataNew(null);
        fileInputRef.current.value = "";
        setLoading(false); 
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
        alert("Hubo un error al procesar la solicitud.");
        setLoading(false); 
      });
    };
console.log('excelData', dataNew, 'excelRazon',excelDataRazonSocial)
useEffect(() => {
  if (excelData) {
      valores(excelData)
      fetch("https://app-excel-production.up.railway.app/razonsocial", requestOptions)
      //fetch("http://localhost:3001/razonsocial", requestOptions)
      .then(response => response.json())
      .then(result => console.log(result));
    }
    getRazonSocial();
    getCotizacionUSD();
    const timer = setTimeout(() => {
      setTypeSuccess(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [excelData]);
  

  return (
    <div className="wrapper">
      <div className="containerLogo">
        <img className="logo" src={logo} alt="logo"></img>
      </div>
      <div>
        <form className="form" onSubmit={handleFileSubmit} id="myForm">
          <div className="containerForm">
            <label htmlFor="input-file" className="btnLabel">
            Selecciona el Archivo CFE Recibos
          </label>
          <input
            type="file" 
            id="input-file" 
            name="fileInput" 
            required
            ref={fileInputRef}
            onChange={(e, excelData) => {
              handleFile(e);
              valores(excelData);
              const fileName = e.target.files[0]?.name;
              setFileName(fileName)
            }}
            />
            <div className="fileName">
              {
                fileName?(
                  <h3 style={{fontSize:'12px'}}>{fileName}</h3>
                  ):
                  <h3  style={{color:'grey', fontSize:'12px'}}>Nombre del archivo...</h3>
              }
            </div>
          </div>
        {typeError ===  "Hay una fecha no encontrada, revisa el archivo" || typeError === null ? (
          null
          ) : (
            <div className="alert" role="alert">
            {typeError}
            <div style={{margin: '0px 10px', fontSize:'19px'}}>
            <FaRegCircleXmark/>
            </div>
          </div>
        )}
        {typeSuccess && (
          <div className="alertSuccess" role="alert">
            {typeSuccess}
            <div style={{margin: '0px 10px', fontSize:'19px'}}>
            <AiOutlineCheckCircle/>
            </div>
          </div>
        )} 
        {   typeInfo && typeError === null? (
              <div className="alertInfo" role="alert">
              {typeInfo}
            <div style={{margin: '0px 10px', fontSize:'19px'}}>
            <BsFillInfoCircleFill/>
            </div>
            </div>
            )
            : null
          }
        {loading === true ? (
          <div className="loading">
            <ReactLoading
              type={"spokes"}
              color={"#000000"}
              height={80}
              width={80}
              />
            <p style={{ marginTop: "10px" }}>Esto puede tardar unos segundos</p>
          </div>
        ) : null}
      <div className="dataBase">
          <button
          className={`btn ${typeError ===
            "Debes seleccionar y examinar tu archivo XLS o XLSX antes de enviar a la base de datos" ||
            typeError || fileName === null || dataNew !== null ? "btn-no" : ""}`}
            type="submit"
            onClick={() => valores(excelData)}
          >
          ANALIZAR ARCHIVO
          </button>
           <button type="button"
          className={`btn ${typeError && typeError !==  "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente"  || excelData==null || dataNew === null || excelDataCotizacion === dataNew || excelDataCotizacion !== null || cotizacionUSD === null  ? "btn-no" : ""}`}
          onClick={valoresCotizacion}
          >
          CONVERTIR MONEDA{" "}
          <span className="icons">
            {/* <FaHandHoldingUsd /> */}
          </span>
        </button>
        <button type="button"
          className={`btn ${typeError && typeError !==  "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente" || excelData==null || dataNew === null || excelDataRazonSocial === dataNew || excelDataRazonSocial !== null  ? "btn-no" : ""}`}
          onClick={valoresRazonSocial}
          >
          AGREGAR NOMBRE Y DIRECCIÓN{" "}
          <span className="icons">
            {/* <FaHandHoldingUsd /> */}
          </span>
        </button>
        <button type="button"
          className={`btn ${dataNew === null || excelFinal === null || excelFinalDowload === "descargado"? "btn-no" : ""}`}
          // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
          onClick={descargarXLS}
          >
          DESCARGAR XLS{" "}
          <span className="icons">
            {/* <FaHandHoldingUsd /> */}
          </span>
        </button>
        <button type="button"
             className={`btn ${typeError && typeError !== "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente" || dataNew === excelData || fileName === null ? "btn-no" : ""}`}
             // className={`btnDataBaseDelete  ${typeError ? "btn-no" : ""}`}
             onClick={reiniciarExcel}
             >
          REINICIAR TABLA{" "}
          <span className="icons">
            {/* <FiRefreshCw /> */}
          </span>
        </button>
        <button type="button"
        //  className={`btn ${excelFinal === null || excelData === null || typeError? "btn-no" : ""}`}
        style={{'display':'none'}}
          onClick={addDataBase}
        >
          ENVIAR A BASE DE DATOS{" "}
          <span className="icons">
            {/* <BsDatabaseAdd /> */}
          </span>
        </button>
        <button type="button"
            // className={`btn-no`}
             style={{'display':'none'}}
             // className={`btnDataBaseDelete  ${typeError ? "btn-no" : ""}`}
             onClick={deleteDataBase}
             >
          ELIMINAR BASE DE DATOS{" "}
          <span className="icons">
          {/* <MdDelete /> */}
          </span>
        </button>
          </div>
      </form>
      <div>
          </div>
          <View excelData={dataNew} title={title}/>
      </div>
      <div style={{margin:'20px 20px'}}>
         {typeError ===
            "Hay una fecha no encontrada, revisa el archivo" ? (
              <div className="alert" role="alert">
            {typeError}
          </div>
            ) :
            null
          }
      </div>
    </div>
  );
}

export default App;