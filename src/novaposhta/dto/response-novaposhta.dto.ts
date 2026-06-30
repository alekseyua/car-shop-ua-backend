import { ApiProperty } from '@nestjs/swagger';

export class CityResponseDto {
    @ApiProperty()
    "Description": string;

    @ApiProperty()
    "DescriptionRu": string;

    @ApiProperty({
        description: 'UUID города',
    })
    "Ref": string;

    @ApiProperty()
    "Delivery1": string;

    @ApiProperty()
    "Delivery2": string;

    @ApiProperty()
    "Delivery3": string;

    @ApiProperty()
    "Delivery4": string;

    @ApiProperty()
    "Delivery5": string;

    @ApiProperty()
    "Delivery6": string;

    @ApiProperty()
    "Delivery7": string;

    @ApiProperty({
        description: 'UUID области',
    })
    "Area": string;

    @ApiProperty({
        description: 'UUID типа населенного пункта',
    })
    "SettlementType": string;

    @ApiProperty()
    "IsBranch": string;

    @ApiProperty()
    "PreventEntryNewStreetsUser": string;

    @ApiProperty()
    "CityID": string;

    @ApiProperty({
        example: 'село',
    })
    "SettlementTypeDescription": string;

    @ApiProperty({
        example: 'село',
    })
    "SettlementTypeDescriptionRu": string;

    @ApiProperty({
        example: 1,
    })
    "SpecialCashCheck": number;

    @ApiProperty({
        example: 'Полтавська',
    })
    "AreaDescription": string;

    @ApiProperty({
        example: 'Полтавская',
    })
    "AreaDescriptionRu": string;
}