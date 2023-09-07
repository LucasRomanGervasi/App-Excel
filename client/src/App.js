import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import logo from "./images/SOSCONTADOR.PNG";
import { BsDatabaseAdd } from "react-icons/bs";
import { getDate } from "./utils/getDate";
import axios from "axios";
import { validateDate } from "./utils/validateDate";
import ReactLoading from "react-loading";

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
      .post("https://app-excel-production.up.railway.app/data/data", {
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
    setLoading(true);
    axios
      .delete("https://app-excel-production.up.railway.app/data")
      .then(() => {
        alert("Base de datos eliminada");
        setTypeSuccess("Eliminado correctamente");
        fileInputRef("");
        setExcelData(null);
        setArchivo(null);
        setImpoCompraVenta(null);
        setLoading(false);
        fileInputRef.current.value = "";
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
        alert("Hubo un error al procesar la solicitud.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (excelData) {
      valores(excelData);
    }
    const timer = setTimeout(() => {
      setTypeSuccess(null);
    }, 2000);
    return () => clearTimeout(timer);
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
        {typeError && (
          <div className="alert" role="alert">
            {typeError}
          </div>
        )}
        {typeSuccess && (
          <div className="alertSuccess" role="alert">
            {typeSuccess}
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
        <h3 className="subtitle">Vista previa del archivo</h3>
        <h3 className="subtitleReparacion">REPARACION DEL SITIO</h3>
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
          className={`btnDataBaseDelete  ${typeError ? "btn-no" : ""}`}
          onClick={deleteDataBase}
        >
          ELIMINAR BASE DE DATOS{" "}
          <span className="icons">
            <BsDatabaseAdd />
          </span>
        </button>
      </div>
      <div className="view">
        {excelData ? (
          <div className="table-res">
            <h3 className="excelTitle">{title}</h3>
            <table className="table">
              <tbody className="excel">
                {excelData.map((individualExcelData, index) =>
                  index < 3 ? (
                    <tr key={index}>
                      {Object.keys(individualExcelData).map((key) => (
                        <td className="excelTable" key={key}>
                          {individualExcelData[key]}
                        </td>
                      ))}
                    </tr>
                  ) : (
                    <tr className="excelTableTitleContainer" key={index}>
                      {Object.keys(individualExcelData).map((key) =>
                        index === 3 ? (
                          <td className="excelTableTitle" key={key}>
                            {individualExcelData[key]}
                          </td>
                        ) : (
                          <td className="excelTableValores" key={key}>
                            {individualExcelData[key]}
                          </td>
                        )
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div>¡Aún no se ha subido ningún archivo!</div>
        )}
      </div>
    </div>
  );
}

export default App;
