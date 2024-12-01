import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {Observable, take} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScipService {

  constructor(private socket: Socket) {}

  sendMessage(msg: string): void {
    this.socket.emit('invoke-request', msg);
  }

  receiveResponse() {
    return this.socket.fromEvent<string>('invoke-sync-response');
  }

  queryClientBalance(txId: string, tmId: string): Observable<string> {
    let observable = this.socket.fromEvent<string>('queryClientBalanceResponse');
    this.socket.emit('queryClientBalanceRequest', { txId: txId, tmId: tmId });

    return observable.pipe(take(1));
  }
}
