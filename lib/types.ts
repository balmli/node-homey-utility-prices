import {Moment} from 'moment-timezone';

export enum Currency {
    NOK = 'NOK',
    SEK = 'SEK',
    DKK = 'DKK',
    EUR = 'EUR',
}

export type I18nMap = { [key: string]: string }

export interface PriceArea {
    id: string;
    label: I18nMap
}

export type PriceAreas = PriceArea[];

export const PriceAreas: PriceAreas = [
    {
        id: "AT",
        label: {
            "en": "Austria - AT"
        }
    },
    {
        id: "BE",
        label: {
            "en": "Belgium - BE"
        }
    },
    {
        id: "DE-LU",
        label: {
            "en": "Germany and Luxembourg (DE-LU)"
        }
    },
    {
        id: "FR",
        label: {
            "en": "France - FR"
        }
    },
    {
        id: "NL",
        label: {
            "en": "Netherlands - NL"
        }
    },
    {
        id: "SE1",
        label: {
            "en": "Sweden - SE1"
        }
    },
    {
        id: "SE2",
        label: {
            "en": "Sweden - SE2"
        }
    },
    {
        id: "SE3",
        label: {
            "en": "Sweden - SE3"
        }
    },
    {
        id: "SE4",
        label: {
            "en": "Sweden - SE4"
        }
    },
    {
        id: "DK1",
        label: {
            "en": "Sweden - DK1"
        }
    },
    {
        id: "DK2",
        label: {
            "en": "Sweden - DK2"
        }
    },
    {
        id: "FI",
        label: {
            "en": "Finland - FI"
        }
    },
    {
        id: "Oslo",
        label: {
            "en": "Norway - Oslo"
        }
    },
    {
        id: "Kr.sand",
        label: {
            "en": "Norway - Kr.sand"
        }
    },
    {
        id: "Bergen",
        label: {
            "en": "Norway - Bergen"
        }
    },
    {
        id: "Molde",
        label: {
            "en": "Norway - Molde"
        }
    },
    {
        id: "Tr.heim",
        label: {
            "en": "Norway - Tr.heim"
        }
    },
    {
        id: "Tromsø",
        label: {
            "en": "Norway - Tromsø"
        }
    },
    {
        id: "EE",
        label: {
            "en": "Estonia - EE"
        }
    },
    {
        id: "LV",
        label: {
            "en": "Latvia - LV"
        }
    },
    {
        id: "LT",
        label: {
            "en": "Lithuania - LT"
        }
    }
];

export interface NordpoolOptions {
    currency: Currency | string;
    priceArea: string;
}

export interface NordpoolColumn {
    Name: string;
    Value: string;
}

export interface NordpoolRow {
    StartTime: string;
    EndTime: string;
    IsExtraRow: boolean;
    Columns: NordpoolColumn[];
}


export interface NordpoolData {
    data: {
        Rows: NordpoolRow[]
    }
}

export interface NordpoolPrice {
    startsAt: Moment,
    time: number,
    price: number
}

export type NordpoolPrices = NordpoolPrice[];

export enum HolidayToday {
    holiday = 'holiday',
    not_holiday = 'not_holiday',
    automatic = 'automatic',
}

export interface HeatingOptions {
    workday: {
        startHour: number,
        endHour: number,
    },
    notWorkday: {
        startHour: number,
        endHour: number,
    },
    workHours: {
        startHour: number,
        endHour: number
    },
    country: string,
    holiday_today?: HolidayToday
}

export interface HeatingResult {
    date: string,
    lDate: string,
    atHome: boolean,
    homeOverride: boolean,
    day: boolean,
    night: boolean,
    atWork: boolean,
    heating: boolean
}

export enum PriceFetcherMethod {
    nordpool = 'nordpool',
    utilityPriceClient = 'utilityPriceClient',
    disabled = 'disabled',
}

export class PriceFetcherOptions {
    prevDays: number; // Number of days in the past day to fetch. Default 1 (yesterday)
    nextDays: number; // Number of days in the future to fetch. Default 1 (tomorrow)
    nordpoolOptions?: NordpoolOptions;
    fetchMethod?: PriceFetcherMethod;
    fetchMonthlyAverage?: boolean; // Shall fetch monthly average ?
    fetchTime?: number; // Seconds in the hour to fetch data

    constructor({prevDays, nextDays, nordpoolOptions, fetchMethod, fetchMonthlyAverage, fetchTime}: {
        prevDays?: number,
        nextDays?: number,
        nordpoolOptions?: NordpoolOptions,
        fetchMethod?: PriceFetcherMethod,
        fetchMonthlyAverage?: boolean,
        fetchTime?: number
    }) {
        this.prevDays = prevDays || 1;
        this.nextDays = nextDays || 1;
        this.nordpoolOptions = nordpoolOptions;
        this.fetchMethod = fetchMethod || PriceFetcherMethod.nordpool;
        this.fetchMonthlyAverage = fetchMonthlyAverage;
        this.fetchTime = fetchTime;
    }

}
