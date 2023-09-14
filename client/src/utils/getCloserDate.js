export function getCloserDate(fechas, fechaObjetivo) {
    // Función para convertir fechas en objetos Date
    


 const fechasEdit = Object.values(fechas).map(item => item.fecha.replace(/-/g, '/'));
  // Convierte la fecha objetivo en un objeto Date
  const fechaObjetivoDate = new Date(fechaObjetivo);

  // Inicializa la fecha más cercana y la diferencia mínima
  let fechaMasCercana = fechasEdit[0];
  let diferenciaMinima = Math.abs(fechaObjetivoDate - new Date(fechasEdit[0]));

  // Itera a través de las fechas
  for (const fecha of fechasEdit) {
    // Convierte la fecha actual en un objeto Date
    const fechaActualDate = new Date(fecha);

    // Calcula la diferencia en milisegundos entre la fecha objetivo y la fecha actual
    const diferencia = Math.abs(fechaObjetivoDate - fechaActualDate);

    // Si la diferencia actual es menor que la diferencia mínima, actualiza la fecha más cercana y la diferencia mínima
    if (diferencia < diferenciaMinima) {
      fechaMasCercana = fecha;
      diferenciaMinima = diferencia;
    }
  }

  return fechaMasCercana;
}
