import { ResponseCatalogCarDto } from "./response-catalog.dto";

export class CreateCatalogDto {
    "groupId": number;
    "groupCode": string;
    "subGroupCode": string;
    "count": number;
    "typeId": number;
}
