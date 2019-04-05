'use strict';

// CAN BE REMOVED

const couchdbIterator = require('couchdb-iterator');
const promiseRetry = require('promise-retry');
const flattenObject = require('obj-flatten');
const unflattenObject = require('obj-unflatten');
const mapValues = require('lodash/mapValues');
const mean = require('lodash/mean');
const objGet = require('lodash/get');

const trimPercentage = 0.01; // Trim evaluations % to normalize skewness of values when aggregating

/**
 * Calculates the aggregation based on the accumulated evaluations.
 *
 * @param {Array} evaluations - The accumulated evaluations.
 *
 * @returns {Object} The aggregation object.
 */
function aggregate(evaluations) {
    const shape = flattenObject(evaluations[0] || {});

    const grouped = mapValues(shape, (value, key) => (
        evaluations
        .map((evaluation) => objGet(evaluation, key))
        // All the packages with negative values will have a score of 0 (e.g.: downloads acceleration)
        // So, we must remove all negative values from the aggregation in order to have a better score curve
        .filter((evaluation) => evaluation >= 0)
        .sort((a, b) => a - b)
    ));

    const aggregation = mapValues(grouped, (evaluations) => {
        const trimmedLength = Math.round(evaluations.length * trimPercentage);

        return {
            min: evaluations[0],
            max: evaluations[evaluations.length - 1],
            mean: mean(evaluations),
            truncatedMean: mean(evaluations.slice(trimmedLength, -trimmedLength)),
            median: evaluations[Math.round(evaluations.length / 2)],
        };
    });

    return unflattenObject(aggregation);
}

module.exports = aggregate;
