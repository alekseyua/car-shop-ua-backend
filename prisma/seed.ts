import { PrismaClient } from "../generated/prisma/client";
import rawModels from '../../car-shop-ua-parser/data/listModels.json'
const prisma = new PrismaClient();

const brands = [
  { markId: 3854, mark: "ABARTH", active: true },
  { markId: 1505, mark: "ACURA", active: true },
  { markId: 4330, mark: "ADLY", active: true },
  { markId: 4331, mark: "AEON", active: true },
  { markId: 2, mark: "ALFA ROMEO", active: true },
  { markId: 866, mark: "ALPINA", active: true },
  { markId: 2246, mark: "AMC", active: true },
  { markId: 2524, mark: "APRILIA", active: true },
  { markId: 2241, mark: "ASHOK LEYLAND", active: true },
  { markId: 2242, mark: "ASKAM", active: true },
  { markId: 881, mark: "ASTON MARTIN", active: true },
  { markId: 5, mark: "AUDI", active: true },
  { markId: 1538, mark: "AUSTIN-HEALEY", active: true },
  { markId: 132, mark: "AVIA", active: true },
  { markId: 4423, mark: "BAOTIAN", active: true },
  { markId: 134, mark: "BARKAS", active: true },
  { markId: 3071, mark: "BAW", active: true },
  { markId: 2532, mark: "BENELLI", active: true },
  { markId: 815, mark: "BENTLEY", active: true },
  { markId: 3762, mark: "BESTURN (FAW)", active: true },
  { markId: 4315, mark: "BETA", active: true },
  { markId: 4368, mark: "BIMOTA", active: true },
  { markId: 4645, mark: "BIO AUTO", active: true },
  { markId: 2243, mark: "BMC", active: true },
  { markId: 16, mark: "BMW", active: true },
  { markId: 4439, mark: "BOGDAN", active: true },
  { markId: 1537, mark: "BOND", active: true },
  { markId: 136, mark: "BORGWARD", active: true },
  { markId: 1487, mark: "BRISTOL", active: true },
  { markId: 4048, mark: "BUELL", active: true },
  { markId: 788, mark: "BUGATTI", active: true },
  { markId: 816, mark: "BUICK", active: true },
  { markId: 3122, mark: "BYD", active: true },
  { markId: 819, mark: "CADILLAC", active: true },
  { markId: 2554, mark: "CAGIVA", active: true },
  { markId: 4617, mark: "CCM", active: true },
  { markId: 4424, mark: "CF MOTO", active: true },
  { markId: 2852, mark: "CHANGAN", active: true },
  { markId: 2853, mark: "CHANGHE", active: true },
  { markId: 2887, mark: "CHERY", active: true },
  { markId: 138, mark: "CHEVROLET", active: true },
  { markId: 20, mark: "CHRYSLER", active: true },
  { markId: 21, mark: "CITROEN", active: true },
  { markId: 4896, mark: "CUPRA", active: true },
  { markId: 139, mark: "DACIA", active: true },
  { markId: 185, mark: "DAEWOO", active: true },
  { markId: 25, mark: "DAIHATSU", active: true },
  { markId: 29, mark: "DODGE", active: true },
  { markId: 700, mark: "FERRARI", active: true },
  { markId: 35, mark: "FIAT", active: true },
  { markId: 36, mark: "FORD", active: true },
  { markId: 16, mark: "BMW", active: true },
  { markId: 74, mark: "MERCEDES-BENZ", active: true },
  { markId: 80, mark: "NISSAN", active: true },
  { markId: 111, mark: "TOYOTA", active: true },
  { markId: 121, mark: "VW", active: true }
];

async function main() {
  console.log('🚗 Seeding brands...');
  for (const item of brands) {
    // 1. создаём или находим бренд
    const brand = await prisma.listBrand.upsert({
      where: { mark: item.mark },
      update: {},
      create: {
        mark: item.mark,
        active: item.active,
        image: null,
      },
    });

    // 2. создаём привязку к складу
    await prisma.autotechnicsBrand.upsert({
      where: { markId: item.markId },
      update: {
        listBrandId: brand.id,
      },
      create: {
        markId: item.markId,
        listBrandId: brand.id,
      },
    });
  }

  console.log('✅ Done seeding');
}

    // main()
    //     .catch((e) => {
    //         console.error(e);
    //         process.exit(1);
    //     })
    //      .finally(() => prisma.$disconnect());


    async function modelSeed() {
        console.log("🚗 Seeding models...");
        const models = rawModels.flat();

    for (const item of models) {
        // 1. создаём/находим модель
        const listModel = await prisma.listModel.upsert({
        where: {
            model_modelRange: {
            model: item.model,
            modelRange: item.modelRange,
            },
        },
        update: {},
        create: {
            model: item.model,
            modelRange: item.modelRange,
            active: item.active,
            image: item.image,
        },
        });

        // 2. связь
        await prisma.autotechnicsModel.upsert({
        where: {
            markId_modelId: {
            markId: item.markId,
            modelId: item.modelId,
            },
        },
        update: {
            listModelId: listModel.id,
        },
        create: {
            markId: item.markId,
            modelId: item.modelId,
            listModelId: listModel.id,
        },
        });
    }

    console.log("✅ Done seeding models");
    }

    modelSeed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());