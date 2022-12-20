import moment, {Moment} from 'moment-timezone';
import {Device} from "homey";

import {NordpoolApi} from "./NordpoolApi";
import {NordpoolOptions, NordpoolPrices} from "./types";

const STORE_PREFIX = 'prices-';

export class PricesFetchClient {

    logger: any;
    nordpool = new NordpoolApi();

    constructor({logger}: {
        logger: any
    }) {
        this.logger = logger;
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
    ): Promise<void> {
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
            .sort((a, b) => a.time - b.time);
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
        await device.setStoreValue(key, prices);
    }

    private getPricesFromStorage(device: Device, aDate: Moment, options: NordpoolOptions): NordpoolPrices | undefined {
        const key = this.cacheId(aDate, options);
        return device.getStoreValue(key)
    }

    /**
     * Clear all prices in the storage.
     *
     * @param device
     * @private
     */
    private async clearStorage(device: Device) {
        const keys = device.getStoreKeys();
        for (const key of keys) {
            if (key.startsWith(STORE_PREFIX)) {
                await device.unsetStoreValue(key);
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
                await device.unsetStoreValue(key);
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
