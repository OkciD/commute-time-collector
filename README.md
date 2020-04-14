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
    3. Перезапускам Tor
        ```shell script
        sudo /etc/init.d/tor restart
        ```
