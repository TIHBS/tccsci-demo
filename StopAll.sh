#!/bin/bash
. ./Vars.sh

echo -e "\n\n"
echo -e "##############################"
echo -e "####    Stopping Fabric   ####"
echo -e "##############################\n\n"
sleep ${SLEEP_SECONDS}

./fabric/fabric-samples/test-network/network.sh down


echo -e "\n\n"
echo -e "################################################"
echo -e "####    Stopping Ganache and SCIP Gateway   ####"
echo -e "################################################\n\n"
sleep ${SLEEP_SECONDS}

docker-compose down -v