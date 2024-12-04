import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from "body-parser";

import {InvokeRequest} from "./model/scip/invoke-request";
import {MemberSignature} from "./model/scip/member-signature";
import {Parameter} from "./model/scip/parameter";
import {SCDLTypes} from "./model/scdl/SCDLTypes";
import {Argument} from "./model/scip/argument";
import {JSONRPCClient, JSONRPCServer} from "json-rpc-2.0";
import {QueryRequest} from "./model/scip/query-request";
import {QueryResponse} from "./model/scip/query-response";
import dayjs from "dayjs";
import {InvokeDtx} from "./model/t-scip/InvokeDtx";
import {MethodNames} from "./MethodNames";

const API_PORT = 5000;
const JSON_RPC_PORT = 6000;
const DOC = 0.1;
const TIMEOUT = 10000;
const HOST = process.env.HOST || 'localhost';
const ADDRESS = `${HOST}:${JSON_RPC_PORT}`;

const app = express();
app.use(bodyParser.json());
const httpServer = new http.Server(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const requests: Map<string ,((isError: boolean, payload: any) => (void))> = new Map();
const server = new JSONRPCServer();

server.addMethod("ReceiveResponse", (params : { correlationIdentifier: string }) => {
    console.log("Received async SCIP response: ", params);

    if (requests.has(params.correlationIdentifier)) {
        requests.get(params.correlationIdentifier)(false, params);
    } else {
        console.warn('Not sure what to do with async result of correlationIdentifier: ', params.correlationIdentifier);
    }
});

server.addMethod("ReceiveError", (err: { correlationIdentifier: string }) => {
    console.error("Received async SCIP error: ", err);

    if (requests.has(err.correlationIdentifier)) {
        requests.get(err.correlationIdentifier)(true, err);
    } else {
        console.warn('Not sure what to do with async result of correlationIdentifier: ', err.correlationIdentifier);
    }
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

app.listen(JSON_RPC_PORT);
console.info(`Server listening on port ${JSON_RPC_PORT} (JSON-RPC)`);


io.on('connection', (client: any) => {
    /* Hotel Manager */
    client.on(MethodNames.QUERY_CLIENT_BALANCE, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.QUERY_CLIENT_BALANCE}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithReturn(MethodNames.QUERY_CLIENT_BALANCE, payload.tmId, payload.txId, new Parameter("clientBalance", SCDLTypes.UNSIGNED_256), payload.scl);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.IS_ROOM_AVAILABLE, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.IS_ROOM_AVAILABLE}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithReturn(MethodNames.IS_ROOM_AVAILABLE, payload.tmId, payload.txId, new Parameter("isRoomAvailable", SCDLTypes.BOOLEAN), payload.scl);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.HAS_RESERVATION, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.HAS_RESERVATION}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithReturn(MethodNames.HAS_RESERVATION, payload.tmId, payload.txId, new Parameter("hasReservation", SCDLTypes.BOOLEAN), payload.scl);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.QUERY_ROOM_PRICE, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.QUERY_ROOM_PRICE}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithReturn(MethodNames.QUERY_ROOM_PRICE, payload.tmId, payload.txId, new Parameter("roomPrice", SCDLTypes.UNSIGNED_256), payload.scl);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.ADD_TO_CLIENT_BALANCE, async (payload: { tmId: string, txId: string, amountToAdd: string, scl: string }) => {
        console.log(`Received ${MethodNames.QUERY_ROOM_PRICE}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithoutReturn(
            MethodNames.ADD_TO_CLIENT_BALANCE,
            payload.tmId,
            payload.txId,
            new Parameter("amountToAdd", SCDLTypes.UNSIGNED_256),
            new Argument("amountToAdd", payload.amountToAdd),
            payload.scl);
        handleInvoke(invocation, client, false);
    });

    client.on(MethodNames.CHANGE_ROOM_PRICE, async (payload: { tmId: string, txId: string, newPrice: string, scl: string }) => {
        console.log(`Received ${MethodNames.CHANGE_ROOM_PRICE}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithoutReturn(
            MethodNames.CHANGE_ROOM_PRICE,
            payload.tmId,
            payload.txId,
            new Parameter("newPrice", SCDLTypes.UNSIGNED_256),
            new Argument("newPrice", payload.newPrice),
            payload.scl);
        handleInvoke(invocation, client, false);
    });

    client.on(MethodNames.BOOK_ROOM, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.BOOK_ROOM}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithoutReturn(
            MethodNames.BOOK_ROOM,
            payload.tmId,
            payload.txId,
            null,
            null,
            payload.scl);
        handleInvoke(invocation, client, false);
    });

    client.on(MethodNames.CHECKOUT, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.CHECKOUT}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithoutReturn(
            MethodNames.CHECKOUT,
            payload.tmId,
            payload.txId,
            null,
            null,
            payload.scl);
        handleInvoke(invocation, client, false);
    });

});


httpServer.listen(API_PORT, () => {
    console.log(`Server listening on port ${API_PORT} (HTTP)`);
});

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateEthereumDtxInvocationWithReturn(methodName: string, tmId: string, txId: string, outputParam: Parameter, scl: string): InvokeDtx {
    const invocation = new InvokeDtx();
    invocation.methodName = methodName;
    invocation.scl = scl;
    invocation.hasReturnValues = true;
    invocation.inputParameters = [new Parameter("txId", SCDLTypes.STRING), new Parameter("tm", SCDLTypes.ETHEREUM_ADDRESS)];
    invocation.inputArguments = [new Argument("txId", txId), new Argument("tm", tmId)];
    invocation.outputParameters = [new Parameter("txId", SCDLTypes.STRING), outputParam];

    return invocation;
}

function generateEthereumDtxInvocationWithoutReturn(methodName: string, tmId: string, txId: string, inputParam: Parameter, inputArgument: Argument, scl: string): InvokeDtx {
    const invocation = new InvokeDtx();
    invocation.methodName = methodName;
    invocation.scl = scl;
    invocation.hasReturnValues = false;
    invocation.inputParameters = [new Parameter("txId", SCDLTypes.STRING), new Parameter("tm", SCDLTypes.ETHEREUM_ADDRESS)];

    if (inputParam) {
        invocation.inputParameters.push(inputParam);
    }

    invocation.inputArguments = [new Argument("txId", txId), new Argument("tm", tmId)];

    if (inputArgument) {
        invocation.inputArguments.push(inputArgument);
    }

    invocation.outputParameters = [];

    return invocation;
}

function handleInvoke(invocation: InvokeDtx, client: any, hasResponse: boolean) {
    const invokeRequest = new InvokeRequest();
    invokeRequest.callbackUrl = ADDRESS;
    invokeRequest.correlationId = crypto.randomUUID();
    invokeRequest.degreeOfConfidence = DOC;
    invokeRequest.sideEffects = true;
    invokeRequest.signature = new MemberSignature(invocation.methodName, true, invocation.inputParameters);
    invokeRequest.inputArguments = invocation.inputArguments;
    invokeRequest.outputParams = [];
    invokeRequest.timeout = TIMEOUT;

    const invokeJsonRpcClient = getDefaultJsonRpcClient(invocation.scl);
    const websocketResponseName = `${invocation.methodName}Response`;
    console.log("Submitting SCIP Invoke Request. Correlation Id: ", invokeRequest.correlationId);

    requests.set(invokeRequest.correlationId, (isError: boolean, payload: any) => {
        requests.delete(invokeRequest.correlationId);

        if (isError) {
            console.log("Received async SCIP error: ", payload);
            io.to(client.id).emit(websocketResponseName, "Smart contract invocation failed: " + payload);
        } else {
            if (hasResponse) {
                const queryJsonRpcClient = getDefaultJsonRpcClient(invocation.scl);
                const queryRequest = new QueryRequest();
                const eventName = `${invocation.methodName.charAt(0).toUpperCase()}${invocation.methodName.substring(1)}Event`;
                // queryRequest.filter = `txId == ${payload.txId}`;
                queryRequest.signature = new MemberSignature(eventName, false, invocation.outputParameters);

                console.log("Submitting SCIP Query Request for: ", queryRequest.signature.name);
                queryJsonRpcClient.request("Query", queryRequest).then((result: QueryResponse) => {
                    result.occurrences.sort((a, b) => {
                        return dayjs(a.isoTimestamp).isAfter(dayjs(b.isoTimestamp)) ? +1 : -1;
                    });
                    console.log("Received SCIP Query synchronous response including ", result.occurrences.length, " event occurrences");
                    io.to(client.id).emit(websocketResponseName, result.occurrences[result.occurrences.length - 1].parameters.filter(p => p.name === invocation.outputParameters[1].name)[0].value);
                }, () => {
                    console.log("SCIP Query failed.");
                    io.to(client.id).emit(websocketResponseName, "querying results failed!");
                });
            } else {
                console.log("Received async SCIP Invoke response: ", payload);
                if (payload.errorCode) {
                    io.to(client.id).emit(websocketResponseName, payload.errorMessage);
                } else {
                    io.to(client.id).emit(websocketResponseName, "Successful!");
                }
            }
        }
    });

    invokeJsonRpcClient.request("Invoke", invokeRequest).then(result => {
        console.log("Received SCIP Invoke synchronous response: ", result);
    }, (error) => {
        console.error("SCIP Invoke failed. Correlation Id: ", invokeRequest.correlationId, ". Reason: ", error);
        io.to(client.id).emit(websocketResponseName, "Invoke failed: " + error);
    });

}

function getDefaultJsonRpcClient(scl: string): JSONRPCClient {
    const client = new JSONRPCClient((jsonRPCRequest) =>
        fetch(scl, {
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
                        console.debug("Received json-rpc response: ", jsonRPCResponse);
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
