import { PaginationResponse } from "../interface/paginted-response.interface";

export function createRequestPagination<T> (
    data: T[],
    page: number = 1,
    limit: number = 5,
    total: number
):PaginationResponse<T>{
    return ({
        data: [],
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit)
        }
    })
}