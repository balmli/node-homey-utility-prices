import {expect} from 'chai';

import moment from 'moment-timezone';

import {Currency, NordpoolApi} from "../lib";

moment.tz.setDefault("Europe/Oslo");

describe('Fetch prices', function () {

    describe('Check fetch prices', function () {
        it('Check fetch prices 1', function (done) {
            const api = new NordpoolApi()
            const localTime = moment().startOf('day');
            api.fetchPrices(localTime, {priceArea: 'Bergen', currency: Currency.NOK})
                .then((prices) => {
                    //console.log(prices);
                    done();
                })
                .catch((err) => {
                    console.log('ERROR', err)
                    done();
                });
        });
    });

});
