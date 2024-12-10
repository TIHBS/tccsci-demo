import {MemberSignature} from "./member-signature";

export class UnsubscribeRequest {
    signature: MemberSignature | undefined;
    correlationId: string | undefined;
}