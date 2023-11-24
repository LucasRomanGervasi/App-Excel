const compras = [];
const retencionesFiscales = [];
const remitos = [];
const pagos = [];
const hojaData = [];
const comprasData = [];
const retencionesData = [];
const remitosData = [];
const pagosData = [];


export function dowloadBuys(dataMemory) {
  const constante = [];
      for (let i = 0; i <= 3; i++) {
        if (i in dataMemory) {
              constante[i] = dataMemory[i];
            }
          }
      
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

      // Crear una hoja de Excel
      if (constante.length > 0) {
        hojaData.push(
        ["CFE Recibidos"],
        [],
          ...constante.slice(0, 3).map((individualExcelData) => {
            return Object.values(individualExcelData);
          }),
          [],
        );
      }
      
      
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
    }

    export { compras, retencionesFiscales, remitos, pagos, hojaData, comprasData, retencionesData, remitosData, pagosData};

