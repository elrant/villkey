echo "Only irisnk and other core-devs with ssh access to ALL GIT INSTANCES should run this!"
git pull
git push --mirror git@github.com:elrant/villkey.git
git push --mirror git@bitbucket.org:elrant/villkey.git
git push --mirror git@gitlab.com:elrant/villkey.git
