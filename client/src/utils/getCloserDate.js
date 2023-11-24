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
  // Resta un día a la fecha objetivo para encontrar la fecha anterior
  fechaObjetivoDate.setDate(fechaObjetivoDate.getDate());

  // Inicializa la fecha más cercana y la diferencia mínima
  let fechaMasCercana = fechasEdit[0];
  let diferenciaMinima = Math.abs(fechaObjetivoDate - new Date(fechasEdit[0]));

  // Itera a través de las fechas
  for (const fecha of fechasEdit) {
    // Calcula la diferencia en milisegundos entre la fecha objetivo y la fecha actual
    const diferencia = Math.abs(fechaObjetivoDate - new Date(fecha));
    // Si la diferencia actual es menor o igual que la diferencia mínima y la fecha actual es menor que la fecha objetivo,
    // actualiza la fecha más cercana y la diferencia mínima
    if (diferencia <= diferenciaMinima && new Date(fecha) < fechaObjetivoDate) {
      fechaMasCercana = fecha;
      diferenciaMinima = diferencia;
    }
  }

  return fechaMasCercana;
}