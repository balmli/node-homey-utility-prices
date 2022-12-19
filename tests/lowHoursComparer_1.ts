const expect = require("chai").expect;
import moment from 'moment-timezone';

import {PriceApi, PriceComparer} from "../lib";
import {getPrices} from "./price_data";

const priceApi = new PriceApi();
const priceComparer = new PriceComparer(priceApi);
//priceComparer.debug(true);

describe("lowHoursComparer", function () {

    before(function () {
        moment.tz.setDefault('Europe/Oslo');
    });

    describe("Check params", function () {
        it("No data", function () {
            expect(false).to.eq(priceComparer.lowHoursComparer({low_hours: 0}, {low_price: true}));
        });
        it("Zero high hours", function () {
            priceComparer.updatePrices(getPrices())
            expect(false).to.eq(priceComparer.lowHoursComparer({low_hours: 0}, {low_price: true}));
        });
        it("No prices", function () {
            priceComparer.updatePrices([])
            expect(false).to.eq(priceComparer.lowHoursComparer({low_hours: 1}, {low_price: true}));
        });
        it("Missing state", function () {
            priceComparer.updatePrices(getPrices())
            expect(false).to.eq(priceComparer.lowHoursComparer({low_hours: 1}, {low_price: true}));
        });
    });

    describe("Check prices", function () {
        it("Check prices 1", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.lowHoursComparer({
                    low_hours: 2
                }, {
                    low_price: false
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 2", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.lowHoursComparer({
                    low_hours: 2
                }, {
                    low_price: true
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 3", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.lowHoursComparer({
                    low_hours: 1
                }, {
                    low_price: true
                }, moment('2019-01-21T01:30:00.000Z')
            ));
        });
        it("Check prices 4", function () {
            expect(true).to.eq(priceComparer.lowHoursComparer({
                    low_hours: 2
                }, {
                    low_price: true
                }, moment('2019-01-21T01:30:00.000Z')
            ));
        });
        it("Check prices 5", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.lowHoursComparer({
                    low_hours: 2
                }, {
                    low_price: true
                }, moment('2019-01-21T02:30:00.000Z')
            ));
        });
        it("Check prices 6", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.lowHoursComparer({
                    low_hours: 2
                }, {
                    low_price: true
                }, moment('2019-01-21T03:30:00.000Z')
            ));
        });
    });

});