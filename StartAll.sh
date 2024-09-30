#!/bin/bash

. ./Vars.sh

NO_CACHE=""

if [[ "$1" == "no-cache" ]]
then
    NO_CACHE="--no-cache"
fi

./StartFabric.sh


echo -e "\n\n"
echo -e "##################################################"
echo -e "####    Deploying Ganache and SCIP Gateway    ####"
echo -e "##################################################\n\n"
sleep ${SLEEP_SECONDS}

if [[ -d ./ethereum/smart-contracts && ! -z "$NO_CACHE" ]]
then
    echo "Removing existing ethereum smart contracts cache."
    rm -r -f ./ethereum/smart-contracts
fi

if [[ ! -d ./ethereum/smart-contracts ]]
then
    echo "Cloning ethereum smart contracts..."
    git clone https://github.com/TIHBS/EthereumResourceManager.git ./ethereum/smart-contracts
fi

if [[ ! -z "$NO_CACHE" ]]
then
    docker-compose build --no-cache
fi

docker compose up -d

echo -e "\n\n"
echo -e "################################################"
echo -e "####    Deploying Ethereum Smart Contracts  ####"
echo -e "################################################\n\n"
sleep ${SLEEP_SECONDS}

TRUFFLE_CONTAINER_ID=$(docker container ls --all --filter=ancestor=$GANACHE_IMAGE_ID --format "{{.ID}}" | tail -n 1)
echo "Using 'truffle migrate' to deploy Ethereum smart contracts to blockchain on container $TRUFFLE_CONTAINER_ID."
docker exec $TRUFFLE_CONTAINER_ID truffle migrate

echo -e "\n\n"
echo -e "###################################################"
echo -e "####    Attaching to SCIP Gateway Container    ####"
echo -e "###################################################\n\n"
sleep ${SLEEP_SECONDS}
GATEWAY_CONTAINER_ID=$(docker container ls --all --filter=ancestor=$GATEWAY_IMAGE_ID --format "{{.ID}}" | tail -n 1)
echo "Attaching to $GATEWAY_CONTAINER_ID. Press Ctrl+C to quit."
docker container attach $GATEWAY_CONTAINER_ID
