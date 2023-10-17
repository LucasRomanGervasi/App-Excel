export const getOrderDataNew = (dataNew) => {
const efactura = [];
const eresguardo = [];
const eremito = [];
let dataNewOrdenado = [];
for (let index = 0; index < dataNew?.length; index++) {
    if (dataNew[index]['tipoCFE'] === "e-Factura" || dataNew[index]['tipoCFE'] === "Nota de Crédito de e-Factura") {
      efactura.push(dataNew[index]);
    } else if (dataNew[index]['tipoCFE'] === "e-Resguardo") {
      eresguardo.push(dataNew[index]);
    }
    else if (dataNew[index]['tipoCFE'] === "e-Remito") {
      eremito.push(dataNew[index]);
    }
  }
  dataNewOrdenado = dataNewOrdenado.concat(efactura, eresguardo,eremito);
  return dataNewOrdenado
}