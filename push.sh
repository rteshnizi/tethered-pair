#!/bin/sh
set -e

grab_commit_msg() {
	CMT_MSG=$(git log -1 --pretty=%B)
}

prepare_output() {
	find ./ -mindepth 1 ! -regex '^./build\(/.*\)?' -delete
	mkdir prod
	ls -la
}

setup_git() {
	git config --global user.email "travis@travis-ci.org"
	git config --global user.name "Travis CI (on behalf of Reza Teshnizi)"
}

prepare_prod() {
	git clone https://rteshnizi:${BB_TOKEN}@bitbucket.org/rteshnizi/rteshnizi.bitbucket.io.git prod
	cd prod
	ls -la
	find ./ -mindepth 1 ! -regex '^.\/\.git\(\/.*\)?' -delete
	cp -v -r ../build/* ./
}

commit_website_files() {
	git status
	git add . -A -f
	git commit --message "Travis build[$TRAVIS_BUILD_NUMBER] --> $CMT_MSG"
}

upload_files() {
	git push origin master
}

echo "Reza --> Grabbing commit message"
grab_commit_msg
echo "Reza --> Preparing the output and cleaning dev files"
prepare_output
echo "Reza --> Setting up Git user and add prod remote"
setup_git
echo "Reza --> Prepare prod folder"
prepare_prod
echo "Reza --> Adding the changes"
commit_website_files
echo "Reza --> Committed the crimes, Now pushing with force!"
upload_files
echo "Reza --> Deployed"