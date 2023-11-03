import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import logo from "./images/asystax.png";
import { FaRegCircleXmark } from "react-icons/fa6";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { getDate } from "./utils/getDate";
import { validateDate } from "./utils/validateDate";
import { getCloserDate } from "./utils/getCloserDate";
import axios from "axios";
import ReactLoading from "react-loading";
import View from "./components/View";
import { getOrderDataNew } from "./utils/getOrderDataNew";

function App() {
  //Estados nombres de archivos
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [title, setTitle] = useState(null);
  //Estados Excel Datos
  const [excelFile, setExcelFile] = useState(null);
  const [excelDataCotizacion, setExcelDataCotizacion] = useState(null)
  const [excelDataRazonSocial, setExcelDataRazonSocial] = useState(null)
  const [excelData, setExcelData] = useState(null);
  const [excelFinal, setExcelFinal] = useState(null)
  const [excelFinalDowload, setExcelFinalDowload] = useState(null)
  const [dataNew, setDataNew] = useState()
  //Estados Otros  
  const [typeError, setTypeError] = useState(null);
  const [typeSuccess, setTypeSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeInfo, setTypeInfo] = useState(null);
  //Estados Base de datos
  const [impoCompraVenta, setimpoCompraVenta] = useState();
  const [archivo, setArchivo] = useState({});
  //Estados Datos extraidos de backend
  const [cotizacionUSD, setCotizacionUSD] = useState()
  const [razonSocial, setRazonSocial] = useState(null)

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
          setTypeInfo(null);
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
        setExcelFinalDowload(null)
      }
    } else {
      console.log("Please select yout file");
      setExcelData(null);
      setFileName(null)
      setDataNew(null);
      setFileName(null);
      setExcelDataCotizacion(null);
      setExcelDataRazonSocial(null);
      setExcelFinal(null);
      setRazonSocial(null);
      setTypeInfo(null)
      setExcelFinalDowload(null)
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
      if (data[3]['__EMPTY_5'] === 'Monto Neto') {
        const dataValues = [{ 'CFE Recibidos': data[0]['CFE Recibidos'], 'cant': data[0]['__EMPTY'] },
        { 'fechadesde': data[1]['CFE Recibidos'], 'valor': data[1]['__EMPTY'] },
        { 'fechahasta': data[2]['CFE Recibidos'], 'valor': data[2]['__EMPTY'] },
        {
          'fecha': data[3]['CFE Recibidos'], 'tipoCFE': data[3]['__EMPTY'], 'tipo': 'Tipo', 'serie': data[3]['__EMPTY_1'], 'numero': data[3]['__EMPTY_2'], 'rutemisor': data[3]['__EMPTY_3'], 'moneda': data[3]['__EMPTY_4'],
          'montoneto': data[3]['__EMPTY_5'], 'ivaventas': data[3]['__EMPTY_6'], 'montototal': data[3]['__EMPTY_7'], 'montoRet/Per': data[3]['__EMPTY_8'], 'montoCredFiscal': data[3]['__EMPTY_9']
        }]
        const dataNewOrdenado = getOrderDataNew(data)
        for (let index = 4; index < dataNewOrdenado?.length; index++) {
          if (dataNewOrdenado[index]) {
            dataValues.push(dataNewOrdenado[index])
          }
        }
        if (A11.length < 11) {
          A11.unshift("");
        }
        setTitle(A0[0]);
        if (A0[0] === "CFE Recibidos" && A10[0] === "Fecha" && A11[0] !== "") {
          setExcelData(
            dataValues
          );
          setDataNew(dataValues)
          setExcelFinalDowload(null)
          setExcelDataCotizacion(null);
          setExcelDataRazonSocial(null);
          setExcelFinal(null)
          setExcelFinalDowload(null)
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
          setExcelFinalDowload(null)
          fileInputRef.current.value = "";
        }
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
        setExcelFinalDowload(null)
      }
    }
  }

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
          montoneto: values[6], //formato money
          montoiva: values[7], //formato money
          montototal: values[8], //formato money
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
    if (excelDataRazonSocial === dataNew) {
      const excelCotizacionData =
        [{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
        { 'fechadesde': dataNew[1]['fechadesde'], 'valor': dataNew[1]['valor'] },
        { 'fechahasta': dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor'] },
        {
          'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'],'tipo':  dataNew[3]['tipo'],  'serie': dataNew[3]['serie'], 'numero': dataNew[3]['numero'], 'rutemisor': dataNew[3]['rutemisor'], 'razonsocial': 'Razon Social', 'domicilio': 'Domicilio', 'moneda': dataNew[3]['moneda'], 'tipoCambio': "Tipo de Cambio de la Fecha",  
          'montonetoUYU': 'Monto Neto UYU', 'ivaventasUYU': 'IVA Ventas UYU', 'montototal': 'Monto Total UYU', 'montoRet/Per': 'Monto Ret/Per UYU', 'montoCredFiscal': 'Monto Cred. Fiscal UYU',
          'montoNeto': 'Monto Neto Original','montoIva': 'IVA Ventas Original', 'montototalorginal': 'Monto Total Original'
        }]
      for (let index = 0; index < cotizacionUSD?.length; index++) {
        if (cotizacionUSD[index]['codigoiso_monedacotiz'] === 'USD') {
          var cotizacion = {
            'montoventa': cotizacionUSD[index]['montoventa'],
            'fecha': cotizacionUSD[index]['fecha'].slice(0, 10)
          }
          fechaCotizacion.push(cotizacion);
        }
      }
      for (let index = 4; index < dataNew?.length; index++) {
        const fechaBuscada = getCloserDate(fechaCotizacion, dataNew[index]['fecha'].replace(/-/g, '/'));
        const fechaAnterior = getCloserDate(fechaCotizacion, dataNew[index]['fecha'].replace(/-/g, '/'));
        const resultado = fechaCotizacion.find(item => item.fecha.replace(/-/g, '/') === fechaAnterior);
        const montoendolaresUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montototal'] : dataNew[index]['montototal'] / resultado.montoventa;
        const montonetoUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montoneto'] : dataNew[index]['montoneto'] * resultado.montoventa;
        const montoivaUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montoiva'] : dataNew[index]['montoiva'] * resultado.montoventa;
        const montototalUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montototal'] : dataNew[index]['montototal'] * resultado.montoventa;
        const montoretperUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montoretper'] : dataNew[index]['montoretper'] * resultado.montoventa;
        const montocredfiscalUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montocredfiscal'] : dataNew[index]['montocredfiscal'] * resultado.montoventa;
        var nuevoImporte = {
          fecha: dataNew[index]['fecha'],
          tipoCFE: dataNew[index]['tipoCFE'],
          tipo: dataNew[index]['tipo'],
          serie: dataNew[index]['serie'],
          numero: dataNew[index]['numero'],
          RUTEmisor: dataNew[index]['RUTEmisor'],
          razonsocial: dataNew[index]['razonsocial'],
          domicilio: dataNew[index]['domicilio'],
          moneda: dataNew[index]['moneda'],
            tipodecambiodelafecha: dataNew[index]['moneda'] === 'UYU' || dataNew[index]['moneda'] === "" ? '1.00' : resultado.montoventa.replace(/(\.\d{2})\d+$/, '$1'),
          montonetoUYU: Number(montonetoUYU).toFixed(2),
          montoivaUYU: Number(montoivaUYU).toFixed(2),
            montototalUYU: Number(montototalUYU).toFixed(2),
            montoretperUYU: Number(montoretperUYU).toFixed(2),
            montocredfiscalUYU: Number(montocredfiscalUYU).toFixed(2),
            montoneto:  dataNew[index]['montoneto'] ,
            montoiva:  dataNew[index]['montoiva'],
            montototaloriginal: dataNew[index]['montototal'],
            valuesLast :{
              montoretper:  dataNew[index]['montoretper'],
              montocredfiscal: dataNew[index]['montocredfiscal'] 
            }};
            excelCotizacionData.push(nuevoImporte);
          }
          setExcelDataCotizacion(excelCotizacionData)
          setDataNew(excelCotizacionData)
          setExcelFinal(excelCotizacionData)
          addDataBase(excelCotizacionData)
        } else {
      const excelCotizacionData =
      [{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
      { 'fechadesde': dataNew[1]['fechadesde'], 'valor': dataNew[1]['valor'] },
      { 'fechahasta': dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor'] },
        {
          'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'],'tipo':  dataNew[3]['tipo'],  'serie': dataNew[3]['serie'], 'numero': dataNew[3]['numero'], 'rutemisor': dataNew[3]['rutemisor'], 'moneda': dataNew[3]['moneda'], 'tipoCambio': "Tipo de Cambio de la Fecha", 
          'montonetoUYU': 'Monto Neto UYU', 'ivaventasUYU': 'IVA Ventas UYU', 'montototal': 'Monto Total UYU','montoRet/Per': 'Monto Ret/Per UYU', 'montoCredFiscal': 'Monto Cred. Fiscal UYU',
          'montoNeto': 'Monto Neto Original', 'montoIva': 'IVA Ventas Original', 'montototalorginal': 'Monto Total Original',
        }]
        for (let index = 0; index < cotizacionUSD?.length; index++) {
          if (cotizacionUSD[index]['codigoiso_monedacotiz'] === 'USD') {
            var cotizacion = {
              'montoventa': cotizacionUSD[index]['montoventa'],
              'fecha': cotizacionUSD[index]['fecha'].slice(0, 10)
            }
            fechaCotizacion.push(cotizacion);
          }
        }
        for (let index = 4; index < dataNew?.length; index++) {
          const fechaAnterior = getCloserDate(fechaCotizacion, dataNew[index]['fecha'].replace(/-/g, '/'));
          const resultado = fechaCotizacion.find(item => item.fecha.replace(/-/g, '/') === fechaAnterior);
          console.log(resultado, fechaAnterior)
          // const montoendolares = dataNew[index]['moneda'] === 'UYU'?  dataNew[index]['montototal'] : dataNew[index]['montototal'] / resultado.montoventa;
          const montonetoUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montoneto'] : dataNew[index]['montoneto'] * resultado.montoventa;
          const montoivaUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montoiva'] : dataNew[index]['montoiva'] * resultado.montoventa;
        const montototalUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montototal'] : dataNew[index]['montototal'] * resultado.montoventa;
        const montoretperUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montoretper'] : dataNew[index]['montoretper'] * resultado.montoventa;
        const montocredfiscalUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montocredfiscal'] : dataNew[index]['montocredfiscal'] * resultado.montoventa;
        var nuevoImporte = {
          fecha: dataNew[index]['fecha'],
          tipoCFE: dataNew[index]['tipoCFE'],
          tipo: dataNew[index]['tipo'],
          serie: dataNew[index]['serie'],
          numero: dataNew[index]['numero'],
          RUTEmisor: dataNew[index]['RUTEmisor'],
          moneda: dataNew[index]['moneda'],
          tipodecambiodelafecha: dataNew[index]['moneda'] === 'UYU' || dataNew[index]['moneda'] === "" ? '1.00' : resultado.montoventa.replace(/(\.\d{2})\d+$/, '$1'),
          montonetoUYU: Number(montonetoUYU).toFixed(2),
          montoivaUYU: Number(montoivaUYU).toFixed(2),
          montototalUYU: Number(montototalUYU).toFixed(2),
          montoretperUYU: Number(montoretperUYU).toFixed(2),
          montocredfiscalUYU: Number(montocredfiscalUYU).toFixed(2),
          montoneto:  dataNew[index]['montoneto'] ,
          montoiva:  dataNew[index]['montoiva'],
          montototaloriginal: dataNew[index]['montototal'],
          valuesLast :{
            montoretper:  dataNew[index]['montoretper'],
            montocredfiscal: dataNew[index]['montocredfiscal'] 
          }};
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
  function valoresRazonSocial() {
    if (razonSocial === null || razonSocial?.length === 0) {
      setTypeInfo(
        "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente"
      );
    }
    else {
      setTypeInfo(null)
      if (excelDataCotizacion === dataNew) {
        const excelRazonSocialValues =
          [{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
          { 'fechadesde': dataNew[1]['fechadesde'], 'valor': dataNew[1]['valor'] },
          { 'fechahasta': dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor'] },
          {
            'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'],'tipo':  dataNew[3]['tipo'],  'serie': dataNew[3]['serie'], 'numero': dataNew[3]['numero'], 'rutemisor': dataNew[3]['rutemisor'], 'razonsocial': 'Razon Social', 'domicilio': 'Domicilio', 'moneda': dataNew[3]['moneda'], 'tipoCambio': "Tipo de Cambio de la Fecha", 
            'montonetoUYU': 'Monto Neto UYU', 'ivaventasUYU': 'IVA Ventas UYU', 'montototal': 'Monto Total UYU', 'montoRet/Per': 'Monto Ret/Per UYU', 'montoCredFiscal': 'Monto Cred. Fiscal UYU',
            'montoNeto': 'Monto Neto Original', 'montoIva': 'IVA Ventas Original','montototalorginal': 'Monto Total Original'
          }]
        if (dataNew) {
        for (let index = 4; index < dataNew?.length; index++) {
          if (dataNew[index] && dataNew[index]['RUTEmisor']) {
            const matchingRutIndex = razonSocial.findIndex(item => item['rut'] === dataNew[index]['RUTEmisor']);

            if (matchingRutIndex !== -1) {
              const razonSocialData = {
                nombre: razonSocial[matchingRutIndex]['razonsocial'],
                domicilio: razonSocial[matchingRutIndex]['domicilio']
              };
              var nuevoImporte = {
                fecha: dataNew[index]['fecha'],
                tipoCFE: dataNew[index]['tipoCFE'],
                tipo: dataNew[index]['tipo'],
                serie: dataNew[index]['serie'],
                numero: dataNew[index]['numero'],
                RUTEmisor: dataNew[index]['RUTEmisor'],
                razonsocial: razonSocialData.nombre,
                domicilio: razonSocialData.domicilio,
                moneda: dataNew[index]['moneda'],
                tipodecambiodelafecha: dataNew[index]['tipodecambiodelafecha'],
                montonetoUYU: dataNew[index]['montonetoUYU'],
                montoivaUYU: dataNew[index]['montoivaUYU'],
                montototalUYU: dataNew[index]['montototalUYU'],
                montoretperUYU: dataNew[index]['montoretperUYU'],
                montocredfiscalUYU: dataNew[index]['montocredfiscalUYU'],
                montoneto: dataNew[index]['montoneto'],
                montoiva:   dataNew[index]['montoiva'],
                montototalorginal: dataNew[index]['montototaloriginal'],
                valuesLast :{
                  montoretper: dataNew[index]['valuesLast']['montoretper'],
                  montocredfiscal:dataNew[index]['valuesLast']['montocredfiscal']
                }
              };
                
              excelRazonSocialValues.push(nuevoImporte);
            } else {
              // Manejar casos en los que no se encontró una coincidencia
              setTypeInfo(
                "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente"
              );
              console.log('No se encontró una coincidencia para RUTEmisor:', dataNew[index]['RUTEmisor']);
            }
          } else {
            setTypeInfo(
              "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente"
            );
          }
        } 
      }else {
        console.error('dataNew es undefined o nulo');
      }
        var excelRazonSocial = excelRazonSocialValues
        setExcelFinal(excelRazonSocial)
        addDataBase(excelRazonSocial)
      } else {
        const excelRazonSocialValues =
          [{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
          { 'fechadesde': dataNew[1]['fechadesde'], 'valor': dataNew[1]['valor'] },
          { 'fechahasta': dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor'] },
          {
            'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'], 'tipo':  dataNew[3]['tipo'], 'serie': dataNew[3]['serie'], 'numero': dataNew[3]['numero'], 'rutemisor': dataNew[3]['rutemisor'], 'razonsocial': 'Razon Social', 'domicilio': 'Domicilio', 'moneda': dataNew[3]['moneda'],
            'montoneto': dataNew[3]['montoneto'], 'ivaventas': dataNew[3]['ivaventas'], 'montototal': dataNew[3]['montototal'], 'montoRet/Per': dataNew[3]['montoRet/Per'], 'montoCredFiscal': dataNew[3]['montoCredFiscal']
          }]
        for (let index = 0; index < dataNew?.length; index++) {

          let found = false;  // Variable para rastrear si se encontró una coincidencia

          for (let razonIndex = 0; razonIndex < razonSocial?.length; razonIndex++) {
            if (dataNew[index]['RUTEmisor'] === razonSocial[razonIndex]['rut']) {
              const razonSocialData = {
                nombre: razonSocial[razonIndex]['razonsocial'],
                domicilio: razonSocial[razonIndex]['domicilio']
              };

              var nuevoImporte = {
                fecha: dataNew[index]['fecha'],
                tipoCFE: dataNew[index]['tipoCFE'],
                tipo: dataNew[index]['tipo'],
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
              found = true;  // Se encontró una coincidencia
              break;  // Salir del bucle interno
            }
          }
          
          if (!found) {
            setTypeInfo(
              "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente"
            );
            // Manejar casos en los que no se encontró una coincidencia
            console.log('No se encontró una coincidencia para RUTEmisor::::', dataNew[index]['RUTEmisor']);
            // Puedes tomar alguna acción aquí si es necesario
          }
        }
        var excelRazonSocial = excelRazonSocialValues
      }
      setExcelDataRazonSocial(excelRazonSocial)
      setDataNew(excelRazonSocial)
      setTypeSuccess("Se agregó correctamente la razon social")
      setTypeInfo(null)
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
    if (excelFinal === null) {
      setTypeError("Error al descargar el archivo")
    } else {
       let excelFinalLength = 6
      const constante1 = [];
      for (let i = 0; i <= 3; i++) {
          if (i in excelFinal) {
              constante1[i] = excelFinal[i];
          }
      }

      // Constante que contiene los elementos restantes
      const compras = [];
      const retencionesFiscales = [];
      const remitos = [];
      const pagos = [];
      
      for (let i = 5; i < Object.keys(excelFinal).length; i++) {
          if (excelFinal[i]['tipo'] === 'compras') {
              compras.push(excelFinal[i]);
          } else if (excelFinal[i]['tipo'] === 'pagos') {
              pagos.push(excelFinal[i]);
          } else if (excelFinal[i]['tipo'] === 'retenciones fiscales') {
              retencionesFiscales.push(excelFinal[i]);
          } else {
              remitos.push(excelFinal[i]);
          }
      }

      const comprasLimite = compras.length + 8;
      const retencionesFiscalesInicio = comprasLimite + 6;
      const retencionesFiscalesLimite = retencionesFiscalesInicio + retencionesFiscales.length;
      const remitosInicio = retencionesFiscalesLimite + 6;
      const remitosLimite = remitosInicio + remitos.length;
      const pagosInicio = remitosLimite;
      const pagosLimite = pagosInicio + pagos.length;
      
      const totalesCompra = compras.length+8+3;
      const totalesRetenciones = retencionesFiscales.length + totalesCompra + 6;
      const libro = XLSX.utils.book_new();

      // Crear una hoja de Excel
      const hojaData = [
    ];
      if (constante1.length > 0) {
        hojaData.push(
        ["CFE Recibidos"],
        [],
          ...constante1.slice(0, 3).map((individualExcelData) => {
            return Object.values(individualExcelData);
          }),
          [],
        );
      }
      
      
      const comprasData = [];
      if (compras.length > 0) {
        comprasData.push(
        ["Compras"],
        [
          "Fecha", "Tipo CFE", "Tipo", "Serie", "Número", "Rut Emisor", "Razón Social",
          "Domicilio", "Moneda", "Tipo de Cambio de la Fecha", "Monto Neto UYU", "IVA Ventas UYU", "Monto Total UYU",
          "Monto Ret/Per UYU", "Monto Cred. Fiscal UYU", 
          "Monto Neto Original", "IVA Venta Original", "Monto Total Original"
        ],
          ...compras.map((individualExcelData) => {
            const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
              return i >= 9 ? Number(valor) : valor;
            });
            return valoresTransformados.slice(0, 18);
          }),
          [],
          ["", "", "", "", "", "", "", "", "", "Monto Neto UYU", "IVA Ventas UYU", "Monto Total UYU", "Monto Ret/Per UYU"],
          ["Total", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(J9:J${comprasLimite})` }, { t: "n", f: `=SUM(K9:K${comprasLimite})` }, { t: "n", f: `=SUM(L9:L${comprasLimite})` }, { t: "n", f: `=SUM(M9:M${comprasLimite})` }],
          []
          );
      } 
      
      const retencionesData = [];
      if (retencionesFiscales.length > 0) {
        retencionesData.push(
      ["Retenciones Fiscales"],
      [
        "Fecha", "Tipo CFE", "Tipo", "Serie", "Número", "Rut Emisor", "Razón Social",
        "Domicilio", "Moneda", "Tipo de Cambio de la Fecha", "Monto Neto UYU", "IVA Ventas UYU", "Monto Total UYU",
        "Monto Ret/Per UYU", "Monto Cred. Fiscal UYU", 
        "Monto Neto Original", "IVA Venta Original", "Monto Total Original"
      ],
          ...retencionesFiscales.map((individualExcelData) => {
            const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
              return i >= 9 ? Number(valor) : valor;
            });
            return valoresTransformados.slice(0, 18);
          }),
          [],
          ["", "", "", "", "", "", "", "", "", "Monto Neto UYU", "IVA Ventas UYU", "Monto Total UYU", "Monto Ret/Per UYU"],
          ["Total", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(J${retencionesFiscalesInicio}:J${retencionesFiscalesLimite})` }, { t: "n", f: `=SUM(K${retencionesFiscalesInicio}:K${retencionesFiscalesLimite})` }, { t: "n", f: `=SUM(L${retencionesFiscalesInicio}:L${retencionesFiscalesLimite})` }, { t: "n", f: `=SUM(M${retencionesFiscalesInicio}:M${retencionesFiscalesLimite})` }],
          []
          );
      }

      const remitosData = [];
      if (remitos.length > 0) {
        remitosData.push(
      ["Remitos"],
      [
        "Fecha", "Tipo CFE", "Tipo", "Serie", "Número", "Rut Emisor", "Razón Social",
        "Domicilio", "Moneda", "Tipo de Cambio de la Fecha", "Monto Neto UYU", "IVA Ventas UYU", "Monto Total UYU",
        "Monto Ret/Per UYU", "Monto Cred. Fiscal UYU", 
        "Monto Neto Original", "IVA Venta Original", "Monto Total Original"
      ],
          ...remitos.map((individualExcelData) => {
            const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
              return i >= 9 ? Number(valor) : valor;
            });
            return valoresTransformados.slice(0, 18);
          }),
          [],
          ["", "", "", "", "", "", "", "", "", "Monto Neto UYU", "IVA Ventas UYU", "Monto Total UYU", "Monto Ret/Per UYU"],
          ["Total", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(J${remitosInicio}:J${remitosLimite})` }, { t: "n", f: `=SUM(K${remitosInicio}:K${remitosLimite})` }, { t: "n", f: `=SUM(L${remitosInicio}:L${remitosLimite})` }, { t: "n", f: `=SUM(M${remitosInicio}:M${remitosLimite})` }],
          []
          );
      }

      const pagosData = [];
      
      if (pagos.length > 0) {
        pagosData.push(
        ["Pagos"],
        [
          "Fecha", "Tipo CFE", "Tipo", "Serie", "Número", "Rut Emisor", "Razón Social",
          "Domicilio", "Moneda", "Tipo de Cambio de la Fecha", "Monto Neto UYU", "IVA Ventas UYU", "Monto Total UYU",
          "Monto Ret/Per UYU", "Monto Cred. Fiscal UYU", 
          "Monto Neto Original", "IVA Venta Original", "Monto Total Original"
        ],
          ...pagos.map((individualExcelData) => {
            const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
              return i >= 9 ? Number(valor) : valor;
            });
            return valoresTransformados.slice(0, 18);
          }),
          [],
          ["", "", "", "", "", "", "", "", "", "Monto Neto UYU", "IVA Ventas UYU", "Monto Total UYU", "Monto Ret/Per UYU"],
          ["Total", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(J${pagosInicio}:J${pagosLimite})`}, { t: "n", f: `=SUM(K${pagosInicio}:K${pagosLimite})` }, { t: "n", f: `=SUM(L${pagosInicio}:L${pagosLimite})` }, { t: "n", f: `=SUM(M${pagosInicio}:M${pagosLimite})` }],
          []
        );
      }

      const hoja = XLSX.utils.aoa_to_sheet([
        ...hojaData,
        ...comprasData,
        ...retencionesData,
        ...remitosData,
        ...pagosData
        // Agrega las partes de remitos y pagos de manera similar
      ]);
      for (const cellRef in hoja) {
        if (hoja.hasOwnProperty(cellRef)) {
          const cell = hoja[cellRef];
          // Aplicar el formato de moneda solo a celdas numéricas
          if (typeof cell === 'object' && cell.t === 'n') {
            if (cell.v < 0) {
              // Formato para números negativos
              cell.z = '[$$-es-UY]#,##0.00;-[$$-es-UY]#,##0.00';
            } else {
              // Formato para números positivos
              if (cell.v >= 10000) {
                // Si el número es mayor o igual a 10,000, ajustamos el formato
                cell.z = '[$$-es-UY]#,##0.00';
              } else {
                // Si el número es menor que 10,000, usamos un formato más simple
                cell.z = '[$$-es-UY]#,##0.00';
              }
            }
            cell.w = cell.v;
          }
        }
      }
        const hoja2 = XLSX.utils.aoa_to_sheet([
          ["Período", `${constante1[1]['valor']}`+' a '+`${constante1[2]['valor']}`],
          ["Resumen de Impuestos"],
          [],
          [],
          ["IVA", "", "", "IRAE", "", "", "ICOSA"],
          ["Ventas", "", "", "IRAE Mínimo", 9940, "", "ICOSA A Pagar"],
          ["IVA Ventas", "", "", "IRAE del Mes", { t: "n", f: `IF(B6*0.027>E6, B6*0.027, E6)` }, "", "ICOSA del Mes", { t: "n", f: `=H6` }],
          ["Total Compras", { t: "n", f: `='CFE Recibidos'!L${totalesCompra}`}],
          ["IVA Compras", { t: "n", f: `='CFE Recibidos'!K${totalesCompra}` }],
          ["Neto IVA", { t: "n", f: `=B7-B9` }, "", "", "", "", "IP"],
          ["IVA del Mes", { t: "n", f: `IF(B10 < 0, 0, B10)` }, "", "Resguardos de IRAE", { t: "n", f: `='CFE Recibidos'!M${totalesRetenciones}` }, "", "IP A Pagar"],
          ["IVA Mes Anterior", "", "", "", "", "", "IP del Mes", { t: "n", f: `=H11`}],
          ["IVA A Pagar", { t: "n", f: `=B11-B12` }],
          ["TOTAL IVA A PAGAR", { t: "n", f: `=B13` }, "", "TOTAL IMPUESTOS A PAGAR", { t: "n", f: `=E7+H7` }]
        ])
      // Agregar la hoja al libro
      for (const cellRef in hoja2) {
        if (hoja2.hasOwnProperty(cellRef)) {
          const cell = hoja2[cellRef];
          // Aplicar el formato de moneda solo a celdas numéricas
          if (typeof cell === 'object' && cell.t === 'n') {
            if (cell.v < 0) {
              // Formato para números negativos
              cell.z = '[$$-es-UY]#,##0.00;[RED]-[$$-es-UY]#,##0.00';
            } else {
              // Formato para números positivos
              if (cell.v >= 10000) {
                // Si el número es mayor o igual a 10,000, ajustamos el formato
                cell.z = '[$$-es-UY]#,##0.00';
              } else {
                // Si el número es menor que 10,000, usamos un formato más simple
                cell.z = '[$$-es-UY]#,##0.00';
              }
            }
            cell.w = cell.v;
          }
        }
      }
      hoja['!cols'] = Array(18).fill({ wch: 12 }); 
      hoja2['!cols'] = Array(18).fill({ wch: 15 }); 
      const columnConfig = { wch: 15, bold: true }; // Puedes ajustar 'wch' (ancho) y otras propiedades según tus necesidades
      // Luego, asigna el objeto de configuración a la quinta columna (índice 4)
      hoja2['!cols'] = hoja2['!cols'] || [];
      hoja2['!cols'][4] = columnConfig;
      XLSX.utils.book_append_sheet(libro, hoja, "CFE Recibidos");
      XLSX.utils.book_append_sheet(libro, hoja2, "Resumen de Impuestos" );
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
  const addDataBase = (excelDataBase) => {
    if (excelDataBase) {
      const restOfArray = excelDataBase.slice(4);
      const parsedData = restOfArray.map((data) => {
        const values = Object.values(data);
        //ISO impoCompraVentaadd
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
                tipo: values[2],
                serie: values[3],
                numero: values[4],
                RUTEmisor: values[5],
                razonsocial: values[6],
                domicilio: values[7],
                moneda: values[8]? values[8]: "-",
                montonetoUYU: values[9], //formato money
                montoivaUYU: values[10], //formato money
                montototal: values[11], //formato money
                montoretperUYU: values[12], //formato money
                montocredfiscalUYU: values[13], //formato money
                montoneto: values[15], //formato money
                montoiva: values[16], //formato money
                montototaloriginal: values[17],
                montoretper: values[18]['montoretper'], //formato money
                montocredfiscal: values[18]['montocredfiscal'], //formato money
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
          // console.log('se guardo en base de datos')
        })
        .catch((error) => {
          console.error("Error en la solicitud:", error);
        });
    };
  }



  //----------------------> ELIMINAR BASE DE DATOS <-------------------------//  
  // const deleteDataBase = () => {
  //   axios
  //     //.delete("https://app-excel-production.up.railway.app/data")
  //     .delete("http://localhost:3001/data")
  //     .then(() => {
  //       alert("Base de Datos eliminada")
  //       setTypeSuccess("Eliminado correctamente");
  //       setFileName(null);
  //       setExcelData(null);
  //       setArchivo(null);
  //       setimpoCompraVenta(null);
  //       setDataNew(null);
  //       fileInputRef.current.value = "";
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error en la solicitud:", error);
  //       alert("Hubo un error al procesar la solicitud.");
  //       setLoading(false);
  //     });
  // };

  useEffect(() => {
    if (excelData) {
      valores(excelData)
      fetch("https://app-excel-production.up.railway.app/razonsocial", requestOptions)
      //fetch("http://localhost:3001/razonsocial", requestOptions)
        .then(response => response.json())
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
                fileName ? (
                  <h3 style={{ fontSize: '12px' }}>{fileName}</h3>
                ) :
                  <h3 style={{ color: 'grey', fontSize: '12px' }}>Nombre del archivo...</h3>
              }
            </div>
          </div>
          {typeError === "Hay una fecha no encontrada, revisa el archivo" || typeError === null ? (
            null
          ) : (
            <div className="alert" role="alert">
              {typeError}
              <div style={{ margin: '0px 10px', fontSize: '19px' }}>
                <FaRegCircleXmark />
              </div>
            </div>
          )}
          {typeSuccess && (
            <div className="alertSuccess" role="alert">
              {typeSuccess}
              <div style={{ margin: '0px 10px', fontSize: '19px' }}>
                <AiOutlineCheckCircle />
              </div>
            </div>
          )}
          {typeInfo && typeError === null ? (
            <div className="alertInfo" role="alert">
              {typeInfo}
              <div style={{ margin: '0px 10px', fontSize: '19px' }}>
                <BsFillInfoCircleFill />
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
                typeError || fileName === null || dataNew !== null? "btn-no" : ""}`}
              type="submit"
              onClick={() => valores(excelData)}
            >
              ANALIZAR ARCHIVO
            </button>
            <button type="button"
              className={`btn ${typeError && typeError !== "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente" || excelData == null || dataNew === null || excelDataCotizacion === dataNew || excelDataCotizacion !== null || cotizacionUSD === null ? "btn-no" : ""}`}
              onClick={valoresCotizacion}
            >
              CONVERTIR MONEDA{" "}
              <span className="icons">
                {/* <FaHandHoldingUsd /> */}
              </span>
            </button>
            <button type="button"
              className={`btn ${typeError && typeError !== "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente" || excelData == null || dataNew === null || excelDataRazonSocial === dataNew || excelDataRazonSocial !== null ? "btn-no" : ""}`}
              onClick={valoresRazonSocial}
            >
              AGREGAR NOMBRE Y DIRECCIÓN{" "}
              <span className="icons">
                {/* <FaHandHoldingUsd /> */}
              </span>
            </button>
            <button type="button"
              className={`btn ${dataNew === null || excelFinal === null || excelFinalDowload === "descargado" ? "btn-no" : ""}`}
              // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
              onClick={descargarXLS}
            >
              DESCARGAR POSICION IVA{" "}
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
              style={{ 'display': 'none' }}
              // onClick={addDataBase}
            >
              ENVIAR A BASE DE DATOS{" "}
              <span className="icons">
                {/* <BsDatabaseAdd /> */}
              </span>
            </button>
            <button type="button"
              // className={`btn-no`}
              style={{ 'display': 'none' }}
            // className={`btnDataBaseDelete  ${typeError ? "btn-no" : ""}`}
            // onClick={deleteDataBase}
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
        <View excelData={dataNew} title={title} />
      </div>
      <div style={{ margin: '20px 20px' }}>
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