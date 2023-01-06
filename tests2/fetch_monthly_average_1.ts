import {Device} from "homey";

import moment from 'moment-timezone';

import Logger from '@balmli/homey-logger';

import {Currency, PricesFetchClient} from "../lib";

moment.tz.setDefault("Europe/Oslo");

class HomeyDevice {
    storage: Map<string, any>;

    constructor() {
        this.storage = new Map<string, any>();
    }

    getStoreKeys = () => {
        return Array.from(this.storage.keys());
    }

    setStoreValue = (key: string, value: any) => {
        this.storage.set(key, value);
    }

    getStoreValue = (key: string) => {
        return this.storage.get(key);
    }

    unsetStoreValue = (key: string) => {
        this.storage.delete(key);
    }
}

describe('Fetch monthly average', function () {

    describe('Check monthly average', function () {
        it('Check monthly average 1', function (done) {
            const logger = new Logger({
                logLevel: 2,
                prefix: undefined,
            });
            const testDevice = new HomeyDevice();
            const client = new PricesFetchClient({logger});
            const localTime = moment();//.startOf('day');
            // @ts-ignore
            client.fetchMonthlyAverage(testDevice as Device, localTime, {
                priceArea: 'Bergen',
                currency: Currency.NOK
            })
                .then((avg) => {
                    //console.log(avg);
                    done();
                })
                .catch((err) => {
                    console.log('ERROR', err)
                    done();
                });
        });
    });

});
