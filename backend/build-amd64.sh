docker buildx version

docker buildx create --name mybuilder --use
docker buildx inspect mybuilder --bootstrap

docker buildx build --platform linux/amd64 -t notlify .

docker buildx build --platform linux/amd64 -t whysosaket/notlify --push .