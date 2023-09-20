import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import logo from "./images/asystax.png";
import { BsDatabaseAdd } from "react-icons/bs";
import {FaHandHoldingUsd } from "react-icons/fa";
import { FaRegCircleXmark} from "react-icons/fa6";
import {AiOutlineCheckCircle} from "react-icons/ai";
import {FiRefreshCw} from "react-icons/fi";
import {MdDelete} from "react-icons/md";
import { getDate } from "./utils/getDate";
import { validateDate } from "./utils/validateDate";
import { getCloserDate } from "./utils/getCloserDate";
import axios from "axios";
import ReactLoading from "react-loading";
import View from "./components/View";
// import Buttons from "./components/Buttons";

function App() {
  const [excelFile, setExcelFile] = useState(null);
  const [excelDataCotizacion, setExcelDataCotizacion] = useState(null)
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [typeError, setTypeError] = useState(null);
  const [typeSuccess, setTypeSuccess] = useState(null);
  const [title, setTitle] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [impoCompraVenta, setimpoCompraVenta] = useState();
  const [archivo, setArchivo] = useState({});
  const [cotizacionUSD, setCotizacionUSD] = useState()
  const [loading, setLoading] = useState(false);
  const [fileName,setFileName] = useState(null)
 
    //onchange event
  const handleFile = (e) => {
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
      }
    } else {
      console.log("Please select yout file");
    }
  };

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
      if (A11.length < 11) {
        A11.unshift("");
      }
      setTitle(A0[0]);
      if (A0[0] === "CFE Recibidos" && A10[0] === "Fecha" && A11[0] !== "") {
        setExcelData(data);
      } else {
        setTypeError(
          "El archivo subido no es un tipo de archivo que podamos procesar, intentar nuevamente con otro archivo"
        );
        setExcelData(null);
        setFileName(null);
        fileInputRef.current.value = "";
      }
    }
  };

  const valores = (excelData) => {
    if (excelData) {
      setTypeError(null);
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
          setTypeError(
            "Hay una fecha no encontrada, revisa el archivo"
          );
          setExcelData(null)
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

  const addDataBase = () => {
    setLoading(true);
    axios
      .post("https://app-excel-production.up.railway.app/data", {
        impoCompraVenta: impoCompraVenta,
        archivo: archivo,
      })
      .then(() => {
        setTypeSuccess("Registrado correctamente");
        setFileName(null);
        setExcelData(null);
        setArchivo(null);
        setimpoCompraVenta(null);
        setLoading(false);
        fileInputRef.current.value = "";
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
        setTypeError(
          "Debes seleccionar y examinar tu archivo XLS o XLSX antes de enviar a la base de datos"
          );
          setLoading(false);
        });
  };

  const deleteDataBase = () => {
    axios
      .delete("https://app-excel-production.up.railway.app/data")
      .then(() => {
        alert("Base de Datos eliminada")
        setTypeSuccess("Eliminado correctamente");
        setFileName(null);
        setExcelData(null);
        setArchivo(null);
        setimpoCompraVenta(null);
        fileInputRef.current.value = "";
        setLoading(false); 
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
        alert("Hubo un error al procesar la solicitud.");
        setLoading(false); 
      });
    };


    
    
    const getCotizacionUSD = () => {
      axios
      .get("https://app-excel-production.up.railway.app/cotizacion-usd")
      .then((response) => {
        setCotizacionUSD(response.data)
      })
      .catch((error) => {
        console.log("eeror")
        setLoading(false)
      });
    }
    
    function valoresCotizacion() {
        const fechaCotizacion = [];
    const excelCotizacionData = [
      { 'CFE Recibidos': 'Comprobante', 'cant': 'Todos' },
      { 'fechadesde': 'Fecha desde', 'valor': '01/07/2023'},
      { 'fechahasta': 'Fecha hasta', 'valor': '31/07/2023'},
      { 'CFE Recibidos': "Fecha", 'tipoCFE': "Tipo CFE", 'seroe': "Serie", 'numero' : "Número", 'rutemisor' : "RUT Emisor", 'moneda' : "Moneda",
      'montoneto': "Monto Neto",'ivaventas': "IVA Ventas",'montototal': "Monto Total",'montoRet/Per': "Monto Ret/Per",'montoCredFiscal': "Monto Cred. Fiscal",
      'tipoCambio': "Tipo de Cambio de la Fecha", 'montoendolares': 'Monto en dolares'
      }
    ]
    for (let index = 0; index < cotizacionUSD?.length; index++) {
    if(cotizacionUSD[index]['codigoiso_monedacotiz'] === 'USD'){
      var cotizacion = {
        'montoventa': cotizacionUSD[index]['montoventa'],
        'fecha': cotizacionUSD[index]['fecha'].slice(0,10)
      }
      fechaCotizacion.push(cotizacion);
    }
  }
    for (let index = 0; index < impoCompraVenta?.length; index++) {
      const fechaBuscada = getCloserDate(fechaCotizacion, impoCompraVenta[index]['fecha'].replace(/-/g, '/'))
      const resultado = fechaCotizacion.find(item => item.fecha.replace(/-/g, '/') === fechaBuscada);
      const montoendolares = impoCompraVenta[index]['moneda'] === 'UYU'? impoCompraVenta[index]['montototal'] / resultado.montoventa: impoCompraVenta[index]['montototal'];
      console.log(montoendolares? montoendolares.toFixed(2) : null)
        var nuevoImporte = {
        fecha: impoCompraVenta[index]['fecha'],
        tipoCFE: impoCompraVenta[index]['tipoCFE'],
        serie: impoCompraVenta[index]['serie'],
        numero: impoCompraVenta[index]['numero'],
        RUTEmisor: impoCompraVenta[index]['RUTEmisor'],
        moneda: impoCompraVenta[index]['moneda'],
        montoneto: impoCompraVenta[index]['montoneto'],
        montoiva: impoCompraVenta[index]['montoiva'],
        montototal: impoCompraVenta[index]['montototal'],
        montoretper: impoCompraVenta[index]['montoretper'],
        montocredfiscal: impoCompraVenta[index]['montocredfiscal'],
        tipodecambiodelafecha: resultado.montoventa.replace(/(\.\d{2})\d+$/, '$1'),
        montoendolares: montoendolares? montoendolares.toFixed(2) : 0
      };
      excelCotizacionData.push(nuevoImporte);
    }
    setTypeSuccess("Se calculó correctamente la cotización del monto en dolares")
    setExcelDataCotizacion(excelCotizacionData)
    const timer = setTimeout(() => {
      setTypeSuccess(null);
    }, 3000);
    return () => clearTimeout(timer)
  };
  

  const reiniciarExcel = () => {
    setExcelDataCotizacion(null); // Establece el estado a 0
  };

  console.log(excelDataCotizacion)


  useEffect(() => {
    if (excelData) {
      valores(excelData);
    }
    getCotizacionUSD();
    const timer = setTimeout(() => {
      setTypeSuccess(null);
    }, 3000);
    return () => clearTimeout(timer), valores(excelData);
  }, [excelData]);
  
  console.log(fileInputRef)

  return (
    <div className="wrapper">
      {/*<h3 className="title">SOS</h3>*/}
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
            ref={fileInputRef}
            required
            onChange={(e, excelData) => {
              handleFile(e);
              valores(excelData);
              const fileName = e.target.files[0].name;
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
      {/* <div><Buttons excelData={excelData} excelCotizacionData={excelDataCotizacion} typeError={typeError} 
      addDataBase={addDataBase}
      valoresCotizacion={valoresCotizacion}
      reiniciarExcel={reiniciarExcel} 
      deleteDataBase={deleteDataBase}
    /></div>     */
    }
      <div className="dataBase">
          <button
          className={`btn ${typeError ===
            "Debes seleccionar y examinar tu archivo XLS o XLSX antes de enviar a la base de datos" ||
            excelData !== null || excelDataCotizacion !==null || typeError || fileName === null ? "btn-no" : ""}`}
            type="submit"
            onClick={() => valores(excelData)}
          >
            ANALIZAR ARCHIVO
          </button>
           <button type="button"
          className={`btn ${typeError || excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
          onClick={valoresCotizacion}
          >
          AGREGAR COTIZACION USD{" "}
          <span className="icons">
            {/* <FaHandHoldingUsd /> */}
          </span>
        </button>
        <button type="button"
          className={`btn-no ${excelData === null || excelDataCotizacion?.lenght !== 0? "btn-no" : ""}`}
          // className={`btnDataBaseRazonSocial ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
          // onClick={valoresCotizacion}
          >
          AGREGAR RAZÓN SOCIAL{" "}
          <span className="icons">
            {/* <FaHandHoldingUsd /> */}
          </span>
        </button>
        <button type="button"
          className={`btn-no ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
          // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
          // onClick={valoresCotizacion}
          >
          DESCARGAR XLS{" "}
          <span className="icons">
            {/* <FaHandHoldingUsd /> */}
          </span>
        </button>
        <button type="button"
             className={`btn ${excelDataCotizacion === null ? "btn-no" : ""}`}
             // className={`btnDataBaseDelete  ${typeError ? "btn-no" : ""}`}
             onClick={reiniciarExcel}
             >
          REINICIAR TABLA{" "}
          <span className="icons">
            {/* <FiRefreshCw /> */}
          </span>
        </button>
        <button type="button"
          className={`btn ${excelData === null || excelDataCotizacion !==null || typeError? "btn-no" : ""}`}
          onClick={addDataBase}
        >
          ENVIAR A BASE DE DATOS{" "}
          <span className="icons">
            {/* <BsDatabaseAdd /> */}
          </span>
        </button>
        <button type="button"
             className={`btn-no`}
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
          {excelDataCotizacion?
          <View excelData={excelDataCotizacion} title={title}/>:
          <View excelData={excelData} title={title}/>
          }
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
