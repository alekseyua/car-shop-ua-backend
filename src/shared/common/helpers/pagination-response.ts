import { PaginationResponse } from "../pagination/dto/paginated-response.dto";

export function createRequestPagination<T> (
    data: T[],
    page: number = 1,
    limit: number = 5,
    total: number
):PaginationResponse<T>{
    return ({
        data: data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit)
        }
    })
}