export function filterArray<T>(array: T[], id_in?: string[]): T[] {
    if(!id_in){
        return array;
    }
    else{
        return array.filter(data => {
            const { id } = data as { id: string };
            return id_in.includes(id);
        });
    }
}