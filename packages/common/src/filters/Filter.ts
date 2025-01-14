import { camelCase } from 'change-case'
import { FilterQuery, Dictionary } from '@mikro-orm/core'
import {
    FilterCondition,
    FilterConfig,
    FilterContract
} from '@tensei/common/filters'

export class Filter<T = any> implements FilterContract {
    public config: FilterConfig<T> = {
        name: '',
        shortName: '',
        default: false,
        dashboardView: false,
        cond: () => ({})
    }

    constructor(name: string, shortName = camelCase(name)) {
        this.config.name = name
        this.config.shortName = shortName
    }

    query(condition: FilterCondition<T>) {
        this.config.cond = condition

        return this
    }

    dashboardView() {
        this.config.dashboardView = true

        return this
    }

    noArgs() {
        this.config.args = false

        return this
    }

    default() {
        this.config.default = true

        return this
    }
}

export function filter<T = any>(name: string, shortName?: string) {
    return new Filter<T>(name, shortName)
}
