// export function getCloserDate(fechas, fechaObjetivo) {
//   // Función para convertir fechas en objetos Date
//   const fechasEdit = Object.values(fechas).map(item => item.fecha.replace(/-/g, '/'));
//   // Convierte la fecha objetivo en un objeto Date
//   const fechaObjetivoDate = new Date(fechaObjetivo);
//   // Resta un día a la fecha
//   fechaObjetivoDate.setDate(fechaObjetivoDate.getDate() - 1);
//   // Inicializa la fecha más cercana y la diferencia mínima
//   let fechaMasCercana = fechasEdit[0];
//   let diferenciaMinima = Math.abs(fechaObjetivoDate - new Date(fechasEdit[0]));
//   // Itera a través de las fechas
//   for (const fecha of fechasEdit) {
//     // Convierte la fecha actual en un objeto Date
//     const fechaActualDate = new Date(fecha);
    
//     // Calcula la diferencia en milisegundos entre la fecha objetivo y la fecha actual
//     const diferencia = Math.abs(fechaObjetivoDate - fechaActualDate);
//     console.log('diferencia', diferencia, 'diferenciaMinima', diferenciaMinima)
//     // Si la diferencia actual es menor que la diferencia mínima, actualiza la fecha más cercana y la diferencia mínima
//     if (diferencia < diferenciaMinima) {
//       fechaMasCercana = fecha;
//       diferenciaMinima = diferencia;
//     }
//   }

//   return fechaMasCercana;
// }

export function getCloserDate(fechas, fechaObjetivo) {
  // Función para convertir fechas en objetos Date
  const fechasEdit = Object.values(fechas).map(item => item.fecha.replace(/-/g, '/'));

  // Dividir la fecha objetivo en partes (día, mes, año)
  const parts = fechaObjetivo.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Convierte la fecha objetivo en un objeto Date con el formato dd/mm/yyyy
  const fechaObjetivoDate = new Date(year, month - 1, day); // Resta 1 al mes, ya que los meses en JavaScript van de 0 a 11

  // Resta un día a la fecha objetivo
  fechaObjetivoDate.setDate(fechaObjetivoDate.getDate() - 1);

  // Inicializa la fecha más cercana y la diferencia mínima
  let fechaMasCercana = fechasEdit[0];
  let diferenciaMinima = Math.abs(fechaObjetivoDate - new Date(fechasEdit[0]));

  // Itera a través de las fechas
  for (const fecha of fechasEdit) {
    // Calcula la diferencia en milisegundos entre la fecha objetivo y la fecha actual
    const diferencia = Math.abs(fechaObjetivoDate - new Date(fecha));
    // Si la diferencia actual es menor que la diferencia mínima, actualiza la fecha más cercana y la diferencia mínima
    if (diferencia < diferenciaMinima) {
      fechaMasCercana = fecha;
      diferenciaMinima = diferencia;
    }
  }

  return fechaMasCercana;
}