// utils/path.ts

export function getPathWithoutAdd(pathname: string): string {
    return pathname.replace(/\/add$/, '');
}