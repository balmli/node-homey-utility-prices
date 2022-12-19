import moment, {MomentInput} from 'moment-timezone';

import {NordpoolPrice, NordpoolPrices} from "./types";
import {calcHeating} from "./Heating";

export class PriceApi {

    toHour = (aDate: MomentInput): string => {
        return moment(aDate).startOf('hour').toISOString();
    }

    currentPrice = (prices: NordpoolPrices, aDate: MomentInput): NordpoolPrice | undefined => {
        const currentHour = this.toHour(aDate);
        return prices.find(p => this.toHour(p.startsAt) === currentHour);
    };

    pricesStarting = (prices: NordpoolPrices, aDate: MomentInput, startHour: number, num_hours: number) => {
        const startingAt = moment(aDate).hour(startHour).startOf('hour');
        return prices
            .filter(p => p.startsAt.isSameOrAfter(startingAt))
            .slice(0, num_hours);
    };

    pricesSorted = (prices: NordpoolPrices, aDate: MomentInput) => {
        return this.pricesStarting(prices, aDate, 0, 24)
            .concat()
            .sort((a, b) => a.price - b.price);
    };

    priceRatio = (prices: NordpoolPrices, aDate: MomentInput) => {
        const currentHour = this.toHour(aDate);
        const withIndex = this.pricesStarting(prices, aDate, 0, 24)
            .concat()
            .sort((a, b) => a.price - b.price)
            .findIndex(p => this.toHour(p.startsAt) === currentHour);
        return Math.round((1 - withIndex / 23) * 1000000) / 1000000
    };

    priceLevels = [
        {
            code: 'VERY_CHEAP',
            eval: 'X <= 0.60',
            description: 'The price is smaller or equal to 60 % compared to average price.'
        },
        {
            code: 'CHEAP',
            eval: 'X > 0.60 && X <= 0.90',
            description: 'The price is greater than 60 % and smaller or equal to 90 % compared to average price.'
        },
        {
            code: 'NORMAL',
            eval: 'X > 0.90 && X < 1.15',
            description: 'The price is greater than 90 % and smaller than 115 % compared to average price.'
        },
        {
            code: 'EXPENSIVE',
            eval: 'X >= 1.15 && X < 1.40',
            description: 'The price is greater or equal to 115 % and smaller than 140 % compared to average price.'
        },
        {
            code: 'VERY_EXPENSIVE',
            eval: 'X >= 1.40',
            description: 'The price is greater or equal to 140 % compared to average price.'
        },
    ];

    priceLevel = (prices: NordpoolPrices, aDate: MomentInput) => {
        const price = this.currentPrice(prices, aDate);
        const averagePrice = this.averagePricesStarting(prices, aDate, 0, 24);
        if (price && averagePrice !== 0) {
            try {
                const share = price.price / averagePrice;
                for (const pl of this.priceLevels) {
                    if (eval(pl.eval.split("X").join(String(share)))) {
                        return pl;
                    }
                }
            } catch (err) {
            }
        }
    };

    priceHighLow = (prices: NordpoolPrices, aDate: MomentInput) => {
        const sorted = this.pricesSorted(prices, aDate);
        const high = sorted.length > 0 ? sorted[sorted.length - 1] : undefined;
        const low = sorted.length > 0 ? sorted[0] : undefined;
        const diffPercentage = high && low && low.price !== 0 ? (high.price - low.price) / low.price * 100 : 0;
        const diffAmount = high && low ? high.price - low.price : 0;
        return {
            high, low, diffPercentage, diffAmount
        };
    };

    priceNextHours = (prices: NordpoolPrices, aDate: MomentInput, num_hours: number) => {
        const startingAt = moment(aDate).startOf('hour').add(1, 'hour');
        return prices
            .concat()
            .filter(p => p.startsAt.isSameOrAfter(startingAt))
            .slice(0, num_hours);
    };

    // TODO: return undefined for missing average?
    averagePricesStarting = (prices: NordpoolPrices, aDate: MomentInput, startHour: number, num_hours: number): number => {
        const startingAt = moment(aDate).hour(startHour).startOf('hour');
        const arr = prices
            .filter(p => p.startsAt.isSameOrAfter(startingAt))
            .map(p => p.price)
            .slice(0, num_hours);
        if (arr.length === 0) {
            return 0;
        }
        return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10000000) / 10000000;
    };

    checkAveragePrice = (price: number, averagePrice: number, below: boolean, percentage: number) => {
        return (price - averagePrice) / averagePrice * 100 * (below ? -1 : 1) > percentage;
    };

    checkLowPrice = (prices: NordpoolPrices, low_hours: number, aDate: MomentInput) => {
        return prices
            .concat()
            .sort((a, b) => a.price - b.price)
            .slice(0, low_hours)
            .filter(p => p.startsAt.isSameOrBefore(aDate) && moment(p.startsAt).add(1, 'hour').startOf('hour').isAfter(aDate));
    };

    checkHighPrice = (prices: NordpoolPrices, high_hours: number, aDate: MomentInput) => {
        return prices
            .concat()
            .sort((a, b) => b.price - a.price)
            .slice(0, high_hours)
            .filter(p => p.startsAt.isSameOrBefore(aDate) && moment(p.startsAt).add(1, 'hour').startOf('hour').isAfter(aDate));
    };

    checkHighPrice2 = function (prices: NordpoolPrices, high_hours: number, aDate: MomentInput, state: any, filter = true) {
        return prices
            .map(p => {
                // @ts-ignore
                p.heating = calcHeating(p.startsAt, state.atHome, state.homeOverride, state.heatingOptions);
                return p;
            })
            // @ts-ignore
            .filter(p => p.heating.heating === false)
            .filter((p, idx) => idx % 2 === 0)
            .sort((a, b) => b.price - a.price)
            .slice(0, high_hours)
            .filter(p => !filter || filter && p.startsAt.isSameOrBefore(aDate) && moment(p.startsAt).add(1, 'hour').startOf('hour').isAfter(aDate));
    };

    minOfHighestPrices = (prices: NordpoolPrices, num_hours: number) => {
        const arr = prices
            .concat()
            .sort((a, b) => b.price - a.price)
            .slice(0, num_hours);
        if (arr.length > 0) {
            return arr[arr.length - 1];
        }
    };

    maxOfLowestPrices = (prices: NordpoolPrices, num_hours: number) => {
        const arr = prices
            .concat()
            .sort((a, b) => a.price - b.price)
            .slice(0, num_hours);
        if (arr.length > 0) {
            return arr[arr.length - 1];
        }
    };

    pricesAmongLowest = (prices: NordpoolPrices, aDate: MomentInput, startHour: number, numHours: number, numLowestHours: number) => {
        // Finds prices starting at 00:00 today
        const pricesToday = this.pricesStarting(prices, aDate, 0, 24);
        if (pricesToday.length === 0) {
            return false;
        }

        // Maximum price of lowest hours today
        const maxOfPeriodToday = this.maxOfLowestPrices(pricesToday, numLowestHours);

        // X following prices
        const pricesFollowing = this.pricesStarting(prices, aDate, startHour, numHours);
        if (pricesFollowing.length === 0) {
            return false;
        }

        // Maximum price of X following prices
        const maxOfFollowing = this.maxOfLowestPrices(pricesFollowing, numHours);

        return !!maxOfPeriodToday && !!maxOfFollowing && maxOfFollowing.price <= maxOfPeriodToday.price;
    }

    pricesAmongHighest = (prices: NordpoolPrices, aDate: MomentInput, startHour: number, numHours: number, numHighestHours: number) => {
        // Finds prices starting at 00:00 today
        const pricesToday = this.pricesStarting(prices, aDate, 0, 24);
        if (pricesToday.length === 0) {
            return false;
        }

        // Minimum price of highest hours today
        const minOfPeriodToday = this.minOfHighestPrices(pricesToday, numHighestHours);

        // X following prices
        const pricesFollowing = this.pricesStarting(prices, aDate, startHour, numHours);
        if (pricesFollowing.length === 0) {
            return false;
        }

        // Minimum price of X following prices
        const minOfFollowing = this.minOfHighestPrices(pricesFollowing, numHours);

        return !!minOfPeriodToday && !!minOfFollowing && minOfFollowing.price >= minOfPeriodToday.price;
    }

    daysPeriod = (aDate: MomentInput, start: number | string, end: number | string) => {
        let startHour;
        let endHour;
        if (typeof start === 'string') {
            const
                starts = start.split(':');
            startHour = parseInt(starts[0]) + parseInt(starts[1]) / 60;
        } else {
            startHour = start;
        }
        if (typeof end === 'string') {
            const ends = end.split(':');
            endHour = parseInt(ends[0]) + parseInt(ends[1]) / 60;
        } else {
            endHour = end;
        }
        if (startHour === endHour) {
            endHour += 24;
        }

        let startTs = moment(aDate).startOf('day').add(startHour, 'hour');
        let endTs = moment(aDate).startOf('day').add(endHour, 'hour');

        if (startHour >= endHour) {
            if (moment(aDate).isSameOrBefore(endTs)) {
                startTs.add(-1, 'day');
            } else {
                endTs.add(1, 'day');
            }
        }

        return {startTs, endTs};
    }

    pricesLowestInPeriod = (prices: NordpoolPrices, aDate: MomentInput, startingAt: MomentInput, endingAt: MomentInput, numLowestHours: number) => {
        if (!this.inPeriod(aDate, startingAt, endingAt)) {
            return false;
        }

        // Finds prices in period
        const pricesInPeriod = prices
            .concat()
            .filter(p => p.startsAt.isSameOrAfter(startingAt)
                && p.startsAt.isBefore(endingAt));
        if (pricesInPeriod.length === 0) {
            // No prices
            return false;
        }

        // Maximum price of the lowest
        const maxOfPeriod = this.maxOfLowestPrices(pricesInPeriod, numLowestHours);

        const current = this.currentPrice(prices, aDate);

        return !!maxOfPeriod && !!current && current.price <= maxOfPeriod.price;
    }

    inPeriod = (aDate: MomentInput, startingAt: MomentInput, endingAt: MomentInput): boolean => {
        return !moment(aDate).isBefore(startingAt) && !moment(aDate).isAfter(endingAt);
    }

    pricesHighestInPeriod = (prices: NordpoolPrices, aDate: MomentInput, startingAt: MomentInput, endingAt: MomentInput, numHighestHours: number) => {
        if (!this.inPeriod(aDate, startingAt, endingAt)) {
            return false;
        }

        // Finds prices in period
        const pricesInPeriod = prices
            .concat()
            .filter(p => p.startsAt.isSameOrAfter(startingAt)
                && p.startsAt.isBefore(endingAt));
        if (pricesInPeriod.length === 0) {
            // No prices
            return false;
        }

        // Minimum price of the highest
        const minOfPeriod = this.minOfHighestPrices(pricesInPeriod, numHighestHours);

        const current = this.currentPrice(prices, aDate);

        return !!minOfPeriod && !!current && current.price >= minOfPeriod.price;
    }

    checkSumPrices = (prices: NordpoolPrices, aDate: MomentInput, startingAt: MomentInput, endingAt: MomentInput, hours: number, low = true) => {
        if (!this.inPeriod(aDate, startingAt, endingAt)) {
            return false;
        }

        const pricesInPeriod = prices
            .filter(p => p.startsAt.isSameOrAfter(startingAt)
                && p.startsAt.isBefore(endingAt));
        if (pricesInPeriod.length === 0) {
            // No prices
            return false;
        }

        const sumPrices = [];
        for (let a = 0; a < pricesInPeriod.length - hours + 1; a++) {
            const val = {
                startsAt: moment(pricesInPeriod[a].startsAt),
                endsAt: moment(pricesInPeriod[a].startsAt).add(hours, 'hour'),
                price: 0
            }
            for (let b = 0; b < hours; b++) {
                val.price += pricesInPeriod[a + b].price;
            }
            sumPrices.push(val);
        }

        const arr = low ?
            sumPrices
                .sort((a, b) => a.price - b.price) :
            sumPrices
                .sort((a, b) => b.price - a.price);

        if (arr.length > 0
            && moment(aDate).isSameOrAfter(arr[0].startsAt)
            && moment(aDate).isBefore(arr[0].endsAt)
        ) {
            return arr[0];
        }
    }

    currentPriceLowerThanNext = (prices: NordpoolPrices, aDate: MomentInput, numHours: number) => {
        const pricesFollowing = this.priceNextHours(prices, aDate, numHours);
        if (pricesFollowing.length === 0) {
            return false;
        }

        const minOfPeriod = this.minOfHighestPrices(pricesFollowing, numHours);

        const current = this.currentPrice(prices, aDate);

        return !!minOfPeriod && !!current && current.price <= minOfPeriod.price;
    }

    currentPriceHigherThanNext = (prices: NordpoolPrices, aDate: MomentInput, numHours: number) => {
        const pricesFollowing = this.priceNextHours(prices, aDate, numHours);
        if (pricesFollowing.length === 0) {
            return false;
        }

        const maxOfPeriod = this.maxOfLowestPrices(pricesFollowing, numHours);

        const current = this.currentPrice(prices, aDate);

        return !!maxOfPeriod && !!current && current.price >= maxOfPeriod.price;
    }

}
