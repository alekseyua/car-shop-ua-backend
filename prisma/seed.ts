import { PrismaClient } from "../generated/prisma/client";
import rawModels from '../../car-shop-ua-parser/data/listModels.json';
import rawBrands from '../../car-shop-ua-parser/data/listBrands.json';
import rawModification from '../../car-shop-ua-parser/data/listModification.json';

type Modification = {
  markId: number
  typeId: number
  modelId: number
  sort: number
  typeName: string
  typeRange: string
  engines: string
  kw: string
  hp: string
  ccmTech: number
  capacity: number
  cylinders: number
  valve: number
  fuel: string
  engineType: string
  fuelPreparation: string
  bodyType: string
  driveType: string
  tonnage: number
  active: boolean
  mark: string
  model: string
  image: string
}
const prisma = new PrismaClient();

async function main() {
    console.log('🚗 Seeding start...');
    // console.log('🚗 Seeding brands...');
    // for (const b of rawBrands.brandsResponse) {
    //     // // 1. создаём или находим бренд
    //     const brand = await prisma.brand.upsert({
    //         where: { mark: b.mark },
    //         update: {},
    //         create: {
    //             mark: b.mark,
    //             active: b.active,
    //             image: null,
    //             markAutotechId: b.markId
    //         }
    //     })
    // }
    // // create models
    // console.log('🚗 Seeding models...');

    // for(const m of rawModels.flat()) {
    //     const brand = await prisma.brand.findUnique({
    //         where: { markAutotechId: m.markId }
    //     })
    //     if(!brand){
    //         console.log('Brand not found for mode ', m.model);
    //         continue;
    //     }
    //     await prisma.model.upsert({
    //         where:{
    //             brandId_modelAutotechId:{
    //                 brandId: brand.id,
    //                 modelAutotechId: m.modelId
    //             }
    //         },
    //         update: {},
    //         create: {
    //             model: m.model,
    //             modelAutotechId:m.modelId,
    //             range: m.modelRange,
    //             active: m.active,
    //             image: null,
    //             brandId: brand.id
    //         }
    //     });
    // }

    console.log('Seeding prepare fuel, engineType, fuelPreparation, bodyType ...')
        const mods = rawModification as Modification[][];
        const fuelsSet = new Set<string>()
        const engineTypesSet = new Set<string>()
        const fuelPrepSet = new Set<string>()
        const bodyTypesSet = new Set<string>()
        const driveTypesSet = new Set<string>()

        for (const mod of mods.flat()) {
            fuelsSet.add(mod.fuel)
            engineTypesSet.add(mod.engineType)
            fuelPrepSet.add(mod.fuelPreparation)
            bodyTypesSet.add(mod.bodyType)
            driveTypesSet.add(mod.driveType)
        }
        await prisma.fuel.createMany({
            data: [...fuelsSet].map(name => ({ name })),
            skipDuplicates: true,
        });

        await prisma.engineType.createMany({
            data: [...engineTypesSet].map(name => ({ name })),
            skipDuplicates: true,
        });
        
        await prisma.fuelPreparation.createMany({
            data: [...fuelPrepSet].map(name => ({ name })),
            skipDuplicates: true,
        });
                
        await prisma.bodyType.createMany({
            data: [...bodyTypesSet].map(name => ({ name })),
            skipDuplicates: true,
        });
                        
        await prisma.driveType.createMany({
            data: [...driveTypesSet].map(name => ({ name })),
            skipDuplicates: true,
        });

        const fuels = await prisma.fuel.findMany();
        const fuelMap = new Map(fuels.map(f => [f.name, f.id]));
        const engineTypes = await prisma.engineType.findMany();
        const engineTypeMap = new Map(engineTypes.map(e => [e.name, e.id]));
        const fuelPreparations = await prisma.fuelPreparation.findMany();
        const fuelPrepMap = new Map(fuelPreparations.map(f => [f.name, f.id]));
        const bodyTypes = await prisma.bodyType.findMany();
        const bodyTypeMap = new Map(bodyTypes.map(b => [b.name, b.id]));
        const driveTypes = await prisma.driveType.findMany();
        const driveTypeMap = new Map(driveTypes.map(d => [d.name, d.id]));
        
        const prepared: any[] = []
    console.log('Seeding modification ...')

        for (const mod of mods.flat()) {
            const fuelId = fuelMap.get(mod.fuel);
            const engineTypeId = engineTypeMap.get(mod.engineType);
            const fuelPreparationId = fuelPrepMap.get(mod.fuelPreparation);
            const bodyTypeId = bodyTypeMap.get(mod.bodyType);
            const driveTypeId = driveTypeMap.get(mod.driveType);
            if (!fuelId || !engineTypeId || !fuelPreparationId || !bodyTypeId || !driveTypeId) {
                console.log('❌ skip mod', mod.typeId)
                continue
            }
            const models = await prisma.model.findMany()

            const modelMap = new Map(
                models.map(m => [`${m.brandId}_${m.modelAutotechId}`, m.id])
            );
            const modelId = modelMap.get(`${mod.markId}_${mod.modelId}`)
            if (!modelId) continue

            prepared.push({
                modificationAutotechId: mod.typeId,
                modelId: modelId,

                typeName: mod.typeName,
                typeRange: mod.typeRange,
                kw: mod.kw,
                hp: mod.hp,
                ccmTech: mod.ccmTech,
                capacity: mod.capacity,
                cylinders: mod.cylinders,
                valve: mod.valve,
                tonnage: mod.tonnage,
                active: mod.active,
                image: mod.image,

                fuelId,
                engineTypeId,
                fuelPreparationId,
                bodyTypeId,
                driveTypeId,
            })
            console.log('prepare complate, loading db')

            await prisma.modification.createMany({
                data: prepared,
                skipDuplicates: true,
            })


            console.log('✅ Done seeding');
        }
}
    main()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
         .finally(() => prisma.$disconnect());