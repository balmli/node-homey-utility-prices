import moment, {Moment, MomentInput} from 'moment-timezone';
import {
    NordpoolColumn,
    NordpoolData,
    NordpoolOptions,
    NordpoolPrice,
    NordpoolPrices
} from "./types";

const http = require('http.min');


export class NordpoolApi {

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
            const oslo = moment().tz('Europe/Oslo');
            const ops = [
                moment(aDate).utcOffset() > oslo.utcOffset() ? this.getHourlyPrices(moment(aDate).add(-1, 'day'), opts) : undefined,
                this.getHourlyPrices(moment(aDate), opts),
                this.getHourlyPrices(moment(aDate).add(1, 'day'), opts)
            ];

            const result = await Promise.all(ops.filter(o => !!o));

            return result
                .filter(r => r && typeof r === 'object' && r.length > 0)
                .flatMap(r => r)
                .map(r => r as NordpoolPrice)
                .sort((a, b) => a.time - b.time);
        } catch (err) {
            this.logger.error('Fetching prices failed: ', err);
        }

        return [];
    };

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
            const data = await http.json({
                    uri: 'https://www.nordpoolgroup.com/api/marketdata/page/10?' +
                        'currency=,' + opts.currency + ',' + opts.currency + ',' + opts.currency +
                        '&endDate=' + momnt.format('DD-MM-YYYY'),
                    timeout: 30000
                }
            );
            return this.parseResult(data as NordpoolData, opts);
        } catch (err) {
            throw err;
        }
    };

    private getDailyPrices = async (momnt: Moment, opts: NordpoolOptions): Promise<NordpoolPrices> => {
        try {
            const startOfMonth = momnt.startOf('month');
            const startOfNextMonth = moment(startOfMonth).add(1, 'month');

            const data = await http.json({
                    uri: 'https://www.nordpoolgroup.com/api/marketdata/page/24?' +
                        'currency=,' + opts.currency + ',' + opts.currency + ',' + opts.currency,
                    timeout: 30000
                }
            );
            const prices = this.parseResult(data as NordpoolData, opts);
            return prices.filter(p => p.startsAt.isSameOrAfter(startOfMonth) && p.startsAt.isBefore(startOfNextMonth));
        } catch (err) {
            throw err;
        }
    };

    private parseResult = (data: NordpoolData, opts: NordpoolOptions): NordpoolPrices => {
        const timeZone = moment().tz();
        const result: NordpoolPrices = [];
        if (data.data && data.data.Rows && data.data.Rows.length) {
            for (var i = 0; i < data.data.Rows.length; i++) {
                const row = data.data.Rows[i];
                if (!row || row.IsExtraRow) {
                    continue;
                }

                const startsAt = moment
                    .tz(row.StartTime, "YYYY-MM-DD\Thh:mm:ss", 'Europe/Oslo')
                    .tz(timeZone as string)
                    .startOf('hour');

                const time = startsAt.unix();

                for (let j = 0; j < row.Columns.length; j++) {
                    const column = row.Columns[j];
                    if (!column) {
                        continue;
                    }

                    const price = this.parsePrice(column);
                    if (isNaN(price)) {
                        continue;
                    }

                    if (column.Name === opts.priceArea) {
                        result.push({startsAt, time, price});
                    }
                }
            }
        }
        return result;
    };

    parsePrice = (column: NordpoolColumn): number => {
        return Math.round(100000 * (parseFloat(column.Value.replace(/,/, '.').replace(' ', '')) / 1000.0)) / 100000;
    }

}