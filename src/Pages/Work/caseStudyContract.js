// One public visibility contract for listings, dedicated pages and initial HTML.
const {validSlug, origin, text} = require('../Writing/writingContract');
const whitespace = Array.from(' \t\r\n\v\f\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff');
const nonblank = expression => `count(string::split(coalesce(${expression}, ""), "")[!(@ in ${JSON.stringify(whitespace)})]) > 0`;
const meaningful = `count(caseStudy[(_type == "block" && count(children[_type == "span" && ${nonblank('text')}]) > 0) || (_type == "articleCode" && ${nonblank('code')}) || (_type == "articleCallout" && ${nonblank('text')})]) > 0`;
const published = '_type == "work" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))';
const readiness = `caseStudyPublished == true && ${nonblank('title')} && ${meaningful}`;
const fields = '_id, title, description, shortDescription, longDescription, techStack, imageurl, link, github, video, showOnHomePage, "slug": slug.current, caseStudyPublished';
const listingQuery = `*[${published}]{${fields}, "caseStudyReady": ${readiness}}`;
const featuredQuery = `*[${published} && showOnHomePage == true]{${fields}, "caseStudyReady": ${readiness}}`;
const detailQuery = `*[${published} && ${readiness} && slug.current == $slug][0]{${fields}, "caseStudyReady": ${readiness}, caseStudy[]{..., _type == "articleImage" => {"asset": asset->{url, mimeType, metadata{dimensions}}}}, "coverImage": imageurl{..., "asset": asset->{url, metadata{dimensions}}}}`;
const metadataQuery = `*[${published} && ${readiness} && slug.current == $slug][0]{${fields}, "caseStudyReady": ${readiness}, "coverImage": imageurl{..., "asset": asset->{url, metadata{dimensions}}}}`;
const eligible = project => Boolean(project && typeof project._id === 'string' && !/^(drafts\.|versions\.)/.test(project._id) && project.caseStudyPublished === true && project.caseStudyReady === true && validSlug(project.slug) && text(project.title));
const caseStudyUrl = (configuredOrigin, slug) => origin(configuredOrigin) && validSlug(slug) ? `${origin(configuredOrigin)}/work/${slug}` : null;
module.exports = {validSlug, eligible, listingQuery, featuredQuery, detailQuery, metadataQuery, caseStudyUrl};
