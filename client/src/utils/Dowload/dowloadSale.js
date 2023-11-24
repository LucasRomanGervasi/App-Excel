const hojaData1 = [];
const ventas = [];
const otros = [];
const ventasData = [];
export function dowloadSale(dataMemoryVentas) {
    const constante = [];
    for (let i = 0; i <= 3; i++) {
        if (i in dataMemoryVentas) {
              constante[i] = dataMemoryVentas[i];
            }
          }
          
          for (let i = 4; i < Object.keys(dataMemoryVentas).length; i++) {
              if (dataMemoryVentas[i]['tipo'] === 'ventas') {
                  ventas.push(dataMemoryVentas[i]);
            } else {
                otros.push(dataMemoryVentas[i]);
            }
        }

        const ventasLimite = ventas.length + 8;

        
        if (constante.length > 0) {
            hojaData1.push(
            ["CFE Emitidos"],
            [],
              ...constante.slice(0, 3).map((individualExcelData) => {
                return Object.values(individualExcelData);
              }),
              [],
            );
          }

          if (ventas.length > 0) {
            ventasData.push(
          ["Ventas"],
          [
            "Fecha", "Tipo CFE", "Tipo", "Serie", "Número", "Rut Emisor", "Razón Social",
             "Moneda", "Monto Neto UYU", "IVA Ventas UYU", "Monto Redondeo UYU", "Monto Total UYU"
          ],
              ...ventas.map((individualExcelData) => {
                delete individualExcelData['TipoCambioDeLaFecha'];
                const valoresTransformados = Object.values(individualExcelData).map((valor, i) => {
                  return i >= 8 ? Number(valor) : valor;
                });
                return valoresTransformados.slice(0, 12);
              }),
              [],
              ["", "", "", "", "", "", "", "", "Monto Neto UYU", "IVA Ventas UYU", "Monto Redondeo UYU", "Monto Total UYU"],
              ["Total", "", "", "", "", "", "", "", { t: "n", f: `=SUM(I9:I${ventasLimite})` }, { t: "n", f: `=SUM(J9:J${ventasLimite})` }, { t: "n", f: `=SUM(K9:K${ventasLimite})` }, { t: "n", f: `=SUM(L9:L${ventasLimite})` }],
              []
              );
          }
    
    }

export {hojaData1, ventas, ventasData};
