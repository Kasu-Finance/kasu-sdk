/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */
export function isPlainObject(obj: any): obj is object {
    if (typeof obj !== 'object' || obj === null) return false;

    let proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}

export default function isPlain(val: any) {
    const type = typeof val;
    return (
        val == null ||
        type === 'string' ||
        type === 'boolean' ||
        type === 'number' ||
        Array.isArray(val) ||
        isPlainObject(val)
    );
}
