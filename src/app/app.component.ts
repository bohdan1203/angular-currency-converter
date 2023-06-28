import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { ENDPOINT } from 'src/constants/endpoint';
import { OPTIONS } from 'src/constants/options';

interface Response {
  date: string;
  info: { timestamp: number; rate: number };
  query: { from: string; to: string; amount: number };
  result: number;
  success: boolean;
}

interface CachedRates {
  [key: string]: number;
}

type Currency = 'currency1' | 'currency2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  cachedRates: CachedRates = {
    USDtoUAH: 1,
    EURtoUAH: 1,
  };

  currentRate: number = 1;
  currency1: string = '';
  currency2: string = '';
  amountCurrency1: number = 0;
  amountCurrency2: number = 0;
  bothCurrenciesSelected: boolean = false;
  fetchError: boolean = false;

  constructor(private http: HttpClient) {}

  onAmountCurrency1Change(amount: number) {
    this.updateAmounts(amount, 'currency1');
  }

  onAmountCurrency2Change(amount: number) {
    this.updateAmounts(amount, 'currency2');
  }

  onCurrency1Change() {
    this.bothCurrenciesSelected = Boolean(this.currency1 && this.currency2);
    this.updateCurrentRateAndAmounts(this.amountCurrency1, 'currency1');
  }

  onCurrency2Change() {
    this.bothCurrenciesSelected = Boolean(this.currency1 && this.currency2);
    this.updateCurrentRateAndAmounts(this.amountCurrency2, 'currency2');
  }

  ngOnInit() {
    this.fetchRateAndUpdateAmounts('USD', 'UAH');
    this.fetchRateAndUpdateAmounts('EUR', 'UAH');
  }

  private updateAmounts(amount: number, currency: Currency) {
    if (this.bothCurrenciesSelected) {
      if (currency === 'currency1') {
        this.amountCurrency1 = amount;
        this.amountCurrency2 = this.roundAmount(
          this.amountCurrency1 * this.currentRate
        );
      } else {
        this.amountCurrency2 = amount;
        this.amountCurrency1 = this.roundAmount(
          this.amountCurrency2 / this.currentRate
        );
      }
    }
  }

  private updateCurrentRateAndAmounts(amount: number, currency: Currency) {
    const existingCachedRate =
      this.cachedRates[`${this.currency1}to${this.currency2}`];

    if (this.bothCurrenciesSelected) {
      if (this.currency1 === this.currency2) {
        this.currentRate = 1;
      } else if (existingCachedRate) {
        this.currentRate = existingCachedRate;
      } else {
        this.fetchRateAndUpdateAmounts(
          this.currency1,
          this.currency2,
          amount,
          currency
        );

        return;
      }

      this.updateAmounts(amount, currency);
    }
  }

  private fetchRateAndUpdateAmounts(
    cur1: string,
    cur2: string,
    amount?: number,
    currency?: Currency
  ) {
    const options = {
      ...OPTIONS,
      params: { from: cur1, to: cur2, amount: '1' },
    };

    this.http.get(ENDPOINT, options).subscribe(
      (response: Response) => {
        if (response.success) {
          this.cachedRates[`${cur1}to${cur2}`] = response?.info?.rate;
          this.cachedRates[`${cur2}to${cur1}`] = 1 / response?.info?.rate;
          this.fetchError = false;

          if (this.bothCurrenciesSelected) {
            this.currentRate =
              this.cachedRates[`${this.currency1}to${this.currency2}`];

            this.updateAmounts(amount, currency);
          }
        } else {
          this.fetchError = true;
        }
      },
      (error) => {
        console.error(error);
        this.fetchError = true;
      }
    );
  }

  private roundAmount(amount: number): number {
    return Number(amount.toFixed(2));
  }
}
