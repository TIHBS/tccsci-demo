import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ScipService} from './scip/scip.service';
import {Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'client-application';
}
