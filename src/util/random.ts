
export const randomlyInsert = (array : any[], element : any) : any[] => {
    const random : number = Math.floor(Math.random() * array.length);
    return [...array.slice(0, random), element, ...array.slice(random)];
}