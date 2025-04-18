// utils/path.ts

export function getPathWithoutIdInForm(pathname: string): string {
    const paths = pathname.split('/');
    const lastSegment = paths[paths.length - 1];
    if (lastSegment === 'detail' || lastSegment === 'edit') {
        return paths.slice(0, paths.length - 2).join('/');
    } else if (lastSegment === 'add') {
        return paths.slice(0, paths.length - 1).join('/');
    }
    return pathname;
}

export function getIdFromPath(pathname: string): string {
    const paths = pathname.split('/');
    const lastSegment = paths[paths.length - 1];
    if (lastSegment === 'detail' || lastSegment === 'edit') {
        return paths[paths.length - 2];
    }
    return '';
}
