import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const bodyParser = require("body-parser");

import {InvokeRequest} from "./model/scip/invoke-request";
import {MemberSignature} from "./model/scip/member-signature";
import {Parameter} from "./model/scip/parameter";
import {SCDLTypes} from "./model/scdl/SCDLTypes";
import {Argument} from "./model/scip/argument";
import {JSONRPCClient, JSONRPCServer} from "json-rpc-2.0";
import {QueryRequest} from "./model/scip/query-request";
import {QueryResponse} from "./model/scip/query-response";
import dayjs from "dayjs";


const API_PORT = 5000;
const JSON_RPC_PORT = 6000;
const SCIP_GATEWAY = 'http://localhost:9090';
const HOTEL_MANAGER_SC_ADDRESS = '0x580b1500e3cea21D4D85b001787791aE0011928b';
const HOTEL_MANAGER_SCL = `${SCIP_GATEWAY}?blockchain=ethereum&blockchain-id=eth-0&address=${HOTEL_MANAGER_SC_ADDRESS}`
const ADDRESS = `http://127.0.0.1:${JSON_RPC_PORT}`;
const app = express();
app.use(bodyParser.json());
const httpServer = new http.Server(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const requests: Map<string ,(() => (void))> = new Map();
const server = new JSONRPCServer();

server.addMethod("ReceiveResponse", (params : { correlationIdentifier: string }) => {
    console.log("Received async SCIP response: ", params);
    if (requests.has(params.correlationIdentifier)) {
        requests.get(params.correlationIdentifier)();
    } else {
        console.warn('Not sure what to do with async result of correlationIdentifier: ', params.correlationIdentifier);
    }
});

server.addMethod("ReceiveError", (err) => {
    console.error("Received async SCIP error: ", err);
})


app.post("/", (req, res) => {
    const jsonRPCRequest = req.body;
    // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
    // It can also receive an array of requests, in which case it may return an array of responses.
    // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
    server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
        if (jsonRPCResponse) {
            res.json(jsonRPCResponse);
        } else {
            // If response is absent, it was a JSON-RPC notification method.
            // Respond with no content status (204).
            res.sendStatus(204);
        }
    });
});

app.listen(6000);
console.info("Server listening on port 6000 (JSON-RPC)");

io.on('connection', (client: any) => {

    client.on('queryClientBalanceRequest', async (payload: { tmId: string, txId: string }) => {
        console.log("Received queryClientBalanceRequest: ", payload);
        const invokeRequest = new InvokeRequest();
        invokeRequest.callbackUrl = ADDRESS;
        invokeRequest.correlationId = crypto.randomUUID();
        invokeRequest.degreeOfConfidence = 0.1;
        invokeRequest.sideEffects = true;
        invokeRequest.signature = new MemberSignature('queryClientBalance', true, [new Parameter("txId", SCDLTypes.STRING), new Parameter("tmId", SCDLTypes.ETHEREUM_ADDRESS)]);
        invokeRequest.inputArguments = [new Argument("txId", payload.txId), new Argument("tmId", payload.tmId)];
        invokeRequest.outputParams = [];
        invokeRequest.timeout = 10000;

        const queryRequest = new QueryRequest();
        // queryRequest.filter = `txId == ${payload.txId}`;
        queryRequest.signature = new MemberSignature('QueryClientBalanceEvent', false, [new Parameter("txId", SCDLTypes.STRING), new Parameter("clientBalance", SCDLTypes.UNSIGNED_256)]);


        const invokeClient = getDefaultJsonRpcClient();
        const queryClient = getDefaultJsonRpcClient();

        console.log("Submitting SCIP Invoke Request. Correlation Id: ", invokeRequest.correlationId);
        requests.set(invokeRequest.correlationId, () => {
            requests.delete(invokeRequest.correlationId);
            console.log("Submitting SCIP Query Request. Correlation Id: ", invokeRequest.correlationId);
            queryClient.request("Query", queryRequest).then((result: QueryResponse) => {
                result.occurrences.sort((a, b) => {
                    return dayjs(a.isoTimestamp).isAfter(dayjs(b.isoTimestamp))? +1 : -1;
                });
                console.log("Received SCIP Query synchronous response: ", result);
                io.to(client.id).emit('queryClientBalanceResponse', result.occurrences[result.occurrences.length - 1].parameters.filter(p => p.name === "clientBalance")[0].value);
            }, () => {
                console.log("SCIP Query failed.");
                io.to(client.id).emit('queryClientBalanceResponse', "querying results failed!");
            });
        });

        invokeClient.request("Invoke", invokeRequest).then(result => {
            console.log("Received SCIP Invoke synchronous response: ", result);
        }, (error) => {
            console.error("SCIP Invoke failed. Correlation Id: ", invokeRequest.correlationId, ". Reason: ", error);
            io.to(client.id).emit('queryClientBalanceResponse', "invoking smart contract failed!");
        });

    });

});

httpServer.listen(API_PORT, () => {
    console.log(`Server listening on port ${API_PORT} (HTTP)`);
});

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDefaultJsonRpcClient(): JSONRPCClient {
    const client = new JSONRPCClient((jsonRPCRequest) =>
        fetch(HOTEL_MANAGER_SCL, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(jsonRPCRequest),
        }).then((response) => {
            if (response.status === 200) {
                // Use client.receive when you received a JSON-RPC response.
                return response
                    .json()
                    .then((jsonRPCResponse) => {
                        console.log("Received json-rpc response: ", jsonRPCResponse);
                        client.receive(jsonRPCResponse);
                    });
            } else {
                console.error("Received json-rpc error: ", response.statusText);
                return Promise.reject(new Error(response.statusText));
            }
        })
    );

    return client;
}
