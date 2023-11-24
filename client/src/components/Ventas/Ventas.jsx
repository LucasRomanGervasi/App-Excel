import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
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

function Ventas() {
  //Estados nombres de archivos
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [title, setTitle] = useState(null);
  //Estados Excel Datos
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [dataNew, setDataNew] = useState()
  const [dataMemory, setDataMemory] = useState()
  const [dataMemoryTitle, setDataMemoryTitle] = useState()
  const [dataMemoryVentas, setDataMemoryVentas] = useState()
  const [dataMemoryTitleVentas, setDataMemoryTitleVentas] = useState()
  //Estados Otros  
  const [typeError, setTypeError] = useState(null);
  const [typeSuccess, setTypeSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeInfo, setTypeInfo] = useState(null);
  //Estados Base de datos
  const [impoCompraVenta, setimpoCompraVenta] = useState();
  const [archivo, setArchivo] = useState({});
  //Estados Siguiente página
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
        // setExcelFinal(null);
        setTypeInfo(null)
        // setExcelFinalDowload(null)
      }
    } else {
      console.log("Please select yout file");
      setExcelData(null);
      setFileName(null)
      setDataNew(null);
      setFileName(null);
      // setExcelFinal(null);
      setTypeInfo(null)
      // setExcelFinalDowload(null)
    }
  };

  //----------------------> ANALIZAR EXCEL <-------------------------//  
  const handleFileSubmit = (e) => {
    setDataMemoryTitleVentas(null)
    setDataMemoryVentas(null)
    setSiguiente(false)
    e.preventDefault();
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: "buffer" });
      const worksheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[worksheetName]);
      const file0 = Object.keys(data[0]);
      localStorage.setItem('titleVentas',JSON.stringify('CFE Emitidos'))
      const file2 = data[2];
      const file1 = data[0];
      const A0 = Object.values(file0);
      const A2 = Object.values(file2);
      const A1 = Object.values(file1);
      const partes = A1[0].split(' ');
      let fechaInicio, fechaFin;
      if (partes.length >= 4) {
        fechaInicio = partes[1];
        fechaFin = partes[3];
        const dataValues = [
          { 'Comprobantes':'Comprobantes', 'VentasCreditoContado': data[1]['Libro de Ventas']},
          { 'Periodo': 'Fecha Desde:', 'Fecha Desde': `${fechaInicio}`, },
          { 'Periodo': 'Fecha Hasta:', 'Fecha Desde': `${fechaFin}`, },
          {
            'fecha': data[2]['Libro de Ventas'], 'Tipo CFE': 'Tipo CFE', 'tipo': 'Tipo', 'serie': 'Serie', 'número': 'Número', 'RUTReceptor': 'RUT Receptor', 'Receptor': 'Receptor',
            'Moneda': 'Moneda', 'TipoCambioDeLaFecha': 'Tipo de Cambio de la Fecha', 'MontoNetoUYU': 'Monto Neto UYU', "IVAVentasUYU": "IVA Ventas UYU", "MontoRedondeoUYU": "Monto Redondeo UYU",
            "MontoTotalUYU": "Monto Total UYU", "Notas":"Notas"
        }]
         for (let index = 3; index < data?.length; index++) {
           if (data[index]) {
            if (typeof data[index]['Libro de Ventas'] === 'number') {
              const fechaExcel = data[index]['Libro de Ventas'];
              const fechaJS = XLSX.SSF.parse_date_code(fechaExcel);
              
              if (fechaJS) {
                const year = fechaJS.y;
                const month = String(fechaJS.m).padStart(2, '0');
                const day = String(fechaJS.d).padStart(2, '0');
                const isoDate = `${day}/${month}/${year}`;
            
                const serie = data[index]['__EMPTY_2'].charAt(0);
                const numero = data[index]['__EMPTY_2'].slice(1);
                const values = {
              'fecha': isoDate,
              'tipoCFE': data[index]['__EMPTY_1'],
              'tipo': "ventas",
              'serie':serie,
              'numero': numero,
              'RUTReceptor': data[index]['__EMPTY_5'],
              'Receptor':  data[index]['__EMPTY_4'],
              'Moneda': 'UYU',
              'TipoCambioDeLaFecha': '1.00',
              'MontoNetoUYU': data[index]['__EMPTY_6'].toFixed(2),
              'IVAVentasUYU': data[index]['__EMPTY_7'].toFixed(2),
              'MontoRedondeoUYU': data[index]['__EMPTY_8'].toFixed(2),
              'MontoTotalUYU': data[index]['__EMPTY_9'].toFixed(2),
              'Notas': data[index]['__EMPTY_10']? data[index]['__EMPTY_10'] : "-",
            }
            dataValues.push(values)
            }
          }
          }}
          setTitle('CFE Emitidos');
          if (A0[0] === "Libro de Ventas" && A2[0] === "FECHA") {
            setExcelData(
              dataValues
              );
              setDataNew(dataValues)
              localStorage.setItem('dataNewVentas', JSON.stringify(dataValues))
        } else {
          setTypeError(
            "El archivo subido no es un tipo de archivo que podamos procesar, intentar nuevamente con otro archivo"
            );
            setExcelData(null);
            setDataNew(null);
            setFileName(null);
            fileInputRef.current.value = "";
          }
      } else {
        setTypeError(
          "El archivo subido no es un tipo de archivo que podamos procesar, intentar nuevamente con otro archivo"
          );
          setExcelData(null);
          setDataNew(null);
          setFileName(null);
          fileInputRef.current.value = "";
      }
    }
    }
      
  const valores = (excelData) => {
    if (excelData) {
      setTypeError(null);
      setTypeInfo(null)
      const firstFourElements = excelData.slice(0, 4);
      const restOfArray = excelData.slice(4, 33);
      //ISO ARCHIVO
      //  let fechadesde = Object.values(firstFourElements[1]);
      //  const [day, month, year] = fechadesde[1].split("/");
      //  const dateObjectFechaDesde = new Date(`${year}-${month}-${day}`);
      //  const isoFechaDesde = dateObjectFechaDesde.toISOString().substring(0, 10);
      //  let fechahasta = Object.values(firstFourElements[2]);
      //  const [day2, month2, year2] = fechahasta[1].split("/");
      //  const dateObject = new Date(`${year2}-${month2}-${day2}`);
      //  const isoFechaHasta = dateObject.toISOString().substring(0, 10);
      const parsedData = restOfArray.map((data) => {
        const values = Object.values(data);
        //ISO impoCompraVenta
        let isoDate = null;
        if (typeof values[0] === 'string') {
          const dateParts = Number(values[0]);
          if (!isNaN(dateParts)) {
            const milisegundos = dateParts * 24 * 60 * 60 * 1000;
            const fecha = new Date(milisegundos);
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Sumamos 1 al mes ya que en JavaScript los meses van de 0 a 11
            const day = String(fecha.getDate()).padStart(2, '0');
            const dateObject = new Date(`${year}-${month}-${day}`);
            isoDate = dateObject.toISOString().substring(0, 10);
          } 
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
        // fechadesde: isoFechaDesde,
        // fechahasta: isoFechaHasta,
        fechaupload: getDate(),
      };
      if (typeError) {
        console.log("error");
     }
      setimpoCompraVenta([...parsedData]);
      setArchivo({ ...archivo });
      setTypeSuccess("Se creo ventas correctamente")
    } else {
      console.log("error");
    }
  };

  //----------------------> REINICIAR VISTA EXCEL <-------------------------//  
  const reiniciarExcel = () => {
    setDataNew(null);
    localStorage.removeItem("dataNewVentas");  
    localStorage.removeItem("titleVentas");  
    setDataMemoryTitleVentas(null);
    setDataMemoryVentas(null);
    setFileName(null)
  };

  const siguienteValidate = () => {
    if(excelData){
      setSiguiente(true)
    }else{
      setSiguiente(false)
    }
  }


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
  //             return {
  //               id: nextIdImpo + 1,
  //               idarchivo: 1, //el id autonumérico obtenido al insertar un registro en tabla "archivo",
  //               fecha: isoDate, //formato ISO
  //               tipoCFE: values[1],
  //               tipo: values[2],
  //               serie: values[3],
  //               numero: values[4],
  //               RUTEmisor: values[5],
  //               razonsocial: values[6],
  //               domicilio: values[7],
  //               moneda: values[8]? values[8]: "-",
  //               montonetoUYU: values[9], //formato money
  //               montoivaUYU: values[10], //formato money
  //               montototal: values[11], //formato money
  //               montoretperUYU: values[12], //formato money
  //               montoneto: values[15], //formato money
  //               montoiva: values[16], //formato money
  //               montoretper: values[17]['montoretper'], //formato money   fhatzen esto me daba error Uncaught TypeError: Cannot read properties of undefined (reading 'montoretper'), puede que no exista columna 18
  //               montototaloriginal: values[18], 
  //             };
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
    setDataMemoryVentas(JSON.parse(localStorage.getItem('dataNewVentas')))
    setDataMemoryTitleVentas(JSON.parse(localStorage.getItem('titleVentas')))
    if (excelData) {
      valores(excelData)
      siguienteValidate()
    }
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
            Selecciona el Archivo de Ventas Zeta
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
          <Link to='/' 
              className="btn"
              // className={`btn ${
              //   siguiente !== true ? "btn-no" : ""}`}
              // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
              //onClick={}
            >
              ANTERIOR{" "}
            </Link>
            <button
              className={`btn ${typeError ===
                "Debes seleccionar y examinar tu archivo XLS o XLSX antes de enviar a la base de datos" ||
                typeError || fileName === null || dataNew !== null? "btn-no" : ""}`}
              type="submit"
              onClick={() => valores(excelData)}
            >
              ANALIZAR ARCHIVO
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
              className={`btn ${typeError || dataMemoryVentas === null || dataNew === null  ? "btn-no" : ""}`}
              //className={`btnDataBaseDelete  ${typeError ? "btn-no" : ""}`}
              onClick={reiniciarExcel}
            >
              REINICIAR TABLA{" "}
              <span className="icons">
                {/* <FiRefreshCw /> */}
              </span>
            </button>
              <Link to='/descargar'
              className={`btn ${ dataMemory === null && dataMemoryVentas === null && excelData === null? "btn-no" : ""}`}
            // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
            //onClick={}
            >
              SIGUIENTE{" "}
            </Link>
            {/* <button type="button"
              //  className={`btn ${excelFinal === null || excelData === null || typeError? "btn-no" : ""}`}
              style={{ 'display': 'none' }}
              // onClick={addDataBase}
            >
              ENVIAR A BASE DE DATOS{" "}
              <span className="icons">
               <BsDatabaseAdd />
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
                {/* <MdDelete /> 
              </span>
            </button> */}
          </div>
        </form>
        <div>
        </div>
        <View excelData={dataMemoryVentas === null ? dataNew : dataMemoryVentas} title={dataMemoryTitleVentas === null ? title : dataMemoryTitleVentas} />
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

export default Ventas;
