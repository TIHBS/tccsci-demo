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
import {DtxCommit} from "./model/t-scip/DtxCommit";
import {DtxAbort} from "./model/t-scip/DtxAbort";

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
    /* 2PC4BC */
    client.on(MethodNames.START, async (payload: {scl: string }) => {
        console.log(`Received ${MethodNames.START}Request: `, payload);
        handleStart(payload.scl, client);
    });

    client.on(MethodNames.REGISTER, async (payload: {scl: string, txId: string, blockchainId: string}) => {
        console.log(`Received ${MethodNames.REGISTER}Request: `, payload);
        handleRegister(payload.scl, client, payload.txId, payload.blockchainId);
    });

    client.on(MethodNames.COMMIT, async (payload: {scl: string, txId: string}) => {
        console.log(`Received ${MethodNames.COMMIT}Request: `, payload);
        handleCommit(payload.scl, client, payload.txId);
    });

    client.on(MethodNames.ABORT, async (payload: {scl: string, txId: string}) => {
        console.log(`Received ${MethodNames.ABORT}Request: `, payload);
        handleAbort(payload.scl, client, payload.txId);
    });

    /* Flight Manager */

    client.on(MethodNames.QUERY_CLIENT_BALANCE_FABRIC, async (payload: {scl: string, tmId: string, txId: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.QUERY_CLIENT_BALANCE_FABRIC, payload, null, null);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.IS_A_SEAT_AVAILABLE, async (payload: {scl: string, tmId: string, txId: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.IS_A_SEAT_AVAILABLE, payload, null, null);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.HAS_RESERVATION_FABRIC, async (payload: {scl: string, tmId: string, txId: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.HAS_RESERVATION_FABRIC, payload, null, null);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.ADD_TO_CLIENT_BALANCE_FABRIC, async (payload: {scl: string, tmId: string, txId: string, amount: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.ADD_TO_CLIENT_BALANCE_FABRIC, payload,
            new Parameter("amount", SCDLTypes.STRING), new Argument("amount", payload.amount));
        handleInvoke(invocation, client, false);
    });

    client.on(MethodNames.IS_SEAT_AVAILABLE, async (payload: {scl: string, tmId: string, txId: string, seatNumber: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.IS_SEAT_AVAILABLE, payload,
            new Parameter("seatNumber", SCDLTypes.STRING), new Argument("seatNumber", payload.seatNumber));
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.IS_A_SEAT_AVAILABLE, async (payload: {scl: string, tmId: string, txId: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.IS_A_SEAT_AVAILABLE, payload, null, null);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.QUERY_NEXT_AVAILABLE_SEAT, async (payload: {scl: string, tmId: string, txId: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.QUERY_NEXT_AVAILABLE_SEAT, payload, null, null);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.IS_SEAT_BOOKED_BY_CLIENT, async (payload: {scl: string, tmId: string, txId: string, seatNumber: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.IS_SEAT_BOOKED_BY_CLIENT, payload,
            new Parameter("seatNumber", SCDLTypes.STRING), new Argument("seatNumber", payload.seatNumber));
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.QUERY_SEATS_COUNT, async (payload: {scl: string, tmId: string, txId: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.QUERY_SEATS_COUNT, payload,
            null, null);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.CHANGE_SEAT_COUNT, async (payload: {scl: string, tmId: string, txId: string, newCount: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.CHANGE_SEAT_COUNT, payload,
            new Parameter("newCount", SCDLTypes.STRING), new Argument("newCount", payload.newCount));
        handleInvoke(invocation, client, false);
    });

    client.on(MethodNames.QUERY_BOOKED_SEATS_COUNT, async (payload: {scl: string, tmId: string, txId: string, newCount: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.QUERY_BOOKED_SEATS_COUNT, payload,
            null, null);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.CHANGE_SEAT_PRICE, async (payload: {scl: string, tmId: string, txId: string, newPrice: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.CHANGE_SEAT_PRICE, payload,
            new Parameter("newCount", SCDLTypes.STRING), new Argument("newCount", payload.newPrice));
        handleInvoke(invocation, client, false);
    });

    client.on(MethodNames.QUERY_SEAT_PRICE, async (payload: {scl: string, tmId: string, txId: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.QUERY_SEAT_PRICE, payload,
            null, null);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.BOOK_SEAT, async (payload: {scl: string, tmId: string, txId: string, seatNumber: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.BOOK_SEAT, payload,
            new Parameter("seatNumber", SCDLTypes.STRING), new Argument("seatNumber", payload.seatNumber));
        handleInvoke(invocation, client, false);
    });

    client.on(MethodNames.END_FLIGHT, async (payload: {scl: string, tmId: string, txId: string}) => {
        let invocation = generateFabricDtxInvocation(MethodNames.END_FLIGHT, payload,
            null, null);
        handleInvoke(invocation, client, false);
    });

    /* Hotel Manager */
    client.on(MethodNames.QUERY_CLIENT_BALANCE_ETHEREUM, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.QUERY_CLIENT_BALANCE_ETHEREUM}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithReturn(MethodNames.QUERY_CLIENT_BALANCE_ETHEREUM, payload.tmId, payload.txId, new Parameter("clientBalance", SCDLTypes.UNSIGNED_256), payload.scl);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.IS_ROOM_AVAILABLE, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.IS_ROOM_AVAILABLE}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithReturn(MethodNames.IS_ROOM_AVAILABLE, payload.tmId, payload.txId, new Parameter("isRoomAvailable", SCDLTypes.BOOLEAN), payload.scl);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.HAS_RESERVATION_ETHEREUM, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.HAS_RESERVATION_ETHEREUM}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithReturn(MethodNames.HAS_RESERVATION_ETHEREUM, payload.tmId, payload.txId, new Parameter("hasReservation", SCDLTypes.BOOLEAN), payload.scl);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.QUERY_ROOM_PRICE, async (payload: { tmId: string, txId: string, scl: string }) => {
        console.log(`Received ${MethodNames.QUERY_ROOM_PRICE}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithReturn(MethodNames.QUERY_ROOM_PRICE, payload.tmId, payload.txId, new Parameter("roomPrice", SCDLTypes.UNSIGNED_256), payload.scl);
        handleInvoke(invocation, client, true);
    });

    client.on(MethodNames.ADD_TO_CLIENT_BALANCE_ETHEREUM, async (payload: { tmId: string, txId: string, amountToAdd: string, scl: string }) => {
        console.log(`Received ${MethodNames.QUERY_ROOM_PRICE}Request: `, payload);
        const invocation = generateEthereumDtxInvocationWithoutReturn(
            MethodNames.ADD_TO_CLIENT_BALANCE_ETHEREUM,
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

function generateFabricDtxInvocation(methodName: string, payload: {tmId: string, txId: string, scl: string}, inputParam: Parameter, inputArg: Argument): InvokeDtx {
    console.log(`Received ${methodName}Request: `, payload);
    const invocation = new InvokeDtx();
    invocation.methodName = methodName;
    invocation.scl = payload.scl;
    invocation.hasReturnValues = true;
    invocation.inputParameters = [new Parameter("txId", SCDLTypes.STRING), new Parameter("tm", SCDLTypes.STRING)];
    invocation.inputArguments = [new Argument("txId", payload.txId), new Argument("tm", payload.tmId)];
    invocation.outputParameters = [new Parameter("return", SCDLTypes.STRING)];

    if (inputParam && inputArg) {
        invocation.inputArguments.push(inputArg);
        invocation.inputParameters.push(inputParam);
    }

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

function readResult(invocation: InvokeDtx, client: any, websocketResponseName: string) {
    const queryJsonRpcClient = getDefaultJsonRpcClient(invocation.scl);
    const queryRequest = new QueryRequest();
    const eventName = `${invocation.methodName.charAt(0).toUpperCase()}${invocation.methodName.substring(1)}Event`;
    //queryRequest.filter = `txId == '${payload.txId}'`;
    queryRequest.signature = new MemberSignature(eventName, false, invocation.outputParameters);

    console.log("Submitting SCIP Query Request for: ", queryRequest.signature.name);

    queryJsonRpcClient.request("Query", queryRequest).then((result: QueryResponse) => {
        console.log("Received SCIP Query synchronous response including ", result.occurrences.length, " event occurrences");
        const possiblyRelevant = result.occurrences.filter(oc => oc.parameters[0].value === invocation.inputArguments[0].value).sort((a, b) => {
            return dayjs(a.isoTimestamp).isAfter(dayjs(b.isoTimestamp)) ? +1 : -1;
        });
        if (possiblyRelevant.length > 0) {
            io.to(client.id).emit(websocketResponseName, possiblyRelevant[possiblyRelevant.length - 1].parameters.filter(p => p.name === invocation.outputParameters[1].name)[0].value);
        } else {
            io.to(client.id).emit(websocketResponseName, "The invocation reported no results!");
        }
    }, () => {
        console.log("SCIP Query failed.");
        io.to(client.id).emit(websocketResponseName, "querying results failed!");
    });
}

function checkForAbort(invocation: InvokeDtx, client: any, websocketResponseName: string, hasResult: boolean): void {
    const isAbortedJsonRpcClient = getDefaultJsonRpcClient(invocation.scl);
    const request = {dtxId: invocation.inputArguments[0].value};

    console.log("Checking if the transaction", request.dtxId, " is aborted.");

    isAbortedJsonRpcClient.request(MethodNames.IS_ABORTED, request).then((result: string) => {

        if (result === "true") {
            io.to(client.id).emit(websocketResponseName, `The transaction ${invocation.inputArguments[0].value} has been aborted due to lock violation!`);
        } else if (hasResult) {
            // not aborted; read the results.
            readResult(invocation, client, websocketResponseName);
        } else {
            io.to(client.id).emit(websocketResponseName, "Successful!");
        }
    }, (error) => {
        console.log("Verifying the state of the transaction failed!");
        io.to(client.id).emit(websocketResponseName, "Verifying transaction state failed: " + error.message);
    });
}

function handleInvoke(invocation: InvokeDtx, client: any, hasResponse: boolean) {
    const invokeRequest = new InvokeRequest();
    invokeRequest.callbackUrl = ADDRESS;
    invokeRequest.correlationId = crypto.randomUUID();
    invokeRequest.degreeOfConfidence = DOC;
    invokeRequest.sideEffects = true;
    invokeRequest.signature = new MemberSignature(invocation.methodName.split('_')[0], true, invocation.inputParameters);
    invokeRequest.inputArguments = invocation.inputArguments;
    invokeRequest.outputParams = invocation.outputParameters;
    invokeRequest.timeout = TIMEOUT;

    const invokeJsonRpcClient = getDefaultJsonRpcClient(invocation.scl);
    const websocketResponseName = `${invocation.methodName}Response`;
    console.log("Submitting SCIP Invoke Request. Correlation Id: ", invokeRequest.correlationId);

    requests.set(invokeRequest.correlationId, (isError: boolean, payload: any) => {
        requests.delete(invokeRequest.correlationId);

        if (isError || payload.errorCode) {
            console.log("Received async SCIP error: ", payload.errorMessage);
            io.to(client.id).emit(websocketResponseName, "Smart contract invocation failed: " + payload.errorMessage);
        } else {
            console.log("Received async SCIP Invoke response: ", payload);

            if (MethodNames.FLIGHT_MANAGER_FUNCTIONS.includes(invocation.methodName)) {
                if (hasResponse) {
                    if (payload && payload.parameters && payload.parameters.length > 0) {
                        io.to(client.id).emit(websocketResponseName, payload.parameters[0].value);
                    } else {
                        io.to(client.id).emit(websocketResponseName, "null");
                    }
                }else {
                    io.to(client.id).emit(websocketResponseName, "Successful!");
                }
            } else {
                checkForAbort(invocation, client, websocketResponseName, hasResponse);
            }
        }
    });

    invokeJsonRpcClient.request("Invoke", invokeRequest).then(result => {
        console.log("Received SCIP Invoke synchronous response: ", result);
    }, (error) => {
        console.error("SCIP Invoke failed. Correlation Id: ", invokeRequest.correlationId, ". Reason: ", error);
        io.to(client.id).emit(websocketResponseName, error.message);
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

function handleStart(scl: string, client: any): void {
    let startRpcClient = getDefaultJsonRpcClient(scl);
    startRpcClient.request(MethodNames.START, null).then(result => {
        console.log("Received T-SCIP DtxStart response: ", result);
        io.to(client.id).emit(`${MethodNames.START}Response`, result);
    }, (error) => {
        console.error("T-SCIP DtxStart failed. Reason: ", error);
        io.to(client.id).emit(`${MethodNames.START}Response`, error.message);
    });
}

function handleRegister(scl: string, client: any, txId: string, blockchainId: string): void {
    let registerBcRpcClient = getDefaultJsonRpcClient(scl);
    registerBcRpcClient.request(MethodNames.REGISTER, {dtxId: txId, blockchainId: blockchainId}).then(result => {
        console.log("Received T-SCIP DtxRegister response: ", result);
        io.to(client.id).emit(`${MethodNames.REGISTER}Response`, result);
    }, (error) => {
        console.error("T-SCIP DtxRegister failed. Reason: ", error);
        io.to(client.id).emit(`${MethodNames.REGISTER}Response`, error.message);
    });
}

function handleCommit(scl: string, client: any, txId: string): void {
    let commitRequest = new DtxCommit();
    commitRequest.dtxId = txId;
    commitRequest.callbackUrl = ADDRESS;

    const commitJsonRpcClient = getDefaultJsonRpcClient(scl);
    const websocketResponseName = `${MethodNames.COMMIT}Response`;
    console.log("Submitting SCIP DtxCommit Request. Transaction Id: ", commitRequest.dtxId);

    requests.set(commitRequest.dtxId, (isError: boolean, payload: any) => {
        requests.delete(commitRequest.dtxId);

        if (isError) {
            console.log("Received async T-SCIP error: ", payload.errorMessage);
            io.to(client.id).emit(websocketResponseName, "Commit failed: " + payload.errorMessage);
        } else {
            console.log("Received async T-SCIP DtxCommit response: ", payload);

            if (payload.errorCode) {
                io.to(client.id).emit(websocketResponseName, payload.errorMessage);
            } else if (payload.verdict === "ABORT") {
                io.to(client.id).emit(websocketResponseName, payload.message);
            } else {
                io.to(client.id).emit(websocketResponseName, "Successful!");
            }
        }
    });

    commitJsonRpcClient.request(MethodNames.COMMIT, commitRequest).then(result => {
        console.log("Received T-SCIP DtxCommit synchronous response: ", result);
    }, (error) => {
        console.error("T-SCIP DtxCommit failed. Transaction id: ", commitRequest.dtxId, ". Reason: ", error);
        io.to(client.id).emit(websocketResponseName, error.message);
    });
}

function handleAbort(scl: string, client: any, txId: string): void {
    let abortRequest = new DtxAbort();
    abortRequest.dtxId = txId;
    abortRequest.callbackUrl = ADDRESS;

    const abortJsonRpcClient = getDefaultJsonRpcClient(scl);
    const websocketResponseName = `${MethodNames.ABORT}Response`;
    console.log("Submitting SCIP DtxAbort Request. Transaction Id: ", abortRequest.dtxId);

    requests.set(abortRequest.dtxId, (isError: boolean, payload: any) => {
        requests.delete(abortRequest.dtxId);

        if (isError) {
            console.log("Received async T-SCIP error: ", payload.errorMessage);
            io.to(client.id).emit(websocketResponseName, "Abort failed: " + payload.errorMessage);
        } else {
            console.log("Received async T-SCIP DtxAbort response: ", payload);

            if (payload.errorCode) {
                io.to(client.id).emit(websocketResponseName, payload.errorMessage);
            } else {
                io.to(client.id).emit(websocketResponseName, "Successful!");
            }
        }
    });

    abortJsonRpcClient.request(MethodNames.ABORT, abortRequest).then(result => {
        console.log("Received T-SCIP DtxAbort synchronous response: ", result);
    }, (error) => {
        console.error("T-SCIP DtxAbort failed. Transaction id: ", abortRequest.dtxId, ". Reason: ", error);
        io.to(client.id).emit(websocketResponseName, error.message);
    });
}
