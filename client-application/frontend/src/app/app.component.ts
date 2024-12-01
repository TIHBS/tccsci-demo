import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ScipService} from './scip/scip.service';
import {Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  constructor(private scipService: ScipService) {
  }

  title = 'client-application';
  balance$: Observable<string> | undefined;

  sendMessage() {
    this.balance$ = this.scipService.queryClientBalance("TX-1", "0x90645Dc507225d61cB81cF83e7470F5a6AA1215A");
  }
}
