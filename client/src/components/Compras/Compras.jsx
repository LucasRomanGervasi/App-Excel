import { useEffect, useRef, useState } from "react";
import logo from "../../images/asystax.png";
import { FaRegCircleXmark } from "react-icons/fa6";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { getDate } from "../../utils/getDate";
import { validateDate } from "../../utils/validateDate";
import { getCloserDate } from "../../utils/getCloserDate";
import axios from "axios";
import ReactLoading from "react-loading";
import View from "./View";
import { getOrderDataNew } from "../../utils/getOrderDataNew";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";


function Compras() {
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
  const [dataNew, setDataNew] = useState(null)
  const [dataMemory, setDataMemory] = useState()
  const [dataMemoryTitle, setDataMemoryTitle] = useState()
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
  //Estados siguiente
  const [siguiente, setSiguiente] = useState(true)
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
          'montoneto': data[3]['__EMPTY_5'], 'ivaventas': data[3]['__EMPTY_6'], 'montototal': data[3]['__EMPTY_7'], 'montoRet/Per': data[3]['__EMPTY_8']
        }]
        const dataNewOrdenado = getOrderDataNew(data)
        for (let index = 4; index < dataNewOrdenado?.length; index++) {
          if (dataNewOrdenado[index]) {
            delete dataNewOrdenado[index]['montocredfiscal'];
            dataValues.push(dataNewOrdenado[index])
          }
        }
        if (A11.length < 11) {
          A11.unshift("");
        }
        setTitle(A0[0]);
        localStorage.setItem('title', JSON.stringify(A0[0]))
        if (A0[0] === "CFE Recibidos" && A10[0] === "Fecha" && A11[0] !== "") {
          setExcelData(
            dataValues
          );
          setDataNew(dataValues)
          setExcelDataCotizacion(null);
          setExcelDataRazonSocial(null);
          setExcelFinal(null)
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
      // .get("http://localhost:3001/cotizacion-usd")
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
          'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'], 'tipo': dataNew[3]['tipo'], 'serie': dataNew[3]['serie'], 'numero': dataNew[3]['numero'], 'rutemisor': dataNew[3]['rutemisor'], 'razonsocial': 'Razon Social', 'domicilio': 'Domicilio', 'moneda': dataNew[3]['moneda'], 'tipoCambio': "Tipo de Cambio de la Fecha",
          'montonetoUYU': 'Monto Neto UYU', 'ivaventasUYU': 'IVA Compras UYU', 'montototal': 'Monto Total UYU', 'montoRet/Per': 'Monto Ret/Per UYU',
          'montoNeto': 'Monto Neto Original', 'montoIva': 'IVA Compras Original', 'montototalorginal': 'Monto Total Original'
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
          montoneto: dataNew[index]['montoneto'],
          montoiva: dataNew[index]['montoiva'],
          montototaloriginal: dataNew[index]['montototal'],
          valuesLast: {
            montoretper: dataNew[index]['montoretper']
          }
        };
        excelCotizacionData.push(nuevoImporte);
      }
      setExcelDataCotizacion(excelCotizacionData)
      setDataNew(excelCotizacionData)
      setExcelFinal(excelCotizacionData)
      // addDataBase(excelCotizacionData)
      localStorage.setItem('dataNew', JSON.stringify(excelCotizacionData))
    } else {
      const excelCotizacionData =
        [{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
        { 'fechadesde': dataNew[1]['fechadesde'], 'valor': dataNew[1]['valor'] },
        { 'fechahasta': dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor'] },
        {
          'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'], 'tipo': dataNew[3]['tipo'], 'serie': dataNew[3]['serie'], 'numero': dataNew[3]['numero'], 'rutemisor': dataNew[3]['rutemisor'], 'moneda': dataNew[3]['moneda'], 'tipoCambio': "Tipo de Cambio de la Fecha",
          'montonetoUYU': 'Monto Neto UYU', 'ivaventasUYU': 'IVA Compras UYU', 'montototal': 'Monto Total UYU', 'montoRet/Per': 'Monto Ret/Per UYU',
          'montoNeto': 'Monto Neto Original', 'montoIva': 'IVA Compras Original', 'montototalorginal': 'Monto Total Original',
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
        // const montoendolares = dataNew[index]['moneda'] === 'UYU'?  dataNew[index]['montototal'] : dataNew[index]['montototal'] / resultado.montoventa;
        const montonetoUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montoneto'] : dataNew[index]['montoneto'] * resultado.montoventa;
        const montoivaUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montoiva'] : dataNew[index]['montoiva'] * resultado.montoventa;
        const montototalUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montototal'] : dataNew[index]['montototal'] * resultado.montoventa;
        const montoretperUYU = dataNew[index]['moneda'] === 'UYU' ? dataNew[index]['montoretper'] : dataNew[index]['montoretper'] * resultado.montoventa;
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
          montoneto: dataNew[index]['montoneto'],
          montoiva: dataNew[index]['montoiva'],
          montototaloriginal: dataNew[index]['montototal'],
          valuesLast: {
            montoretper: dataNew[index]['montoretper']
          }
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
      // .get("http://localhost:3001/razonsocial")
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
            'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'], 'tipo': dataNew[3]['tipo'], 'serie': dataNew[3]['serie'], 'numero': dataNew[3]['numero'], 'rutemisor': dataNew[3]['rutemisor'], 'razonsocial': 'Razon Social', 'domicilio': 'Domicilio', 'moneda': dataNew[3]['moneda'], 'tipoCambio': "Tipo de Cambio de la Fecha",
            'montonetoUYU': 'Monto Neto UYU', 'ivaventasUYU': 'IVA Compras UYU', 'montototal': 'Monto Total UYU', 'montoRet/Per': 'Monto Ret/Per UYU',
            'montoNeto': 'Monto Neto Original', 'montoIva': 'IVA Compras Original', 'montototalorginal': 'Monto Total Original'
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
                  montoneto: dataNew[index]['montoneto'],
                  montoiva: dataNew[index]['montoiva'],
                  montototalorginal: dataNew[index]['montototaloriginal'],
                  valuesLast: {
                    montoretper: dataNew[index]['valuesLast']['montoretper']
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
        } else {
          console.error('dataNew es undefined o nulo');
        }
        var excelRazonSocial = excelRazonSocialValues
        setExcelFinal(excelRazonSocial)
        // addDataBase(excelRazonSocial)
        localStorage.setItem('dataNew', JSON.stringify(excelRazonSocial))
      } else {
        const excelRazonSocialValues =
          [{ 'CFE Recibidos': dataNew[0]['CFE Recibidos'], 'cant': dataNew[0]['cant'] },
          { 'fechadesde': dataNew[1]['fechadesde'], 'valor': dataNew[1]['valor'] },
          { 'fechahasta': dataNew[2]['fechahasta'], 'valor': dataNew[2]['valor'] },
          {
            'fecha': dataNew[3]['fecha'], 'tipoCFE': dataNew[3]['tipoCFE'], 'tipo': dataNew[3]['tipo'], 'serie': dataNew[3]['serie'], 'numero': dataNew[3]['numero'], 'rutemisor': dataNew[3]['rutemisor'], 'razonsocial': 'Razon Social', 'domicilio': 'Domicilio', 'moneda': dataNew[3]['moneda'],
            'montoneto': dataNew[3]['montoneto'], 'ivaventas': dataNew[3]['ivaventas'], 'montototal': dataNew[3]['montototal'], 'montoRet/Per': dataNew[3]['montoRet/Per']
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
    localStorage.removeItem("dataNew");
    localStorage.removeItem("title");
    setDataMemory(null);
    setDataMemoryTitle(null)
    setExcelDataCotizacion(null)
    setExcelDataRazonSocial(null)
    setExcelFinal(null)
  };

  // //----------------------> ENVIAR BASE DE DATOS <-------------------------//  
  // const addDataBase = (excelDataBase) => {
  //   if (excelDataBase) {
  //     setSiguiente(true)
  //     const restOfArray = excelDataBase.slice(4);
  //     const parsedData = restOfArray.map((data) => {
  //       const values = Object.values(data);
  //       //ISO impoCompraVentaadd
  //       let isoDate = null;
  //       if (validateDate(values[0])) {
  //         const dateParts = values[0].split("/");
  //         const [day, month, year] = dateParts;
  //         const dateObject = new Date(`${year}-${month}-${day}`);
  //         isoDate = dateObject.toISOString().substring(0, 10);
  //         let nextIdImpo = 0;
  //         //REVICION
  //         return {
  //           id: nextIdImpo + 1,
  //           idarchivo: 1, //el id autonumérico obtenido al insertar un registro en tabla "archivo",
  //           fecha: isoDate, //formato ISO
  //           tipoCFE: values[1],
  //           tipo: values[2],
  //           serie: values[3],
  //           numero: values[4],
  //           RUTEmisor: values[5],
  //           razonsocial: values[6],
  //           domicilio: values[7],
  //           moneda: values[8] ? values[8] : "-",
  //           montonetoUYU: values[9], //formato money
  //           montoivaUYU: values[10], //formato money
  //           montototal: values[11], //formato money
  //           montoretperUYU: values[12], //formato money
  //           montoneto: values[15], //formato money
  //           montoiva: values[16], //formato money
  //           montoretper: values[17]['montoretper'], //formato money   fhatzen esto me daba error Uncaught TypeError: Cannot read properties of undefined (reading 'montoretper'), puede que no exista columna 18
  //           montototaloriginal: values[18],
  //         };
  //       }
  //     });
  //     if (typeError) {
  //       console.log("error");
  //     }
  //     axios
  //       // .post("https://app-excel-production.up.railway.app/data", {
  //       .post("http://localhost:3001/data", {
  //         impoCompraVenta: [...parsedData],
  //         archivo: archivo,
  //       })
  //       .then(() => {
  //         // console.log('se guardo en base de datos')
  //       })
  //       .catch((error) => {
  //         console.error("Error en la solicitud:", error);
  //       });
  //   };
  // }


  useEffect(() => {
    setDataMemory(JSON.parse(localStorage.getItem('dataNew')))
    setDataMemoryTitle(JSON.parse(localStorage.getItem('title')))
    if (excelData) {
      valores(excelData)
      fetch("https://app-excel-production.up.railway.app/razonsocial", requestOptions)
      // fetch("http://localhost:3001/razonsocial", requestOptions)
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
                typeError || fileName === null || dataNew !== null ? "btn-no" : ""}`}
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
            {/* <button type="button"
              className={`btn ${dataNew === null || excelFinal === null || excelFinalDowload === "descargado" ? "btn-no" : ""}`}
              // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
              onClick={descargarXLS}
            >
              DESCARGAR POSICION IVA{" "}
              <span className="icons">
                 <FaHandHoldingUsd /> 
              </span>
            </button> */}
            <button type="button"
              className={`btn ${typeError && typeError !== "Cargando datos desde los servicios web de DGI, aguarde unos segundos y presione nuevamente" || dataMemory === null && dataNew === excelData ? "btn-no" : ""}`}
              // className={`btnDataBaseDelete  ${typeError ? "btn-no" : ""}`}
              onClick={reiniciarExcel}
            >
              REINICIAR TABLA{" "}
              <span className="icons">
                {/* <FiRefreshCw /> */}
              </span>
            </button>
            <Link to='/ventas'
              className={`btn ${siguiente !== true ? "btn-no" : ""}`}
            // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
            //onClick={}
            >
              SIGUIENTE{" "}
            </Link>
          </div>
        </form>
        <div>
        </div>
        <View excelData={dataMemory === null ? dataNew : dataMemory} title={dataMemoryTitle === null ? title : dataMemoryTitle} />
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

export default Compras;
