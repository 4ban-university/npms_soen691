'use strict';

const got = require('got');
const handleError = require('./util/handleError');
const Table = require('cli-table3');
const chalk = require('chalk');
const moment = require('moment');
const truncate = require('truncate');

exports.command = 'info <package>';
exports.describe = 'Get info from npms.io of a given package.';

exports.builder = (yargs) =>
    yargs
    .usage('Usage: $0 info <package> [options]\n\nGet info from npms.io of a given package.')
    .example('$0 info gulp', 'Get "gulp" package info')

    .options({
        output: {
            alias: 'o',
            describe: 'Format the results in a human readable format or as JSON',
            default: 'human',
            choices: ['human', 'json'],
        },
        api: {
            describe: 'The API url',
            default: 'http://127.0.0.1:3000',
        },
    });

exports.handler = (argv) => {
    got(`${argv.api}/package/${encodeURIComponent(argv.package)}`, { json: true })
    .then((res) => {
        console.log(res.body.docs.length)

        // res.body.docs.sort(function(a, b) {
        //     return a.collected.metadata.name > b.collected.metadata.name
        // })
        res.body.docs.sort(function (a, b) { return b.score.final - a.score.final})

        const table = new Table({ head: ['Package', 'Quality', 'Popularity', 'Maintenance', 'Score'] });
        table.push(...res.body.docs.map((item) => {
            const pkg = item.collected.metadata;
            const scr = item.score;

            const packageColumn = [`${chalk.bold(pkg.name)} • ${chalk.dim(pkg.links.repository || pkg.links.npm)}`,
                chalk.gray(truncate(pkg.description, 80, {
                    ellipsis: '...',
                })),
                pkg.date && pkg.publisher ? chalk.dim(`updated ${moment(pkg.date).fromNow()} by ${pkg.publisher.username}`) : '',
            ].join('\n');

            const scoreColumn = ['quality', 'popularity', 'maintenance']
            .map((score) => ({
                hAlign: 'center',
                vAlign: 'center',
                content: Math.round(scr.detail[score] * 100),
            }))
            .concat([{
                hAlign: 'center',
                vAlign: 'center',
                content: chalk.green(Math.round(scr.final * 100)),
            }]);


            return [packageColumn].concat(scoreColumn);
        }));



        // const pkg = res.body.collected.metadata;
        // const scr = res.body.score;

        // const packageColumn = [`${chalk.bold(pkg.name)} • ${chalk.dim(pkg.links.repository || pkg.links.npm)}`,
        //     chalk.gray(truncate(pkg.description, 80, {
        //         ellipsis: '...',
        //     })),
        //     pkg.date && pkg.publisher ? chalk.dim(`updated ${moment(pkg.date).fromNow()} by ${pkg.publisher.username}`) : '',
        // ].join('\n');
        // const scoreColumn = ['quality', 'popularity', 'maintenance']
        // .map((score) => ({
        //     hAlign: 'center',
        //     vAlign: 'center',
        //     content: Math.round(scr.detail[score] * 100),
        // }))
        // .concat([{
        //     hAlign: 'center',
        //     vAlign: 'center',
        //     content: chalk.green(Math.round(scr.final * 100)),
        // }]);

        // table.push([packageColumn].concat(scoreColumn));

        console.log(table.toString());
    })
    .then(() => { process.exitCode = 0; })
    .catch((err) => handleError(err));
};
