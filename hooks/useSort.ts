import * as React from 'react';

type SortDirection = 'asc' | 'desc';

/**
 * A custom hook for sorting an array of objects.
 * @param data - The array of data to sort.
 * @param initialKey - The initial key to sort by.
 * @param initialDirection - The initial sort direction ('asc' or 'desc').
 * @returns An object with sorted data, a sort handler, and a function to get sort direction arrows.
 */
export const useSort = <T,>(data: T[], initialKey: keyof T, initialDirection: SortDirection = 'asc') => {
    const [sortKey, setSortKey] = React.useState<keyof T>(initialKey);
    const [sortDirection, setSortDirection] = React.useState<SortDirection>(initialDirection);

    const sortedData = React.useMemo(() => {
        return [...data].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            if (valA === undefined || valB === undefined) return 0;

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortKey, sortDirection]);

    const handleSort = (key: keyof T) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const getSortArrow = (key: keyof T) => {
        if (sortKey !== key) return null;
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    return { sortedData, handleSort, getSortArrow };
};
