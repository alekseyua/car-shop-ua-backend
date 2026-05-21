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

    <!-- https://ecom.ad.ua/api/Car/Catalog/modificatinAutotechnicsId --> post request
    
    задачи 
    <!-- 1) доделать описание ответа для /items-catalog -->
    <!-- 2) доделать описание ответа для /items-catalog/{id} -->
    <!-- 4) доделать описание ответа для /catalog -->
    3) возмодно привести к стандарту с пагинацией для парсера
    5) добавить парсер для получения оригинальных номеров
