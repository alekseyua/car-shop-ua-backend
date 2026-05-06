"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../generated/prisma/client");
const listModification_json_1 = __importDefault(require("../../car-shop-ua-parser/data/listModification.json"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚗 Seeding start...');
    console.log('Seeding prepare fuel, engineType, fuelPreparation, bodyType ...');
    const mods = listModification_json_1.default;
    const fuelsSet = new Set();
    const engineTypesSet = new Set();
    const fuelPrepSet = new Set();
    const bodyTypesSet = new Set();
    const driveTypesSet = new Set();
    for (const mod of mods.flat()) {
        fuelsSet.add(mod.fuel);
        engineTypesSet.add(mod.engineType);
        fuelPrepSet.add(mod.fuelPreparation);
        bodyTypesSet.add(mod.bodyType);
        driveTypesSet.add(mod.driveType);
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
    let prepared = [];
    console.log('Seeding modification ...');
    const models = await prisma.model.findMany({
        include: {
            brand: true
        }
    });
    console.log(models[0]);
    const modelMap = new Map(models.map(m => [`${m.brand.markAutotechId}_${m.modelAutotechId}`, m.id]));
    let count = 0;
    const arrMods = mods.flat();
    const sizeChunk = 1000;
    for (const mod of arrMods) {
        if (count > 0 && count % 1000 === 0) {
            console.log(`Progress: ${count}/${arrMods.length}`);
        }
        const fuelId = fuelMap.get(mod.fuel);
        const engineTypeId = engineTypeMap.get(mod.engineType);
        const fuelPreparationId = fuelPrepMap.get(mod.fuelPreparation);
        const bodyTypeId = bodyTypeMap.get(mod.bodyType);
        const driveTypeId = driveTypeMap.get(mod.driveType);
        if (!fuelId || !engineTypeId || !fuelPreparationId || !bodyTypeId || !driveTypeId) {
            console.log('❌ skip mod', mod.typeId);
            continue;
        }
        const modelId = modelMap.get(`${mod.markId}_${mod.modelId}`);
        if (!modelId)
            continue;
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
        });
        count++;
        if (prepared.length >= sizeChunk) {
            console.log('🚀 inserting...');
            await prisma.modification.createMany({
                data: prepared,
                skipDuplicates: true,
            });
            prepared = [];
        }
    }
    console.log('prepare complate, loading db');
    if (prepared.length) {
        await prisma.modification.createMany({
            data: prepared,
            skipDuplicates: true,
        });
    }
    console.log('✅ Done seeding');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map