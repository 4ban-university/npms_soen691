'use strict';

const got = require('got');
const opn = require('opn');
const handleError = require('./util/handleError');

function getLink(argv, res) {
    const links = res.body.collected.metadata.links;

    if (argv.link === 'npms') {
        return `https://npms.io/search?term=${argv.package}`;
    }
    if (argv.link === 'npm') {
        return links.npm;
    }

    return links.repository || links.npm;
}

// --------------------------------------------------------

exports.command = 'open <package>';
exports.describe = 'Opens the package in your browser.';

exports.builder = (yargs) =>
    yargs
    .usage('Usage: $0 open <package> [options]\n\nOpens the package in your browser..')
    .example('$0 open gulp', 'Opens "gulp" package using auto source')
    .example('$0 open gulp --link npms', 'Opens "gulp" package in `https://npms.io` service')

    .options({
        link: {
            describe: 'Open <package> using supplied link source',
            type: 'string',
            choices: ['auto', 'npm', 'npms'],
            default: 'auto',
        },
        api: {
            describe: 'The API url',
            default: 'http://127.0.0.1:3000',
        },
    });

exports.handler = (argv) => {
    got(`${argv.api}/package/${encodeURIComponent(argv.package)}`, { json: true })
    .then((res) => getLink(argv, res))
    .then((link) => opn(link, { wait: false }))
    .then(() => { process.exitCode = 0; })
    .catch((err) => handleError(err));
};
