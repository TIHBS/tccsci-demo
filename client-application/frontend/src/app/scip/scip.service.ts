import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {Observable, take} from 'rxjs';
import {ScFunction} from '../dashboard/model/sc-function';
import {ScipMethod} from '../dashboard/model/scip-method';

@Injectable({
  providedIn: 'root'
})
export class ScipService {
  constructor(private socket: Socket) {}

  /* Flight Manager Smart Contract */
  queryClientBalanceFabric(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.QUERY_CLIENT_BALANCE_FABRIC}Response`);
    this.socket.emit(ScFunction.QUERY_CLIENT_BALANCE_FABRIC, { txId: txId, tmId: tmId, scl: scl });

    return observable.pipe(take(1));
  }

  hasReservationFabric(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.HAS_RESERVATION_FABRIC}Response`);
    this.socket.emit(ScFunction.HAS_RESERVATION_FABRIC, { txId: txId, tmId: tmId, scl: scl });

    return observable.pipe(take(1));
  }

  addToClientBalanceFabric(txId: string, tmId: string, amount: string | undefined | null, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.ADD_TO_CLIENT_BALANCE_FABRIC}Response`);
    this.socket.emit(ScFunction.ADD_TO_CLIENT_BALANCE_FABRIC, { txId: txId, tmId: tmId, amount: amount, scl: scl });

    return observable.pipe(take(1));
  }

  isSeatAvailable(txId: string, tmId: string, seatNumber: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.IS_SEAT_AVAILABLE}Response`);
    this.socket.emit(ScFunction.IS_SEAT_AVAILABLE, { txId: txId, tmId: tmId, seatNumber: seatNumber, scl: scl});

    return observable.pipe(take(1));
  }

  isASeatAvailable(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.IS_A_SEAT_AVAILABLE}Response`);
    this.socket.emit(ScFunction.IS_A_SEAT_AVAILABLE, { txId: txId, tmId: tmId, scl: scl});

    return observable.pipe(take(1));
  }

  queryNextAvailableSeat(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.QUERY_NEXT_AVAILABLE_SEAT}Response`);
    this.socket.emit(ScFunction.QUERY_NEXT_AVAILABLE_SEAT, { txId: txId, tmId: tmId, scl: scl});

    return observable.pipe(take(1));
  }

  isSeatBookedByClient(txId: string, tmId: string, seatNumber: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.IS_SEAT_BOOKED_BY_CLIENT}Response`);
    this.socket.emit(ScFunction.IS_SEAT_BOOKED_BY_CLIENT, { txId: txId, tmId: tmId, seatNumber: seatNumber, scl: scl});

    return observable.pipe(take(1));
  }

  querySeatsCount(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.QUERY_SEATS_COUNT}Response`);
    this.socket.emit(ScFunction.QUERY_SEATS_COUNT, { txId: txId, tmId: tmId, scl: scl});

    return observable.pipe(take(1));
  }

  changeSeatsCount(txId: string, tmId: string, newCount: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.CHANGE_SEATS_COUNT}Response`);
    this.socket.emit(ScFunction.CHANGE_SEATS_COUNT, { txId: txId, tmId: tmId, newCount: newCount, scl: scl});

    return observable.pipe(take(1));
  }

  queryBookedSeatsCount(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.QUERY_BOOKED_SEATS_COUNT}Response`);
    this.socket.emit(ScFunction.QUERY_BOOKED_SEATS_COUNT, { txId: txId, tmId: tmId, scl: scl});

    return observable.pipe(take(1));
  }

  changeSeatPrice(txId: string, tmId: string, newPrice: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.CHANGE_SEAT_PRICE}Response`);
    this.socket.emit(ScFunction.CHANGE_SEAT_PRICE, { txId: txId, tmId: tmId, newPrice: newPrice, scl: scl});

    return observable.pipe(take(1));
  }

  querySeatPrice(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.QUERY_SEAT_PRICE}Response`);
    this.socket.emit(ScFunction.QUERY_SEAT_PRICE, { txId: txId, tmId: tmId, scl: scl});

    return observable.pipe(take(1));
  }

  bookSeat(txId: string, tmId: string, seatNumber: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.BOOK_SEAT}Response`);
    this.socket.emit(ScFunction.BOOK_SEAT, { txId: txId, tmId: tmId, seatNumber: seatNumber, scl: scl});

    return observable.pipe(take(1));
  }

  endFlight(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.BOOK_SEAT}Response`);
    this.socket.emit(ScFunction.BOOK_SEAT, { txId: txId, tmId: tmId, scl: scl});

    return observable.pipe(take(1));
  }

  /* Hotel Manager Smart Contract */
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

  changeRoomPrice(txId: string, tmId: string, newPrice: string | undefined | null, scl: string):Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.CHANGE_ROOM_PRICE}Response`);
    this.socket.emit(ScFunction.CHANGE_ROOM_PRICE, { txId: txId, tmId: tmId, newPrice: newPrice, scl: scl });

    return observable.pipe(take(1));
  }

  bookRoom(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.BOOK_ROOM}Response`);
    this.socket.emit(ScFunction.BOOK_ROOM, { txId: txId, tmId: tmId, scl: scl });

    return observable.pipe(take(1));
  }

  checkout(txId: string, tmId: string, scl: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScFunction.CHECKOUT}Response`);
    this.socket.emit(ScFunction.CHECKOUT, { txId: txId, tmId: tmId, scl: scl });

    return observable.pipe(take(1));
  }

  dtxStart(scl: string):Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScipMethod.START}Response`);
    this.socket.emit(ScipMethod.START, { scl: scl });

    return observable.pipe(take(1));
  }

  dtxRegister(scl: string, txId: string, blockchainId: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScipMethod.REGISTER}Response`);
    this.socket.emit(ScipMethod.REGISTER, {scl: scl, txId: txId, blockchainId: blockchainId});

    return observable.pipe(take(1));
  }

  dtxCommit(scl: string, txId: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScipMethod.COMMIT}Response`);
    this.socket.emit(ScipMethod.COMMIT, {scl: scl, txId: txId});

    return observable.pipe(take(1));
  }

  dtxAbort(scl: string, txId: string): Observable<string> {
    let observable = this.socket.fromEvent<string>(`${ScipMethod.ABORT}Response`);
    this.socket.emit(ScipMethod.ABORT, {scl: scl, txId: txId});

    return observable.pipe(take(1));
  }

}
