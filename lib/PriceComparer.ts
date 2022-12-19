import moment, {Moment} from 'moment-timezone';
import {NordpoolPrices} from "./types";
import {PriceApi} from "./PriceApi";

export class PriceComparer {

    _prices: NordpoolPrices | undefined;
    _priceApi: PriceApi
    _debug: boolean;

    constructor(
        priceApi: PriceApi,
    ) {
        this._priceApi = priceApi;
        this._debug = false;
    }

    updatePrices(prices: NordpoolPrices) {
        this._prices = prices;
    }

    debug(debug: boolean) {
        this._debug = debug;
    }

    logDebug(msg: string) {
        if (this._debug) {
            console.log(msg);
        }
    }

    /**
     * Current price is !{{among|not among}} the [[high_hours]] hours of the days highest prices.
     *
     * Condition to check if the current price is among the today's highest prices.
     * Specify the number of hours with highest prices to compare against.
     *
     * @param args
     * @param state
     * @param curTime
     */
    highHoursComparer(args: { high_hours: number }, state: { high_price: boolean }, curTime?: Moment) {
        if (args.high_hours <= 0
            || args.high_hours >= 24) {
            this.logDebug(`highHoursComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`highHoursComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        const pricesToday = this._priceApi.pricesStarting(this._prices, localTime, 0, 24);
        if (pricesToday.length === 0) {
            this.logDebug(`highHoursComparer: no prices today, args: ${args.high_hours}, state: ${state.high_price}`);
            return false;
        }

        const highPriceNow = this._priceApi.checkHighPrice(pricesToday, args.high_hours, localTime);

        const result = !state.high_price && highPriceNow.length === 0 || state.high_price && highPriceNow.length === 1;

        this.logDebug(`highHoursComparer: high_hours: ${args.high_hours}, state: ${state.high_price}, highPriceNow: ${highPriceNow}, result = ${result}`);

        return result;
    }

    /**
     * Current price is !{{among|not among}} the [[low_hours]] hours of the days lowest prices.
     *
     * Condition to check if the current price is among the today's lowest prices.
     * Specify the number of hours with lowest prices to compare against.
     *
     * @param args
     * @param state
     * @param curTime
     */
    lowHoursComparer(args: { low_hours: number }, state: { low_price: boolean }, curTime?: Moment) {
        if (args.low_hours <= 0
            || args.low_hours >= 24) {
            this.logDebug(`lowHoursComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`lowHoursComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        const pricesToday = this._priceApi.pricesStarting(this._prices, localTime, 0, 24);
        if (pricesToday.length === 0) {
            this.logDebug(`lowHoursComparer: no prices today, args: ${args.low_hours}, state: ${state.low_price}`);
            return false;
        }

        const lowPriceNow = this._priceApi.checkLowPrice(pricesToday, args.low_hours, localTime);

        const result = state.low_price && lowPriceNow.length === 1 || !state.low_price && lowPriceNow.length === 0;

        this.logDebug(`lowHoursComparer: low_hours: ${args.low_hours}, state: ${state.low_price}, lowPriceNow: ${lowPriceNow}, result = ${result}`);

        return result;
    }

    /**
     * Check if current price is X % below / above average price for today or average price for next Y hours.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceAvgComparer(args: { percentage: number, hours?: number }, state: { below: boolean }, curTime?: Moment) {
        if (args.percentage <= 0
            || args.percentage >= 100) {
            this.logDebug(`priceAvgComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceAvgComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        let startHour = 0;
        let numHours = 24;
        if (args.hours) {
            startHour = localTime.hour();
            numHours = args.hours;
        }

        const currentPrice = this._priceApi.currentPrice(this._prices, localTime);
        if (currentPrice === undefined) {
            this.logDebug(`priceAvgComparer: no current price`);
            return false;
        }

        const averagePrice = this._priceApi.averagePricesStarting(this._prices, localTime, startHour, numHours);
        if (!averagePrice) {
            this.logDebug(`priceAvgComparer: no average price`);
            return false;
        }

        const result = this._priceApi.checkAveragePrice(currentPrice.price, averagePrice, state.below, args.percentage);

        this.logDebug(`priceAvgComparer: percentage: ${args.percentage}, state: ${state.below}, currentPrice: ${currentPrice.price}, averagePrice: ${averagePrice}, result = ${result}`);

        return result;
    }

    /**
     * Current price is !{{|not}} among the [[low_hours]] hours of lowest between [[start]] and [[end]].
     *
     * Condition to check if the current price is among the X lowest in a period.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceAmongLowestComparer(args: { low_hours: number, hours?: number }, state: any, curTime?: Moment) {
        if (args.low_hours <= 0
            || args.low_hours >= 24) {
            this.logDebug(`priceAmongLowestComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceAmongLowestComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

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

    /**
     * The following [[hours]] hours are !{{|not}} among the [[high_hours]] hours of today's highest prices.
     *
     * Condition to check if one of the following hours are among the today's highest prices.
     * Specify the number of hours from now, including the current hour and the number of hours
     * with highest prices to compare against.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceAmongHighestComparer(args: { high_hours: number, hours?: number }, state: any, curTime?: Moment) {
        if (args.high_hours <= 0
            || args.high_hours >= 24) {
            this.logDebug(`priceAmongHighestComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceAmongHighestComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

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

    /**
     * Current price is !{{|not}} among the [[low_hours]] hours of lowest between [[start]] and [[end]].
     *
     * Condition to check if the current price is among the X lowest in a period.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceLowestInPeriodComparer(args: { start: number | string, end: number | string, low_hours: number }, state: any, curTime?: Moment) {
        if (args.start === undefined
            || args.end === undefined
            || !args.low_hours
            || args.low_hours <= 0
            || args.low_hours >= 24) {
            this.logDebug(`priceLowestInPeriodComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceLowestInPeriodComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        const {startTs, endTs} = this._priceApi.daysPeriod(localTime, args.start, args.end);
        return this._priceApi.pricesLowestInPeriod(this._prices, localTime, startTs, endTs, args.low_hours);
    }

    /**
     * Current price is !{{|not}} among the [[high_hours]] hours of highest between [[start]] and [[end]].
     *
     * Condition to check if the current price is among the X highest in a period.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceHighestInPeriodComparer(args: { start: number | string, end: number | string, high_hours: number }, state: any, curTime?: Moment) {
        if (args.start === undefined
            || args.end === undefined
            || !args.high_hours
            || args.high_hours <= 0
            || args.high_hours >= 24) {
            this.logDebug(`priceHighestInPeriodComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceHighestInPeriodComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        const {startTs, endTs} = this._priceApi.daysPeriod(localTime, args.start, args.end);
        return this._priceApi.pricesHighestInPeriod(this._prices, localTime, startTs, endTs, args.high_hours);
    }

    /**
     * The following [[hours]] consecutive hours have !{{|not}} the lowest total price between [[start]] and [[end]].
     *
     * Condition for checking whether the next hours in a row have the lowest total price in a period.
     * Use '00:00' for both start and end for the current day.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceLowestNextHoursComparer(args: { start: number | string, end: number | string, hours: number }, state: any, curTime?: Moment) {
        if (args.start === undefined
            || args.end === undefined
            || !args.hours
            || args.hours <= 0
            || args.hours > 24) {
            this.logDebug(`priceLowestNextHoursComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceLowestNextHoursComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        const {startTs, endTs} = this._priceApi.daysPeriod(localTime, args.start, args.end);
        const sumPrice = this._priceApi.checkSumPrices(this._prices, localTime, startTs, endTs, args.hours, true);
        return !!sumPrice;
    }

    /**
     * The following [[hours]] consecutive hours have !{{|not}} the highest total price between [[start]] and [[end]].
     *
     * Condition for checking whether the next hours in a row have the highest total price in a period.
     * Use '00:00' for both start and end for the current day.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceHighestNextHoursComparer(args: { start: number | string, end: number | string, hours: number }, state: any, curTime?: Moment) {
        if (args.start === undefined
            || args.end === undefined
            || !args.hours
            || args.hours <= 0
            || args.hours > 24) {
            this.logDebug(`priceHighestNextHoursComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceHighestNextHoursComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        const {startTs, endTs} = this._priceApi.daysPeriod(localTime, args.start, args.end);
        const sumPrice = this._priceApi.checkSumPrices(this._prices, localTime, startTs, endTs, args.hours, false);
        return !!sumPrice;
    }

    /**
     * Difference between highest and lowest price is !{{less|more}} than [[percentage]] %.
     *
     * Condition to check if the difference between the highest and the lowest price for
     * the whole day is less or more than X percent.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceDiffHighLowComparer(args: { percentage: number }, state: any, curTime?: Moment) {
        if (!args.percentage
            || args.percentage < 0
            || args.percentage > 9999) {
            this.logDebug(`priceDiffHighLowComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceDiffHighLowComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        const diffCheck = this._priceApi.priceHighLow(this._prices, localTime);
        return diffCheck.diffPercentage < args.percentage;
    }

    /**
     * Difference between highest and lowest price is !{{less|more}} than [[amount]].
     *
     * Condition to check if the difference between the highest and the lowest price
     * for the whole day is less or more than X.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceDiffHighLowComparer2(args: { amount: number }, state: any, curTime?: Moment) {
        if (!args.amount
            || args.amount < 0
            || args.amount > 9999) {
            this.logDebug(`priceDiffHighLowComparer2: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceDiffHighLowComparer2: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        const diffCheck = this._priceApi.priceHighLow(this._prices, localTime);
        return diffCheck.diffAmount < args.amount;
    }

    /**
     * Current price is !{{|not}} lower than prices next [[hours]] hours.
     *
     * Condition to check if the current price is lower than prices next hours.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceLowerNextHoursComparer(args: { hours: number }, state: any, curTime?: Moment) {
        if (!args.hours
            || args.hours <= 0
            || args.hours > 24) {
            this.logDebug(`priceLowerNextHoursComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceLowerNextHoursComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        return this._priceApi.currentPriceLowerThanNext(this._prices, localTime, args.hours);
    }

    /**
     * Current price is !{{|not}} higher than prices next [[hours]] hours.
     *
     * Condition to check if the current price is higher than prices next hours.
     *
     * @param args
     * @param state
     * @param curTime
     */
    priceHigherNextHoursComparer(args: { hours: number }, state: any, curTime?: Moment) {
        if (!args.hours
            || args.hours <= 0
            || args.hours > 24) {
            this.logDebug(`priceHigherNextHoursComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`priceHigherNextHoursComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        return this._priceApi.currentPriceHigherThanNext(this._prices, localTime, args.hours);
    }

    /**
     * High prices [[high_hours]] hours of the day.
     *
     * Triggers when the utility price changes, and the price is among the highest prices of the day.
     *
     * @param args
     * @param state
     * @param curTime
     */
    heatingOffHighPriceComparer(args: { high_hours: number }, state: { high_price: boolean }, curTime?: Moment) {
        if (!args.high_hours
            || args.high_hours <= 0
            || args.high_hours >= 24) {
            this.logDebug(`heatingOffHighPriceComparer: missing params`);
            return false;
        }
        if (!this._prices) {
            this.logDebug(`heatingOffHighPriceComparer: missing prices`);
            return false;
        }

        const localTime = curTime ? curTime : moment();

        const pricesToday = this._priceApi.pricesStarting(this._prices, localTime, 0, 24);
        if (pricesToday.length === 0) {
            this.logDebug(`heatingOffHighPriceComparer: no prices today, args: ${args.high_hours}, state: ${state.high_price}`);
            return false;
        }

        const highPriceNow = this._priceApi.checkHighPrice2(pricesToday, args.high_hours, localTime, state);

        return !state.high_price && highPriceNow.length === 0 || state.high_price && highPriceNow.length === 1;
    }
}