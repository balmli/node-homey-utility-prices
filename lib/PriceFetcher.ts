import EventEmitter from "events";
import moment from 'moment-timezone';

import {Device} from "homey";

import {UtilityBillApi} from "@balmli/homey-utility-prices-client";

import {NordpoolOptions, NordpoolPrices, PriceFetcherMethod, PriceFetcherOptions} from "./types";
import {PriceApi} from "./PriceApi";
import {PricesFetchClient} from "./PricesFetchClient";

export class PriceFetcher extends EventEmitter {

    private logger: any;
    private priceApi = new PriceApi()
    private pricesFetchClient: PricesFetchClient;
    private device: Device;
    private utilityBillApi?: UtilityBillApi;
    private priceFetcherOptions = new PriceFetcherOptions({});

    private forcePriceUpdate?: boolean;
    private fetchTimeout?: NodeJS.Timeout;
    private updatePriceTimeout?: NodeJS.Timeout;
    private deleted?: boolean;

    constructor({logger, pricesFetchClient, device, utilityBillApi}: {
        logger: any,
        pricesFetchClient: PricesFetchClient,
        device: Device,
        utilityBillApi?: UtilityBillApi,
    }) {
        super();
        this.logger = logger;
        this.pricesFetchClient = pricesFetchClient;
        this.device = device;
        this.utilityBillApi = utilityBillApi;
    }

    start() {
        this.forcePriceUpdate = true;
        this.scheduleFetchData(3);
    }

    stop() {
        this.clearFetchData();
        this.clearUpdatePrice();
    }

    destroy() {
        this.deleted = true;
        this.stop();
    }

    setNordpoolOptions(nordpoolOptions: NordpoolOptions) {
        this.priceFetcherOptions.nordpoolOptions = nordpoolOptions;
    }

    setFetchTime(fetchTime: number) {
        this.priceFetcherOptions.fetchTime = fetchTime;
    }

    setFetchMethod(fetchMethod: PriceFetcherMethod) {
        this.priceFetcherOptions.fetchMethod = fetchMethod;
    }

    private clearFetchData() {
        if (this.fetchTimeout) {
            this.device.homey.clearTimeout(this.fetchTimeout);
            this.fetchTimeout = undefined;
        }
    }

    private scheduleFetchData(seconds?: number) {
        if (this.deleted) {
            return;
        }
        this.clearFetchData();
        if (seconds === undefined) {
            let syncTime = this.priceFetcherOptions.fetchTime!!;
            const now = new Date();
            seconds = syncTime - (now.getMinutes() * 60 + now.getSeconds());
            seconds = seconds <= 0 ? seconds + 3600 : seconds;
            this.logger.verbose(`Price Fetcher: fetch time: ${syncTime}`);
        }
        this.logger.debug(`Price Fetcher: fetch data in ${seconds} seconds`);
        this.fetchTimeout = this.device.homey.setTimeout(this.doFetchData.bind(this), seconds * 1000);
    }

    private async doFetchData() {
        if (this.deleted) {
            return;
        }
        try {
            this.clearFetchData();
            if (this.forcePriceUpdate) {
                this.clearUpdatePrice();
            }

            const {fromDate, toDate, options} = this.getFetchParameters();

            if (this.priceFetcherOptions.fetchMethod == PriceFetcherMethod.nordpool) {
                const prices = await this.pricesFetchClient.fetchSpotPricesInRange(this.device, fromDate, toDate, options, false);
                this.emit('prices', prices);
                this.logger.verbose(`Price Fetcher: fetched prices from Nordpool: ${prices.length}`)
            } else if (this.priceFetcherOptions.fetchMethod == PriceFetcherMethod.utilityPriceClient) {
                if (!!this.utilityBillApi) {
                    const pricesUtilityBill = await this.utilityBillApi.fetchPrices();
                    const prices = pricesUtilityBill ? pricesUtilityBill.map((p: any) => {
                        return {
                            startsAt: moment(p.time * 1000),
                            time: p.time,
                            price: p.price,
                        }
                    }) : undefined;
                    this.emit('prices', prices);
                    this.logger.verbose(`Price Fetcher: fetched prices from Utility Bill app: ${prices.length}`)
                } else {
                    this.logger.error(`Price Fetcher: utilityBillApi has not been initialized`);
                }
            }

            const monthlyAverage = await this.pricesFetchClient.fetchMonthlyAverage(this.device, moment(), options);
            this.logger.info('monthlyAverage: ', monthlyAverage);
            this.emit('monthlyAverage', monthlyAverage);
        } catch (err) {
            this.logger.error(err);
        } finally {
            this.scheduleFetchData();
            if (this.forcePriceUpdate) {
                this.forcePriceUpdate = false;
                this.scheduleUpdatePrice(1);
            }
        }
    }

    private clearUpdatePrice() {
        if (this.updatePriceTimeout) {
            this.device.homey.clearTimeout(this.updatePriceTimeout);
            this.updatePriceTimeout = undefined;
        }
    }

    private scheduleUpdatePrice(seconds?: number) {
        if (this.deleted) {
            return;
        }
        this.clearUpdatePrice();
        if (seconds === undefined) {
            const now = new Date();
            seconds = 3 - (now.getMinutes() * 60 + now.getSeconds()); // 3 seconds after top of the hour
            seconds = seconds <= 0 ? seconds + 3600 : seconds;
        }
        this.logger.debug(`Price Fetcher: update price in ${seconds} seconds`);
        this.updatePriceTimeout = this.device.homey.setTimeout(this.doUpdatePrice.bind(this), seconds * 1000);
    }

    private async doUpdatePrice() {
        if (this.deleted) {
            return;
        }
        try {
            this.clearUpdatePrice();
            if (this.priceFetcherOptions.fetchMethod == PriceFetcherMethod.nordpool) {
                const {fromDate, toDate, options} = this.getFetchParameters();
                const prices = this.pricesFetchClient.getPrices(this.device, fromDate, toDate, options);
                await this.onSpotPrices(prices);
            }
        } catch (err) {
            this.logger.error(err);
        } finally {
            this.scheduleUpdatePrice();
        }
    }

    private async onSpotPrices(prices: NordpoolPrices) {
        try {
            if (prices.length > 0) {
                const localTime = moment();
                const currentPrice = this.priceApi.currentPrice(prices, localTime);
                if (currentPrice) {
                    this.logger.verbose('Price Fetcher: current price:', currentPrice.price);
                    this.emit('priceChanged', currentPrice);
                }
            }
        } catch (err) {
            this.logger.error(err);
        }
    }

    private getFetchParameters() {
        const fromDate = moment().add(this.priceFetcherOptions.prevDays * -1, 'day');
        const toDate = moment().add(this.priceFetcherOptions.nextDays, 'day');
        const options = this.priceFetcherOptions.nordpoolOptions!;
        return {fromDate, toDate, options}
    }
}
