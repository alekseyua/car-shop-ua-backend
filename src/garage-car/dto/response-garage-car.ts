import {
  ModificationFromDb,
  NormalizeCarModification,
} from 'src/catalog/modification/dto/response-car_modification.dto';

export class GarageCarFromPrisma {
  id!: number;
  vin!: string | null;
  nickname!: string | null;
  modification!: ModificationFromDb;
}

// export class ModificationGarageCarFromPrisma {
//   id!: number;
//   modificationAutotechId!: number;
//   typeName!: string | null;
//   model!: {
//     model: string;
//     brand: {
//       mark: string;
//     };
//   };
//   typeRange!: string | null;
//   kw!: string | null;
//   hp!: string | null;

//   bodyType!: {
//     id: number;
//     name: string;
//   };

//   engineType!: {
//     id: number;
//     name: string;
//   };
// }

export class GarageCarResponseDto {
  id!: number;
  vin!: string;
  nickname!: string;
  modification!: NormalizeCarModification;
  // другие нужные поля
}

// class ModificationGarageCarResponseDto {
//   modificationAutotechId!: number;
//   typeName!: string | null;
//   model!: string;
//   brand!: string;
//   typeRange!: string;
//   engineType!: EngineType;
//   kw!: string;
//   hp!: string;
//   bodyType!: BodyType;
// }
