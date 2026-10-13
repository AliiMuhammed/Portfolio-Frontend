const {createHandler} = require('../server/publicPermalink');
const {metadataQuery, eligible} = require('../src/Pages/Work/caseStudyContract');
const {text} = require('../src/Pages/Writing/writingContract');
module.exports = createHandler({
  query:metadataQuery, isEligible:eligible, section:'work',
  prepare:project => ({...project, excerpt:text(project.shortDescription) || text(project.description)}),
});
