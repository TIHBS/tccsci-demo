import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {Observable, take} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScipService {

  static readonly SCIP_GATEWAY = 'http://localhost:9090';
  static readonly HOTEL_MANAGER_SC_ADDRESS = '0x580b1500e3cea21D4D85b001787791aE0011928b';
  static readonly HOTEL_MANAGER_SCL = `${ScipService.SCIP_GATEWAY}?blockchain=ethereum&blockchain-id=eth-0&address=${ScipService.HOTEL_MANAGER_SC_ADDRESS}`

  constructor(private socket: Socket) {}

  queryClientBalance(txId: string, tmId: string): Observable<string> {
    let observable = this.socket.fromEvent<string>('queryClientBalanceResponse');
    this.socket.emit('queryClientBalance', { txId: txId, tmId: tmId, scl: ScipService.HOTEL_MANAGER_SCL });

    return observable.pipe(take(1));
  }

  isRoomAvailable(txId: string, tmId: string):Observable<string> {
    let observable = this.socket.fromEvent<string>('isRoomAvailableResponse');
    this.socket.emit('isRoomAvailable', { txId: txId, tmId: tmId, scl: ScipService.HOTEL_MANAGER_SCL });

    return observable.pipe(take(1));
  }

  hasReservation(txId: string, tmId: string):Observable<string> {
    let observable = this.socket.fromEvent<string>('hasReservationResponse');
    this.socket.emit('hasReservation', { txId: txId, tmId: tmId, scl: ScipService.HOTEL_MANAGER_SCL });

    return observable.pipe(take(1));
  }

  queryRoomPrice(txId: string, tmId: string):Observable<string> {
    let observable = this.socket.fromEvent<string>('queryRoomPriceResponse');
    this.socket.emit('queryRoomPrice', { txId: txId, tmId: tmId, scl: ScipService.HOTEL_MANAGER_SCL });

    return observable.pipe(take(1));
  }


}
