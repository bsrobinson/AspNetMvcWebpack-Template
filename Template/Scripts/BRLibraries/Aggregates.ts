
export {};

declare global {
    interface Array<T> {
        /**
        * Sum array
        * @returns {number} - Sum of array
        */
        sum(): number;

        /**
        * Sum properties in array
        * @param {Function} predicate - Element to sum
        * @returns {number} - Sum of element values
        */
        sum(predicate: (value: T) => number): number;

        /**
        * Gets the smallest value in array
        * @returns {number} - Smallest value of array
        */
        min(): number;

        /**
        * Gets the smallest property value in array
        * @param {Function} predicate - Element to find min in
        * @returns {number} - Smallest element value
        */
        min(predicate: (value: T) => number): number;

        /**
        * Gets the object with smallest property value in array
        * @param {Function} predicate - Element to find min in
        * @returns {T} - Element with smallest value
        */
        minBy(predicate: ((value: T) => number)): T;

        /**
        * Gets the largest value in array
        * @returns {number} - Largest value of array
        */
        max(): number;

        /**
        * Gets the largest property value in array
        * @param {Function} predicate - Element to find max in
        * @returns {number} - Largest element value
        */
        max(predicate: (value: T) => number): number;

        /**
        * Gets the object with largest property value in array
        * @param {Function} predicate - Element to find max in
        * @returns {T} - Element with largest value
        */
        maxBy(predicate: ((value: T) => number)): T;
    }
}

Array.prototype.sum = function<T>(predicate: ((value: T) => number) | null = null): number {
    return this.reduce((accumulator, currentValue) => {
        if (predicate && currentValue instanceof Object) {
            let value = predicate(currentValue);
            if (isNaN(value)) { throw Error(`${value} is NaN`); }
            return accumulator + value;
        }
        else {
            if (isNaN(currentValue)) { throw Error(`${currentValue} is NaN`); }
            return accumulator + currentValue
        }
    }, 0);
}

Array.prototype.min = function<T>(predicate: ((value: T) => number) | null = null): number {
    if (predicate) {
        return predicate(this.minBy(predicate));
    }
    else {
        return this.reduce((accumulator, currentValue) => {
            if (isNaN(currentValue)) { throw Error(`${currentValue} is NaN`); }
            return Math.min(accumulator ?? currentValue, currentValue);
        }, null);
    }
}

Array.prototype.minBy = function<T>(predicate: ((value: T) => number)): T {
    return this.reduce((accumulator, currentValue) => {
        let value = predicate(currentValue);
        if (isNaN(value)) { throw Error(`${value} is NaN`); }
        return accumulator ? predicate(accumulator) < value ? accumulator : currentValue : currentValue;
    }, null);
}

Array.prototype.max = function<T>(predicate: ((value: T) => number) | null = null): number {
    if (predicate) {
        return predicate(this.maxBy(predicate));
    }
    else {
        return this.reduce((accumulator, currentValue) => {
            if (isNaN(currentValue)) { throw Error(`${currentValue} is NaN`); }
            return Math.max(accumulator ?? currentValue, currentValue);
        }, null);
    }
}

Array.prototype.maxBy = function<T>(predicate: ((value: T) => number)): T {
    return this.reduce((accumulator, currentValue) => {
        let value = predicate(currentValue);
        if (isNaN(value)) { throw Error(`${value} is NaN`); }
        return accumulator ? predicate(accumulator) > value ? accumulator : currentValue : currentValue;
    }, null);
}
