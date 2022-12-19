import moment, {Moment} from 'moment-timezone';
import {PriceApi} from "../lib";

const expect = require("chai").expect;

const priceApi = new PriceApi();

const getDay = (y: number, M: number, d: number, h: number, m: number, s: number, ms: number): Moment => {
    return moment({y, M, d, h, m, s, ms});
};

describe("PriceApi.daysPeriod", function () {

    before(function () {
        moment.tz.setDefault('Europe/Oslo');
    });

    describe("Check daysPeriod", function () {
        it("Friday 02.12.2022, start less than end, text", function () {
            const {startTs, endTs} = priceApi.daysPeriod(getDay(2022, 11, 2, 10, 0, 0, 0), "02:00", "07:00");
            expect(startTs.toISOString()).to.eq("2022-12-02T01:00:00.000Z");
            expect(endTs.toISOString()).to.eq("2022-12-02T06:00:00.000Z");
        });
        it("Friday 02.12.2022, start less than end, number", function () {
            const {startTs, endTs} = priceApi.daysPeriod(getDay(2022, 11, 2, 10, 0, 0, 0), 2, 7);
            expect(startTs.toISOString()).to.eq("2022-12-02T01:00:00.000Z");
            expect(endTs.toISOString()).to.eq("2022-12-02T06:00:00.000Z");
        });

        it("Friday 02.12.2022, start greater than end, text", function () {
            const {startTs, endTs} = priceApi.daysPeriod(getDay(2022, 11, 2, 10, 0, 0, 0), "07:00", "02:00");
            expect(startTs.toISOString()).to.eq("2022-12-02T06:00:00.000Z");
            expect(endTs.toISOString()).to.eq("2022-12-03T01:00:00.000Z");
        });
        it("Friday 02.12.2022, start greater than end, number", function () {
            const {startTs, endTs} = priceApi.daysPeriod(getDay(2022, 11, 2, 10, 0, 0, 0), 7, 2);
            expect(startTs.toISOString()).to.eq("2022-12-02T06:00:00.000Z");
            expect(endTs.toISOString()).to.eq("2022-12-03T01:00:00.000Z");
        });
    });

});
