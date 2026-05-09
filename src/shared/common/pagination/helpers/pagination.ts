
export const buildPagination = (page: number = 1, limit: number = 5): {
    skip: number; take: number;
} => {
    const s = (page - 1) * limit;
    return {
        skip: s,
        take: limit,
    }
}