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

  private fb = inject(FormBuilder);
  invokeForm = this.fb.group({
    scFunction: ['', Validators.required],
    parameter1Value: ['', Validators.required],
    parameter2Value: ['', Validators.required],
    parameter3Value: ['', null]
  });

  scipMethods: ScipMethod[] = [
    ScipMethod.INVOKE,
    ScipMethod.PREPARE,
    ScipMethod.COMMIT,
    ScipMethod.ABORT
  ];

  functionNames: ScFunction[] = [
    ScFunction.QUERY_CLIENT_BALANCE,
    ScFunction.ADD_TO_CLIENT_BALANCE,
    ScFunction.QUERY_ROOM_PRICE,
    ScFunction.CHANGE_ROOM_PRICE,
    ScFunction.HAS_RESERVATION,
    ScFunction.IS_ROOM_AVAILABLE,
    ScFunction.BOOK_ROOM,
    ScFunction.CHECKOUT
  ];

  onSubmit(): void {
    if (this.method === ScipMethod.INVOKE) {
      this.invoke();
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

  prepare(): void {

  }

  commit(): void {

  }

  abort(): void {

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
