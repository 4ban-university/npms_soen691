'use strict';

const router = require('koa-router');
const routes = require('require-directory')(module);

module.exports = (npmsNano) => {
    const apiRouter = router();

    routes.package.info(apiRouter, npmsNano);
    // routes.search.query(apiRouter, esClient);
    // routes.search.suggestions(apiRouter, esClient);

    return apiRouter.routes();
};
