const expect = require("chai").expect;
import moment from 'moment-timezone';

import {PriceApi, PriceComparer} from "../lib";
import {getPrices} from "./price_data";

const priceApi = new PriceApi();
const priceComparer = new PriceComparer(priceApi);
//priceComparer.debug(true);

describe("priceAvgComparer", function () {

    before(function () {
        moment.tz.setDefault('Europe/Oslo');
    });

    describe("Check params", function () {
        it("Low percentage", function () {
            priceComparer.updatePrices(getPrices())
            expect(false).to.eq(priceComparer.priceAvgComparer({percentage: -1, hours: 0}, {below: true}));
        });
        it("No prices", function () {
            priceComparer.updatePrices([])
            expect(false).to.eq(priceComparer.priceAvgComparer({percentage: 0, hours: 0}, {below: true}));
        });
        it("High percentage", function () {
            priceComparer.updatePrices(getPrices())
            expect(false).to.eq(priceComparer.priceAvgComparer({percentage: 101, hours: 0}, {below: true}));
        });
    });

    describe("Check prices", function () {
        it("Current price is 4 % above todays average price", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.priceAvgComparer({
                    percentage: 4
                }, {
                    below: false
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Current price is 4 % below todays average price", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.priceAvgComparer({
                    percentage: 4
                }, {
                    below: true
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Current price is 1 % above average of next 5 hours", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.priceAvgComparer({
                    percentage: 1,
                    hours: 5
                }, {
                    below: false
                }, moment('2019-01-21T09:10:00.000Z')
            ));
        });
        it("Current price is 4 % below average of next 5 hours", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.priceAvgComparer({
                    percentage: 4,
                    hours: 5
                }, {
                    below: true
                }, moment('2019-01-21T09:10:00.000Z')
            ));
        });
    });

});