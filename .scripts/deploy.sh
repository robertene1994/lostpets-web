#!/bin/bash
echo $HEROKU_API_KEY >> ~/.netrc
cat ~/.netrc
git config --global user.name "${HEROKU_EMAIL}"
git config --global user.email "${HEROKU_EMAIL}"
heroku whoami
cd build
ls -l
git init
git add .
git commit -m "Release"
git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
