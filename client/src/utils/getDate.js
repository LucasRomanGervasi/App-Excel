export const getDate = () => {

    const date = new Date();

    date.setUTCHours(date.getUTCHours() - 3);

    const isoDateArgentina = date.toISOString();

    const formattedDate = isoDateArgentina.replace('T', ' ').slice(0, 19);

    return formattedDate

}