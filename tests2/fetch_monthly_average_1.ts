import moment from 'moment-timezone';

import Logger from '@balmli/homey-logger';

import {Currency, NordpoolApi} from "../lib";

moment.tz.setDefault("Europe/Oslo");

describe('Fetch monthly average', function () {

    describe('Check monthly average', function () {
        it('Check monthly average 1', function (done) {
            const api = new NordpoolApi({
                logger: new Logger({
                    logLevel: 3,
                    prefix: undefined,
                })
            });
            const localTime = moment().startOf('day');
            api.fetchMonthlyAverage(localTime, {priceArea: 'Bergen', currency: Currency.NOK})
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
