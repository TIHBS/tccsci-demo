import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {Observable, take} from 'rxjs';
import {ScFunction} from '../dashboard/model/sc-function';

@Injectable({
  providedIn: 'root'
})
export class ScipService {


  constructor(private socket: Socket) {}

  queryClientBalance(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.QUERY_CLIENT_BALANCE}Response`);
    this.socket.emit(ScFunction.QUERY_CLIENT_BALANCE, { txId: txId, tmId: tmId, scl: scl});

    return observable.pipe(take(1));
  }

  isRoomAvailable(txId: string, tmId: string, scl: string):Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.IS_ROOM_AVAILABLE}Response`);
    this.socket.emit(ScFunction.IS_ROOM_AVAILABLE, { txId: txId, tmId: tmId, scl: scl });

    return observable.pipe(take(1));
  }

  hasReservation(txId: string, tmId: string, scl: string):Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.HAS_RESERVATION}Response`);
    this.socket.emit(ScFunction.HAS_RESERVATION, { txId: txId, tmId: tmId, scl: scl });

    return observable.pipe(take(1));
  }

  queryRoomPrice(txId: string, tmId: string, scl: string):Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.QUERY_ROOM_PRICE}Response`);
    this.socket.emit(ScFunction.QUERY_ROOM_PRICE, { txId: txId, tmId: tmId, scl: scl });

    return observable.pipe(take(1));
  }

  addToClientBalance(txId: string, tmId: string, amount: string | undefined | null, scl: string):Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.ADD_TO_CLIENT_BALANCE}Response`);
    this.socket.emit(ScFunction.ADD_TO_CLIENT_BALANCE, { txId: txId, tmId: tmId, amountToAdd: amount, scl: scl });

    return observable.pipe(take(1));
  }


}
