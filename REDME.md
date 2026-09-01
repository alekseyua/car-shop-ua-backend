# Start server application
1. Поднять Redis через Docker
    а) # Создай users.acl
    mkdir -p /opt/redis-stack
    nano /opt/redis-stack/users.acl
    Содержимое:
    user default off
    user example_username on >example_password ~* &* +@all
    б) # DOCKER 
    docker run -d \
  --name redis-stack \
  --restart unless-stopped \
  -p 6381:6379 \
  -v redis-stack-data:/data \
  -v /opt/redis-stack/users.acl:/usr/local/etc/redis/users.acl:ro \
  -e REDIS_ARGS="--aclfile /usr/local/etc/redis/users.acl --appendonly yes" \
  redis/redis-stack-server:latest
    в) Индексируем прайс для поиска
        FT.CREATE idx:price_autotechnics ON HASH PREFIX 1 price: SCHEMA itemNo TEXT name TEXT price NUMERIC catItemNo TEXT 
    ) # .env 
        REDIS_USER=example_username
        REDIS_USER_PASSWORD=example_password
        REDIS_PORT=6379
        REDIS_HOST=you_host
2. Поднять postgress через docker
    

3. запустить cron процессы
    а) excel price
    б) 