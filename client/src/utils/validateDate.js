export const validateDate = (date) => {
    if(typeof date !== "string"){
        return false
    }
    if(!date.includes("/")){
        return false
    }
    return true
}