import type { ITableOrView } from "../utils/ITableOrView"
import { Column, isColumn, OptionalColumn, __getColumnPrivate } from "../utils/Column"
import type { IfValueSource, BooleanValueSource, IAnyBooleanValueSource, IStringIntValueSource, StringIntValueSource, IStringNumberValueSource, StringNumberValueSource, IIntValueSource, IntValueSource, INumberValueSource, NumberValueSource, ITypeSafeBigintValueSource, TypeSafeBigintValueSource, IBigintValueSource, BigintValueSource, IStringDoubleValueSource, StringDoubleValueSource, IDoubleValueSource, DoubleValueSource, ITypeSafeStringValueSource, TypeSafeStringValueSource, IStringValueSource, StringValueSource, ILocalDateValueSource, LocalDateValueSource, IDateValueSource, DateValueSource, ILocalTimeValueSource, LocalTimeValueSource, ITimeValueSource, TimeValueSource, ILocalDateTimeValueSource, LocalDateTimeValueSource, IDateTimeValueSource, DateTimeValueSource, IEqualableValueSource, EqualableValueSource, IComparableValueSource, ComparableValueSource } from "../expressions/values"
import type { ifValueSourceType, tableOrView, valueType } from "../utils/symbols"

type OnlyStringKey<KEY> = KEY extends string ? KEY : never

export function prefixCapitalized<O extends object, PREFIX extends string>(obj: O, prefix: PREFIX): { [K in OnlyStringKey<keyof O> as `${PREFIX}${Capitalize<K>}`]: O[K] } {
    if (!obj) {
        return obj
    }
    const result: any = {}
    for (let key in obj) {
        result[prefix + key.substr(0, 1).toUpperCase() + key.substr(1)] = obj[key]
    }
    return result
}

export function prefixMapForSplitCapitalized<O extends object, PREFIX extends string>(obj: O, prefix: PREFIX): { [K in OnlyStringKey<keyof O> as K]: `${PREFIX}${Capitalize<K>}` } {
    if (!obj) {
        return obj
    }
    const result: any = {}
    for (let key in obj) {
        result[key] = prefix + key.substr(0, 1).toUpperCase() + key.substr(1)
    }
    return result
}

type CapitalizedGuided<PREFIX extends string, KEY extends string, REFERENCE extends object> = KEY extends keyof REFERENCE
    ? (
        REFERENCE[KEY] extends Column 
        ? (
            REFERENCE[KEY] extends OptionalColumn
            ? `${PREFIX}${Capitalize<KEY>}`
            : `${PREFIX}${Capitalize<KEY>}!`
        ) : `${PREFIX}${Capitalize<KEY>}`
    ) : `${PREFIX}${Capitalize<KEY>}`

export function prefixMapForGuidedSplitCapitalized<O extends object, R extends ITableOrView<any> | { [KEY in keyof O]?: Column }, PREFIX extends string>(obj: O, reference: R, prefix: PREFIX): { [K in OnlyStringKey<keyof O> as K]: CapitalizedGuided<PREFIX, K, R> } {
    if (!obj) {
        return obj
    }
    const result: any = {}
    for (let key in obj) {
        const r = (reference as any)[key]
        if (isColumn(r) && !__getColumnPrivate(r).__isOptional) {
            result[key] = prefix + key.substr(0, 1).toUpperCase() + key.substr(1) + '!'
        } else {
            result[key] = prefix + key.substr(0, 1).toUpperCase() + key.substr(1)
        }
    }
    return result
}

type NameGuided<KEY extends string, REFERENCE extends object> = KEY extends keyof REFERENCE
    ? (
        REFERENCE[KEY] extends Column 
        ? (
            REFERENCE[KEY] extends OptionalColumn
            ? KEY
            : `${KEY}!`
        ) : KEY
    ) : KEY

export function mapForGuidedSplit<O extends object, R extends ITableOrView<any> | { [KEY in keyof O]?: Column } >(obj: O, reference: R): { [K in OnlyStringKey<keyof O> as K]: NameGuided<K, R> } {
    if (!obj) {
        return obj
    }
    const result: any = {}
    for (let key in obj) {
        const r = (reference as any)[key]
        if (isColumn(r) && !__getColumnPrivate(r).__isOptional) {
            result[key] = key + '!'
        } else {
            result[key] = key
        }
    }
    return result
}

export function prefixDotted<O extends object, PREFIX extends string>(obj: O, prefix: PREFIX): { [K in OnlyStringKey<keyof O> as `${PREFIX}.${K}`]-?: O[K] } {
    if (!obj) {
        return obj
    }
    const result: any = {}
    for (let key in obj) {
        result[prefix + '.' + key] = obj[key]
    }
    return result
}

export function prefixMapForSplitDotted<O extends object, PREFIX extends string>(obj: O, prefix: PREFIX): { [K in OnlyStringKey<keyof O> as K]-?: `${PREFIX}.${K}` } {
    if (!obj) {
        return obj
    }
    const result: any = {}
    for (let key in obj) {
        result[key] = prefix + '.' + key
    }
    return result
}

type DottedGuided<PREFIX extends string, KEY extends string, REFERENCE extends object> = KEY extends keyof REFERENCE
    ? (
        REFERENCE[KEY] extends Column 
        ? (
            REFERENCE[KEY] extends OptionalColumn
            ? `${PREFIX}.${KEY}`
            : `${PREFIX}.${KEY}!`
        ) : `${PREFIX}.${KEY}`
    ) : `${PREFIX}.${KEY}`

export function prefixMapForGuidedSplitDotted<O extends object, R extends ITableOrView<any> | { [KEY in keyof O]?: Column }, PREFIX extends string>(obj: O, reference: R, prefix: PREFIX): { [K in OnlyStringKey<keyof O> as K]: DottedGuided<PREFIX, K, R> } {
    if (!obj) {
        return obj
    }
    const result: any = {}
    for (let key in obj) {
        const r = (reference as any)[key]
        if (isColumn(r) && !__getColumnPrivate(r).__isOptional) {
            result[key] = prefix + '.' + key + '!'
        } else {
            result[key] = prefix + '.' + key
        }
    }
    return result
}

type ColumnKeys<O extends object> = { [K in keyof O]-?: O[K] extends Column ? K : never }[keyof O]

export function extractColumnsFrom<O extends object>(obj: O): { [K in ColumnKeys<O>]: O[K] } {
    if (!obj) {
        return obj
    }
    const result: any = {}
    for (let key in obj) {
        const value = obj[key]
        if (isColumn(value)) {
            result[key] = value
        }
    }
    return result
}

type HasIfValueSource<VALUE> = VALUE extends {[ifValueSourceType]: 'IfValueSource'} ? 'yes' : never

export function mergeType<VALUE extends IAnyBooleanValueSource<any, any>>(value: VALUE): 'yes' extends HasIfValueSource<VALUE>? IfValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]> : BooleanValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IStringIntValueSource<any, any>>(value: VALUE): StringIntValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IStringNumberValueSource<any, any>>(value: VALUE): StringNumberValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IIntValueSource<any, any>>(value: VALUE): IntValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends INumberValueSource<any, any>>(value: VALUE): NumberValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends ITypeSafeBigintValueSource<any, any>>(value: VALUE): TypeSafeBigintValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IBigintValueSource<any, any>>(value: VALUE): BigintValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IStringDoubleValueSource<any, any>>(value: VALUE): StringDoubleValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IStringNumberValueSource<any, any>>(value: VALUE): StringNumberValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IDoubleValueSource<any, any>>(value: VALUE): DoubleValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends INumberValueSource<any, any>>(value: VALUE): NumberValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends ITypeSafeStringValueSource<any, any>>(value: VALUE): TypeSafeStringValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IStringValueSource<any, any>>(value: VALUE): StringValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends ILocalDateValueSource<any, any>>(value: VALUE): LocalDateValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IDateValueSource<any, any>>(value: VALUE): DateValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends ILocalTimeValueSource<any, any>>(value: VALUE): LocalTimeValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends ITimeValueSource<any, any>>(value: VALUE): TimeValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends ILocalDateTimeValueSource<any, any>>(value: VALUE): LocalDateTimeValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<VALUE extends IDateTimeValueSource<any, any>>(value: VALUE): DateTimeValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType]>
export function mergeType<TYPE_NAME, VALUE extends IEqualableValueSource<any, any, TYPE_NAME>>(value: VALUE & IEqualableValueSource<any, any, TYPE_NAME>): EqualableValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType], TYPE_NAME>
export function mergeType<TYPE_NAME, VALUE extends IComparableValueSource<any, any, TYPE_NAME>>(value: VALUE & IComparableValueSource<any, any, TYPE_NAME>): ComparableValueSource<VALUE[typeof tableOrView], VALUE[typeof valueType], TYPE_NAME>
export function mergeType(value: any): any {
    return value
}
