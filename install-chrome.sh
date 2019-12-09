#!/usr/bin/env bash

# Install Chrome.
sudo curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
echo "deb http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee -a /etc/apt/sources.list.d/google-chrome.list > /dev/null
sudo apt-get -y update
sudo apt-get -y install google-chrome-stable
