export const err = ( 

    message: any,
    status: boolean,
    data?: any

 ) => {

    return JSON.stringify({
        message: message,
        status: status,
        data: data
    })    

}