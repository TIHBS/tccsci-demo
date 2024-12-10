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
yes | cp ./scip-gateway/config/.connectionProfiles.json ./scip-gateway/config/connectionProfiles.json
yes | cp ./client-application/frontend/src/environments/.environment.development.ts ./client-application/frontend/src/environments/environment.development.ts
yes | cp ./client-application/frontend/src/environments/.environment.ts ./client-application/frontend/src/environments/environment.ts
sed -i -e "s/HOST/${HOST}/g" ./scip-gateway/config/connectionProfiles.json
sed -i -e "s/HOST/${HOST}/g" ./client-application/frontend/src/environments/environment.ts
sed -i -e "s/HOST/${HOST}/g" ./client-application/frontend/src/environments/environment.development.ts
sed -i -e "s/RMSC/${RESOURCE_MANAGER_ADDRESS}/g" ./scip-gateway/config/connectionProfiles.json
sed -i -e "s/ETH_ADDRESS/${HOTEL_MANAGER_ADDRESS}/g" ./client-application/frontend/src/environments/environment.ts
sed -i -e "s/ETH_ADDRESS/${HOTEL_MANAGER_ADDRESS}/g" ./client-application/frontend/src/environments/environment.development.ts

echo -e "\n\n"
echo -e "##################################################"
echo -e "#############    Deploying Gateway     ###########"
echo -e "##################################################\n\n"
sleep ${SLEEP_SECONDS}

if [[ ! -z "$NO_CACHE" ]]
then
    docker-compose build --no-cache scip-gateway
fi

docker compose up scip-gateway -d

GATEWAY_CONTAINER_ID=$(docker container ls --all --filter=ancestor=$GATEWAY_IMAGE_ID --format "{{.ID}}" | tail -n 1)

if [[ -z "$NO_CACHE" ]]
then
    echo "Copying updated connectionProfiles.json to container $GATEWAY_CONTAINER_ID"
    docker cp ./scip-gateway/config/connectionProfiles.json ${GATEWAY_CONTAINER_ID}:/root/.bal/connectionProfiles.json
    docker cp ./scip-gateway/ethereum/ ${GATEWAY_CONTAINER_ID}:/root/.bal/
    docker compose restart scip-gateway
fi


echo -e "\n\n"
echo -e "#############################################################"
echo -e "#############    Deploying Client Application     ###########"
echo -e "#############################################################\n\n"
sleep ${SLEEP_SECONDS}

if [[ ! -z "$NO_CACHE" ]]
then
    docker-compose build --no-cache client-backend
fi

HOST=$HOST docker compose up client-backend -d


echo -e "\n\n"
echo -e "#############################################################"
echo -e "#############    Starting Frontend     ######################"
echo -e "#############################################################\n\n"
sleep ${SLEEP_SECONDS}

cd client-application/frontend
ng serve --host=0.0.0.0

#echo -e "\n\n"
#echo -e "###################################################"
#echo -e "####    Attaching to SCIP Gateway Container    ####"
#echo -e "###################################################\n\n"
#sleep ${SLEEP_SECONDS}
#echo "Attaching to $GATEWAY_CONTAINER_ID. Press Ctrl+C to quit."
#docker container attach $GATEWAY_CONTAINER_ID
