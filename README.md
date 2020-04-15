# commute-time-collector [![Build Status](https://travis-ci.com/OkciD/commute-time-collector.svg?branch=master)](https://travis-ci.com/OkciD/commute-time-collector)
> Сервис, при помощи Яндекс карт собирающий данные о времени, затрачиваемом на Ваши ежедневные маршруты
> из точки _A_ в точку _B_ (не забывая при этом заехать в точку _C_ по пути, конечно) 

## Запуск

### Tor
Для работы сервиса необходим [Tor](https://www.torproject.org/). 

#### Docker
1. Переходим в текущую папку
2. Запускаем контейнер с Tor и передаём ему настройки 
    ```shell script
    docker run -d \
      -p 127.0.0.1:9050:9050 \
      -p 127.0.0.1:9052:9052 \
      -p 127.0.0.1:9053:9053 \
      -p 127.0.0.1:9054:9054 \
      --volume $PWD/torrc:/etc/tor/torrc:ro \
      --name=tor \
      osminogin/tor-simple
    ```

#### Ручками
1. Устанавливаем  
    ```shell script
    sudo apt-get install tor
    ```
2. Добавляем побольше SOCKS-портов в конфиг Tor:
    1. Открываем на редактирование конфиг Tor
        ```shell script
        sudo vim /etc/tor/torrc
        ```
    2. Дописываем в конец следующие строки:
        ```
        SocksPort 9050
        SocksPort 9052
        SocksPort 9053
        SocksPort 9054
        ```
       Обратите внимание, порт `9051` мы не трогаем - он нужен Tor для других чёрных делишек
    3. Перезапускаем Tor
        ```shell script
        sudo /etc/init.d/tor restart
        ```

### Сам сервис

#### Docker
1. Переходим в текущую папку
2. Собираем контейнер
    ```shell script
    docker build -t okcid/commute-time-collector ./
    ```
3. Запускаем
    ```shell script
    docker run -d \
      --name=commute-time-collector \
      -e "WAYPOINTS=55.751347,37.618731->55.754930,37.573071" \
      -e "CRON_EXPRESSION=* * * * *" \
      -e "TOR_HOST=127.0.0.1" \
      -e "TOR_PORTS=9050,9052,9053,9054" \
      --volume $HOME/commute-time-collector/logs:/var/log/commute-time-collector \
      --volume $HOME/commute-time-collector/out:/root/commute-time-collector \
      okcid/commute-time-collector
    ```

    Параметры:
    * **WAYPOINTS** &ndash; координаты точки, через которые нужно строить маршрут (разделены символом `->`)
    * **CRON_EXPRESSION** &ndash; cron-выражение, по которому будет запускаться сбор данных
    * **TOR_HOST** &ndash; хост, на котором запущен Tor
    * **TOR_PORTS** &ndash; список открытых SOCKS-портов Tor через запятую
    * **$HOME/commute-time-collector/logs** &ndash; директория, куда складывать логи.
    Строку с этим параметром можно пропустить &ndash; тогда логи останутся внутри контейнера
    * **$HOME/commute-time-collector/out** &ndash; директория, в которую будут собираться CSV файлы с результатами
    
#### Ручками
1. Переходим в текущую папку
2. Устанавливаем зависимости
    ```shell script
    npm ci --only=production
    ```
3. Запускаем ~~гуся~~
    ```shell script
    npm start -- \
      --waypoints="55.751347,37.618731->55.754930,37.573071" \
      --cronExpression="* * * * *" \
      --torHost="127.0.0.1" \
      --torPorts="9050,9052,9053,9054" \
      --logsDir="$HOME/commute-time-collector/logs" \
      --outDir="$HOME/commute-time-collector/out"
    ```
