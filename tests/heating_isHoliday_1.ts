import moment, {Moment} from 'moment-timezone';
import {HeatingOptions, HolidayToday, heating} from "../lib";

const expect = require("chai").expect;

const getDay = (y: number, M: number, d: number, h: number, m: number, s: number, ms: number): Moment => {
    return moment({y, M, d, h, m, s, ms});
};

const getHeatingOptions = (): HeatingOptions => {
    return {
        workday: {
            startHour: 5,
            endHour: 22.5,
        },
        notWorkday: {
            startHour: 7,
            endHour: 23,
        },
        workHours: {
            startHour: 7,
            endHour: 14
        },
        country: 'NO'
    };
};

describe("Heating", function () {

    before(function () {
        moment.tz.setDefault('Europe/Oslo');
    });

    describe("Check isHoliday", function () {
        it("Friday 02.12.2022, automatic", function () {
            const aDate = getDay(2022, 11, 2, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: undefined
            })).to.equal(false);
        });
        it("Friday 02.12.2022, automatic", function () {
            const aDate = getDay(2022, 11, 2, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: HolidayToday.automatic
            })).to.equal(false);
        });
        it("Friday 02.12.2022, holiday set", function () {
            const aDate = getDay(2022, 11, 2, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: HolidayToday.holiday
            })).to.equal(true);
        });
        it("Friday 02.12.2022, not_holiday set", function () {
            const aDate = getDay(2022, 11, 2, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: HolidayToday.not_holiday
            })).to.equal(false);
        });
        it("Saturday 03.12.2022, automatic", function () {
            const aDate = getDay(2022, 11, 3, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: undefined
            })).to.equal(false);
        });
        it("Saturday 03.12.2022, automatic", function () {
            const aDate = getDay(2022, 11, 3, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: HolidayToday.automatic
            })).to.equal(false);
        });
        it("Saturday 03.12.2022, holiday set", function () {
            const aDate = getDay(2022, 11, 3, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: HolidayToday.holiday
            })).to.equal(true);
        });
        it("Saturday 03.12.2022, not_holiday set", function () {
            const aDate = getDay(2022, 11, 3, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: HolidayToday.not_holiday
            })).to.equal(false);
        });
        it("Christmas Day 25.12.2022, automatic", function () {
            const aDate = getDay(2022, 11, 25, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: undefined
            })).to.equal(true);
        });
        it("Christmas Day 25.12.2022, automatic", function () {
            const aDate = getDay(2022, 11, 25, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: HolidayToday.automatic
            })).to.equal(true);
        });
        it("Christmas Day 25.12.2022, holiday et ", function () {
            const aDate = getDay(2022, 11, 25, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: HolidayToday.holiday
            })).to.equal(true);
        });
        it("Christmas Day 25.12.2022, not_holiday set", function () {
            const aDate = getDay(2022, 11, 25, 10, 0, 0, 0);
            expect(heating.isHoliday(aDate, {
                ...getHeatingOptions(),
                holiday_today: HolidayToday.not_holiday
            })).to.equal(false);
        });
    });

});
