# Supported operations

The most common operations over the data are suported by ts-sql-query; in the case the database don't support it, an emulation is provided, if an emulation is not possible you will get an error during the compilation of your source code.

Some API are fluent API, that means, every function you call returns an object that contains the functions that you can call in that step. 

Here is shown a simplified version of the ts-sql-query APIs.

## Operations definitions

All values managed by the database are represented as a subclass of `ValueSource`, almost all methods listed here support the TypeScript value and the database value (as overload).

The methods which name ends with `IfValue` do the same that the one without `IfValue` but only if the provided value(s) are different to undefined, null, empty string (only when the `allowEmptyString` flag in the connection is not set to true, that is the default behaviour) or an empty array, otherwise it is ignored.

Be aware, in the database, when null is part of an operation the result of the operation is null (It is not represented in the following definition but it is implemented)

All the data manipulation operations are implemented as a methods inside the value, that means if you what to calculate the abolute, in sql is `abs(value)` but in ts-sql-query is reprecented as `value.abs()`.

```ts
interface ValueSource {
    isConstValue(): boolean
    /**
     * It returns the proper type of the value, instead of the any type included here to simplify
     * If the value source is not a const value it throws an error
     */
    getConstValue(): any
    /**
     * Throw an error if the value source is used in the generated sql query when the boolean value provided as argument is false
     */
    allowWhen(when: boolean, errorMessage: string): this
    allowWhen(when: boolean, error: Error): this
    /**
     * Throw an error if the value source is used in the generated sql query when the boolean value provided as argument is true
     */
    disallowWhen(when: boolean, errorMessage: string): this
    disallowWhen(when: boolean, error: Error): this
}

interface NullableValueSource extends ValueSource {
    isNull(): boolean
    isNotNull(): boolean
    valueWhenNull(value: this): this
    nullIfValue(value: this): this | null | undefined
    asOptional(): this | null | undefined
    asRequiredInOptionalObject(): this
    onlyWhenOrNull(when: boolean): this
    ignoreWhenAsNull(when: boolean): this
}

interface EqualableValueSource extends NullableValueSource {
    equalsIfValue(value: this | null | undefined): boolean
    equals(value: this): boolean
    notEqualsIfValue(value: this | null | undefined): boolean
    notEquals(value: this): boolean
    isIfValue(value: this | null | undefined): boolean
    /** 'is' is the same that equals, but returns true when booth are null */
    is(value: this): boolean
    isNotIfValue(value: this | null | undefined): boolean
    isNot(value: this): boolean

    inIfValue(values: this[] | null | undefined): boolean
    in(values: this[]): boolean
    in(select: Subquery): boolean
    notInIfValue(values: this[] | null | undefined): boolean
    notIn(values: this[]): boolean
    notIn(select: Subquery): boolean
    inN(...value: this[]): boolean
    notInN(...value: this[]): boolean
}

interface ComparableValueSource extends EqualableValueSource {
    lessThanIfValue(value: this | null | undefined): boolean
    lessThan(value: this): boolean
    greaterThanIfValue(value: this | null | undefined): boolean
    greaterThan(value: this): boolean
    lessOrEqualsIfValue(value: this | null | undefined): boolean
    lessOrEquals(value: this): boolean
    greaterOrEqualsIfValue(value: this | null | undefined): boolean
    greaterOrEquals(value: this): boolean
    between(value: this, value2: this): boolean
    notBetween(value: this, value2: this): boolean

    /** @deprecated use lessThanIfValue method instead */
    smallerIfValue(value: this | null | undefined): boolean
    /** @deprecated use lessThan method instead */
    smaller(value: this): boolean
    /** @deprecated use greaterThanIfValue method instead */
    largerIfValue(value: this | null | undefined): boolean
    /** @deprecated use greaterThan method instead */
    larger(value: this): boolean
    /** @deprecated use lessOrEqualsIfValue method instead */
    smallAsIfValue(value: this | null | undefined): boolean
    /** @deprecated use lessOrEquals method instead */
    smallAs(value: this): boolean
    /** @deprecated use greaterOrEqualsIfValue method instead */
    largeAsIfValue(value: this | null | undefined): boolean
    /** @deprecated use greaterOrEquals method instead */
    largeAs(value: this): boolean
}

/**
 * Represents a boolean
 */
interface BooleanValueSource extends EqualableValueSource {
    negate(): boolean
    and(value: boolean): boolean
    or(value: boolean): boolean
    /** This function returns a boolean expression that only applies if the argument is true */
    onlyWhen(condition: boolean): boolean
    /** This function returns a boolean expression that only applies if the argument is false, it is ignored when true */
    ignoreWhen(condition: boolean): boolean
    /** This function allows to return a true value when null or undefined were provided to the *IfValue function */
    trueWhenNoValue(): boolean
    /** This function allows to return a false value when null or undefined were provided to the *IfValue function */
    falseWhenNoValue(): boolean
    /** This function allows to return a value when null or undefined were provided to the *IfValue function */
    valueWhenNoValue(value: boolean): boolean
}

/**
 * Represents an int or a double
 */
interface NumberValueSource extends ComparableValueSource {
    asInt(): number
    asDouble(): number
    asStringInt(): number|string
    asStringDouble(): number|string
    asBigint(): bigint
    abs(): number
    ceil(): number
    floor(): number
    round(): number
    exp(): number
    ln(): number
    log10(): number
    sqrt(): number
    cbrt(): number
    sign(): number
    acos(): number
    asin(): number
    atan(): number
    cos(): number
    cot(): number
    sin(): number
    tan(): number
    power(value: number): number
    logn(value: number): number
    roundn(value: number): number
    /**
     * This function establish a minimum value for the current value, that means the biggest value must be returned
     */
    minValue(value: number): number
    /**
     * This function establish a maximun value for the current value, that means the smallest value must be returned
     */
    maxValue(value: number): number
    add(value: number): number
    substract(value: number): number
    multiply(value: number): number
    divide(value: number): number
    modulo(value: number): number
    /** @deprecated use modulo method instead */
    mod(value: number): number
    atan2(value: number): number
}

/**
 * Represents a stringInt or a stringDouble
 */
interface StringNumberValueSource extends ComparableValueSource {
    asStringInt(): number|string
    asStringDouble(): number|string
    asBigint(): bigint
    abs(): number|string
    ceil(): number|string
    floor(): number|string
    round(): number|string
    exp(): number|string
    ln(): number|string
    log10(): number|string
    sqrt(): number|string
    cbrt(): number|string
    sign(): number|string
    acos(): number|string
    asin(): number|string
    atan(): number|string
    cos(): number|string
    cot(): number|string
    sin(): number|string
    tan(): number|string
    power(value: number|string): number|string
    logn(value: number|string): number|string
    roundn(value: number|string): number|string
    /**
     * This function establish a minimum value for the current value, that means the biggest value must be returned
     */
    minValue(value: number|string): number|string
    /**
     * This function establish a maximun value for the current value, that means the smallest value must be returned
     */
    maxValue(value: number|string): number|string
    add(value: number|string): number|string
    substract(value: number|string): number|string
    multiply(value: number|string): number|string
    divide(value: number|string): number|string
    modulo(value: number|string): number|string
    /** @deprecated use modulo method instead */
    mod(value: number|string): number|string
    atan2(value: number|string): number|string
}

/**
 * Represents a bigint
 */
interface BigintValueSource extends ComparableValueSource {
    asStringNumber(): number|string
    abs(): bigint
    ceil(): bigint
    floor(): bigint
    round(): bigint
    sign(): number
    /**
     * This function establish a minimum value for the current value, that means the biggest value must be returned
     */
    minValue(value: bigint): bigint
    /**
     * This function establish a maximun value for the current value, that means the smallest value must be returned
     */
    maxValue(value: bigint): bigint
    add(value: bigint): bigint
    substract(value: bigint): bigint
    multiply(value: bigint): bigint
    modulo(value: bigint): bigint
    /** @deprecated use modulo method instead */
    mod(value: bigint): bigint
}

/**
 * Represents a string
 */
interface StringValueSource extends ComparableValueSource {
    equalsInsensitiveIfValue(value: string | null | undefined): boolean
    equalsInsensitive(value: string): boolean
    notEqualsInsensitiveIfValue(value: string | null | undefined): boolean
    notEqualsInsensitive(value: string): boolean
    likeIfValue(value: string | null | undefined): boolean
    like(value: string): boolean
    notLikeIfValue(value: string | null | undefined): boolean
    notLike(value: string): boolean
    likeInsensitiveIfValue(value: string | null | undefined): boolean
    likeInsensitive(value: string): boolean
    notLikeInsensitiveIfValue(value: string | null | undefined): boolean
    notLikeInsensitive(value: string): boolean
    startsWithIfValue(value: string | null | undefined): boolean
    startsWith(value: string): boolean
    notStartsWithIfValue(value: string | null | undefined): boolean
    notStartsWith(value: string): boolean
    endsWithIfValue(value: string | null | undefined): boolean
    endsWith(value: string): boolean
    notEndsWithIfValue(value: string | null | undefined): boolean
    notEndsWith(value: string): boolean
    startsWithInsensitiveIfValue(value: string | null | undefined): boolean
    startsWithInsensitive(value: string): boolean
    notStartsWithInsensitiveIfValue(value: string | null | undefined): boolean
    notStartsWithInsensitive(value: string): boolean
    endsWithInsensitiveIfValue(value: string | null | undefined): boolean
    endsWithInsensitive(value: string): boolean
    notEndsWithInsensitiveIfValue(value: string | null | undefined): boolean
    notEndsWithInsensitive(value: string): boolean
    containsIfValue(value: string | null | undefined): boolean
    contains(value: string): boolean
    notContainsIfValue(value: string | null | undefined): boolean
    notContains(value: string): boolean
    containsInsensitiveIfValue(value: string | null | undefined): boolean
    containsInsensitive(value: string): boolean
    notContainsInsensitiveIfValue(value: string | null | undefined): boolean
    notContainsInsensitive(value: string): boolean
    toLowerCase(): string
    /** @deprecated use toLowerCase method instead */
    lower(): string
    toUpperCase(): string
    /** @deprecated use toUpperCase method instead */
    upper(): string
    length(): number
    trim(): string
    trimLeft(): string
    /** @deprecated use trimLeft method instead */
    ltrim(): string
    trimRight(): string
    /** @deprecated use trimRight method instead */
    rtrim(): string
    reverse(): string
    concatIfValue(value: string | null | undefined): string
    concat(value: string): string
    substrToEnd(start: number): string
    substringToEnd(start: number): string
    substr(start: number, count: number): string
    substring(start: number, end: number): string
    /** @deprecated use replaceAllIfValue method instead */
    replaceIfValue(findString: string | null | undefined, replaceWith: string | null | undefined): string
    replaceAllIfValue(findString: string | null | undefined, replaceWith: string | null | undefined): string
    /** @deprecated use replaceAll method instead */
    replace(findString: string, replaceWith: string): string
    replaceAll(findString: string, replaceWith: string): string
}

/**
 * Represents an UUID
 */
 interface UuidValueSource extends ComparableValueSource {
    asString(): string
 }

/**
 * Represents a local date without time (using a Date object)
 */
interface DateValueSource extends ComparableValueSource {
    /** Gets the year */
    getFullYear(): number
    /** Gets the month (value between 0 to 11)*/
    getMonth(): number
    /** Gets the day-of-the-month */
    getDate(): number
    /** Gets the day of the week (0 represents Sunday) */
    getDay(): number
}

/**
 * Represents a local time without date (using a Date object)
 */
interface TimeValueSource extends ComparableValueSource {
    /** Gets the hours */
    getHours(): number
    /** Gets the minutes */
    getMinutes(): number
    /** Gets the seconds */
    getSeconds(): number
    /** Gets the milliseconds */
    getMilliseconds(): number
}

/**
 * Represents a local date with time (using a Date object)
 */
interface DateTimeValueSource extends ComparableValueSource {
    /** Gets the year */
    getFullYear(): number
    /** Gets the month (value between 0 to 11)*/
    getMonth(): number
    /** Gets the day-of-the-month */
    getDate(): number
    /** Gets the day of the week (0 represents Sunday) */
    getDay(): number
    /** Gets the hours */
    getHours(): number
    /** Gets the minutes */
    getMinutes(): number
    /** Gets the seconds */
    getSeconds(): number
    /** Gets the milliseconds */
    getMilliseconds(): number
    /** Gets the time value in milliseconds */
    getTime(): number
}

/**
 * Represents the result of an aggregate as object array
 */
interface AggregatedArrayValueSource extends ValueSource {
    useEmptyArrayForNoValue(): AggregatedArrayValueSource
    asOptionalNonEmptyArray(): AggregatedArrayValueSource
    asRequiredInOptionalObject(): AggregatedArrayValueSource
    onlyWhenOrNull(when: boolean): AggregatedArrayValueSource
    ignoreWhenAsNull(when: boolean): AggregatedArrayValueSource
}
```

## Connection definition

```ts
interface Connection {
    /** Query runner used to create the connection */
    readonly queryRunner: QueryRunner

    // Transaction management
    beginTransaction(): Promise<void>
    commit(): Promise<void>
    rollback(): Promise<void>
    isTransactionActive(): boolean
    transaction<T>(fn: () => Promise<T>[]): Promise<T[]>
    transaction<T>(fn: () => Promise<T>): Promise<T>
    // Fuctions that allow to differ a code execution till the end of the transaction
    executeAfterNextCommit(fn: ()=> void): void
    executeAfterNextCommit(fn: ()=> Promise<void>): void
    executeAfterNextRollback(fn: ()=> void): void
    executeAfterNextRollback(fn: ()=> Promise<void>): void

    // Querying
    insertInto(table: Table): InsertExpression
    update(table: Table): UpdateExpression
    updateAllowingNoWhere(table: Table): UpdateExpression
    deleteFrom(table: Table): DeleteExpression
    deleteAllowingNoWhereFrom(table: Table): DeleteExpression
    selectFrom(table: Table | View): SelectExpression
    selectDistinctFrom(table: Table | View): SelectExpression
    selectFromNoTable(): SelectExpression

    // These methods allows to create a subquery that depends of a outer table defined in the main query 
    subSelectUsing(table: Table | View): SelectExpression
    subSelectUsing(table1: Table | View, table2: Table | View): SelectExpression
    subSelectUsing(table1: Table | View, table2: Table | View, table3: Table | View): SelectExpression
    subSelectDistinctUsing(table: Table | View): SelectExpression
    subSelectDistinctUsing(table1: Table | View, table2: Table | View): SelectExpression
    subSelectDistinctUsing(table1: Table | View, table2: Table | View, table3: Table | View): SelectExpression
    
    // default value for use in insert queries
    default(): Default

    // values that can be returned by the database
    pi(): NumberValueSource
    random(): NumberValueSource
    currentDate(): DateValueSource
    currentTime(): TimeValueSource
    currentDateTime(): DateTimeValueSource
    currentTimestamp(): DateTimeValueSource
    true(): BooleanValueSource
    false(): BooleanValueSource

    // methods that allows to create a value source with a constant value
    const(value: boolean, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    const(value: number | string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    const(value: number, type: 'int', adapter?: TypeAdapter): NumberValueSource
    const(value: number, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    const(value: number | string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    const(value: number, type: 'double', adapter?: TypeAdapter): NumberValueSource
    const(value: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    const(value: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    const(value: Date, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    const(value: Date, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    const(value: Date, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    const<T, TYPE_NAME = T>(value: T, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    const<T, TYPE_NAME = T>(value: T, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    const<T, TYPE_NAME = T>(value: T, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // methods that allows to create a value source with an optional constant value
    optionalConst(value: boolean | null | undefined, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    optionalConst(value: number | string | null | undefined, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    optionalConst(value: number | null | undefined, type: 'int', adapter?: TypeAdapter): NumberValueSource
    optionalConst(value: number | null | undefined, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    optionalConst(value: number | string | null | undefined, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    optionalConst(value: number | null | undefined, type: 'double', adapter?: TypeAdapter): NumberValueSource
    optionalConst(value: string | null | undefined, type: 'string', adapter?: TypeAdapter): StringValueSource
    optionalConst(value: string | null | undefined, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    optionalConst(value: Date | null | undefined, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    optionalConst(value: Date | null | undefined, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    optionalConst(value: Date | null | undefined, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    optionalConst<T, TYPE_NAME = T>(value: T | null | undefined, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalConst<T, TYPE_NAME = T>(value: T | null | undefined, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalConst<T, TYPE_NAME = T>(value: T | null | undefined, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource
    
    // allows to use the exits function on a subquery
    exists(select: Subquery): BooleanValueSource
    notExists(select: Subquery): BooleanValueSource

    // aggregate functions
    /** count(*) */
    countAll(): NumberValueSource
    /** count(value) */
    count(value: ValueSource): NumberValueSource
    /** count(distinct value) */
    countDistinct(value: ValueSource): NumberValueSource
    /** max(value) */
    max<TYPE extends ComparableValueSource>(value: TYPE): TYPE
    /** min(value) */
    min<TYPE extends ComparableValueSource>(value: TYPE): TYPE
    /** sum(value) */
    sum(value: NumberValueSource): NumberValueSource
    sum(value: StringNumberValueSource): StringNumberValueSource
    /** sum(distinct value) */
    sumDistinct(value: NumberValueSource): NumberValueSource
    sumDistinct(value: StringNumberValueSource): StringNumberValueSource
    /** avg(value) */
    average(value: NumberValueSource): NumberValueSource
    average(value: StringNumberValueSource): StringNumberValueSource
    /** avg(disctinct value) */
    averageDistinct(value: NumberValueSource): NumberValueSource
    averageDistinct(value: StringNumberValueSource): StringNumberValueSource
    /** group_concat(value, separator) sometimes called string_agg or listagg. The default separator is ',' */
    stringConcat(value: StringValueSource, separator?: string): StringValueSource
    /** group_concat(distinct value, separator) sometimes called string_agg or listagg. The default separator is ',' */
    stringConcatDistinct(value: StringValueSource, separator?: string): StringValueSource
    /** Aggregate as object array */
    aggregateAsArray(columns: SelectValues): AggregatedArrayValueSource
    aggregateAsArrayOfOneColumn(value: ValueSource): AggregatedArrayValueSource

    // Methods that allows create SQL fragments
    fragmentWithType(type: 'boolean', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'stringInt', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'int', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'bigint', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'stringDouble', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'double', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'string', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'uuid', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'localDate', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'localTime', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType(type: 'localDateTime', required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType<T, TYPE_NAME = T>(type: 'enum', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType<T, TYPE_NAME = T>(type: 'custom', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    fragmentWithType<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): FragmentExpression
    
    /** 
     * This is a template, you can call as: .rawFragment`sql text with ${valueSourceParam}` 
     */
    rawFragment(sql: TemplateStringsArray, ...p: Array<ValueSource | Subquery>): RawFragment

    // Protected methods that allows call a stored procedure
    executeProcedure(procedureName: string, params: ValueSource[]): Promise<void>

    // Protected methods that allows call a function
    executeFunction(functionName: string, params: ValueSource[], returnType: 'boolean', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<boolean>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'stringInt', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<number>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'int', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<number>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'bigint', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<bigint>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'stringDouble', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<number>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'double', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<number>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'string', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<string>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'uuid', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<string>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'localDate', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<Date>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'localTime', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<Date>
    executeFunction(functionName: string, params: ValueSource[], returnType: 'localDateTime', required: 'required' | 'optional', adapter?: TypeAdapter): Promise<Date>
    executeFunction<T, TYPE_NAME = T>(functionName: string, params: ValueSource[], returnType: 'enum', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): Promise<T>
    executeFunction<T, TYPE_NAME = T>(functionName: string, params: ValueSource[], returnType: 'custom', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): Promise<T>
    executeFunction<T, TYPE_NAME = T>(functionName: string, params: ValueSource[], returnType: 'customComparable', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): Promise<T>

    // Protected methods to define a sequence (only available in oracle, postgreSql and sqlServer)
    sequence(name: string, type: 'boolean', adapter?: TypeAdapter): Sequence<BooleanValueSource>
    sequence(name: string, type: 'stringInt', adapter?: TypeAdapter): Sequence<StringNumberValueSource>
    sequence(name: string, type: 'int', adapter?: TypeAdapter): Sequence<NumberValueSource>
    sequence(name: string, type: 'bigint', adapter?: TypeAdapter): Sequence<BigintValueSource>
    sequence(name: string, type: 'stringDouble', adapter?: TypeAdapter): Sequence<StringNumberValueSource>
    sequence(name: string, type: 'double', adapter?: TypeAdapter): Sequence<NumberValueSource>
    sequence(name: string, type: 'string', adapter?: TypeAdapter): Sequence<StringValueSource>
    sequence(name: string, type: 'uuid', adapter?: TypeAdapter): Sequence<UuidValueSource>
    sequence(name: string, type: 'localDate', adapter?: TypeAdapter): Sequence<DateValueSource>
    sequence(name: string, type: 'localTime', adapter?: TypeAdapter): Sequence<TimeValueSource>
    sequence(name: string, type: 'localDateTime', adapter?: TypeAdapter): Sequence<DateTimeValueSource>
    sequence<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): Sequence<EqualableValueSource>
    sequence<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): Sequence<EqualableValueSource>
    sequence<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): Sequence<ComparableValueSource>

    // Protected methods to define reusable fragments
    /**
     * Allows to define arguments that acept the value or a value source of the type specified
     */
    arg(type: 'boolean', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'stringInt', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'int', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'bigint', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'stringDouble', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'double', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'string', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'uuid', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'localDate', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'localTime', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg(type: 'localDateTime', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg<T, TYPE_NAME = T>(type: 'enum', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg<T, TYPE_NAME = T>(type: 'custom', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    arg<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): Argument

    /**
     * Allows to define arguments that acept the value (but no a value source) of the type specified
     */
    valueArg(type: 'boolean', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'stringInt', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'int', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'bigint', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'stringDouble', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'double', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'string', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'uuid', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'localDate', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'localTime', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg(type: 'localDateTime', required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg<T, TYPE_NAME = T>(type: 'enum', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg<T, TYPE_NAME = T>(type: 'custom', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): Argument
    valueArg<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, required: 'required' | 'optional', adapter?: TypeAdapter): Argument

    /*
     * This functions receive the argument definition that you can create calling the arg function or the valueArg function.
     * You can specify up to 5 argument definitions
     */
    buildFragmentWithArgs(...argumentDefinitions: Argument[]): FragmentBuilder
    buildFragmentWithArgsIfValue(...argumentDefinitions: Argument[]): FragmentBuilderIfValue

    /**
     * Return the same special neutral boolean mark returned by the IfValue functions when there is no value
     */
    noValueBoolean(): BooleanValueSource

    /**
     * Return the same special neutral boolean mark returned by the IfValue functions when there is no value in a way it can be used
     * to create dynamic boolean expression where the variable is reasigned (it have a stable type)
     */
    dynamicBooleanExpressionUsing(table: Table | View): BooleanValueSource
    dynamicBooleanExpressionUsing(table1: Table | View, table2: Table | View): BooleanValueSource
    dynamicBooleanExpressionUsing(table1: Table | View, table2: Table | View, table3: Table | View): BooleanValueSource
    dynamicBooleanExpressionUsing(table1: Table | View, table2: Table | View, table3: Table | View,  table4: Table | View): BooleanValueSource
    dynamicBooleanExpressionUsing(table1: Table | View, table2: Table | View, table3: Table | View,  table4: Table | View,  table5: Table | View): BooleanValueSource

    /**
     * Allows to create a condition where the criteria is provided by an external system
     */
    dynamicConditionFor(definition: { [key: string ]: ValueSource }): DynamicConditionExpression

    /*
     * The fn function will receive as first argument the table name as ValueSource,
     * as the second argument is the alias of the table as ValueSource
     * The number of additional arguments in the fn function is the same in the resulting function (up to 5 arguments).
     * The first argument of the returned function is the table or view, the second argument
     * is a name for the customization; the additional arguments are the same defined in the fn function.
     */
    createTableOrViewCustomization(fn: (table: ValueSource, alias: ValueSource, ...params: any[]) => RawFragment): (tableOrView: Table | View, name: string, ...params: any[]) => CustomizedTableOrView

    /*
     * Configurations
     */

    /** 
     * Protected property that allows changing the behaviour of empty string treatment.
     * By default empty string as treated as null, if you want to allow to send and receive empty string to the database set this property to true
     * Default value: false
     */
    allowEmptyString: boolean

    /** Protected method that allows to transform the values received from the database */
    transformValueFromDB(value: unknown, type: string): unknown
    /** Protected method that allows to transform the values that will be send to the database */
    transformValueToDB(value: unknown, type: string): unknown
    /** Protected method that allows to customize the value placeholder in the query */
    transformPlaceholder(placeholder: string, type: string, forceTypeCast: boolean, valueSentToDB: unknown): string

    /** Protected method that returns true if the provided string is a reserved keyword, otherwise return false */
    isReservedWord(word: string): boolean
    /** Protected method that returns the provided string as a indefier quoting it all the time */
    forceAsIdentifier(identifier: string): string
    /** 
     * Protected method that returns the provided identifier escaped.
     * The default implementation quote the identifier only if it is a reserved keyword.
     * If you want all identifiers quoted, you must reimplement this function returning the result of the forceAsIdentifier function.
     */
    escape(identifier: string, strict: boolean): string
}

interface FragmentExpression {
    /** 
     * This is a template, you can call as: .sql`sql text with ${valueSourceParam}` 
     * You can specify up to 7 parameters.
     */
    sql(sql: TemplateStringsArray, ...p: ValueSource[]): ValueSource
}

interface FragmentBuilder {
    /*
     * The impl function will receive the proper ValueSource type according to the argument definition.
     * The nunber of arguments is the same specified in the function buildFragmentWithArgs (up to 5 arguments).
     * The arguments of the returned function will have the proper parameters type.
     */
    as(impl: (...args: ValueSource[]) => ValueSource): (...args: any) => ValueSource
}

interface FragmentBuilderIfValue {
    /*
     * The impl function will receive the proper ValueSource type according to the argument definition.
     * The nunber of arguments is the same specified in the function buildFragmentWithArgsIfValue (up to 5 arguments).
     * Any optional valueArg will be treated as required, the function received as argument will be not called if
     * that argument receives null or undefined.
     * The arguments of the returned function will have the proper parameters type.
     */
    as(impl: (...args: ValueSource[]) => ValueSource): (...args: any) => BooleanValueSource
}

interface Sequence<T> {
    nextValue(): T
    currentValue(): T
}

interface DynamicConditionExpression {
    withValues(filter: DynamicFilter): BooleanValueSource
}
```

## Table definition

```ts
interface Table {
    /** Allows to define an alias for the table to be used in the selects queries */
    as(as: string): this
    /** Allows  to use the table in a left join */
    forUseInLeftJoin(): this & OuterJoinSource
    /** Allows  to use the table in a left join with an alias */
    forUseInLeftJoinAs(as: string): this & OuterJoinSource

    // Protected methods that allow to create a required column that doesn't admits null
    column(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    column(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    column(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    column(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    column(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    column(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    column(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    column(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    column(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    column(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    column(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    column<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    column<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    column<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allow to create an optional column that admits null
    optionalColumn(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    optionalColumn(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    optionalColumn(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    optionalColumn(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    optionalColumn(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    optionalColumn(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    optionalColumn(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    optionalColumn(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    optionalColumn(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    optionalColumn(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    optionalColumn(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    optionalColumn<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalColumn<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalColumn<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource
    
    // Protected methods that allow to create a required column that doesn't admits null but have a default value when insert
    columnWithDefaultValue(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    columnWithDefaultValue(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    columnWithDefaultValue(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    columnWithDefaultValue(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    columnWithDefaultValue(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    columnWithDefaultValue(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    columnWithDefaultValue(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    columnWithDefaultValue(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    columnWithDefaultValue(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    columnWithDefaultValue(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    columnWithDefaultValue(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    columnWithDefaultValue<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    columnWithDefaultValue<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    columnWithDefaultValue<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource
    
    // Protected methods that allow to create an optional column that admits null and have a default value when insert
    optionalColumnWithDefaultValue(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    optionalColumnWithDefaultValue(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    optionalColumnWithDefaultValue(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    optionalColumnWithDefaultValue(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    optionalColumnWithDefaultValue(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    optionalColumnWithDefaultValue(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    optionalColumnWithDefaultValue(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    optionalColumnWithDefaultValue(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    optionalColumnWithDefaultValue(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    optionalColumnWithDefaultValue(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    optionalColumnWithDefaultValue(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    optionalColumnWithDefaultValue<T, TYPE_NAME = T>(name: string, type: 'enum', typeNme: string, adapter?: TypeAdapter): EqualableValueSource
    optionalColumnWithDefaultValue<T, TYPE_NAME = T>(name: string, type: 'custom', typeNme: string, adapter?: TypeAdapter): EqualableValueSource
    optionalColumnWithDefaultValue<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeNme: string, adapter?: TypeAdapter): ComparableValueSource
    
    // Protected methods that allow to create a primary key column autogenerated in the database
    // When you insert you don't need specify this column
    autogeneratedPrimaryKey(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    autogeneratedPrimaryKey(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    autogeneratedPrimaryKey(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    autogeneratedPrimaryKey(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    autogeneratedPrimaryKey(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    autogeneratedPrimaryKey(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    autogeneratedPrimaryKey(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    autogeneratedPrimaryKey(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    autogeneratedPrimaryKey(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    autogeneratedPrimaryKey(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    autogeneratedPrimaryKey(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    autogeneratedPrimaryKey<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    autogeneratedPrimaryKey<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    autogeneratedPrimaryKey<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allow to create a primary key column not automatically generated
    // When you insert you must specify this column
    primaryKey(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    primaryKey(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    primaryKey(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    primaryKey(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    primaryKey(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    primaryKey(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    primaryKey(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    primaryKey(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    primaryKey(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    primaryKey(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    primaryKey(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    primaryKey<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    primaryKey<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    primaryKey<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource
      
    // Protected methods that allow to create a primary key column generated by a sequence
    // When you insert you don't need specify this column, it will be added automatically by ts-sql-query
    // This method is only supported by oracle, postgreSql and sqlServer
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    autogeneratedPrimaryKeyBySequence(name: string, sequenceName: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    autogeneratedPrimaryKeyBySequence<T, TYPE_NAME = T>(name: string, sequenceName: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    autogeneratedPrimaryKeyBySequence<T, TYPE_NAME = T>(name: string, sequenceName: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    autogeneratedPrimaryKeyBySequence<T, TYPE_NAME = T>(name: string, sequenceName: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allow to create a computed column that doesn't admits null
    computedColumn(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    computedColumn(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    computedColumn(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    computedColumn(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    computedColumn(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    computedColumn(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    computedColumn(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    computedColumn(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    computedColumn(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    computedColumn(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    computedColumn(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    computedColumn<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    computedColumn<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    computedColumn<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allow to create an optional computed column that admits null
    optionalComputedColumn(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    optionalComputedColumn(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    optionalComputedColumn(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    optionalComputedColumn(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    optionalComputedColumn(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    optionalComputedColumn(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    optionalComputedColumn(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    optionalComputedColumn(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    optionalComputedColumn(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    optionalComputedColumn(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    optionalComputedColumn(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    optionalComputedColumn<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalComputedColumn<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalComputedColumn<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allows to create a sql fragment in the table
    virtualColumnFromFragment(type: 'boolean', fn: (fragment: FragmentExpression) => BooleanValueSource, adapter?: TypeAdapter): BooleanValueSource
    virtualColumnFromFragment(type: 'stringInt', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    virtualColumnFromFragment(type: 'int', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    virtualColumnFromFragment(type: 'bigint', fn: (fragment: FragmentExpression) => BigintValueSource, adapter?: TypeAdapter): BigintValueSource
    virtualColumnFromFragment(type: 'stringDouble', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    virtualColumnFromFragment(type: 'double', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    virtualColumnFromFragment(type: 'string', fn: (fragment: FragmentExpression) => StringValueSource, adapter?: TypeAdapter): StringValueSource
    virtualColumnFromFragment(type: 'uuid', fn: (fragment: FragmentExpression) => UuidValueSource, adapter?: TypeAdapter): UuidValueSource
    virtualColumnFromFragment(type: 'localDate', fn: (fragment: FragmentExpression) => DateValueSource, adapter?: TypeAdapter): DateValueSource
    virtualColumnFromFragment(type: 'localTime', fn: (fragment: FragmentExpression) => TimeValueSource, adapter?: TypeAdapter): TimeValueSource
    virtualColumnFromFragment(type: 'localDateTime', fn: (fragment: FragmentExpression) => DateTimeValueSource, adapter?: TypeAdapter): DateTimeValueSource
    virtualColumnFromFragment<T, TYPE_NAME = T>(type: 'enum', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    virtualColumnFromFragment<T, TYPE_NAME = T>(type: 'custom', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    virtualColumnFromFragment<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, fn: (fragment: FragmentExpression) => ComparableValueSource, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allows to create an optional sql fragment in the table
    optionalVirtualColumnFromFragment(type: 'boolean', fn: (fragment: FragmentExpression) => BooleanValueSource, adapter?: TypeAdapter): BooleanValueSource
    optionalVirtualColumnFromFragment(type: 'stringInt', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    optionalVirtualColumnFromFragment(type: 'int', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    optionalVirtualColumnFromFragment(type: 'bigint', fn: (fragment: FragmentExpression) => BigintValueSource, adapter?: TypeAdapter): BigintValueSource
    optionalVirtualColumnFromFragment(type: 'stringDouble', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    optionalVirtualColumnFromFragment(type: 'double', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    optionalVirtualColumnFromFragment(type: 'string', fn: (fragment: FragmentExpression) => StringValueSource, adapter?: TypeAdapter): StringValueSource
    optionalVirtualColumnFromFragment(type: 'uuid', fn: (fragment: FragmentExpression) => UuidValueSource, adapter?: TypeAdapter): UuidValueSource
    optionalVirtualColumnFromFragment(type: 'localDate', fn: (fragment: FragmentExpression) => DateValueSource, adapter?: TypeAdapter): DateValueSource
    optionalVirtualColumnFromFragment(type: 'localTime', fn: (fragment: FragmentExpression) => TimeValueSource, adapter?: TypeAdapter): TimeValueSource
    optionalVirtualColumnFromFragment(type: 'localDateTime', fn: (fragment: FragmentExpression) => DateTimeValueSource, adapter?: TypeAdapter): DateTimeValueSource
    optionalVirtualColumnFromFragment<T, TYPE_NAME = T>(type: 'enum', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    optionalVirtualColumnFromFragment<T, TYPE_NAME = T>(type: 'custom', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    optionalVirtualColumnFromFragment<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, fn: (fragment: FragmentExpression) => ComparableValueSource, adapter?: TypeAdapter): ComparableValueSource
}
```

## View definition

```ts
interface View {
    /** Allows to define an alias for the view to be used in the selects queries */
    as(as: string): this
    /** Allows  to use the view in a left join */
    forUseInLeftJoin(): this & OuterJoinSource
    /** Allows  to use the view in a left join with an alias */
    forUseInLeftJoinAs(as: string): this & OuterJoinSource

    // Protected methods that allow to create a required column that doesn't admits null
    column(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    column(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    column(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    column(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    column(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    column(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    column(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    column(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    column(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    column(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    column(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    column<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    column<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    column<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allow to create an optional column that admits null
    optionalColumn(name: string, type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    optionalColumn(name: string, type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    optionalColumn(name: string, type: 'int', adapter?: TypeAdapter): NumberValueSource
    optionalColumn(name: string, type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    optionalColumn(name: string, type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    optionalColumn(name: string, type: 'double', adapter?: TypeAdapter): NumberValueSource
    optionalColumn(name: string, type: 'string', adapter?: TypeAdapter): StringValueSource
    optionalColumn(name: string, type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    optionalColumn(name: string, type: 'localDate', adapter?: TypeAdapter): DateValueSource
    optionalColumn(name: string, type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    optionalColumn(name: string, type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    optionalColumn<T, TYPE_NAME = T>(name: string, type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalColumn<T, TYPE_NAME = T>(name: string, type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalColumn<T, TYPE_NAME = T>(name: string, type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allows to create a sql fragment in the view
    virtualColumnFromFragment(type: 'boolean', fn: (fragment: FragmentExpression) => BooleanValueSource, adapter?: TypeAdapter): BooleanValueSource
    virtualColumnFromFragment(type: 'stringInt', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    virtualColumnFromFragment(type: 'int', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    virtualColumnFromFragment(type: 'bigint', fn: (fragment: FragmentExpression) => BigintValueSource, adapter?: TypeAdapter): BigintValueSource
    virtualColumnFromFragment(type: 'stringDouble', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    virtualColumnFromFragment(type: 'double', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    virtualColumnFromFragment(type: 'string', fn: (fragment: FragmentExpression) => StringValueSource, adapter?: TypeAdapter): StringValueSource
    virtualColumnFromFragment(type: 'uuid', fn: (fragment: FragmentExpression) => UuidValueSource, adapter?: TypeAdapter): UuidValueSource
    virtualColumnFromFragment(type: 'localDate', fn: (fragment: FragmentExpression) => DateValueSource, adapter?: TypeAdapter): DateValueSource
    virtualColumnFromFragment(type: 'localTime', fn: (fragment: FragmentExpression) => TimeValueSource, adapter?: TypeAdapter): TimeValueSource
    virtualColumnFromFragment(type: 'localDateTime', fn: (fragment: FragmentExpression) => DateTimeValueSource, adapter?: TypeAdapter): DateTimeValueSource
    virtualColumnFromFragment<T, TYPE_NAME = T>(type: 'enum', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    virtualColumnFromFragment<T, TYPE_NAME = T>(type: 'custom', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    virtualColumnFromFragment<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, fn: (fragment: FragmentExpression) => ComparableValueSource, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allows to create an optional sql fragment in the view
    optionalVirtualColumnFromFragment(type: 'boolean', fn: (fragment: FragmentExpression) => BooleanValueSource, adapter?: TypeAdapter): BooleanValueSource
    optionalVirtualColumnFromFragment(type: 'stringInt', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    optionalVirtualColumnFromFragment(type: 'int', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    optionalVirtualColumnFromFragment(type: 'bigint', fn: (fragment: FragmentExpression) => BigintValueSource, adapter?: TypeAdapter): BigintValueSource
    optionalVirtualColumnFromFragment(type: 'stringDouble', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    optionalVirtualColumnFromFragment(type: 'double', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    optionalVirtualColumnFromFragment(type: 'string', fn: (fragment: FragmentExpression) => StringValueSource, adapter?: TypeAdapter): StringValueSource
    optionalVirtualColumnFromFragment(type: 'uuid', fn: (fragment: FragmentExpression) => UuidValueSource, adapter?: TypeAdapter): UuidValueSource
    optionalVirtualColumnFromFragment(type: 'localDate', fn: (fragment: FragmentExpression) => DateValueSource, adapter?: TypeAdapter): DateValueSource
    optionalVirtualColumnFromFragment(type: 'localTime', fn: (fragment: FragmentExpression) => TimeValueSource, adapter?: TypeAdapter): TimeValueSource
    optionalVirtualColumnFromFragment(type: 'localDateTime', fn: (fragment: FragmentExpression) => DateTimeValueSource, adapter?: TypeAdapter): DateTimeValueSource
    optionalVirtualColumnFromFragment<T, TYPE_NAME = T>(type: 'enum', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    optionalVirtualColumnFromFragment<T, TYPE_NAME = T>(type: 'custom', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    optionalVirtualColumnFromFragment<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, fn: (fragment: FragmentExpression) => ComparableValueSource, adapter?: TypeAdapter): ComparableValueSource
}
```

## Constant values view definition

```ts
interface Values {
    /** Allows to define an alias for the view to be used in the selects queries */
    as(as: string): this
    /** Allows  to use the view in a left join */
    forUseInLeftJoin(): this & OuterJoinSource
    /** Allows  to use the view in a left join with an alias */
    forUseInLeftJoinAs(as: string): this & OuterJoinSource

    // Protected methods that allow to create a required column that doesn't admits null
    column(type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    column(type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    column(type: 'int', adapter?: TypeAdapter): NumberValueSource
    column(type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    column(type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    column(type: 'double', adapter?: TypeAdapter): NumberValueSource
    column(type: 'string', adapter?: TypeAdapter): StringValueSource
    column(type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    column(type: 'localDate', adapter?: TypeAdapter): DateValueSource
    column(type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    column(type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    column<T, TYPE_NAME = T>(type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    column<T, TYPE_NAME = T>(type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    column<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allow to create an optional column that admits null
    optionalColumn(type: 'boolean', adapter?: TypeAdapter): BooleanValueSource
    optionalColumn(type: 'stringInt', adapter?: TypeAdapter): StringNumberValueSource
    optionalColumn(type: 'int', adapter?: TypeAdapter): NumberValueSource
    optionalColumn(type: 'bigint', adapter?: TypeAdapter): BigintValueSource
    optionalColumn(type: 'stringDouble', adapter?: TypeAdapter): StringNumberValueSource
    optionalColumn(type: 'double', adapter?: TypeAdapter): NumberValueSource
    optionalColumn(type: 'string', adapter?: TypeAdapter): StringValueSource
    optionalColumn(type: 'uuid', adapter?: TypeAdapter): UuidValueSource
    optionalColumn(type: 'localDate', adapter?: TypeAdapter): DateValueSource
    optionalColumn(type: 'localTime', adapter?: TypeAdapter): TimeValueSource
    optionalColumn(type: 'localDateTime', adapter?: TypeAdapter): DateTimeValueSource
    optionalColumn<T, TYPE_NAME = T>(type: 'enum', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalColumn<T, TYPE_NAME = T>(type: 'custom', typeName: string, adapter?: TypeAdapter): EqualableValueSource
    optionalColumn<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allows to create a sql fragment in the view
    virtualColumnFromFragment(type: 'boolean', fn: (fragment: FragmentExpression) => BooleanValueSource, adapter?: TypeAdapter): BooleanValueSource
    virtualColumnFromFragment(type: 'stringInt', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    virtualColumnFromFragment(type: 'int', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    virtualColumnFromFragment(type: 'bigint', fn: (fragment: FragmentExpression) => BigintValueSource, adapter?: TypeAdapter): BigintValueSource
    virtualColumnFromFragment(type: 'stringDouble', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    virtualColumnFromFragment(type: 'double', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    virtualColumnFromFragment(type: 'string', fn: (fragment: FragmentExpression) => StringValueSource, adapter?: TypeAdapter): StringValueSource
    virtualColumnFromFragment(type: 'uuid', fn: (fragment: FragmentExpression) => UuidValueSource, adapter?: TypeAdapter): UuidValueSource
    virtualColumnFromFragment(type: 'localDate', fn: (fragment: FragmentExpression) => DateValueSource, adapter?: TypeAdapter): DateValueSource
    virtualColumnFromFragment(type: 'localTime', fn: (fragment: FragmentExpression) => TimeValueSource, adapter?: TypeAdapter): TimeValueSource
    virtualColumnFromFragment(type: 'localDateTime', fn: (fragment: FragmentExpression) => DateTimeValueSource, adapter?: TypeAdapter): DateTimeValueSource
    virtualColumnFromFragment<T, TYPE_NAME = T>(type: 'enum', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    virtualColumnFromFragment<T, TYPE_NAME = T>(type: 'custom', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    virtualColumnFromFragment<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, fn: (fragment: FragmentExpression) => ComparableValueSource, adapter?: TypeAdapter): ComparableValueSource

    // Protected methods that allows to create an optional sql fragment in the view
    optionalVirtualColumnFromFragment(type: 'boolean', fn: (fragment: FragmentExpression) => BooleanValueSource, adapter?: TypeAdapter): BooleanValueSource
    optionalVirtualColumnFromFragment(type: 'stringInt', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    optionalVirtualColumnFromFragment(type: 'int', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    optionalVirtualColumnFromFragment(type: 'bigint', fn: (fragment: FragmentExpression) => BigintValueSource, adapter?: TypeAdapter): BigintValueSource
    optionalVirtualColumnFromFragment(type: 'stringDouble', fn: (fragment: FragmentExpression) => StringNumberValueSource, adapter?: TypeAdapter): StringNumberValueSource
    optionalVirtualColumnFromFragment(type: 'double', fn: (fragment: FragmentExpression) => NumberValueSource, adapter?: TypeAdapter): NumberValueSource
    optionalVirtualColumnFromFragment(type: 'string', fn: (fragment: FragmentExpression) => StringValueSource, adapter?: TypeAdapter): StringValueSource
    optionalVirtualColumnFromFragment(type: 'uuid', fn: (fragment: FragmentExpression) => UuidValueSource, adapter?: TypeAdapter): UuidValueSource
    optionalVirtualColumnFromFragment(type: 'localDate', fn: (fragment: FragmentExpression) => DateValueSource, adapter?: TypeAdapter): DateValueSource
    optionalVirtualColumnFromFragment(type: 'localTime', fn: (fragment: FragmentExpression) => TimeValueSource, adapter?: TypeAdapter): TimeValueSource
    optionalVirtualColumnFromFragment(type: 'localDateTime', fn: (fragment: FragmentExpression) => DateTimeValueSource, adapter?: TypeAdapter): DateTimeValueSource
    optionalVirtualColumnFromFragment<T, TYPE_NAME = T>(type: 'enum', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    optionalVirtualColumnFromFragment<T, TYPE_NAME = T>(type: 'custom', typeName: string, fn: (fragment: FragmentExpression) => EqualableValueSource, adapter?: TypeAdapter): EqualableValueSource
    optionalVirtualColumnFromFragment<T, TYPE_NAME = T>(type: 'customComparable', typeName: string, fn: (fragment: FragmentExpression) => ComparableValueSource, adapter?: TypeAdapter): ComparableValueSource
}
```

## Insert definition

```ts
interface InsertExpression {
    /** Alias to set method: Set the values for insert */
    values(columns: InsertSets): this
    /** Allow to insert multiple registers in the database */
    values(columns: InsertSets[]): this
    /** Set the values for insert */
    set(columns: InsertSets): this
    /** 
     * Set a value only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array 
     */
    setIfValue(columns: OptionalInsertSets): this
    /** Set a previous set value only */
    setIfSet(columns: InsertSets): this
    /** 
     * Set a previous set value only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array 
     */
    setIfSetIfValue(columns: OptionalInsertSets): this
    /** Set a unset value (only if the value was not previously set) */
    setIfNotSet(columns: InsertSets): this
    /** 
     * Set a unset value only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array
     * (only if the value was not previously set) 
     */
    setIfNotSetIfValue(columns: OptionalInsertSets): this
    /** Unset the listed columns previous set */
    ignoreIfSet(...columns: string[]): this

    /** 
     * Set a value for the specified columns that was previously indicated a value for set.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    setIfHasValue(columns: InsertSets): this
    /** 
     * Set a value for the specified columns that was previously indicated a value for 
     * set only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    setIfHasValueIfValue(columns: OptionalInsertSets): this
    /** 
     * Set a value for the specified columns that has not value to set.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    setIfHasNoValue(columns: InsertSets): this
    /** 
     * Set a value for the specified columns that has no value to set 
     * only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    setIfHasNoValueIfValue(columns: OptionalInsertSets): this
    /** 
     * Unset the listed columns if them has value to set.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    ignoreIfHasValue(...columns: string[]): this
    /** 
     * Unset the listed columns if them has no value to set.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    ignoreIfHasNoValue(...columns: string[]): this
    /** 
     * Unset all columns that was set with no value.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    ignoreAnySetWithNoValue(): this

    /** Allows to set the values dynamically */
    dynamicSet(): this

    /** Insert the default values in the table */
    defaultValues(): this

    /** Insert from a select */
    from(select: Subquery): this

    /** 
     * Indicate that the query must return the last inserted id 
     * Note: If you are inserting multiple rows, only PostgreSql, SqlServer and Oracle support it
     */
    returningLastInsertedId(): this

    // Methos to specify the on conflict clause
    /** Allows to specify the "on conflict do nothing" clause */
    onConflictDoNothing(): this
    /** Allows to specify the "on conflict do update" clause and next specify the sets */
    onConflictDoUpdateDynamicSet(): this
    /** Allows to specify the "on conflict do update set" clause, setting the columns provided as argument */
    onConflictDoUpdateSet(columns: UpdateSets): this
    /** 
     * Allows to specify the "on conflict do update set" clause, setting the columns provided as argument.
     * Set a value only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array 
     */
    onConflictDoUpdateSetIfValue(columns: UpdateSets): this
    /**Allow to specify the "on conflit" clasue indicating the index column expected by this clause */
    onConflictOn(column: ValueSource, ...columns: ValueSource[]): this
    /**Allow to specify the "on conflit on constraint" clasue indicating the index name expected by this clause */
    onConflictOnConstraint(constraint: string): this
    /**Allow to specify the "on conflit on constraint" clasue indicating the index name expected by this clause */
    onConflictOnConstraint(constraint: StringValueSource): this
    /**Allow to specify the "on conflit on constraint" clasue indicating the index name expected by this clause */
    onConflictOnConstraint(constraint: RawFragment): this

    // Methods available when previously is called onConflictOn or onConflictOnConstraint
    /** Allows to specify the "do nothing" clause */
    doNothing(): this
    /** Allows to specify the "do update" clause and next specify the sets */
    doUpdateDynamicSet(): this
    /** Allows to specify the do update set" clause, setting the columns provided as argument */
    doUpdateSet(columns: UpdateSets): this
    /** 
     * Allows to specify the "do update set" clause, setting the columns provided as argument.
     * Set a value only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array 
     */
    doUpdateSetIfValue(columns: UpdateSets): this

    // Methods available to specify a where clause inmediatelly after call onConflictOn or any do update method
    /** Allows to create the where dynamically */
    dynamicWhere(): this
    /** Allows to specify the where */
    where(condition: BooleanValueSource): this
    /** Allows to extends the where using an and */
    and(condition: BooleanValueSource): this
    /** Allows to extends the where using an or */
    or(condition: BooleanValueSource): this

    /**
     * Execute the insert, by default returns the number of inserted rows
     * 
     * @param min Indicate the minimum of rows that must be updated, 
     *           if the minimum is not reached an exception will be thrown
     * @param max Indicate the maximum of rows that must be updated, 
     *           if the maximum is exceeded an exception will be thrown
     */
    executeInsert(min?: number, max?: number): Promise<RESULT>
    /** Returns the sql query to be executed in the database */
    query(): string
    /** Returns the required parameters by the sql query */
    params(): any[]

    // Result compose operations
    compose(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    composeDeletingInternalProperty(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    composeDeletingExternalProperty(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    withNoneOrOne(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withOne(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withMany(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withOptionalMany(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    split(propertyName: string, mappig: { [property: string]: string }): this
    splitRequired(propertyName: string, mappig: { [property: string]: string }): this
    splitOptional(propertyName: string, mappig: { [property: string]: string }): this
    guidedSplitRequired(propertyName: string, mappig: { [property: string]: string }): this
    guidedSplitOptional(propertyName: string, mappig: { [property: string]: string }): this

    // Returning methods
    /** 
     * Allows to specify the returning clause.
     * It must be an object where the name of the property is the name of the resulting property
     * and the value is the ValueSource where the value will be obtained.
     */
    returning(columns: InsertReturningValues): this
    /** 
     * Allows to specify the returning clause of a query that returns only one column.
     * It receives as argument the ValueSource where the value will be obtained.
     */
    returningOneColumn(column: ValueSource): this
    /** Execute the insert query that returns one o no result from the database */
    executeInsertNoneOrOne(): Promise<RESULT | null>
    /** 
     * Execute the insert query that returns one result from the database.
     * If no result is returned by the database an exception will be thrown.
     */
    executeInsertOne(): Promise<RESULT>
    /** 
     * Execute the insert query that returns zero or many results from the database 
     * 
     * @param min Indicate the minimum of rows that must be deleted, 
     *           if the minimum is not reached an exception will be thrown
     * @param max Indicate the maximum of rows that must be deleted, 
     *           if the maximum is exceeded an exception will be thrown
     */
    executeInsertMany(min?: number, max?: number): Promise<RESULT[]>

    customizeQuery(customization: {
        afterInsertKeyword?: RawFragment
        afterQuery?: RawFragment
    }): this
}

/** Columns required by the insert */
type InsertSets = { [columnName: string]: any }
/** Columns required by the insert, but marked as optionals */
type OptionalInsertSets = { [columnName: string]: any }
/**
 * Returning projection of the value that vill be retreived from the database.
 * 
 * It must be an object where the name of the property is the name of the resulting property
 * and the value is the ValueSource where the value will be obtained.
 */
 type InsertReturningValues = { [columnName: string]: ValueSource }
```

## Update definition

```ts
interface UpdateExpression {
    /** Set the values for insert */
    set(columns: UpdateSets): this
    /** Set a value only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array 
     */
    setIfValue(columns: OptionalUpdateSets): this
    /** Set a previous set value only */
    setIfSet(columns: UpdateSets): this
    /** Set a previous set value only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array
     */
    setIfSetIfValue(columns: OptionalUpdateSets): this
    /** Set a unset value (only if the value was not previously set) */
    setIfNotSet(columns: UpdateSets): this
    /** 
     * Set a unset value only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array
     * (only if the value was not previously set) 
     */
    setIfNotSetIfValue(columns: OptionalUpdateSets): this
    /** Unset the listed columns previous set */
    ignoreIfSet(...columns: string[]): this

    /** 
     * Set a value for the specified columns that was previously indicated a value for set.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    setIfHasValue(columns: UpdateSets): this
    /** 
     * Set a value for the specified columns that was previously indicated a value for 
     * set only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    setIfHasValueIfValue(columns: OptionalUpdateSets): this
    /** 
     * Set a value for the specified columns that has not value to set.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    setIfHasNoValue(columns: UpdateSets): this
    /** 
     * Set a value for the specified columns that has no value to set 
     * only if the provided value is not null, undefined, empty string 
     * (only when the allowEmptyString flag in the connection is not set to true, 
     * that is the default behaviour) or an empty array.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    setIfHasNoValueIfValue(columns: OptionalUpdateSets): this
    /** 
     * Unset the listed columns if them has value to set.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    ignoreIfHasValue(...columns: string[]): this
    /** 
     * Unset the listed columns if them has no value to set.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    ignoreIfHasNoValue(...columns: string[]): this
    /** 
     * Unset all columns that was set with no value.
     * It is considered the column has value if it was set with a value that is not null, 
     * undefined, empty string (only when the allowEmptyString flag in the connection is not 
     * set to true, that is the default behaviour) or an empty array 
     */
    ignoreAnySetWithNoValue(): this
    /** Allows to set the values dynamically */
    dynamicSet(): this

    /** Allows to create the where dynamically */
    dynamicWhere(): this
    /** Allows to specify the where */
    where(condition: BooleanValueSource): this

    /** Allows to extends the where or the on clause of a join using an and */
    and(condition: BooleanValueSource): this
    /** Allows to extends the where or the on clause of a join using an or */
    or(condition: BooleanValueSource): this

    /**
     * Execute the update returning the number of updated rows
     * 
     * @param min Indicate the minimum of rows that must be updated, 
     *           if the minimum is not reached an exception will be thrown
     * @param max Indicate the maximum of rows that must be updated, 
     *           if the maximum is exceeded an exception will be thrown
     */
    executeUpdate(min?: number, max?: number): Promise<number>
    /** Returns the sql query to be executed in the database */
    query(): string
    /** Returns the required parameters by the sql query */
    params(): any[]

    // Result compose operations
    compose(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    composeDeletingInternalProperty(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    composeDeletingExternalProperty(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    withNoneOrOne(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withOne(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withMany(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withOptionalMany(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    split(propertyName: string, mappig: { [property: string]: string }): this
    splitRequired(propertyName: string, mappig: { [property: string]: string }): this
    splitOptional(propertyName: string, mappig: { [property: string]: string }): this
    guidedSplitRequired(propertyName: string, mappig: { [property: string]: string }): this
    guidedSplitOptional(propertyName: string, mappig: { [property: string]: string }): this

    // Returning methods
    /** 
     * Allows to specify the returning clause.
     * It must be an object where the name of the property is the name of the resulting property
     * and the value is the ValueSource where the value will be obtained.
     */
    returning(columns: UpdateReturningValues): this
    /** 
     * Allows to specify the returning clause of a query that returns only one column.
     * It receives as argument the ValueSource where the value will be obtained.
     */
    returningOneColumn(column: ValueSource): this
    /** Execute the update query that returns one o no result from the database */
    executeUpdateNoneOrOne(): Promise<RESULT | null>
    /** 
     * Execute the update query that returns one result from the database.
     * If no result is returned by the database an exception will be thrown.
     */
    executeUpdateOne(): Promise<RESULT>
    /** 
     * Execute the update query that returns zero or many results from the database 
     * 
     * @param min Indicate the minimum of rows that must be deleted, 
     *           if the minimum is not reached an exception will be thrown
     * @param max Indicate the maximum of rows that must be deleted, 
     *           if the maximum is exceeded an exception will be thrown
     */
    executeUpdateMany(min?: number, max?: number): Promise<RESULT[]>

    /** Allows to add a from to the update query */
    from(table: Table | View): this

    /** Allows to add a join to the update query */
    join(table: Table | View): this
    /** Allows to add a inner join to the update query */
    innerJoin(table: Table | View): this
    /** 
     * Allows to add a left join to the update query. 
     * Note: to use a table or view here you must call first forUseInLeftJoin methods on it
     */
    leftJoin(source: OuterJoinSource): this
    /** 
     * Allows to add a left outer join to the update query. 
     * Note: to use a table or view here you must call first forUseInLeftJoin methods on it
     */
    leftOuterJoin(source: OuterJoinSource): this

    /** Allows to create the on clause of a join dynamically */
    dynamicOn(): this
    /** Allows to specify the on clause of a join */
    on(condition: BooleanValueSource): this

    customizeQuery(customization: {
        afterUpdateKeyword?: RawFragment
        afterQuery?: RawFragment
    }): this
}

/** Columns required by the update */
type UpdateSets = { [columnName: string]: any }
/** Columns required by the update, but marked as optional */
type OptionalUpdateSets = { [columnName: string]: any }
/**
 * Returning projection of the value that vill be retreived from the database.
 * 
 * It must be an object where the name of the property is the name of the resulting property
 * and the value is the ValueSource where the value will be obtained.
 */
 type UpdateReturningValues = { [columnName: string]: ValueSource }
```

## Delete definition

```ts
interface DeleteExpression {
    /** Allows to create the where dynamically */
    dynamicWhere(): this
    /** Allows to specify the where */
    where(condition: BooleanValueSource): this

    /** Allows to extends the where or the on clause of a join using an and */
    and(condition: BooleanValueSource): this
    /** Allows to extends the where or the on clause of a join using an or */
    or(condition: BooleanValueSource): this

    /**
    * Execute the delete returning the number of deleted rows
    * 
    * @param min Indicate the minimum of rows that must be deleted, 
    *           if the minimum is not reached an exception will be thrown
    * @param max Indicate the maximum of rows that must be deleted, 
    *           if the maximum is exceeded an exception will be thrown
    */
    executeDelete(min?: number, max?: number): Promise<number>
    /** Returns the sql query to be executed in the database */
    query(): string
    /** Returns the required parameters by the sql query */
    params(): any[]

    // Returning methods
    /** 
     * Allows to specify the returning clause.
     * It must be an object where the name of the property is the name of the resulting property
     * and the value is the ValueSource where the value will be obtained.
     */
    returning(columns: DeleteReturningValues): this
    /** 
     * Allows to specify the returning clause of a query that returns only one column.
     * It receives as argument the ValueSource where the value will be obtained.
     */
    returningOneColumn(column: ValueSource): this
    /** Execute the delete query that returns one o no result from the database */
    executeDeleteNoneOrOne(): Promise<RESULT | null>
    /** 
     * Execute the delete query that returns one result from the database.
     * If no result is returned by the database an exception will be thrown.
     */
    executeDeleteOne(min?: number, max?: number): Promise<RESULT>
    /** 
     * Execute the delete query that returns zero or many results from the database 
     * 
     * @param min Indicate the minimum of rows that must be deleted, 
     *           if the minimum is not reached an exception will be thrown
     * @param max Indicate the maximum of rows that must be deleted, 
     *           if the maximum is exceeded an exception will be thrown
     */
    executeDeleteMany(): Promise<RESULT[]>

    // Result compose operations
    compose(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    composeDeletingInternalProperty(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    composeDeletingExternalProperty(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    withNoneOrOne(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withOne(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withMany(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withOptionalMany(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    split(propertyName: string, mappig: { [property: string]: string }): this
    splitRequired(propertyName: string, mappig: { [property: string]: string }): this
    splitOptional(propertyName: string, mappig: { [property: string]: string }): this
    guidedSplitRequired(propertyName: string, mappig: { [property: string]: string }): this
    guidedSplitOptional(propertyName: string, mappig: { [property: string]: string }): this

    /** Allows to add a using (like a from that doesn't delete) to the delete query */
    using(table: Table | View): this

    /** Allows to add a join to the delete query */
    join(table: Table | View): this
    /** Allows to add a inner join to the delete query */
    innerJoin(table: Table | View): this
    /** 
     * Allows to add a left join to the delete query. 
     * Note: to use a table or view here you must call first forUseInLeftJoin methods on it
     */
    leftJoin(source: OuterJoinSource): this
    /** 
     * Allows to add a left outer join to the delete query. 
     * Note: to use a table or view here you must call first forUseInLeftJoin methods on it
     */
    leftOuterJoin(source: OuterJoinSource): this

    /** Allows to create the on clause of a join dynamically */
    dynamicOn(): this
    /** Allows to specify the on clause of a join */
    on(condition: BooleanValueSource): this

    customizeQuery(customization: {
        afterDeleteKeyword?: RawFragment
        afterQuery?: RawFragment
    }): this
}

/**
 * Returning projection of the value that vill be retreived from the database.
 * 
 * It must be an object where the name of the property is the name of the resulting property
 * and the value is the ValueSource where the value will be obtained.
 */
type DeleteReturningValues = { [columnName: string]: ValueSource }
```

## Select definition

The select query definition must follow the logical order or the alternative order:

- **Logical order**: from, join, **WHERE**, **group by**, **having**, **select**, order by, limit, offset, customizeQuery, compose/split
- **Alternative logical order 1**: from, join, **group by**, **having**, **WHERE**, **select**, order by, limit, offset, customizeQuery, compose/split
- **Arternative logical order 2**: from, join, **group by**, **having**, **select**, **WHERE**, order by, limit, offset, customizeQuery, compose/split
- **Arternative logical order 3**: from, join, **group by**, **having**, **select**, order by, **WHERE**, limit, offset, customizeQuery, compose/split
- **Arternative logical order 4**: from, join, **group by**, **having**, **select**, order by, limit, offset, **WHERE**, customizeQuery, compose/split
- **Arternative logical order 5**: from, join, **group by**, **having**, **select**, order by, limit, offset, customizeQuery, **WHERE**, compose/split
- **Arternative logical order 6**: from, join, **group by**, **having**, **select**, order by, limit, offset, customizeQuery, compose/split, **WHERE**
- **Alternative order 1**: from, join, **select**, **WHERE**, **group by**, **having**, order by, limit, offset, customizeQuery, compose/split
- **Alternative order 2**: from, join, **select**, **group by**, **having**, **WHERE**, order by, limit, offset, customizeQuery, compose/split
- **Alternative order 3**: from, join, **select**, **group by**, **having**, order by, **WHERE**, limit, offset, customizeQuery, compose/split
- **Alternative order 4**: from, join, **select**, **group by**, **having**, order by, limit, offset, **WHERE**, customizeQuery, compose/split
- **Alternative order 5**: from, join, **select**, **group by**, **having**, order by, limit, offset, customizeQuery, **WHERE**, compose/split
- **Alternative order 6**: from, join, **select**, **group by**, **having**, order by, limit, offset, customizeQuery, compose/split, **WHERE**

```ts
interface SelectExpression {
    /** Allows to add a from to the select query */
    from(table: Table | View): this

    /** Allows to add a join to the select query */
    join(table: Table | View): this
    /** Allows to add a inner join to the select query */
    innerJoin(table: Table | View): this
    /** 
     * Allows to add a left join to the select query. 
     * Note: to use a table or view here you must call first forUseInLeftJoin methods on it
     */
    leftJoin(source: OuterJoinSource): this
    /** 
     * Allows to add a left outer join to the select query. 
     * Note: to use a table or view here you must call first forUseInLeftJoin methods on it
     */
    leftOuterJoin(source: OuterJoinSource): this

    // Optional variants for joins, to be used in select picking columns
    optionalJoin(table: Table | View): this
    optionalInnerJoin(table: Table | View): this
    optionalLeftJoin(source: OuterJoinSource): this
    optionalLeftOuterJoin(source: OuterJoinSource): this

    /** Allows to create the on clause of a join dynamically */
    dynamicOn(): this
    /** Allows to specify the on clause of a join */
    on(condition: BooleanValueSource): this

    /** Allows to create the where dynamically */
    dynamicWhere(): this
    /** Allows to specify the where */
    where(condition: BooleanValueSource): this
    
    /** Allows to specify the group by of the select query */
    groupBy(...columns: ValueSource[]): this
    /** 
     * Allows to specify the group by of the select query.
     * 
     * If you already defined the select clause, you can use the name of
     * the properties returned by the select instead of its definition, it
     * will be replace by the definition automatically.
     * 
     * Note: this overload is only available if you define the select clause first.
     */
    groupBy(...columns: string[]): this
    /** Allows to create the having clause of the group by dynamically */
    dynamicHaving(): this
    /** Allows to specify the having clause of the group by */
    having(condition: BooleanValueSource): this

    /** 
     * Allows to specify the select clause.
     * It must be an object where the name of the property is the name of the resulting property
     * and the value is the ValueSource where the value will be obtained.
     */
    select(columns: SelectValues): this
    /** 
     * Allows to specify the select clause of a query that returns only one column.
     * It receives as argument the ValueSource where the value will be obtained.
     */
    selectOneColumn(column: ValueSource): this

    /** 
     * Allows to specify an order by used by the query, you must indicate the name of the column
     * returned by the query.
     * If you select one column the name of the column is 'result'.
     */
    orderBy(column: string, mode?: OrderByMode): this
    /** Allows to specify an order by dynamically, it is parsed from the provided string */
    orderByFromString(orderBy: string): this
    orderByFromStringIfValue(orderBy: string | null | undefined): this

    /** Allows to specify the maximum number of rows that will be returned by the query */
    limit(limit: number): this
    limitIfValue(limit: number | null | undefined): this
     /** Allows to specify the number of first rows ignored by the query */
    offset(offset: number): this
    offsetIfValue(offset: number | null | undefined): this


    /** Allows to extends the where, or the on clause of a join, or the having clause using an and */
    and(condition: BooleanValueSource): this
    /** Allows to extends the where, or the on clause of a join, or the having clause using an or */
    or(condition: BooleanValueSource): this

    // Query compound operators
    union(select: CompoundableSubquery): this
    unionAll(select: CompoundableSubquery): this
    intersect(select: CompoundableSubquery): this
    intersectAll(select: CompoundableSubquery): this
    except(select: CompoundableSubquery): this
    exceptAll(select: CompoundableSubquery): this
    minus(select: CompoundableSubquery): this // alias to except
    minusAll(select: CompoundableSubquery): this // alias to exceptAll

    // Recursive queries
    recursiveUnion(fn: (view: View) => CompoundableSubquery): this
    recursiveUnionAll(fn: (view: View) => CompoundableSubquery): this
    recursiveUnionOn(fn: (view: View) => BooleanValueSource): this
    recursiveUnionAllOn(fn: (view: View) => BooleanValueSource): this

    /** Execute the select query that returns one o no result from the database */
    executeSelectNoneOrOne(): Promise<RESULT | null>
    /** 
     * Execute the select query that returns one result from the database.
     * If no result is returned by the database an exception will be thrown.
     */
    executeSelectOne(): Promise<RESULT>
    /** Execute the select query that returns zero or many results from the database */
    executeSelectMany(): Promise<RESULT[]>
    /** 
     * Execute the select query that returns zero or many results from the database.
     * Select page execute the query twice, the first one to get the data from the database 
     * and the second one to get the count of all data without the limit and the offset. 
     * Note: select page is only available if you don't define a group by clause.
     */
    executeSelectPage(): Promise<{ data: RESULT[], count: number }>
    /** 
     * Execute the select query as a select page, but allows to include extra properties to will be resulting object.
     * If the object provided by argument includes the property count, the query that count the data will be omitted and
     * this value will be used. If the object provided by argument includes the property data, the query that extract 
     * the data will be omitted and this value will be used.
     */
    executeSelectPage<EXTRAS extends {}>(extras: EXTRAS): Promise<{ data: RESULT[], count: number } & EXTRAS>
    
    /**
     * Allows to use a select query as a view in another select. 
     * This select will be included as a clause with in the final sql.
     * 
     * @param as name of the clause with in the final query (must be unique per final query)
     */
    forUseInQueryAs(as: string): View

    /**
     * Allows to use a select query as an inline query value in another select. 
     */
    forUseAsInlineQueryValue(): ValueSource

    /**
     * Allows to use a select query as an inline object array value in another select. 
     */
    forUseAsInlineAggregatedArrayValue(): AggregatedArrayValueSource
    
    /** Returns the sql query to be executed in the database */
    query(): string
    /** Returns the required parameters by the sql query */
    params(): any[]

    // Result compose operations
    compose(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    composeDeletingInternalProperty(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    composeDeletingExternalProperty(config: { externalProperty: string, internalProperty: string, propertyName: string }): this
    withNoneOrOne(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withOne(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withMany(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    withOptionalMany(fn: (ids: EXTERNAL_PROPERTY_TYPE[]) => Promise<any[]>): this
    split(propertyName: string, mappig: { [property: string]: string }): this
    splitRequired(propertyName: string, mappig: { [property: string]: string }): this
    splitOptional(propertyName: string, mappig: { [property: string]: string }): this
    guidedSplitRequired(propertyName: string, mappig: { [property: string]: string }): this
    guidedSplitOptional(propertyName: string, mappig: { [property: string]: string }): this

    customizeQuery(customization: {
        afterSelectKeyword?: RawFragment
        beforeColumns?: RawFragment
        customWindow?: RawFragment
        afterQuery?: RawFragment
        beforeWithQuery?: RawFragment
        afterWithQuery?: RawFragment
    }): this
}

/**
 * Modes of sorting in an order by.
 * If the database don't support one of then it will be emulated.
 */
type OrderByMode = 'asc' | 'desc' | 'asc nulls first' | 'asc nulls last' | 'desc nulls first' | 'desc nulls last' | 'insensitive' |
                   'asc insensitive' | 'desc insensitive' | 'asc nulls first insensitive' | 'asc nulls last insensitive' | 
                   'desc nulls first insensitive' | 'desc nulls last insensitive'

/**
 * Select projection of the value that vill be retreived from the database.
 * 
 * It must be an object where the name of the property is the name of the resulting property
 * and the value is the ValueSource where the value will be obtained.
 */
type SelectValues = { [columnName: string]: ValueSource }
```

## Type adpaters

Type adapters allow customising how the values are sent and retrieved from the database, allowing to transform them. You can specify the type adapter per field when you define at the table or view; or, you can define general rules overriding the `transformValueFromDB` and `transformValueToDB`.

The `CustomBooleanTypeAdapter` allows defining custom values to express a boolean when they don't match the database's default values. For example, when you have a field in the database that is a boolean; but, the true value is represented with the string `yes`, and the false value is represented with the string `no`. See [Custom booleans values](advanced-usage.md#custom-booleans-values) for more information.

Type adapter definitions are in the file `ts-sql-query/TypeAdapter`.

```ts
interface TypeAdapter {
    transformValueFromDB(value: unknown, type: string, next: DefaultTypeAdapter): unknown
    transformValueToDB(value: unknown, type: string, next: DefaultTypeAdapter): unknown
    transformPlaceholder?(placeholder: string, type: string, forceTypeCast: boolean, valueSentToDB: unknown, next: DefaultTypeAdapter): string
}

interface DefaultTypeAdapter {
    transformValueFromDB(value: unknown, type: string): unknown
    transformValueToDB(value: unknown, type: string): unknown
    transformPlaceholder(placeholder: string, type: string, forceTypeCast: boolean, valueSentToDB: unknown): string
}

class CustomBooleanTypeAdapter implements TypeAdapter {
    readonly trueValue: number | string
    readonly falseValue: number | string

    constructor(trueValue: number, falseValue: number)
    constructor(trueValue: string, falseValue: string)

    transformValueFromDB(value: unknown, type: string, next: DefaultTypeAdapter): unknown
    transformValueToDB(value: unknown, type: string, next: DefaultTypeAdapter): unknown
}

declare class ForceTypeCast implements TypeAdapter {
    transformValueFromDB(value: unknown, type: string, next: DefaultTypeAdapter): unknown
    transformValueToDB(value: unknown, type: string, next: DefaultTypeAdapter): unknown
    transformPlaceholder(placeholder: string, type: string, _forceTypeCast: boolean, valueSentToDB: unknown, next: DefaultTypeAdapter): string
}
```

## Dynamic conditions

See [Select using a dynamic filter](queries/dynamic-queries.md#select-using-a-dynamic-filter) for more information.

A dynamic condition allows you to create a condition which definition is provided in runtime. To create a dynamic condition, you must call the method `dynamicConditionFor` from the connection; this method receives a map where the key is the name with which is going to be referred the field, and the value is the corresponding value source to be used in the query. The `dynamicConditionFor` method returns an object that contains the method `withValues` that receives the dynamic criteria and returns a boolean value source that you can use in any place where a boolean can be used in the query (like the where).

```ts
const dynamicCondition = connection.dynamicConditionFor(selectFields).withValues(filter)
```

The utility type `DynamicCondition` and `TypeSafeDynamicCondition` (when the extended types are used with type-safe connections) from `ts-sql-query/dynamicCondition` allows you to create a type definition for the dynamic criteria. This object receives a map with the name for the field and as value the name of the type.


For the filter definition:

```ts
type FilterType = DynamicCondition<{
    myBoolean: 'boolean'
    myStringInt: 'stringInt'
    myInt: 'int'
    myBigint: 'bigint'
    myStringDouble: 'stringDouble'
    myDouble: 'double'
    myString: 'string'
    myUuid: 'uuid'
    myLocalDate: 'localDate'
    myLocalTime: 'localTime'
    myLocalDateTime: 'localDateTime'
    myEnum: ['enum', MyEnumType]
    myCustom: ['custom', MyCustomType]
    myCustomComparable: ['customComparable', MyCustomComparableType]
}>
```

The `FilterType` definition looks like this:

```ts
type FilterType = {
    not?: FilterType
    and?: Array<FilterType | undefined>
    or?: Array<FilterType | undefined>
    myBoolean: EqualableFilter<boolean>
    myStringInt: ComparableFilter<string | number>
    myInt: ComparableFilter<number>
    myBigint: ComparableFilter<bigint>
    myStringDouble: ComparableFilter<string | number>
    myDouble: ComparableFilter<number>
    myString: StringFilter
    myString: StringFilter
    myLocalDate: ComparableFilter<Date>
    myLocalTime: ComparableFilter<Date>
    myLocalDateTime: ComparableFilter<Date>
    myEnum: EqualableFilter<MyEnumType>
    myCustom: EqualableFilter<MyCustomType>
    myCustomComparable: ComparableFilter<MyCustomComparableType>
}

```

**Note**: for convenience, `uuid` type will be treated as string type, calling `asString()` method automatically in all methods defined in the `StringFilter` interface.

You can use the properties `and`, `or` and `not` to perform the logical operations. If you specify multiple elements to the `FilterType`, all of them will be joined using the and operator. The same happens with the elements specified in the `and` array. But the elements will be joined using the or operator in the case of the `or` array.

The definition of the different types are:

```ts
interface EqualableFilter<TYPE> {
    isNull?: boolean
    isNotNull?: boolean
    equalsIfValue?: TYPE | null | undefined
    equals?: TYPE
    notEqualsIfValue?: TYPE | null | undefined
    notEquals?: TYPE
    isIfValue?: TYPE | null | undefined
    is?: TYPE | null | undefined
    isNotIfValue?: TYPE | null | undefined
    isNot?: TYPE | null | undefined
    inIfValue?: TYPE[] | null | undefined
    in?: TYPE[]
    notInIfValue?: TYPE[] | null | undefined
    notIn?: TYPE[]
}

interface ComparableFilter<TYPE> extends EqualableFilter<TYPE> {
    lessThanIfValue?: TYPE | null | undefined
    lessThan?: TYPE
    greaterThanIfValue?: TYPE | null | undefined
    greaterThan?: TYPE
    lessOrEqualsIfValue?: TYPE | null | undefined
    lessOrEquals?: TYPE
    greaterOrEqualsIfValue?: TYPE | null | undefined
    greaterOrEquals?: TYPE

    /** @deprecated use lessThanIfValue instead */
    smallerIfValue?: TYPE | null | undefined
    /** @deprecated use lessThan instead */
    smaller?: TYPE
    /** @deprecated use greaterThanIfValue instead */
    largerIfValue?: TYPE | null | undefined
    /** @deprecated use greaterThan instead */
    larger?: TYPE
    /** @deprecated use lessOrEqualsIfValue instead */
    smallAsIfValue?: TYPE | null | undefined
    /** @deprecated use lessOrEquals instead */
    smallAs?: TYPE
    /** @deprecated use greaterOrEqualsIfValue instead */
    largeAsIfValue?: TYPE | null | undefined
    /** @deprecated use greaterOrEquals instead */
    largeAs?: TYPE
}

interface StringFilter extends ComparableFilter<string> {
    equalsInsensitiveIfValue?: string | null | undefined
    equalsInsensitive?: string
    notEqualsInsensitiveIfValue?: string | null | undefined
    likeIfValue?: string | null | undefined
    like?: string
    notLikeIfValue?: string | null | undefined
    notLike?: string
    likeInsensitiveIfValue?: string | null | undefined
    likeInsensitive?: string
    notLikeInsensitiveIfValue?: string | null | undefined
    notLikeInsensitive?: string
    startsWithIfValue?: string | null | undefined
    startsWith?: string
    notStartsWithIfValue?: string | null | undefined
    notStartsWith?: string
    endsWithIfValue?: string | null | undefined
    endsWith?: string
    notEndsWithIfValue?: string | null | undefined
    notEndsWith?: string
    startsWithInsensitiveIfValue?: string | null | undefined
    startsWithInsensitive?: string
    notStartsWithInsensitiveIfValue?: string | null | undefined
    notStartsWithInsensitive?: string
    endsWithInsensitiveIfValue?: string | null | undefined
    endsWithInsensitive?: string
    notEndsWithInsensitiveIfValue?: string | null | undefined
    notEndsWithInsensitive?: string
    containsIfValue?: string | null | undefined
    contains?: string
    notContainsIfValue?: string | null | undefined
    notContains?: string
    containsInsensitiveIfValue?: string | null | undefined
    containsInsensitive?: string
    notContainsInsensitiveIfValue?: string | null | undefined
    notContainsInsensitive?: string
}
```
