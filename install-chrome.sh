#!/usr/bin/env bash

# Taken from https://gist.github.com/ziadoz/3e8ab7e944d02fe872c3454d17af31a5#file-install-sh-L25-L29

sudo curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
echo "deb http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee -a /etc/apt/sources.list.d/google-chrome.list > /dev/null
sudo apt-get -y update
sudo apt-get -y install google-chrome-stable
