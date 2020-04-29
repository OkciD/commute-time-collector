# commute-time-collector [![Build Status](https://travis-ci.com/OkciD/commute-time-collector.svg?branch=master)](https://travis-ci.com/OkciD/commute-time-collector)
> Сервис, при помощи Яндекс карт собирающий данные о времени, затрачиваемом на Ваши ежедневные маршруты
> из точки _A_ в точку _B_ (даже через точку _C_) 

## Запуск

### Зависимости

Для работы приложению нужны [Tor](https://www.torproject.org/) и [Selenium server](https://www.selenium.dev/downloads/).
Самый простой способ запустить их &ndash; использовать Docker Compose, конфиг которого лежит в корне репозитория
```shell script
docker-compose up -d
```

Потушить сервисы можно следующим образом:
```shell script
docker-compose down -v
```

### Приложение

#### Docker

1. Собираем контейнер
    ```shell script
    docker build -t okcid/commute-time-collector ./
    ```
2. Запускаем
    ```shell script
    docker run -d \
        -e "WAYPOINTS=55.751347,37.618731->55.754930,37.573071" \
        -e "CRON_EXPRESSION=* * * * *" \
        -e "TZ=Europe/Moscow" \
        --volume $HOME/commute-time-collector:/root/commute-time-collector \
        --network="commute-time-collector-network" \
        --name="commute-time-collector" \
        okcid/commute-time-collector
    ```

Параметры:
* `WAYPOINTS` &ndash; список координат точек маршрута, разделённый символом `->`;
* `CRON_EXPRESSION` &ndash; [cron-выражение](https://github.com/node-cron/node-cron#cron-syntax), по которому будет производиться замер длительности маршрута;
* `TZ`(_опционально_) &ndash; таймзона контейнера (по умолчанию `Europe/Moscow`);
* `$HOME/commute-time-collector` &ndash; путь до директории на хост-машине, в которую будут складываться результаты;
* `--name` &ndash; имя контейнера.

#### Ручками
`// TODO`
