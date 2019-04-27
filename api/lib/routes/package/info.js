'use strict';

const bodyParser = require('koa-bodyparser');
const Joi = require('joi');
const validateNpmPackageName = require('validate-npm-package-name');
const keyBy = require('lodash/keyBy');
const uniq = require('lodash/uniq');
const joiHelper = require('../../util/joiHelper');

function validateNames(names) {
    names.forEach((name) => {
        const validation = validateNpmPackageName(name);

        if (validation.errors) {
            throw Object.assign(new Error(`${validation.errors[0]} ("${name}")`),
                { code: 'INVALID_PARAMETER', status: 400, expose: true });
        }
    });

    return names;
}

// Unused function
function fetchFromCouchdb(names, npmsNano) {
    return npmsNano.fetchAsync({ keys: names.map((name) => `${name}`) })
    .get('rows')
    .map((row) => {
        if (row.doc) {
            return {
                analyzedAt: row.doc.analyzedAt,
                collected: row.doc.collected,
                evaluation: row.doc.evaluation,
                score: row.doc.score,
                error: row.doc.error,
            };
        }

        if (row.error === 'not_found') {
            return null;
        }

        throw Object.assign(new Error(`Unable to retrieve ${row.key} from CouchDB`), { code: row.error });
    });
}

function getFromCouchdb(names, npmsNano) {
    const q = {
        "selector": {
            "_id": {"$regex": names[0]}
        },
        "limit": 400
    }

    return npmsNano.find(q)
}

// ----------------------------------------------------------

module.exports = (router, npmsNano) => {
    /* eslint-disable newline-per-chained-call */
    const infoParamsSchema = Joi.object({
        name: Joi.string().trim().min(1).required(),
    }).required();
    /* eslint-enable newline-per-chained-call */

    router.get('/package/:name',
        function* (next) {
            this.validated = joiHelper.validate(infoParamsSchema, this.params);
            validateNames([this.validated.name]);
            yield next;
        },
        function* () {
            const names = [this.validated.name];

            this.log.debug({ names }, 'Will fetch info');

            // Fetch info
            const info = yield Promise.props({
                // couchdb: getFromCouchdb(names, npmsNano).get(0),
                couchdb: getFromCouchdb(names, npmsNano),
            });

            this.log.debug({ names, info }, 'Got info');

            // Fetch info
            // const additional = [];

            // var filtered = info.couchdb.docs[0].collected.metadata.keywords.filter(function (value, index, arr) {
            //     return value != names[0];
            // });
            // filtered = [...new Set(filtered)];

            // var filteredAgain = new Set()
            // for ( let i in filtered) {
            //     for ( let j in filtered){
            //         if (filtered[i] !== filtered[j]){
            //             if (filtered[j].indexOf(filtered[i]) != -1) {
            //                 filteredAgain.add(filtered[i])
            //             }
            //         }
            //     }
            // }

            // // var filteredAgain = new Set()
            // // filteredAgain.add('test')
            // // filteredAgain.add('vue')

            // for (let q of filteredAgain) {
            //     const addNames = [];

            //     addNames.push(q);
            //     additional.push(yield Promise.props({
            //         couchdb: getFromCouchdb(addNames, npmsNano),
            //     }));
            // }
            // Check if the package does not exist
            if (!info.couchdb) {
                throw Object.assign(new Error('Module not found'), { code: 'NOT_FOUND', status: 404, expose: true });
            }
            // for (let j in additional){
            //     for( let i in additional[j].couchdb.docs) {
            //         info.couchdb.docs.push(additional[j].couchdb.docs[i])
            //     }
            // }
            this.body = Object.assign({}, info.couchdb);
        });

    /* eslint-disable newline-per-chained-call */
    const infoMgetBodySchema = Joi.array().label('names').min(1).max(250).items(Joi.string().trim().min(1)).required();
    /* eslint-enable newline-per-chained-call */

    router.post('/package/mget',
        bodyParser({ enableTypes: ['json'] }),
        function* (next) {
            this.validated = validateNames(joiHelper.validate(infoMgetBodySchema, uniq(this.request.body)));
            yield next;
        },
        function* () {
            const names = this.validated;

            this.log.debug({ names }, 'Will fetch info');

            // Fetch info
            const info = yield Promise.props({
                couchdb: fetchFromCouchdb(names, npmsNano),
            });

            this.log.debug({ names, info }, 'Got info');

            // Build the packages array, clearing the ones that do not exist
            /* eslint-disable */
            const infos = info.couchdb
            .map((infoCouchdb) => {
                return !infoCouchdb ? null : Object.assign({}, infoCouchdb)
            })
            .filter((info) => !!info);
            /* eslint-enable */
            // Return an object indexed by name
            this.body = keyBy(infos, (info) => info.collected.metadata.name);
        });
};
