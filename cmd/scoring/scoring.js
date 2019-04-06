'use strict';

const weightedMean = require('weighted-mean');
const semver = require('semver');
const deepCompact = require('deep-compact');
const clamp = require('lodash/clamp');
const mean = require('lodash/mean');
const pick = require('lodash/pick');
const { solveCubic } = require('../util/paperNumerical');


function scoreQuality(quality) {
  return mean([quality.carefulness, quality.tests, quality.health, quality.branding])
}

function scorePopularity(popularity) {
  return popularity.communityInterest
}

function scoreMaintenance(maintenance, aggregation) {
  return mean([maintenance.releasesFrequency, maintenance.commitsFrequency, maintenance.openIssues, maintenance.issuesDistribution])
}


function buildScore(fullData) {
  const collected = fullData.collected;
  const evaluation = fullData.evaluation;

  // console.log(fullData)

  const scoreDetail = {
    quality: scoreQuality(evaluation.quality),
    popularity: scorePopularity(evaluation.popularity),
    maintenance: scoreMaintenance(evaluation.maintenance),
  };

  return deepCompact({
    score: {
      final: (scoreDetail.quality) *
        (scoreDetail.popularity) *
        (scoreDetail.maintenance),
      detail: scoreDetail,
    },
  });
}

function score(fullData) {
  return buildScore(fullData)
}

module.exports = score;
