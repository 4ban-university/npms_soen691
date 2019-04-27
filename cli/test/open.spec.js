'use strict';

const cp = require('child_process');
const expect = require('chai').expect;
const nock = require('nock');
const betray = require('betray');
const exec = require('./util/exec');

describe('open', () => {
    afterEach(() => nock.cleanAll());

    it('should open module\'s repository in browser', () => {
        nock('https://api.npms.io')
        .get('/package/gulp')
        .reply(200, JSON.stringify(require('./fixtures/open/gulp.json')));

        const betrayed = betray(cp, 'spawn', () => ({
            unref: () => {},
        }));

        return exec(['open', '--link', 'npms', 'gulp'])
        .then((output) => {
            expect(output.stdout).to.equal('');
            expect(output.stderr).to.equal('');

            expect(betrayed.invoked).to.equal(1);
            expect(betrayed.invocations[0][1]).to.contain('https://npms.io/search?term=gulp');
        });
    });

    it('should open module\'s repository in browser using `--link npm` service', () => {
        nock('https://api.npms.io')
        .get('/package/gulp')
        .reply(200, JSON.stringify(require('./fixtures/open/gulp.json')));

        const betrayed = betray(cp, 'spawn', () => ({
            unref: () => {},
        }));

        return exec(['open', '--link', 'npm', 'gulp'])
        .then((output) => {
            expect(output.stdout).to.equal('');
            expect(output.stderr).to.equal('');

            expect(betrayed.invoked).to.equal(1);
            expect(betrayed.invocations[0][1]).to.contain('https://www.npmjs.com/package/gulp');
        });
    });

    it('should open module\'s repository in browser using `--link auto` service', () => {
        nock('https://api.npms.io')
        .get('/package/gulp')
        .reply(200, JSON.stringify(require('./fixtures/open/gulp.json')));

        const betrayed = betray(cp, 'spawn', () => ({
            unref: () => {},
        }));

        return exec(['open', '--link', 'auto', 'gulp'])
        .then((output) => {
            expect(output.stdout).to.equal('');
            expect(output.stderr).to.equal('');

            expect(betrayed.invoked).to.equal(1);
            expect(betrayed.invocations[0][1]).to.contain('https://github.com/gulpjs/gulp');
        });
    });

    it('should open module\'s npm page in browser using auto service if it has no repository', () => {
        nock('https://api.npms.io')
        .get('/package/query')
        .reply(200, JSON.stringify(require('./fixtures/open/query.json')));

        const betrayed = betray(cp, 'spawn', () => ({
            unref: () => {},
        }));

        return exec(['open', 'query'])
        .then((output) => {
            expect(output.stdout).to.equal('');
            expect(output.stderr).to.equal('');

            expect(betrayed.invoked).to.equal(1);
            expect(betrayed.invocations[0][1]).to.contain('https://www.npmjs.com/package/query');
        });
    });

    it('should handle API errors', () => {
        nock('https://api.npms.io')
        .get('/package/gulp')
        .reply(555, { code: 'SOME_ERROR', message: 'Some error' });

        return exec(['open', 'gulp', '--no-color'], { printStderr: false })
        .catch((err) => {
            expect(err.status).to.equal(1);
            expect(err.output.stderr).to.contain('ERROR\n');
            expect(err.output.stderr).to.contain('SOME_ERROR');
            expect(err.output.stderr).to.contain('Some error');
            expect(nock.isDone()).to.equal(true);
        });
    });
});
