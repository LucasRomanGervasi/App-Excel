export function convertISO(numeroExcel) {
  const fechaBase = new Date(1900, 0, 1);

  const ajusteExcel = 2;

  const nuevaFecha = new Date(fechaBase.getTime() + (numeroExcel - ajusteExcel) * 24 * 60 * 60 * 1000);

  const dia = nuevaFecha.getDate();
  const mes = nuevaFecha.getMonth() + 1; 
  const año = nuevaFecha.getFullYear();

  const fechaFormateada = `${dia}/${mes}/${año}`;

  return fechaFormateada;
}
