import moment, {Moment} from 'moment-timezone';
import {Device} from "homey";

import {NordpoolApi} from "./NordpoolApi";
import {NordpoolOptions, NordpoolPrices} from "./types";

const STORE_PREFIX = 'prices-';
const STORE_MONTHLY_AVG = 'sum10-';

export class PricesFetchClient {

    logger: any;
    nordpool: NordpoolApi;

    constructor({logger}: {
        logger: any
    }) {
        this.logger = logger;
        this.nordpool = new NordpoolApi({logger});
    }

    /**
     * Fetch prices from Nordpool for a period and store.
     *
     * @param device Homey.device
     * @param fromDate
     * @param toDate
     * @param options
     * @param onlyIfMissing Only fetch if missing for specific date
     */
    async fetchSpotPricesInRange(
        device: Device,
        fromDate: Moment,
        toDate: Moment,
        options: NordpoolOptions,
        onlyIfMissing: boolean
    ): Promise<NordpoolPrices> {
        const dates = this.getDateRange(fromDate, toDate);
        await this.clearStorageExcept(device, dates);
        for (const aDate of dates) {
            if (!onlyIfMissing || onlyIfMissing && !this.hasPricesForDay(device, aDate, options)) {
                const prices = await this.nordpool.fetchPricesForDay(aDate, options);
                if (prices && prices.length > 0) {
                    this.storePricesInStorage(device, aDate, prices, options);
                }
            }
        }
        return this.getPrices(device, fromDate, toDate, options);
    }

    /**
     * Check if all prices exist for dates in the range.
     *
     * @param device
     * @param fromDate
     * @param toDate
     * @param options
     * @private
     */
    hasPricesInRange(
        device: Device,
        fromDate: Moment,
        toDate: Moment,
        options: NordpoolOptions
    ): boolean {
        const dates = this.getDateRange(fromDate, toDate);
        return dates.filter(aDate => this.hasPricesForDay(device, aDate, options)).length === dates.length;
    }

    /**
     * Get prices from storage for a period.
     *
     * @param device
     * @param fromDate
     * @param toDate
     * @param options
     */
    getPrices(
        device: Device,
        fromDate: Moment,
        toDate: Moment,
        options: NordpoolOptions
    ): NordpoolPrices {
        const allPrices: NordpoolPrices = [];
        const dates = this.getDateRange(fromDate, toDate);
        for (const aDate of dates) {
            const prices = this.getPricesFromStorage(device, aDate, options);
            if (prices) {
                allPrices.push(...prices);
            }
        }
        return allPrices
            .map((p: any) => {
                return {
                    startsAt: moment(p.time * 1000),
                    time: p.time,
                    price: p.price,
                }
            })
            .sort((a, b) => a.time - b.time);
    }

    /**
     * Fetch monhtly average price for a month.
     *
     * @param device
     * @param aDate
     * @param options
     */
    fetchMonthlyAverage = async (
        device: Device,
        aDate: Moment,
        options: NordpoolOptions
    ): Promise<number | undefined> => {
        this.logger.debug(`fetchMonthlyAverage: ${aDate.format()}, options: ${JSON.stringify(options)}`)

        await this.clearMonthlyAvgStorageExcept(device, aDate);

        const dailyPrices = await this.nordpool.fetchDailyPrices(aDate, options);
        if (!dailyPrices) {
            return undefined;
        }

        const dayOfMonth = aDate.date();
        const startOfMonth = moment(aDate).startOf('month');
        const day10th = moment(startOfMonth).add(9, 'day');
        const day11th = moment(day10th).add(1, 'day');

        this.logger.debug(`fetchMonthlyAverage: ${aDate.format()}, ${dayOfMonth}, ${startOfMonth}, ${day10th}, ${day11th}`)

        const hasPricesFirst10days = dailyPrices
            .find(p => p.startsAt.isSameOrAfter(day10th)) !== undefined;

        this.logger.debug(`fetchMonthlyAverage: ${aDate.format()}, options: ${JSON.stringify(options)} => hasPricesFirst10days: ${hasPricesFirst10days}`)

        if (hasPricesFirst10days) {
            const sumFirst10days = dailyPrices
                .filter(p => p.startsAt.isSameOrAfter(startOfMonth) && p.startsAt.isBefore(day11th))
                .map(p => p.price)
                .reduce((a, b) => a + b, 0);

            this.logger.debug(`fetchMonthlyAverage: => sumFirst10days: ${sumFirst10days}`)

            this.storeSum10DaysInStorage(device, aDate, sumFirst10days, options);
        } else if (dayOfMonth >= 15) {
            const sumFirst10Days = this.getSum10DaysFromStorage(device, aDate, options);
            if (!!sumFirst10Days) {
                const sumAfterDay10 = dailyPrices
                    .filter(p => p.startsAt.isAfter(day10th))
                    .map(p => p.price)
                    .reduce((a, b) => a + b, 0);

                const ret2 = (sumFirst10Days + sumAfterDay10) / dayOfMonth;
                this.logger.debug(`fetchMonthlyAverage: ${aDate.format()}, options: ${JSON.stringify(options)} => ${sumFirst10Days} + ${sumAfterDay10} => monthly average from storage: ${ret2}`)
                return ret2;
            }
        }

        const ret = dailyPrices
            .map(p => p.price)
            .reduce((a, b) => a + b, 0) / dailyPrices.length;
        this.logger.debug(`fetchMonthlyAverage: ${aDate.format()}, options: ${JSON.stringify(options)} => monthly average = ${ret}`)
        return ret;
    }

    private cachePrefix(aDate: Moment) {
        return `${STORE_PREFIX}${aDate.format().substring(0, 10)}-`;
    }

    private cacheId(aDate: Moment, options: NordpoolOptions) {
        return `${this.cachePrefix(aDate)}${options.currency}-${options.priceArea}`;
    }

    private hasPricesForDay(device: Device, aDate: Moment, options: NordpoolOptions): boolean {
        const key = this.cacheId(aDate, options);
        const keys = device.getStoreKeys();
        return keys.includes(key);
    }

    private async storePricesInStorage(device: Device, aDate: Moment, prices: NordpoolPrices, options: NordpoolOptions): Promise<void> {
        const key = this.cacheId(aDate, options);
        await device.setStoreValue(key, prices).catch(err => this.logger.error(err));
    }

    private getPricesFromStorage(device: Device, aDate: Moment, options: NordpoolOptions): NordpoolPrices | undefined {
        const key = this.cacheId(aDate, options);
        return device.getStoreValue(key);
    }

    private cachePrefixSum10Days(aDate: Moment) {
        return `${STORE_MONTHLY_AVG}${aDate.format().substring(0, 7)}-`;
    }

    private cacheIdSum10Days(aDate: Moment, options: NordpoolOptions) {
        return `${this.cachePrefixSum10Days(aDate)}${options.currency}-${options.priceArea}`;
    }

    private async storeSum10DaysInStorage(device: Device, aDate: Moment, sum10FirstDays: number, options: NordpoolOptions): Promise<void> {
        const key = this.cacheIdSum10Days(aDate, options);
        await device.setStoreValue(key, sum10FirstDays).catch(err => this.logger.error(err));
        this.logger.debug(`storeSum10DaysInStorage: ${key} = ${sum10FirstDays}`)
    }

    private getSum10DaysFromStorage(device: Device, aDate: Moment, options: NordpoolOptions): number | undefined {
        const key = this.cacheIdSum10Days(aDate, options);
        const ret = device.getStoreValue(key);
        this.logger.debug(`getSum10DaysFromStorage: ${key} = ${ret}`)
        return ret;
    }

    /**
     * Clear all prices in the storage.
     *
     * @param device
     * @private
     */
    async clearStorage(device: Device) {
        const keys = device.getStoreKeys();
        for (const key of keys) {
            if (key.startsWith(STORE_PREFIX)) {
                await device.unsetStoreValue(key).catch(err => this.logger.error(err));
            }
        }
    }

    /**
     * Clear all prices in storage, except for specified dates.
     *
     * @param device
     * @param dates do not clear for dates in range
     * @private
     */
    private async clearStorageExcept(device: Device, dates: Moment[]): Promise<any> {
        const keepKeys = dates.map(aDate => this.cachePrefix(aDate));
        const keys = device.getStoreKeys();
        for (const key of keys) {
            if (key.startsWith(STORE_PREFIX) && keepKeys.filter(kk => key.startsWith(kk)).length === 0) {
                await device.unsetStoreValue(key).catch(err => this.logger.error(err));
            }
        }
    }

    /**
     * Clear 'day 1-10 sum price' in storage, except for specified date.
     *
     * @param device
     * @param aDate do not clear for date
     * @private
     */
    private async clearMonthlyAvgStorageExcept(device: Device, aDate: Moment): Promise<any> {
        const keepKey = this.cachePrefixSum10Days(aDate);
        const keys = device.getStoreKeys();
        for (const key of keys) {
            if (key.startsWith(STORE_MONTHLY_AVG) && !key.startsWith(keepKey)) {
                this.logger.debug(`clearMonthlyAvgStorageExcept: clear key: ${key}`)
                await device.unsetStoreValue(key).catch(err => this.logger.error(err));
            }
        }
    }

    /**
     * Get dates as array.  NB! Max 10 dates..
     * @param fromDate
     * @param toDate
     */
    private getDateRange(
        fromDate: Moment,
        toDate: Moment
    ): Moment[] {
        let numDates = 0;
        const dates: Moment[] = [];
        let aDate = moment(fromDate).startOf('day');
        dates.push(aDate);
        let aToDate = moment(toDate).startOf('day');
        while (aDate.isBefore(aToDate) && numDates < 10) {
            aDate = moment(aDate).add(1, 'day');
            dates.push(aDate);
            numDates++;
        }
        return dates;
    }

}
