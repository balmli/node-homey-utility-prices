import moment, {Moment, MomentInput} from 'moment-timezone';
import {
    NordpoolOptions,
    NordpoolPrices,
    PRICE_AREA_MAP
} from "./types";

const http = require('http.min');

export class NordpoolApi {
    private readonly API_URL = "https://dataportal-api.nordpoolgroup.com/api";
    logger: any;

    constructor({logger}: {
        logger: any
    }) {
        this.logger = logger;
    }

    /**
     * Fetch prices from Nordpool, for yesterday, today and tomorrow.
     *
     * @param aDate
     * @param opts
     */
    fetchPrices = async (aDate: MomentInput, opts: NordpoolOptions): Promise<NordpoolPrices> => {
        try {
            const yesterday = moment(aDate).subtract(1, 'day');
            const today = moment(aDate);
            const tomorrow = moment(aDate).add(1, 'day');

            const results = await Promise.all([
                this.getHourlyPrices(yesterday, opts),
                this.getHourlyPrices(today, opts),
                this.getHourlyPrices(tomorrow, opts)
            ]);

            return results.flat();
        } catch (err) {
            this.logger.error('Fetching prices failed: ', err);
            return [];
        }
    }

    /**
     * Fetch prices from Nordpool for a single day.
     *
     * @param aDate
     * @param opts
     */
    fetchPricesForDay = async (aDate: MomentInput, opts: NordpoolOptions): Promise<NordpoolPrices | undefined> => {
        try {
            return await this.getHourlyPrices(moment(aDate), opts);
        } catch (err) {
            this.logger.error('Fetching prices failed: ', err);
        }

        return undefined;
    };

    /**
     * Fetch daily average prices for a month.
     *
     * @param aDate
     * @param opts
     */
    fetchDailyPrices = async (aDate: MomentInput, opts: NordpoolOptions): Promise<NordpoolPrices | undefined> => {
        try {
            return this.getDailyPrices(moment(aDate), opts);
        } catch (err) {
            this.logger.error('Fetching daily average prices failed: ', err);
        }

        return undefined;
    };

    private getHourlyPrices = async (momnt: Moment, opts: NordpoolOptions): Promise<NordpoolPrices> => {
        try {
            const url = new URL(`${this.API_URL}/DayAheadPrices`);
            url.searchParams.append('currency', opts.currency);
            url.searchParams.append('market', 'DayAhead');
            url.searchParams.append('deliveryArea', this.mapPriceArea(opts.priceArea));
            url.searchParams.append('date', momnt.format('YYYY-MM-DD'));

            const resp = await http.get({
                uri: url.toString(),
                headers: {
                    'accept': 'application/json'
                },
                timeout: 30000
            });

            if (resp.response.statusCode === 204) {
                return [];
            }
            if (resp.response.statusCode !== 200) {
                throw new Error(`Invalid response from Nordpool API: ${resp.response.statusCode}, ${resp.response.statusMessage}`);
            }

            const data = JSON.parse(resp.data);
            return this.parseHourlyResult(data, opts);
        } catch (err) {
            throw err;
        }
    };

    private parseHourlyResult(data: any, opts: NordpoolOptions): NordpoolPrices {
        if (data.currency !== opts.currency) {
          throw new Error('Currency mismatch');
        }

        const result: NordpoolPrices = [];

        for (const entry of data.multiAreaEntries) {
            const startsAt = moment(entry.deliveryStart);
            const price = entry.entryPerArea[this.mapPriceArea(opts.priceArea)] / 1000;
            result.push({
                startsAt,
                time: startsAt.unix(),
                price
            });
        }

        return result;
    }


  private getDailyPrices = async (momnt: Moment, opts: NordpoolOptions): Promise<NordpoolPrices> => {
        const startOfMonth = momnt.startOf('month');
        const startOfNextMonth = moment(startOfMonth).add(1, 'month');

        try {
            const url = new URL(`${this.API_URL}/AggregatePrices`);
            url.searchParams.append('currency', opts.currency);
            url.searchParams.append('market', 'DayAhead');
            url.searchParams.append('deliveryArea', this.mapPriceArea(opts.priceArea));
            url.searchParams.append('year', startOfMonth.format('YYYY'));

            const resp = await http.get({
                uri: url.toString(),
                headers: {
                    'accept': 'application/json'
                },
                timeout: 30000
            });

            if (resp.response.statusCode === 204) {
                return [];
            }
            if (resp.response.statusCode !== 200) {
                throw new Error(`Invalid response from Nordpool API: ${resp.response.statusCode}, ${resp.response.statusMessage}`);
            }

            const data = JSON.parse(resp.data);
            return this.parseDailyResult(data, opts, startOfMonth, startOfNextMonth);
        } catch (err) {
            throw err;
        }
    }

    private parseDailyResult(data: any, opts: NordpoolOptions, startOfMonth: Moment,  startOfNextMonth: Moment): NordpoolPrices {
        const result: NordpoolPrices = [];

        for (const entry of data.multiAreaDailyAggregates) {
            const startsAt = moment(entry.deliveryStart);
            if (startsAt.isSameOrAfter(startOfMonth) && startsAt.isBefore(startOfNextMonth)) {
                const price = entry.averagePerArea[this.mapPriceArea(opts.priceArea)] / 1000;
                result.push({
                    startsAt,
                    time: startsAt.unix(),
                    price
                });
            }
        }

        return result;
    }

    private mapPriceArea = (area: string): string => {
        if (PRICE_AREA_MAP[area]) {
            return PRICE_AREA_MAP[area];
        }

        return area;
    }

}