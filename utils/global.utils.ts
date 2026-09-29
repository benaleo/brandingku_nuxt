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

// Reads a `{ id, en }` json string for the given locale; falls back to the other locale,
// then to the raw value for legacy plain-string rows.
export function getLangValue(val: string | undefined | null, locale: 'id' | 'en' = 'id'): string {
    if (!val) return '';
    try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object') {
            return parsed[locale] || parsed.id || parsed.en || '';
        }
    } catch {
        // not json
    }
    return val;
}
