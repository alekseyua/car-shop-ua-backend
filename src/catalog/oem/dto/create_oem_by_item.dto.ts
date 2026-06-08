import { ApiProperty } from "@nestjs/swagger";

export class CreateOemByItemDto {
    @ApiProperty({
        description: 'ID товара',
        example: 12345,
    })
    "comId": number
    @ApiProperty({
        description: 'Номер товара',
        example: 'FS 333-926',
    })
    "itemNo": string
    @ApiProperty({
        description: 'Код',
        example: '1755F7',
    })
    "code": string
    @ApiProperty({
        description: 'Марка',
        example: 'PEUGEOT',
    })
    "brand": string
    @ApiProperty({
        description: 'Поиск',
        example: '1755F7',
    })
    "search": string
}