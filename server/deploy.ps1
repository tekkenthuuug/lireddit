$Version = Read-Host -Prompt 'Which version you deploying?'
Write-Host "Deploying version to tekkenthuuug/lireddit:$Version"

docker build -t tekkenthuuug/lireddit:$Version .
docker push tekkenthuuug/lireddit:$Version

Write-Host "SSHing..."
ssh root@207.154.212.51 "docker pull tekkenthuuug/lireddit:$Version && docker tag tekkenthuuug/lireddit:$Version dokku/api:$Version && dokku tags:deploy api $Version"