#!/bin/bash
. ./Vars.sh

echo -e "\n\n"
echo -e "###############################"
echo -e "####    Deploying Fabric   ####"
echo -e "###############################\n\n"
sleep ${SLEEP_SECONDS}

cd fabric

if [ -d "fabric-samples" ]; then
    echo "fabric-samples directory already exists..."
else
    echo "Directory fabric-samples does not exist. Running install-fabric.sh..."
    ./install-fabric.sh
fi

echo -e "\n\n"
echo -e "######################################"
echo -e "####    Starting Fabric Network   ####"
echo -e "######################################\n\n"
sleep ${SLEEP_SECONDS}

cd fabric-samples/test-network
./network.sh down
./network.sh up createChannel -c "$FABRIC_CHANNEL_NAME" -ca


echo -e "\n\n"
echo -e "###############################################"
echo -e "####    Deploying Fabric Smart Contracts   ####"
echo -e "###############################################\n\n"
sleep ${SLEEP_SECONDS}

if [ -d "../../$FABRIC_CHAINCODE_NAME" ]; then
    echo "$FABRIC_CHAINCODE_NAME already exists..."
    cd "../../$FABRIC_CHAINCODE_NAME"
else
    echo "Directory $FABRIC_CHAINCODE_NAME does not exist. Cloning smart contracts..."
    cd ../..
    mkdir "$FABRIC_CHAINCODE_NAME"
    cd "$FABRIC_CHAINCODE_NAME"
    git clone https://github.com/TIHBS/fabric-resource-manager.git .
fi

cd ../fabric-samples/test-network
./network.sh deployCC -ccn "$FABRIC_CHAINCODE_NAME" -ccp ../../$FABRIC_CHAINCODE_NAME -ccl javascript

echo -e "\n\n"
echo -e "###############################################"
echo -e "##    Initializing Fabric Smart Contracts   ###"
echo -e "###############################################\n\n"
sleep ${SLEEP_SECONDS}

./network.sh cc invoke -c "$FABRIC_CHANNEL_NAME" -ccn "$FABRIC_CHAINCODE_NAME" -ccic '{"Args":["BasicFlightBookingManager:InitLedger"]}'