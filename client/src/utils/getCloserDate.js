const getCloserDate = (date) => {

    const fechas = ["22/07/2023", "23/07/2023", "24/07/2023"];
    const fechaObjetivo = "25/08/2023";
    
    // Función para convertir fechas en objetos Date
    function convertirFecha(fecha) {
        const partes = fecha.split("/");
        // El formato de Date es (año, mes - 1, día)
        return new Date(partes[2], partes[1] - 1, partes[0]);
    }
    
    // Convertir la fecha objetivo en objeto Date
    const fechaObjetivoObj = convertirFecha(fechaObjetivo);
    
    // Función para encontrar la fecha más cercana
    function encontrarFechaMasCercana(fechas, fechaObjetivo) {
        const fechasObj = fechas.map(fecha => convertirFecha(fecha));
    
        // Inicializar la fecha más cercana como la primera fecha del array
        let fechaMasCercana = fechasObj[0];
        let diferenciaMasCercana = Math.abs(fechaObjetivo - fechaMasCercana);
    
        // Iterar sobre las fechas y encontrar la más cercana
        for (const fecha of fechasObj) {
            const diferencia = Math.abs(fechaObjetivo - fecha);
            if (diferencia < diferenciaMasCercana) {
                fechaMasCercana = fecha;
                diferenciaMasCercana = diferencia;
            }
        }
    
        return fechaMasCercana.toLocaleDateString();
    }
    
    // Encontrar la fecha más cercana
    const fechaMasCercana = encontrarFechaMasCercana(fechas, fechaObjetivoObj);
    
    console.log("La fecha más cercana es:", fechaMasCercana);
}