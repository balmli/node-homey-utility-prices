const expect = require("chai").expect;
import moment from 'moment-timezone';

import {PriceApi, PriceComparer} from "../lib";
import {getPrices} from "./price_data";

const priceApi = new PriceApi();
const priceComparer = new PriceComparer(priceApi);
//priceComparer.debug(true);

describe("currentPriceAmongNextHoursComparer", function () {

    before(function () {
        moment.tz.setDefault('Europe/Oslo');
    });

    describe("Check params", function () {
        it("No data", function () {
            expect(false).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                num_hours: 0,
                next_hours: 0
            }, {high_price: true}));
        });
        it("Zero high hours", function () {
            priceComparer.updatePrices(getPrices())
            expect(false).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                num_hours: 0,
                next_hours: 0
            }, {high_price: true}));
        });
        it("No prices", function () {
            priceComparer.updatePrices([])
            expect(false).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                num_hours: 0,
                next_hours: 0
            }, {high_price: true}));
        });
    });

    describe("Check high prices", function () {
        it("Check prices 1", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                    num_hours: 1,
                    next_hours: 6
                }, {high_price: true},
                moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 1", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                    num_hours: 2,
                    next_hours: 6
                }, {high_price: true},
                moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 1", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                    num_hours: 6,
                    next_hours: 6
                }, {high_price: true},
                moment('2019-01-21T04:10:00.000Z')
            ));
        });

        it("Check prices 1", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                    num_hours: 1,
                    next_hours: 6
                }, {high_price: true},
                moment('2019-01-21T06:10:00.000Z')
            ));
        });
        it("Check prices 1", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                    num_hours: 2,
                    next_hours: 6
                }, {high_price: true},
                moment('2019-01-21T06:10:00.000Z')
            ));
        });
    });
    describe("Check low prices", function () {
        it("Check prices 1", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                    num_hours: 1,
                    next_hours: 6
                }, {high_price: false},
                moment('2019-01-21T06:10:00.000Z')
            ));
        });
        it("Check prices 2", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                    num_hours: 2,
                    next_hours: 6
                }, {high_price: false},
                moment('2019-01-21T06:10:00.000Z')
            ));
        });
        it("Check prices 3", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                    num_hours: 4,
                    next_hours: 6
                }, {high_price: false},
                moment('2019-01-21T06:10:00.000Z')
            ));
        });
        it("Check prices 4", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongNextHoursComparer({
                    num_hours: 5,
                    next_hours: 6
                }, {high_price: false},
                moment('2019-01-21T06:10:00.000Z')
            ));
        });
    });
});