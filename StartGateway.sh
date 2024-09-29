#!/bin/bash

. ./Vars.sh

echo -e "######################################"
echo -e "####    Deploying SCIP Gateway    ####"
echo -e "######################################\n"
sleep ${SLEEP_SECONDS}

echo "building image $IMAGE_ID" 
docker build -t $IMAGE_ID .
docker run -p 8080:8080 -d $IMAGE_ID
CONTAINER_ID=$(docker container ls --all --filter=ancestor=$IMAGE_ID --format "{{.ID}}" | tail -n 1)
echo "Waiting until SCIP Gatway boots up..."
sleep 10
echo "Copying Fabric crypto folder to SCIP Gateway container"
docker cp ./fabric/fabric-samples/test-network/organizations/ $CONTAINER_ID:/root/.bal/crypto/


echo -e "####################################"
echo -e "####    Deployment Finished!    ####"
echo -e "####################################\n"
sleep ${SLEEP_SECONDS}

echo -e "###################################################"
echo -e "####    Attaching to SCIP Gateway Container    ####"
echo -e "###################################################\n"
sleep ${SLEEP_SECONDS}
docker container attach $CONTAINER_ID