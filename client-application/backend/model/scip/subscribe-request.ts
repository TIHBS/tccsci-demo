import {MemberSignature} from "./member-signature";

export class SubscribeRequest {
    signature: MemberSignature | undefined;
    callbackUrl: string | undefined;
    correlationId: string | undefined;
    readonly callbackBinding: string = "json-rpc";
    degreeOfConfidence: number | undefined;
    filter: string | undefined;
}