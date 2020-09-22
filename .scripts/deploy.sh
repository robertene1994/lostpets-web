#!/bin/bash
cd build
ls -l
git init
git config --global user.name "$HEROKU_EMAIL"
git config --global user.email "$HEROKU_EMAIL"
git add .
git commit -m "Release"
git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
