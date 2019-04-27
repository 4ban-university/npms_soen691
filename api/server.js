#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const assert = require('assert');
const config = require('config');

const argv = yargs
.wrap(Math.min(120, yargs.terminalWidth()))
.version()
.alias('version', 'v')
.help('help')
.alias('help', 'h')
.command('[options]')
.usage('Usage: $0 [options]\n\nStarts the API server.')

.option('hostname', {
    type: 'string',
    default: config.get('listen.hostname'),
    alias: 'H',
    describe: 'Specify the hostname',
})
.option('port', {
    type: 'number',
    default: config.get('listen.port'),
    alias: 'p',
    describe: 'Specify the port',
})
.option('backlog', {
    type: 'number',
    default: config.get('listen.backlog'),
    alias: 'b',
    describe: 'Specify the backlog size',
})
.option('log-level', {
    type: 'string',
    default: 'warn',
    alias: 'll',
    describe: 'The log level to use',
    choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
})

.check((argv) => {
    assert(argv.port >= 0, 'Invalid argument: --port must be a number greater than or equal to 0');
    assert(argv.backlog >= 0, 'Invalid argument: --backlog must be a number greater than or equal to 0');

    return true;
})

.argv;

// ------------------------------------------------------------

require('./lib/configure');
logger.level = argv.logLevel;

const elasticsearch = require('elasticsearch');
const nano = require('nano');
const api = require('./');

const npmsNano = Promise.promisifyAll(nano(config.get('couchdbNpms')));
const esClient = new elasticsearch.Client(config.get('elasticsearch'));
const log = logger.child({ module: 'server' });

api(config.get('app'), npmsNano, esClient)
.listen(argv.port, argv.hostname, argv.backlog, (err) => {
    if (err) {
        log.error({ err }, 'Unable to start server');
        throw err;
    }

    log.info(`Now listening on ${argv.hostname}:${argv.port}..`);
});
