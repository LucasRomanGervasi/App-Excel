export const getOrderDataNew = (data) => {
  const efactura = [];
  const eresguardo = [];
  const eremito = [];
  const efactura2 = [];
  let dataNewOrdenado = [];
  for (let index = 0; index < data?.length; index++) {
    if (data[index]['__EMPTY'] === "e-Factura" || data[index]['__EMPTY'] === "Nota de Crédito de e-Factura" || data[index]['__EMPTY'] === "Nota de Débito de e-Factura") {
      if (data[index]['__EMPTY_5'] !== 0 || 0.00 && data[index]['__EMPTY_6'] !== 0 || 0.00) {
        const values = {
          'fecha': data[index]['CFE Recibidos'],
          'tipoCFE': data[index]['__EMPTY'],
          'tipo': "compras",
          'serie': data[index]['__EMPTY_1'],
          'numero': data[index]['__EMPTY_2'],
          'RUTEmisor': data[index]['__EMPTY_3'],
          'moneda':  data[index]['__EMPTY_4'] ? data[index]['__EMPTY_4'] : "",
          'montoneto': data[index]['__EMPTY_5'].toFixed(2),
          'montoiva': data[index]['__EMPTY_6'].toFixed(2),
          'montototal': data[index]['__EMPTY_7'].toFixed(2),
          'montoretper': data[index]['__EMPTY_8'].toFixed(2),
          'montocredfiscal': data[index]['__EMPTY_9'].toFixed(2),
        }
        efactura.push(values)
      } else {
        const values = {
          'fecha': data[index]['CFE Recibidos'],
          'tipoCFE': data[index]['__EMPTY'],
          'tipo': "pagos",
          'serie': data[index]['__EMPTY_1'],
          'numero': data[index]['__EMPTY_2'],
          'RUTEmisor': data[index]['__EMPTY_3'],
          'moneda':  data[index]['__EMPTY_4'] ? data[index]['__EMPTY_4'] : "",
          'montoneto': data[index]['__EMPTY_5'].toFixed(2),
          'montoiva': data[index]['__EMPTY_6'].toFixed(2),
          'montototal': data[index]['__EMPTY_7'].toFixed(2),
          'montoretper': data[index]['__EMPTY_8'].toFixed(2),
          'montocredfiscal': data[index]['__EMPTY_9'].toFixed(2),
        }
        efactura2.push(values)
      }
    } else if (data[index]['__EMPTY'] === "e-Resguardo") {
      const values = {
        'fecha': data[index]['CFE Recibidos'],
        'tipoCFE': data[index]['__EMPTY'],
        'tipo': "retenciones fiscales",
        'serie': data[index]['__EMPTY_1'],
        'numero': data[index]['__EMPTY_2'],
        'RUTEmisor': data[index]['__EMPTY_3'],
        'moneda': data[index]['__EMPTY_4'] ? data[index]['__EMPTY_4'] : "",
        'montoneto': data[index]['__EMPTY_5'].toFixed(2),
        'montoiva': data[index]['__EMPTY_6'].toFixed(2),
        'montototal': data[index]['__EMPTY_7'].toFixed(2),
        'montoretper': data[index]['__EMPTY_8'].toFixed(2),
        'montocredfiscal': data[index]['__EMPTY_9'].toFixed(2),
      }
      eresguardo.push(values);
    }
    else if (data[index]['__EMPTY'] === "e-Remito") {
      const values = {
        'fecha': data[index]['CFE Recibidos'],
        'tipoCFE': data[index]['__EMPTY'],
        'tipo': "remitos",
        'serie': data[index]['__EMPTY_1'],
        'numero': data[index]['__EMPTY_2'],
        'RUTEmisor': data[index]['__EMPTY_3'],
        'moneda': data[index]['__EMPTY_4'] ? data[index]['__EMPTY_4'] : "",
        'montoneto': data[index]['__EMPTY_5'].toFixed(2),
        'montoiva': data[index]['__EMPTY_6'].toFixed(2),
        'montototal': data[index]['__EMPTY_7'].toFixed(2),
        'montoretper': data[index]['__EMPTY_8'].toFixed(2),
        'montocredfiscal': data[index]['__EMPTY_9'].toFixed(2),
      }
      eremito.push(values);
    }
  }
  dataNewOrdenado = dataNewOrdenado.concat(efactura, eresguardo, eremito, efactura2);
  return dataNewOrdenado
}