# TCCSCI Demo System

A Docker-based demo for SCIP and T-SCIP using a Hyplerdeger Fabric instance, a private Ethereuem instance, a SCIP Gateway, and a client application.

## Prerequisites

- Fulfill the [Hyperledger Fabric installation requirements](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html).
- Git
- The following ports must be free:
  - 7050 - 7051
  - 7053 - 7054
  - 7545
  - 8080
  - 8054
  - 9054
  - 9443 - 9444
  - 17054
  - 18054
  - 19054






## Usage

### StartAll.sh

The script deploys and starts the demo scenario. 
Invoke this script as follows:
```bash
./StartAll.sh [no-cache]
```
Specifically, it does the following:

- Pulls the official `fabric-samples`.
- Starts the official fabric `test-network`.
- Deploys the Fabric 2PC4BC Resource Manager Smart Contract along with a sample smart contract to a channel on fabric.
- Deploys a ganache network.
- Deploys the Ethereum 2PC4BC Resource Manager Smart Contract on the ganache network.
- Deploys an instance of the SCIP Gateway.
- Configures the SCIP Gateway instance to communicate with the fabric and Ethereum blockchains.
- Configures the SCIP Gateway instance to use the deployed 2PC4BC Resource Manager Smart Contracts.

The `no-cache` optional argument ensures building fresh ganache and SCIP Gateway Docker images.

### StopAll.sh

The script tears down the demo scenario. 
Invoke this script as follows:
```bash
./StopAll.sh
```

## Sample Invocations

After deployment, you can test the setup using the following requests.

```bash
curl --location 'http://localhost:8080?blockchain-id=fabric-0&blockchain=fabric&address=mychannel%2Ffabric-rmsc%2FFlightBookingManager' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "method": "Invoke",
    "params": {
        "functionIdentifier": "isASeatAvailable",
        "inputs": [
            {
                "name": "txId",
                "type": "{ \"type\": \"string\" }",
                "value": "tx1"
            }
        ],
        "outputs": [
            {
                "name": "Result",
                "type": "{ \"type\": \"string\" }"
            }
        ],
        "doc": 0.99,
        "callbackUrl": "http://localhost:8080/submit-transaction/dummy",
        "timeout": 10000,
        "correlationIdentifier": "abc",
        "signature": ""
    },
    "id": 123
}'
```

```bash
curl --location 'http://localhost:8080/configure/test?blockchain-id=eth-0'
```