import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css'],
})
export class CurrencyComponent {
  @Input() amount: number;
  @Input() currency: string;
  @Output() amountChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() currencyChange: EventEmitter<string> = new EventEmitter<string>();
}
