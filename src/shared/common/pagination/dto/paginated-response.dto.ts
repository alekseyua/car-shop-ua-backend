import { MetaDto } from "./meta.dto";

export class PaginationResponse<T> {
    "data": T[]
    "meta": MetaDto
}