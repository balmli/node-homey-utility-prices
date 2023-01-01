const expect = require("chai").expect;
import moment from 'moment-timezone';

import {PriceApi, PriceComparer} from "../lib";
import {getPrices} from "./price_data";

const priceApi = new PriceApi();
const priceComparer = new PriceComparer(priceApi);
//priceComparer.debug(true);

describe("currentPriceAmongBeforeTimeComparer", function () {

    before(function () {
        moment.tz.setDefault('Europe/Oslo');
    });

    describe("Check params", function () {
        it("No data", function () {
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                num_hours: 0,
                time: "07:00"
            }, {high_price: true}));
        });
        it("Zero high/low hours", function () {
            priceComparer.updatePrices(getPrices())
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                num_hours: 0,
                time: "07:00"
            }, {high_price: true}));
        });
        it("No prices", function () {
            priceComparer.updatePrices([])
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                num_hours: 1,
                time: "07:00"
            }, {high_price: true}));
        });
    });
    describe("Check high prices", function () {
        it("Check prices 1", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 2,
                    time: "08:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 2", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 3,
                    time: "08:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 3", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 4,
                    time: "08:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 4", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 2,
                    time: "18:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T07:10:00.000Z')
            ));
        });
        it("Check prices 5", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 3,
                    time: "18:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T07:10:00.000Z')
            ));
        });
        it("Check prices 6", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 1,
                    time: "18:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 7", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 2,
                    time: "18:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 8", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 3,
                    time: "18:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 9", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 4,
                    time: "18:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 10", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 5,
                    time: "18:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 11", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 6,
                    time: "18:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 12", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 1,
                    time: "07:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T21:10:00.000Z')
            ));
        });
        it("Check prices 13", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 2,
                    time: "07:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T21:10:00.000Z')
            ));
        });
        it("Check prices 14", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 4,
                    time: "07:00"
                }, {
                    high_price: true
                }, moment('2019-01-21T21:10:00.000Z')
            ));
        });
    });
    describe("Check low prices", function () {
        it("Check prices 1", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 2,
                    time: "08:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 2", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 3,
                    time: "08:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 3", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 4,
                    time: "08:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T04:10:00.000Z')
            ));
        });
        it("Check prices 4", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 2,
                    time: "18:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T07:10:00.000Z')
            ));
        });
        it("Check prices 5", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 3,
                    time: "18:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T07:10:00.000Z')
            ));
        });
        it("Check prices 6", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 1,
                    time: "18:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 7", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 2,
                    time: "18:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 8", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 3,
                    time: "18:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 9", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 4,
                    time: "18:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 10", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 5,
                    time: "18:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });
        it("Check prices 11", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 6,
                    time: "18:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T11:10:00.000Z')
            ));
        });

        it("Check prices 12", function () {
            priceComparer.updatePrices(getPrices());
            expect(false).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 7,
                    time: "06:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T21:10:00.000Z')
            ));
        });
        it("Check prices 13", function () {
            priceComparer.updatePrices(getPrices());
            expect(true).to.eq(priceComparer.currentPriceAmongBeforeTimeComparer({
                    num_hours: 8,
                    time: "06:00"
                }, {
                    high_price: false
                }, moment('2019-01-21T21:10:00.000Z')
            ));
        });
    });
});