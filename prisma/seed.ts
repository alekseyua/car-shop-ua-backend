import { PrismaClient } from "../generated/prisma/client";
import rawModels from '../../car-shop-ua-parser/data/listModels.json';
import rawBrands from '../../car-shop-ua-parser/data/listBrands.json';
import rawModification from '../../car-shop-ua-parser/data/listModification.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🚗 Seeding brands...');
  for (const b of rawBrands) {
    const brand = await prisma.Brand.upsert({
        where:  {mark: b.mark},
        update: {},
        create: {
            mark: b.mark,
            active: true,
            image: null,
            markAutotechId: b.markId
        }
    })
    // // 1. создаём или находим бренд
    // const brand = await prisma.listBrand.upsert({
    //   where: { mark: item.mark },
    //   update: {},
    //   create: {
    //     mark: item.mark,
    //     active: item.active,
    //     image: null,
    //   },
    // });

    // // 2. создаём привязку к складу
    // await prisma.autotechnicsBrand.upsert({
    //   where: { markId: item.markId },
    //   update: {
    //     listBrandId: brand.id,
    //   },
    //   create: {
    //     markId: item.markId,
    //     listBrandId: brand.id,
    //   },
    // });
  }

  console.log('✅ Done seeding');
}

    main()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
         .finally(() => prisma.$disconnect());


