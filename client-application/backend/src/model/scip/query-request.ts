import {MemberSignature} from "./member-signature";

export class QueryRequest {
    timeframe: string | undefined;
    filter: string | undefined;
    signature: MemberSignature | undefined;
}