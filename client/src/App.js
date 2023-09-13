import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import logo from "./images/SOSCONTADOR.PNG";
import { BsDatabaseAdd } from "react-icons/bs";
import {FaHandHoldingUsd } from "react-icons/fa";
import { FaRegCircleXmark} from "react-icons/fa6";
import {AiOutlineCheckCircle} from "react-icons/ai";
import {MdDelete} from "react-icons/md";
import { getDate } from "./utils/getDate";
import axios from "axios";
import { validateDate } from "./utils/validateDate";
import ReactLoading from "react-loading";
import View from "./components/View";

function App() {
  const [excelFile, setExcelFile] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [typeError, setTypeError] = useState(null);
  const [typeSuccess, setTypeSuccess] = useState(null);
  const [title, setTitle] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [impoCompraVenta, setImpoCompraVenta] = useState();
  const [archivo, setArchivo] = useState({});
  const [cotizacionUSD, setCotizacionUSD] = useState()
  const [excelDataCotizacion, setExcelDataCotizacion] = useState()
  const [loading, setLoading] = useState(false);
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
        setExcelFile(null);
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
        //ISO IMPOCOMPRAVENTA
        let isoDate = null;
        if (validateDate(values[0])) {
          const dateParts = values[0].split("/");
          const [day, month, year] = dateParts;
          const dateObject = new Date(`${year}-${month}-${day}`);
          isoDate = dateObject.toISOString().substring(0, 10);
        } else {
          setExcelData("");
          setTypeError(
            "Hay una fecha no encontrada en el archivo, intentar nuevamente con otro archivo"
          );
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
      setImpoCompraVenta([...parsedData]);
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
        setExcelFile(null);
        setExcelData(null);
        setArchivo(null);
        setImpoCompraVenta(null);
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
        setExcelFile(null);
        setExcelData(null);
        setArchivo(null);
        setImpoCompraVenta(null);
        fileInputRef.current.value = "";
        setLoading(false); 
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
        alert("Hubo un error al procesar la solicitud.");
        setLoading(false); 
      });
  };

const valoresCotizacion = () => {
  // // Inicializar un objeto para almacenar las fechas más cercanas
  // const fechasMasCercanas = {};

  // // Recorrer todas las fechas de cotizacionUSD
  // cotizacionUSD.forEach((cotizacion, cotizacionIndex) => {
  //   const fechaCotizacionDeseada = cotizacion["fecha"].substring(0, 10);
  //   const montoCmabioFecha = cotizacion[]
  //   // Inicializar la fecha más cercana para esta cotización
  //   let fechaMasCercana = null;

  //   // Recorrer el array impoCompraVenta para encontrar la fecha más cercana
  //   impoCompraVenta.forEach((compraVenta) => {
  //     const fechaCompraVenta = new(compraVenta["fecha"]);

  //     // Verificar si la fecha es más cercana a la fecha de cotización deseada
  //     if (!fechaMasCercana || Math.abs(fechaCompraVenta - fechaCotizacionDeseada) < Math.abs(fechaMasCercana - fechaCotizacionDeseada)) {
  //       fechaMasCercana = fechaCompraVenta;
  //     }
  //   });

  //   // Almacenar la fecha más cercana en el objeto de fechasMasCercanas
  //   fechasMasCercanas[cotizacionIndex] = fechaMasCercana;
  // });
  // console.log("Fechas más cercanas:", fechasMasCercanas);
  console.log("excelData:", excelData)
  console.log("impo Compra Venta:", impoCompraVenta )
  console.log("cotizacion:", cotizacionUSD)
};
  

  const getCotizacionUSD = () => {
    setLoading(true);
    axios
    .get("https://app-excel-production.up.railway.app/cotizacion-usd")
    .then((response) => {
      setCotizacionUSD(response.data)
      setLoading(false)
      valoresCotizacion()
    })
    .catch((error) => {
      console.log("eeror")
      setLoading(false)
    });
  };


  useEffect(() => {
    if (excelData) {
      valores(excelData);
    }
    const timer = setTimeout(() => {
      setTypeSuccess(null);
    }, 2000);
    return () => clearTimeout(timer), valores(excelData);
  }, [excelData]);


  return (
    <div className="wrapper">
      {/*<h3 className="title">SOS</h3>*/}
      <div className="containerLogo">
        <img className="logo" src={logo} alt="logo"></img>
      </div>

      <div className="containerForm">
        <form className="form" onSubmit={handleFileSubmit}>
          <div>
            <input
              type="file"
              id="input-file"
              className="form-control"
              ref={fileInputRef}
              required
              onChange={(e, excelData) => {
                handleFile(e);
                valores(excelData);
              }}
            />
          </div>
          {typeError ===
            "Debes seleccionar y examinar tu archivo XLS o XLSX antes de enviar a la base de datos" ||
          typeError === null ? (
            <button
              type="submit"
              onClick={() => valores(excelData)}
              className="btn"
            >
              {" "}
              EXAMINAR ARCHIVO{" "}
              {/*<span className="icons"><BsArrowDownCircle/></span>*/}
            </button>
          ) : (
            <button className="btn-no">
              EXAMINAR ARCHIVO{" "}
              {/*<span className="icons"><BsArrowDownCircle/></span>*/}
            </button>
          )}
        </form>
        {typeError ===  "Hay una fecha no encontrada en el archivo, intentar nuevamente con otro archivo" || typeError === null ? (
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
      </div>

      <div className="dataBase">
        <button
          className={`btnDataBase ${typeError ? "btn-no" : ""}`}
          onClick={addDataBase}
        >
          ENVIAR A BASE DE DATOS{" "}
          <span className="icons">
            <BsDatabaseAdd />
          </span>
        </button>
        <button
          className={`btnDataBaseCotizacion ${excelData === null ? "btn-no" : ""}`}
          onClick={getCotizacionUSD}
        >
          AGREGAR COTIZACION USD{" "}
          <span className="icons">
            <FaHandHoldingUsd />
          </span>
        </button>
        <button
          className={`btnDataBaseDelete  ${typeError ? "btn-no" : ""}`}
          onClick={deleteDataBase}
        >
          ELIMINAR BASE DE DATOS{" "}
          <span className="icons">
            <MdDelete />
          </span>
        </button>
      </div>
      <div className="view">
          <View excelData={cotizacionUSD? excelDataCotizacion: excelData} title={title}/>
      </div>
      <div style={{margin:'10px 20px'}}>
         {typeError ===
            "Hay una fecha no encontrada en el archivo, intentar nuevamente con otro archivo" ? (
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
