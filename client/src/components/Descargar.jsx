import React, { useEffect, useState } from "react";
import View from "./Compras/View";
import { Link } from "react-router-dom";
import ReactLoading from "react-loading";
import logo from "../images/asystax.png";
import * as XLSX from "xlsx";
import { dowloadBuys } from "../utils/Dowload/dowloadBuys";
import  {compras, retencionesFiscales, remitos, pagos, hojaData, comprasData, retencionesData, remitosData, pagosData} from "../utils/Dowload/dowloadBuys";
import { dowloadSale } from "../utils/Dowload/dowloadSale";
import { hojaData1, ventasData, ventas } from "../utils/Dowload/dowloadSale";

function Descargar() {
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
    if (dataMemory === null && dataMemoryVentas === null) {
      setTypeError("Error al descargar el archivo")
    }
    if (dataMemory !== null && dataMemoryVentas === null) {
      console.log("memori")
      dowloadBuys(dataMemory)
      
      //COMPRAS
      const comprasLimite = compras.length + 8;
      const retencionesFiscalesInicio = comprasLimite + 6;
      const retencionesFiscalesLimite = retencionesFiscalesInicio + retencionesFiscales.length;
      const remitosInicio = retencionesFiscalesLimite;
      const remitosLimite = remitosInicio + remitos.length;
      const pagosInicio = remitosLimite;
      const pagosLimite = pagosInicio + pagos.length;
      const totalesCompra = comprasLimite +3;
      const totalesRetenciones = retencionesFiscales.length + totalesCompra + 6;
      const libro = XLSX.utils.book_new();
      
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
      hoja['!cols'] = Array(18).fill({ wch: 12 });    
      // hoja2['!cols'] = Array(18).fill({ wch: 15 }); 
      const columnConfig = { wch: 15, bold: true }; // Puedes ajustar 'wch' (ancho) y otras propiedades según tus necesidades
      // Luego, asigna el objeto de configuración a la quinta columna (índice 4)
      // hoja2['!cols'] = hoja2['!cols'] || [];
      // hoja2['!cols'][4] = columnConfig;
      if( dataMemory !== null && dataMemoryVentas === null){
        // XLSX.utils.book_append_sheet(libro, hoja1, "CFE Emitidos");
        XLSX.utils.book_append_sheet(libro, hoja, "CFE Recibidos");
        // XLSX.utils.book_append_sheet(libro, hoja2, "Resumen de Impuestos" );
      }
      const timer = setTimeout(() => {
        XLSX.writeFile(libro, "Asystax - Resumen Impositivo.xlsx");
        setLoading(false);
        setTypeSuccess("Se descargó el archivo correctamente");
        setExcelFinalDowload("descargado");
        localStorage.removeItem("dataNew");
        localStorage.removeItem("title");
        localStorage.removeItem("dataNewVentas");
        localStorage.removeItem("titleVentas");
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

    if (dataMemory === null && dataMemoryVentas !== null) {
      
  //VENTAS
      dowloadSale(dataMemoryVentas)

      const totalesVenta = ventas.length + 11;
      const libro = XLSX.utils.book_new();

      const hoja1 = XLSX.utils.aoa_to_sheet([
        ...hojaData1,
        ...ventasData
        // Agrega las partes de remitos y pagos de manera similar
      ]);
          // Agregar la hoja al libro
          for (const cellRef in hoja1) {
            if (hoja1.hasOwnProperty(cellRef)) {
              const cell = hoja1[cellRef];
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
          hoja1['!cols'] = Array(18).fill({ wch: 13 }); 
          // hoja2['!cols'] = Array(18).fill({ wch: 15 }); 
          // const columnConfig = { wch: 15, bold: true }; // Puedes ajustar 'wch' (ancho) y otras propiedades según tus necesidades
          // // Luego, asigna el objeto de configuración a la quinta columna (índice 4)
          // hoja2['!cols'] = hoja2['!cols'] || [];
          // hoja2['!cols'][4] = columnConfig;
          if( dataMemory === null && dataMemoryVentas !== null){
            XLSX.utils.book_append_sheet(libro, hoja1, "CFE Emitidos");
            // XLSX.utils.book_append_sheet(libro, hoja2, "Resumen de Impuestos" );
          }
          const timer = setTimeout(() => {
            XLSX.writeFile(libro, "Asystax - Resumen Impositivo.xlsx");
            setLoading(false);
            setTypeSuccess("Se descargó el archivo correctamente");
            setExcelFinalDowload("descargado");
            localStorage.removeItem("dataNew");
            localStorage.removeItem("title");
            localStorage.removeItem("dataNewVentas");
            localStorage.removeItem("titleVentas");
            window.location.href = "/";
            // Agregar otro setTimeout aquí
            setTimeout(() => {
              // Tu código aquí para el segundo setTimeout
              setTypeSuccess(null);
            }, 4000); // Por ejemplo, 2 segundos después del primer setTimeout
          }, 4000);
    
          setTypeSuccess(null);
          return () => clearTimeout(timer);
    } else{
      
      dowloadBuys(dataMemory)
      
      //COMPRAS
      const comprasLimite = compras.length + 8;
      const retencionesFiscalesInicio = comprasLimite + 6;
      const retencionesFiscalesLimite = retencionesFiscalesInicio + retencionesFiscales.length;
      const remitosInicio = retencionesFiscalesLimite;
      const remitosLimite = remitosInicio + remitos.length;
      const pagosInicio = remitosLimite;
      const pagosLimite = pagosInicio + pagos.length;
      const totalesCompra = comprasLimite +3;
      const totalesRetenciones = retencionesFiscales.length + totalesCompra + 6;
      const libro = XLSX.utils.book_new();
      
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
      
      
      //VENTAS
      dowloadSale(dataMemoryVentas)

      const totalesVenta = ventas.length + 11;
      
      const hoja1 = XLSX.utils.aoa_to_sheet([
        ...hojaData1,
        ...ventasData
        // Agrega las partes de remitos y pagos de manera similar
      ]);
          // Agregar la hoja al libro
          for (const cellRef in hoja1) {
            if (hoja1.hasOwnProperty(cellRef)) {
              const cell = hoja1[cellRef];
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
          
      //RESUMEN DE IMPUESTOS
      const hoja2 = XLSX.utils.aoa_to_sheet([
        ["Período", `${dataMemory[1]['valor']}`+' a '+`${dataMemory[2]['valor']}`],
        ["Resumen de Impuestos"],
          [],
          [],
          ["IVA", "", "", "IRAE", "", "", "ICOSA"],
          ["Ventas", { t: "n", f: `='CFE Emitidos'!L${totalesVenta}`}, "", "IRAE Mínimo", 9940, "", "ICOSA A Pagar"],
          ["IVA Ventas", { t: "n", f: `='CFE Emitidos'!J${totalesVenta}`}, "", "IRAE del Mes", { t: "n", f: `IF(B6*0.027>E6, B6*0.027, E6)` }, "", "ICOSA del Mes", { t: "n", f: `=H6` }],
          ["Total Compras", { t: "n", f: `='CFE Recibidos'!M${totalesCompra}`}],
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
      hoja1['!cols'] = Array(18).fill({ wch: 13 }); 
      hoja2['!cols'] = Array(18).fill({ wch: 15 }); 
      const columnConfig = { wch: 15, bold: true }; // Puedes ajustar 'wch' (ancho) y otras propiedades según tus necesidades
      // Luego, asigna el objeto de configuración a la quinta columna (índice 4)
      hoja2['!cols'] = hoja2['!cols'] || [];
      hoja2['!cols'][4] = columnConfig;
      if( dataMemory !== null && dataMemoryVentas !== null){
        XLSX.utils.book_append_sheet(libro, hoja1, "CFE Emitidos");
        XLSX.utils.book_append_sheet(libro, hoja, "CFE Recibidos");
        XLSX.utils.book_append_sheet(libro, hoja2, "Resumen de Impuestos" );
      }
      const timer = setTimeout(() => {
        XLSX.writeFile(libro, "Asystax - Resumen Impositivo.xlsx");
        setLoading(false);
        setTypeSuccess("Se descargó el archivo correctamente");
        setExcelFinalDowload("descargado");
        localStorage.removeItem("dataNew");
        localStorage.removeItem("title");
        localStorage.removeItem("dataNewVentas");
        localStorage.removeItem("titleVentas");
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
  <div >
  <div className="containerLogo">
        <img className="logo" src={logo} alt="logo"></img>
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
        <div className="dataBaseDescarga">
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
            className={`btn ${dataMemory === null && dataMemoryVentas === null || excelFinalDowload === "descargado" ? "btn-no" : ""}`}
            // className={`btnDataBaseDescargarXLS ${excelData === null || excelDataCotizacion !==null ? "btn-no" : ""}`}
            onClick={descargarXLS}
            >
             DESCARGAR POSICIÓN IMPOSITIVA{" "}
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
