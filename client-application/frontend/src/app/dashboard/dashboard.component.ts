import {Component, inject} from '@angular/core';

import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import {ScipMethod} from './model/scip-method';
import {ScipService} from '../scip/scip.service';
import {ScFunction} from './model/sc-function';
import {interval, Observable, takeWhile} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {environment} from '../../environments/environment';

interface Function {
  value: ScFunction;
  viewValue: string;
}

interface FunctionGroup {
  name: string;
  functions: Function[];
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule
  ]
})
export class DashboardComponent {

  constructor(private scipService: ScipService) {
  }

  protected readonly ScipMethod = ScipMethod;
  scl: string = "";
  method: ScipMethod = ScipMethod.INVOKE;

  logMsg: string = "";
  isLoading: boolean = false;

  private invokeFormBuilder = inject(FormBuilder);
  private registerFormBuilder = inject(FormBuilder);

  invokeForm = this.invokeFormBuilder.group({
    scFunction: ['', Validators.required],
    parameter1Value: ['', Validators.required],
    parameter2Value: ['', Validators.required],
    parameter3Value: ['', null]
  });

  registerForm = this.registerFormBuilder.group({
    txId: ['', Validators.required],
    blockchainId: ['', Validators.required]
  });

  commitForm = this.registerFormBuilder.group({
    txId: ['', Validators.required]
  });

  abortForm = this.registerFormBuilder.group({
    txId: ['', Validators.required]
  });

  scipMethods: ScipMethod[] = [
    ScipMethod.START,
    ScipMethod.INVOKE,
    ScipMethod.REGISTER,
    ScipMethod.COMMIT,
    ScipMethod.ABORT
  ];

  functionNames: FunctionGroup[] = [
    {
      name: "Hotel Manager Smart Contract",
      functions: [
        { value : ScFunction.QUERY_CLIENT_BALANCE, viewValue : ScFunction.QUERY_CLIENT_BALANCE },
        { value : ScFunction.ADD_TO_CLIENT_BALANCE, viewValue : ScFunction.ADD_TO_CLIENT_BALANCE },
        { value : ScFunction.QUERY_ROOM_PRICE, viewValue : ScFunction.QUERY_ROOM_PRICE },
        { value : ScFunction.CHANGE_ROOM_PRICE, viewValue : ScFunction.CHANGE_ROOM_PRICE },
        { value : ScFunction.HAS_RESERVATION, viewValue : ScFunction.HAS_RESERVATION },
        { value : ScFunction.IS_ROOM_AVAILABLE, viewValue : ScFunction.IS_ROOM_AVAILABLE },
        { value : ScFunction.BOOK_ROOM, viewValue : ScFunction.BOOK_ROOM },
        { value : ScFunction.CHECKOUT, viewValue : ScFunction.CHECKOUT }
      ]
    },
    {
      name: "Flight Manager Smart Contract",
      functions: [
        { value : ScFunction.QUERY_CLIENT_BALANCE_FABRIC, viewValue : "queryClientBalance" },
        { value : ScFunction.HAS_RESERVATION_FABRIC, viewValue : "hasReservation" },
        { value : ScFunction.ADD_TO_CLIENT_BALANCE_FABRIC, viewValue : "addToClientBalance" },
        { value : ScFunction.IS_SEAT_AVAILABLE, viewValue : ScFunction.IS_SEAT_AVAILABLE },
        { value : ScFunction.IS_A_SEAT_AVAILABLE, viewValue : ScFunction.IS_A_SEAT_AVAILABLE },
        { value : ScFunction.QUERY_NEXT_AVAILABLE_SEAT, viewValue : ScFunction.QUERY_NEXT_AVAILABLE_SEAT },
        { value : ScFunction.IS_SEAT_BOOKED_BY_CLIENT, viewValue : ScFunction.IS_SEAT_BOOKED_BY_CLIENT },
        { value : ScFunction.QUERY_SEATS_COUNT, viewValue : ScFunction.QUERY_SEATS_COUNT },
        { value : ScFunction.CHANGE_SEATS_COUNT, viewValue : ScFunction.CHANGE_SEATS_COUNT },
        { value : ScFunction.QUERY_BOOKED_SEATS_COUNT, viewValue : ScFunction.QUERY_BOOKED_SEATS_COUNT },
        { value : ScFunction.CHANGE_SEAT_PRICE, viewValue : ScFunction.CHANGE_SEAT_PRICE },
        { value : ScFunction.QUERY_SEAT_PRICE, viewValue : ScFunction.QUERY_SEAT_PRICE },
        { value : ScFunction.BOOK_SEAT, viewValue : ScFunction.BOOK_SEAT },
        { value : ScFunction.END_FLIGHT, viewValue : ScFunction.END_FLIGHT }
      ]
    }
  ];

  onSubmit(): void {
    if (this.method === ScipMethod.INVOKE) {
      this.invoke();
    } else if (this.method === ScipMethod.REGISTER) {
      this.register();
    } else if (this.method === ScipMethod.COMMIT) {
      this.commit();
    }  else {
      this.abort();
    }
  }

  invoke(): void {
    const functionName = this.invokeForm.value.scFunction;
    if (this.scl && functionName) {
      const arg1 = this.invokeForm.value.parameter1Value;
      const arg2 = this.invokeForm.value.parameter2Value;
      if (arg1 && arg2) {

        const arg3 = this.invokeForm.value.parameter3Value;
        let observable: Observable<string> | undefined;

        switch (functionName) {
          case ScFunction.QUERY_CLIENT_BALANCE:
            this.addEvent(`Invoking ${functionName}(${arg1},${arg2}) on ${this.scl}`);
            this.startWaiting();
            observable = this.scipService.queryClientBalance(arg1, arg2, this.scl);
            break;
          case ScFunction.IS_ROOM_AVAILABLE:
            this.addEvent(`Invoking ${functionName}(${arg1},${arg2}) on ${this.scl}`);
            this.startWaiting();
            observable = this.scipService.isRoomAvailable(arg1, arg2, this.scl);
            break;
          case ScFunction.HAS_RESERVATION:
            this.addEvent(`Invoking ${functionName}(${arg1},${arg2}) on ${this.scl}`);
            this.startWaiting();
            observable = this.scipService.hasReservation(arg1, arg2, this.scl);
            break;
          case ScFunction.QUERY_ROOM_PRICE:
            this.addEvent(`Invoking ${functionName}(${arg1},${arg2}) on ${this.scl}`);
            this.startWaiting();
            observable = this.scipService.queryRoomPrice(arg1, arg2, this.scl);
            break;
          case ScFunction.ADD_TO_CLIENT_BALANCE:
            if (this.isNumber(arg3)) {
              this.addEvent(`Invoking ${functionName}(${arg1},${arg2},${arg3}) on ${this.scl}`);
              this.startWaiting();
              observable = this.scipService.addToClientBalance(arg1, arg2, arg3, this.scl)
            }
            break;
          case ScFunction.CHANGE_ROOM_PRICE:
            if (this.isNumber(arg3)) {
              this.addEvent(`Invoking ${functionName}(${arg1},${arg2},${arg3}) on ${this.scl}`);
              this.startWaiting();
              observable = this.scipService.changeRoomPrice(arg1, arg2, arg3, this.scl);
            }
            break;
          case ScFunction.BOOK_ROOM:
            this.addEvent(`Invoking ${functionName}(${arg1},${arg2}) on ${this.scl}`);
            this.startWaiting();
            observable = this.scipService.bookRoom(arg1, arg2, this.scl);
            break;
          case ScFunction.CHECKOUT:
            this.addEvent(`Invoking ${functionName}(${arg1},${arg2}) on ${this.scl}`);
            this.startWaiting();
            observable = this.scipService.checkout(arg1, arg2, this.scl);
            break;

            /* Flight Management SC */
          case ScFunction.QUERY_CLIENT_BALANCE_FABRIC:
            this.addEvent(`Invoking ${functionName.split('_')[0]}(${arg1},${arg2}) on ${this.scl}`);
            this.startWaiting();
            observable = this.scipService.queryClientBalanceFabric(arg1, arg2, this.scl);
            break;
          case ScFunction.HAS_RESERVATION_FABRIC:
            this.addEvent(`Invoking ${functionName.split('_')[0]}(${arg1},${arg2}) on ${this.scl}`);
            this.startWaiting();
            observable = this.scipService.hasReservationFabric(arg1, arg2, this.scl);
            break;
          case ScFunction.ADD_TO_CLIENT_BALANCE_FABRIC:
            if (this.isNumber(arg3)) {
              this.addEvent(`Invoking ${functionName.split('_')[0]}(${arg1},${arg2},${arg3} ) on ${this.scl}`);
              this.startWaiting();
              observable = this.scipService.addToClientBalanceFabric(arg1, arg2, arg3, this.scl);
            }
            break;
          case ScFunction.IS_A_SEAT_AVAILABLE:
            this.addEvent(`Invoking ${functionName}(${arg1},${arg2}) on ${this.scl}`);
            this.startWaiting();
            observable = this.scipService.isASeatAvailable(arg1, arg2, this.scl);
            break;
        }

        if (observable) {
          observable.subscribe(msg => {
            this.stopWaiting();
            let myMsg = `Invoke result: ${msg}`;
            this.addEvent(myMsg);
          });
        }

      }

    }

  }

  start(): void {
    if (this.scl) {
      this.addEvent(`Calling DtxStart on ${this.scl}`);
      this.startWaiting();
      this.scipService.dtxStart(this.scl).subscribe(msg => {
        this.stopWaiting();
        let myMsg = `DtxStart result: ${msg}`;
        this.addEvent(myMsg);
      });
    }
  }

  register(): void {
    if (this.scl && this.registerForm.value.blockchainId && this.registerForm.value.txId) {
      const txId = this.registerForm.value.txId;
      const blockchainId = this.registerForm.value.blockchainId;
      this.addEvent(`Calling DtxRegister(txId=${txId}, blockchainId=${blockchainId}) on ${this.scl}`);
      this.startWaiting();
      this.scipService.dtxRegister(this.scl, txId, blockchainId).subscribe(msg => {
        this.stopWaiting();
        let myMsg = `DtxRegister result: ${msg}`;
        this.addEvent(myMsg);
      });
    }
  }

  commit(): void {
    if (this.scl &&  this.commitForm.value.txId) {
      const txId = this.commitForm.value.txId;
      this.addEvent(`Calling DtxCommit(txId=${txId}) on ${this.scl}`);
      this.startWaiting();
      this.scipService.dtxCommit(this.scl, txId).subscribe(msg => {
        this.stopWaiting();
        let myMsg = `DtxCommit result: ${msg}`;
        this.addEvent(myMsg);
      });
    }
  }

  abort(): void {
    if (this.scl &&  this.abortForm.value.txId) {
      const txId = this.abortForm.value.txId;
      this.addEvent(`Calling DtxAbort(txId=${txId}) on ${this.scl}`);
      this.startWaiting();
      this.scipService.dtxAbort(this.scl, txId).subscribe(msg => {
        this.stopWaiting();
        let myMsg = `DtxAbort result: ${msg}`;
        this.addEvent(myMsg);
      });
    }
  }

  addEvent(msg: string): void {
    if (this.logMsg && this.logMsg.length > 0) {
      this.logMsg = `${this.logMsg}\n\n> ${msg}`;
    } else {
      this.logMsg = `> ${msg}`;
    }
  }

  startWaiting(): void {
    let counter = 0;
    this.logMsg = `${this.logMsg}\n`;
    this.isLoading = true;

    interval(1000)
      .pipe(takeWhile(() => this.isLoading))
      .subscribe(() => {
        if (counter % 3 === 0) {
          let splits = this.logMsg.lastIndexOf('\n');
          this.logMsg = this.logMsg.substring(0, splits + 1);
        }
        counter++;
        this.logMsg = `${this.logMsg}.`;
      });
  }

  stopWaiting(): void {
    this.isLoading = false;
    let splits = this.logMsg.lastIndexOf('\n');
    this.logMsg = this.logMsg.substring(0, splits);
  }

  copyText(text: string) {
      navigator.clipboard.writeText(text);
  }

  isNumber(value?: string | null | undefined): boolean {
    return ((value != null) &&
      (value !== '') &&
      !isNaN(Number(value.toString())));
  }

  protected readonly environment = environment;
}
