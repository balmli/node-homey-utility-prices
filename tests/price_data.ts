import moment from 'moment-timezone';
const expect = require("chai").expect;

import {NordpoolPrices} from "../lib";

let _prices: NordpoolPrices | undefined = undefined;

export const getPrices = (): NordpoolPrices => {
    if (_prices) {
        const aDate = moment('2019-01-20T23:00:00.000Z');
        for (let p of _prices) {
            expect(p.startsAt.toISOString()).to.equal(aDate.toISOString());
            aDate.add(1, 'hour');
        }
        expect(_prices.length).to.equal(48);
        return _prices;
    }
    const prices = [
        {
            startsAt: '2019-01-20T23:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.49599
        },
        {
            startsAt: '2019-01-21T00:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.49103
        },
        {
            startsAt: '2019-01-21T01:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.48919
        },
        {
            startsAt: '2019-01-21T02:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.48987
        },
        {
            startsAt: '2019-01-21T03:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.4955
        },
        {
            startsAt: '2019-01-21T04:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.52078
        },
        {
            startsAt: '2019-01-21T05:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.53604
        },
        {
            startsAt: '2019-01-21T06:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.60264
        },
        {
            startsAt: '2019-01-21T07:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.63073
        },
        {
            startsAt: '2019-01-21T08:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.60176
        },
        {
            startsAt: '2019-01-21T09:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.56754
        },
        {
            startsAt: '2019-01-21T10:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.55704
        },
        {
            startsAt: '2019-01-21T11:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.55344
        },
        {
            startsAt: '2019-01-21T12:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.55315
        },
        {
            startsAt: '2019-01-21T13:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.55772
        },
        {
            startsAt: '2019-01-21T14:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.56385
        },
        {
            startsAt: '2019-01-21T15:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.58008
        },
        {
            startsAt: '2019-01-21T16:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.59671
        },
        {
            startsAt: '2019-01-21T17:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.57979
        },
        {
            startsAt: '2019-01-21T18:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.54868
        },
        {
            startsAt: '2019-01-21T19:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.53634
        },
        {
            startsAt: '2019-01-21T20:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.53264
        },
        {
            startsAt: '2019-01-21T21:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.52185
        },
        {
            startsAt: '2019-01-21T22:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.50902
        },
        {
            startsAt: '2019-01-21T23:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.49599
        },
        {
            startsAt: '2019-01-22T00:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.49103
        },
        {
            startsAt: '2019-01-22T01:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.48919
        },
        {
            startsAt: '2019-01-22T02:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.48987
        },
        {
            startsAt: '2019-01-22T03:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.4955
        },
        {
            startsAt: '2019-01-22T04:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.52078
        },
        {
            startsAt: '2019-01-22T05:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.53604
        },
        {
            startsAt: '2019-01-22T06:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.60264
        },
        {
            startsAt: '2019-01-22T07:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.63073
        },
        {
            startsAt: '2019-01-22T08:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.60176
        },
        {
            startsAt: '2019-01-22T09:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.56754
        },
        {
            startsAt: '2019-01-22T10:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.55704
        },
        {
            startsAt: '2019-01-22T11:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.55344
        },
        {
            startsAt: '2019-01-22T12:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.55315
        },
        {
            startsAt: '2019-01-22T13:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.55772
        },
        {
            startsAt: '2019-01-22T14:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.56385
        },
        {
            startsAt: '2019-01-22T15:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.58008
        },
        {
            startsAt: '2019-01-22T16:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.59671
        },
        {
            startsAt: '2019-01-22T17:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.57979
        },
        {
            startsAt: '2019-01-22T18:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.54868
        },
        {
            startsAt: '2019-01-22T19:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.53634
        },
        {
            startsAt: '2019-01-22T20:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.53264
        },
        {
            startsAt: '2019-01-22T21:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.52185
        },
        {
            startsAt: '2019-01-22T22:00:00.000Z',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.50902
        }
    ];
    const timeZone = moment().tz();
    _prices = prices
        .map(p => {
            const startsAt = moment.tz(p.startsAt, 'UTC').tz(timeZone as string);
            const time = startsAt.unix();
            const price = p.price;
            return {startsAt, time, price};
        });
    return _prices;
};
