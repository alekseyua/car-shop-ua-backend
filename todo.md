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
  1) сделать миграцию
  2) написать авторизацию
  3) создавать пользователя
  4) создать карзину
  5) создать заказ
  6) создать отзыв сервис / товар
  7) создать мои желания
  8) история

  9) дописать ответы в endpoints
  10) интегрировать history во все endpoints

  1_) создать телеграм бота для отслеживания заказов
