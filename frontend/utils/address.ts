export const displayAddress = (address: string) =>{
    return address.substring(0, 6) + '...' + address.substring(38);
}