
## Sample SCIP Invocation

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