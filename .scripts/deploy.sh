#!/bin/bash
# echo "machine git.heroku.com" > ~.netrc
# echo "login $HEROKU_EMAIL" > ~.netrc
# echo "password $HEROKU_API_KEY" > ~~netrc
# cat .netrc
# git config --global --list
git config user.name "$HEROKU_USERNAME"
git config user.email "$HEROKU_EMAIL"
git config --list
git clone  https://git.heroku.com/$HEROKU_APP_NAME.git remote
rm -rfv remote/dist/*
cp -r build/dist/* remote/dist/
cd build
ls -l
git add .
git commit -m "Release"
git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git master
