import moment from 'moment-timezone';
import {NordpoolPrices} from "./types";
import {PriceApi} from "./PriceApi";


export class PriceComparer {

    _prices: NordpoolPrices | undefined;
    _priceApi: PriceApi

    constructor(
        priceApi: PriceApi,
    ) {
        this._priceApi = priceApi
    }
    
    updatePrices(prices: NordpoolPrices) {
        this._prices = prices;
    }

    highHoursComparer(args: any, state: any) {
        if (!args.high_hours
            || args.high_hours <= 0
            || args.high_hours >= 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();

        // Finds prices starting at 00:00 today
        const pricesNextHours = this._priceApi.pricesStarting(this._prices, localTime, 0, 24);
        if (pricesNextHours.length === 0) {
            return false;
        }

        // Check if high price now.
        const highPriceNow = this._priceApi.checkHighPrice(pricesNextHours, args.high_hours, localTime);

        return state.high_price === false && highPriceNow.length === 0 || state.high_price === true && highPriceNow.length === 1;
    }

    lowHoursComparer(args: any, state: any) {
        if (!args.low_hours
            || args.low_hours <= 0
            || args.low_hours >= 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();

        // Finds prices starting at 00:00 today
        const pricesNextHours = this._priceApi.pricesStarting(this._prices, localTime, 0, 24);
        if (pricesNextHours.length === 0) {
            return false;
        }

        // Check if low price now
        const lowPriceNow = this._priceApi.checkLowPrice(pricesNextHours, args.low_hours, localTime);

        return state.low_price === true && lowPriceNow.length === 1 || state.low_price === false && lowPriceNow.length === 0;
    }

    priceAvgComparer(args: any, state: any) {
        if (!args.percentage
            || args.percentage <= 0
            || args.percentage >= 100
            || !this._prices) {
            return false;
        }
        const localTime = moment();
        let startHour = 0;
        let numHours = 24;
        if (args.hours) {
            startHour = localTime.hour();
            numHours = args.hours;
        }

        const currentPrice = this._priceApi.currentPrice(this._prices, localTime);
        if (!currentPrice) {
            return false;
        }

        // Finds average of prices
        const averagePrice = this._priceApi.averagePricesStarting(this._prices, localTime, startHour, numHours);
        if (!averagePrice) {
            return false;
        }

        return this._priceApi.checkAveragePrice(currentPrice.price, averagePrice, state.below, args.percentage);
    }

    priceAmongLowestComparer(args: any, state: any) {
        if (!args.low_hours
            || args.low_hours <= 0
            || args.low_hours >= 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        let startHour = 0;
        let numHours = 24;
        let numLowestHours = 1;
        if (args.hours) {
            startHour = localTime.hour();
            numHours = args.hours;
            numLowestHours = args.low_hours;
        }

        return this._priceApi.pricesAmongLowest(this._prices, localTime, startHour, numHours, numLowestHours);
    }

    priceAmongHighestComparer(args: any, state: any) {
        if (!args.high_hours
            || args.high_hours <= 0
            || args.high_hours >= 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        let startHour = 0;
        let numHours = 24;
        let numHighestHours = 1;
        if (args.hours) {
            startHour = localTime.hour();
            numHours = args.hours;
            numHighestHours = args.high_hours;
        }

        return this._priceApi.pricesAmongHighest(this._prices, localTime, startHour, numHours, numHighestHours);
    }

    priceLowestInPeriodComparer(args: any, state: any) {
        if (args.start === undefined
            || args.end === undefined
            || !args.low_hours
            || args.low_hours <= 0
            || args.low_hours >= 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        const { startTs, endTs } = this._priceApi.daysPeriod(localTime, args.start, args.end);
        return this._priceApi.pricesLowestInPeriod(this._prices, localTime, startTs, endTs, args.low_hours);
    }

    priceHighestInPeriodComparer(args: any, state: any) {
        if (args.start === undefined
            || args.end === undefined
            || !args.high_hours
            || args.high_hours <= 0
            || args.high_hours >= 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        const { startTs, endTs } = this._priceApi.daysPeriod(localTime, args.start, args.end);
        return this._priceApi.pricesHighestInPeriod(this._prices, localTime, startTs, endTs, args.high_hours);
    }

    priceLowestNextHoursComparer(args: any, state: any) {
        if (args.start === undefined
            || args.end === undefined
            || !args.hours
            || args.hours <= 0
            || args.hours > 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        const { startTs, endTs } = this._priceApi.daysPeriod(localTime, args.start, args.end);
        const sumPrice = this._priceApi.checkSumPrices(this._prices, localTime, startTs, endTs, args.hours, true);
        return !!sumPrice;
    }

    priceHighestNextHoursComparer(args: any, state: any) {
        if (args.start === undefined
            || args.end === undefined
            || !args.hours
            || args.hours <= 0
            || args.hours > 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        const { startTs, endTs } = this._priceApi.daysPeriod(localTime, args.start, args.end);
        const sumPrice = this._priceApi.checkSumPrices(this._prices, localTime, startTs, endTs, args.hours, false);
        return !!sumPrice;
    }

    priceDiffHighLowComparer(args: any, state: any) {
        if (!args.percentage
            || args.percentage < 0
            || args.percentage > 9999
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        const diffCheck = this._priceApi.priceHighLow(this._prices, localTime);
        return diffCheck.diffPercentage < args.percentage;
    }

    priceDiffHighLowComparer2(args: any, state: any) {
        if (!args.amount
            || args.amount < 0
            || args.amount > 9999
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        const diffCheck = this._priceApi.priceHighLow(this._prices, localTime);
        return diffCheck.diffAmount < args.amount;
    }

    priceLowerNextHoursComparer(args: any, state: any) {
        if (!args.hours
            || args.hours <= 0
            || args.hours > 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        return this._priceApi.currentPriceLowerThanNext(this._prices, localTime, args.hours);
    }

    priceHigherNextHoursComparer(args: any, state: any) {
        if (!args.hours
            || args.hours <= 0
            || args.hours > 24
            || !this._prices) {
            return false;
        }

        const localTime = moment();
        return this._priceApi.currentPriceHigherThanNext(this._prices, localTime, args.hours);
    }
    
}