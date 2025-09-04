source .env
git push
ssh -tt root@$APP_HOST <<'ENDSSH'
#commands to run on remote host
#top
#docker ps
cd /docker/limiland-bot/ && git pull && docker compose build && docker compose up main -d
exit
ENDSSH