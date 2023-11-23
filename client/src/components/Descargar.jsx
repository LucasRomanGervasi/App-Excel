import React, { useEffect, useState } from "react";
import View from "./Compras/View";
import { Link } from "react-router-dom";
import ReactLoading from "react-loading";
import * as XLSX from "xlsx";


function Descargar({ excelData, title }) {
  const [dataMemory, setDataMemory] = useState()
  const [dataMemoryTitle, setDataMemoryTitle] = useState()
  const [dataMemoryVentas, setDataMemoryVentas] = useState()
  const [dataMemoryTitleVentas, setDataMemoryTitleVentas] = useState()
  const [excelFinalDowload, setExcelFinalDowload] = useState()
  //Estados Otros  
  const [typeError, setTypeError] = useState(null);
  const [typeSuccess, setTypeSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeInfo, setTypeInfo] = useState(null);

  //----------------------> DESCARGAR XLS<-------------------------//  
  const descargarXLS = () => {
    setLoading(true);
    if (dataMemory === null) {
      setTypeError("Error al descargar el archivo")
    } else {
       let excelFinalLength = 6
      const constante1 = [];
      for (let i = 0; i <= 3; i++) {
          if (i in dataMemory) {
              constante1[i] = dataMemory[i];
          }
      }

      // Constante que contiene los elementos restantes
      const compras = [];
      const retencionesFiscales = [];
      const remitos = [];
      const pagos = [];
      
      for (let i = 5; i < Object.keys(dataMemory).length; i++) {
          if (dataMemory[i]['tipo'] === 'compras') {
              compras.push(dataMemory[i]);
          } else if (dataMemory[i]['tipo'] === 'pagos') {
              pagos.push(dataMemory[i]);
          } else if (dataMemory[i]['tipo'] === 'resguardos' || dataMemory[i]['tipo'] === 'retenciones fiscales') {
              retencionesFiscales.push(dataMemory[i]);
          } else {
              remitos.push(dataMemory[i]);
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
          "Domicilio", "Moneda", "Tipo de Cambio de la Fecha", "Monto Neto UYU", "IVA Compras UYU", "Monto Total UYU",
          "Monto Ret/Per UYU", 
          "Monto Neto Original", "IVA Compra Original", "Monto Total Original"
        ],
          ...compras.map((individualExcelData) => {
            const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
              return i >= 9 ? Number(valor) : valor;
            });
            return valoresTransformados.slice(0, 17);
          }),
          [],
          ["", "", "", "", "", "", "", "", "", "","Monto Neto UYU", "IVA Compras UYU", "Monto Total UYU", "Monto Ret/Per UYU"],
          ["Total", "", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(K9:K${comprasLimite})` }, { t: "n", f: `=SUM(L9:L${comprasLimite})` }, { t: "n", f: `=SUM(M9:M${comprasLimite})` }, { t: "n", f: `=SUM(N9:N${comprasLimite})` }],
          []
          );
      } 
      
      const retencionesData = [];
      if (retencionesFiscales.length > 0) {
        retencionesData.push(
      ["Resguardos"],
      [
        "Fecha", "Tipo CFE", "Tipo", "Serie", "Número", "Rut Emisor", "Razón Social",
        "Domicilio", "Moneda", "Tipo de Cambio de la Fecha", "Monto Neto UYU", "IVA Compras UYU", "Monto Total UYU",
        "Monto Ret/Per UYU", 
        "Monto Neto Original", "IVA Compra Original", "Monto Total Original"
      ],
          ...retencionesFiscales.map((individualExcelData) => {
            const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
              return i >= 9 ? Number(valor) : valor;
            });
            return valoresTransformados.slice(0, 17);
          }),
          [],
          ["", "", "", "", "", "", "", "", "", "", "Monto Neto UYU", "IVA Compras UYU", "Monto Total UYU", "Monto Ret/Per UYU"],
          //["Total", "", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(J${retencionesFiscalesInicio}:J${retencionesFiscalesLimite})` }, { t: "n", f: `=SUM(K${retencionesFiscalesInicio}:K${retencionesFiscalesLimite})` }, { t: "n", f: `=SUM(L${retencionesFiscalesInicio}:L${retencionesFiscalesLimite})` }, { t: "n", f: `=SUM(M${retencionesFiscalesInicio}:M${retencionesFiscalesLimite})` }],
          ["Total", "", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(K${retencionesFiscalesInicio}:K${retencionesFiscalesLimite})` }, { t: "n", f: `=SUM(L${retencionesFiscalesInicio}:L${retencionesFiscalesLimite})` }, { t: "n", f: `=SUM(M${retencionesFiscalesInicio}:M${retencionesFiscalesLimite})` }, { t: "n", f: `=SUM(N${retencionesFiscalesInicio}:N${retencionesFiscalesLimite})` }],
          []
          );
      }

      const remitosData = [];
      if (remitos.length > 0) {
        remitosData.push(
      ["Remitos"],
      [
        "Fecha", "Tipo CFE", "Tipo", "Serie", "Número", "Rut Emisor", "Razón Social",
        "Domicilio", "Moneda", "Tipo de Cambio de la Fecha", "Monto Neto UYU", "IVA Compras UYU", "Monto Total UYU",
        "Monto Ret/Per UYU", 
        "Monto Neto Original", "IVA Compra Original", "Monto Total Original"
      ],
          ...remitos.map((individualExcelData) => {
            const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
              return i >= 9 ? Number(valor) : valor;
            });
            return valoresTransformados.slice(0, 17);
          }),
          [],
          ["", "", "", "", "", "", "", "", "", "", "Monto Neto UYU", "IVA Compras UYU", "Monto Total UYU", "Monto Ret/Per UYU"],
          //["Total", "", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(J${remitosInicio}:J${remitosLimite})` }, { t: "n", f: `=SUM(K${remitosInicio}:K${remitosLimite})` }, { t: "n", f: `=SUM(L${remitosInicio}:L${remitosLimite})` }, { t: "n", f: `=SUM(M${remitosInicio}:M${remitosLimite})` }],
          ["Total", "", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(K${remitosInicio}:K${remitosLimite})` }, { t: "n", f: `=SUM(L${remitosInicio}:L${remitosLimite})` }, { t: "n", f: `=SUM(M${remitosInicio}:M${remitosLimite})` }, { t: "n", f: `=SUM(N${remitosInicio}:N${remitosLimite})` }],
          []
          );
      }

      const pagosData = [];
      
      if (pagos.length > 0) {
        pagosData.push(
        ["Pagos"],
        [
          "Fecha", "Tipo CFE", "Tipo", "Serie", "Número", "Rut Emisor", "Razón Social",
          "Domicilio", "Moneda", "Tipo de Cambio de la Fecha", "Monto Neto UYU", "IVA Compras UYU", "Monto Total UYU",
          "Monto Ret/Per UYU", 
          "Monto Neto Original", "IVA Compra Original", "Monto Total Original"
        ],
          ...pagos.map((individualExcelData) => {
            const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
              return i >= 9 ? Number(valor) : valor;
            });
            return valoresTransformados.slice(0, 17);
          }),
          [],
          ["", "", "", "", "", "", "", "", "", "", "Monto Neto UYU", "IVA Compras UYU", "Monto Total UYU", "Monto Ret/Per UYU"],
          //["Total", "", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(J${pagosInicio}:J${pagosLimite})`}, { t: "n", f: `=SUM(K${pagosInicio}:K${pagosLimite})` }, { t: "n", f: `=SUM(L${pagosInicio}:L${pagosLimite})` }, { t: "n", f: `=SUM(M${pagosInicio}:M${pagosLimite})` }],
          ["Total", "", "", "", "", "", "", "", "", "", { t: "n", f: `=SUM(K${pagosInicio}:K${pagosLimite})`}, { t: "n", f: `=SUM(L${pagosInicio}:L${pagosLimite})` }, { t: "n", f: `=SUM(M${pagosInicio}:M${pagosLimite})` }, { t: "n", f: `=SUM(N${pagosInicio}:N${pagosLimite})` }],
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
          ["Ventas", "ingresar monto", "", "IRAE Mínimo", 9940, "", "ICOSA A Pagar"],
          ["IVA Ventas", "ingresar monto", "", "IRAE del Mes", { t: "n", f: `IF(B6*0.027>E6, B6*0.027, E6)` }, "", "ICOSA del Mes", { t: "n", f: `=H6` }],
          ["Total Compras", { t: "n", f: `='CFE Recibidos'!m${totalesCompra}`}],
          ["IVA Compras", { t: "n", f: `='CFE Recibidos'!L${totalesCompra}` }],
          ["Neto IVA", { t: "n", f: `=B7-B9` }, "", "", "", "", "IP"],
          ["IVA del Mes", { t: "n", f: `IF(B10 < 0, 0, B10)` }, "", "Resguardos de IRAE", { t: "n", f: `='CFE Recibidos'!N${totalesRetenciones}` }, "", "IP A Pagar"],
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
        localStorage.removeItem("dataNew");
        localStorage.removeItem("title");
        window.location.href = "/";
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

  
  
  useEffect(() => {
  setDataMemory(JSON.parse(localStorage.getItem('dataNew')))
  setDataMemoryTitle(JSON.parse(localStorage.getItem('title')))
  setDataMemoryVentas(JSON.parse(localStorage.getItem('dataNewVentas')))
  setDataMemoryTitleVentas(JSON.parse(localStorage.getItem('titleVentas')))
}, []);





return(
  <div>
        <div className="view">
        <h1>DESCARGAR</h1>
        </div>
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
          <Link to='/ventas' 
          className="btn"
          // className={`btn ${
            // dataMemory || dataMemoryTitle === t ? "btn-no" : ""}`}
            // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
            //onClick={}
            >
            ANTERIOR{" "}
            </Link>
            <button type="button"
            className={`btn ${dataMemory === null ||excelFinalDowload === "descargado" ? "btn-no" : ""}`}
            // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
            onClick={descargarXLS}
            >
             DESCARGAR POSICION IVA{" "}
            {/* <span className="icons">
               <FaHandHoldingUsd /> 
            </span> */}
            </button>
            </div>
          <View excelData={dataMemory === null ? null : dataMemory} title={dataMemoryTitle === null ? null : dataMemoryTitle} />
          <View excelData={dataMemoryVentas === null ? null : dataMemoryVentas} title={dataMemoryTitleVentas === null ? null : dataMemoryTitleVentas} />
      </div>
    )
}

export default Descargar;
