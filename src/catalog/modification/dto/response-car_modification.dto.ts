import { ApiProperty } from '@nestjs/swagger';

export class ResponseCarModificationDto {
    @ApiProperty({
        example: 1,
        description: 'ID модификации',
    })
    "id": Number;

    @ApiProperty({
        example: 119512,
        description: 'ID модификации в Autotech',
    })
    "modificationAutotechId": Number;

    @ApiProperty({
        example: '1.4 (348)',
        description: 'Название модификации',
    })
    "typeName": String | null;

    @ApiProperty({
        example: '2016.03 - ',
        description: 'Период выпуска',
    })
    "typeRange": String | null;

    @ApiProperty({
        example: '125',
        description: 'Мощность в кВт',
    })
    "kw": String | null;

    @ApiProperty({
        example: '170',
        description: 'Мощность в лошадиных силах',
    })
    "hp": String | null;

    @ApiProperty({
        example: 1368,
        description: 'Объём двигателя в см³',
    })
    "ccmTech": Number | null;

    @ApiProperty({
        example: '1.4',
        description: 'Объём двигателя',
    })
    "capacity": any;

    @ApiProperty({
        example: 4,
        description: 'Количество цилиндров',
    })
    "cylinders": Number | null;

    @ApiProperty({
        example: 4,
        description: 'Количество клапанов',
    })
    "valve": Number | null;

    @ApiProperty({
        example: 0,
        description: 'Тоннаж',
    })
    "tonnage": Number | null;

    @ApiProperty({
        example: false,
        description: 'Активна ли модификация',
    })
    "active": Boolean;

    @ApiProperty({
        example: '',
        description: 'Изображение модификации',
    })
    "image": String | null;

    @ApiProperty({
        example: 1,
        description: 'ID типа топлива',
    })
    "fuelId": Number;

    @ApiProperty({
        example: 1,
        description: 'ID типа двигателя',
    })
    "engineTypeId": Number;

    @ApiProperty({
        example: 1,
        description: 'ID системы подачи топлива',
    })
    "fuelPreparationId": Number;

    @ApiProperty({
        example: 1,
        description: 'ID типа кузова',
    })
    "bodyTypeId": Number;

    @ApiProperty({
        example: 1,
        description: 'ID типа привода',
    })
    "driveTypeId": Number;

    @ApiProperty({
        example: 1,
        description: 'ID модели автомобиля',
    })
    "modelId": Number;

    @ApiProperty({
        example: {
            model: 'Astra'
        },
        description: 'Модель автомобиля',
    })
    "model": {
        "model": String;
    }
    @ApiProperty({
        example: {
            name: 'Бензин'
        },
        description: 'Тип двигателя',
    })
    "engineType": {
        "name": String;
    }
    @ApiProperty({
        example: {
            name: 'Седан'
        },
        description: 'Тип кузова',
    })
    "bodyType": {
        "name": String;
    }
}