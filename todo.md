Структура проекта (production-ready)
src/
  main.ts

  app.module.ts

  core/                  # 🔥 инфраструктура (1 раз на приложение)
    config/
    database/
    logger/
    interceptors/
    guards/
    filters/

  modules/               # 🔥 бизнес-фичи
    car-brands/
    car-models/
    users/
    auth/

  shared/                # 🔥 переиспользуемые вещи без бизнес-логики
    dto/
    utils/
    constants/
    decorators/
    types/