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

cd ../..
mkdir fabric-rmsc
cd "$FABRIC_CHAINCODE_NAME"
git clone https://github.com/TIHBS/fabric-resource-manager.git .

cd ../fabric-samples/test-network
./network.sh deployCC -ccn "$FABRIC_CHAINCODE_NAME" -ccp ../../$FABRIC_CHAINCODE_NAME -ccl javascript