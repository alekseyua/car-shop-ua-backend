import { PrismaClient } from "../generated/prisma/client";
import rawModels from '../../car-shop-ua-parser/data/listModels.json';
import rawBrands from '../../car-shop-ua-parser/data/listBrands.json';
import rawModification from '../../car-shop-ua-parser/data/listModification.json';


const prisma = new PrismaClient();

async function main() {
    console.log('🚗 Seeding brands...');
    for (const b of rawBrands.brandsResponse) {
        // // 1. создаём или находим бренд
        const brand = await prisma.brand.upsert({
            where: { mark: b.mark },
            update: {},
            create: {
                mark: b.mark,
                active: b.active,
                image: null,
                markAutotechId: b.markId
            }
        })
    }
    // create models
    console.log('🚗 Seeding models...');

    for(const m of rawModels.flat()) {
        const brand = await prisma.brand.findUnique({
            where: { markAutotechId: m.markId }
        })
        if(!brand){
            console.log('Brand not found for mode ', m.model);
            continue;
        }
        await prisma.model.upsert({
            where:{
                brandId_modelAutotechId:{
                    brandId: brand.id,
                    modelAutotechId: m.modelId
                }
            },
            update: {},
            create: {
                model: m.model,
                modelAutotechId:m.modelId,
                range: m.modelRange,
                active: m.active,
                image: null,
                brandId: brand.id
            }
        });
    }

    console.log('Seeding modification ...')
    for(const mod of rawModification.flat()){
        const model = await prisma.model.findUnique({
            where:{
                modelAutotechId: mod.modelId
            }
    })
    }


    console.log('✅ Done seeding');
}

    main()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
         .finally(() => prisma.$disconnect());


