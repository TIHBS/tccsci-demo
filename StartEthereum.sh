#!/bin/bash

. ./Vars.sh

NO_CACHE=""
HOST="192.168.178.47"

if [[ "$1" == "no-cache" ]]
then
    NO_CACHE="--no-cache"
fi

echo -e "\n\n"
echo -e "##################################################"
echo -e "#############    Deploying Ganache     ###########"
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
    docker-compose build --no-cache ganache
fi

docker compose up ganache -d

echo -e "\n\n"
echo -e "################################################"
echo -e "####    Deploying Ethereum Smart Contracts  ####"
echo -e "################################################\n\n"
sleep ${SLEEP_SECONDS}

TRUFFLE_CONTAINER_ID=$(docker container ls --all --filter=ancestor=$GANACHE_IMAGE_ID --format "{{.ID}}" | tail -n 1)
echo "Using 'truffle migrate' to deploy Ethereum smart contracts to blockchain on container $TRUFFLE_CONTAINER_ID."

docker exec $TRUFFLE_CONTAINER_ID truffle migrate | tee migrate_output
HOTEL_MANAGER_ADDRESS=$(grep "contract address:" ./migrate_output | awk -F  ":    " '{print $2}' | sed -n '4p')
RESOURCE_MANAGER_ADDRESS=$(grep "contract address:" ./migrate_output | awk -F  ":    " '{print $2}' | sed -n '2p')

echo "Ethereum RMSC address is ${RESOURCE_MANAGER_ADDRESS}"
echo "Ethereum HotelMgtSC address is ${HOTEL_MANAGER_ADDRESS}"
sed -i -e "s/HOST/${HOST}/g" ./scip-gateway/config/connectionProfiles.json
sed -i -e "s/HOST/${HOST}/g" ./client-application/frontend/src/environments/*.ts
sed -i -e "s/RMSC/${RESOURCE_MANAGER_ADDRESS}/g" ./scip-gateway/config/connectionProfiles.json
sed -i -e "s/ETH_ADDRESS/${HOTEL_MANAGER_ADDRESS}/g" ./client-application/frontend/src/environments/*.ts

echo -e "\n\n"
echo -e "##################################################"
echo -e "#############    Deploying Gateway     ###########"
echo -e "##################################################\n\n"
sleep ${SLEEP_SECONDS}

#docker-compose build --no-cache scip-gateway
docker compose up scip-gateway -d


echo -e "\n\n"
echo -e "#############################################################"
echo -e "#############    Deploying Client Application     ###########"
echo -e "#############################################################\n\n"
sleep ${SLEEP_SECONDS}

if [[ ! -z "$NO_CACHE" ]]
then
    docker-compose build --no-cache client-backend
fi

docker compose up -e HOST=$HOST client-backend -d


echo -e "\n\n"
echo -e "###################################################"
echo -e "####    Attaching to SCIP Gateway Container    ####"
echo -e "###################################################\n\n"
sleep ${SLEEP_SECONDS}
GATEWAY_CONTAINER_ID=$(docker container ls --all --filter=ancestor=$GATEWAY_IMAGE_ID --format "{{.ID}}" | tail -n 1)
echo "Attaching to $GATEWAY_CONTAINER_ID. Press Ctrl+C to quit."
docker container attach $GATEWAY_CONTAINER_ID
