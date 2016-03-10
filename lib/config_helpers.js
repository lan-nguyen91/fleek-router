var _             = require('lodash');
var fs            = require('fs');
var helpers       = require('./helpers');
var fleekValidate = require('fleek-validator');
var fleekResponse = require('fleek-response');
var genit         = require('genit');

const cwd = process.cwd();

//
// Parse Swagger Docs
//
// Parameters:
//   relPath
//     [String] - path of location called from
//
//   DocSrc
//     [Undefined] - attempt to find (swagger.json || api.jsonP
//       OR
//     [String] - path to docs
//       OR
//     [Object] - swagger object
//
exports.parseSwaggerDocs = function (relPath, docSrc) {
  var docs = null;

  // If the swagger property is a path
  if (_.isString(docSrc)) {
    docSrc = helpers.pathToAbsolute(relPath, docSrc);

    if (fs.existsSync(docSrc)) {
      docs = require(docSrc);
    } else {
      throw new Error('Swagger json file does not exist: ' + docSrc);
    }

    // If the swagger property is an object
  } else if (_.isObject(docSrc)) {
    docs = docSrc;

  // Try to find the swagger doc in a few different places
  } else {
    _.each([
      '/api.json',
      '/swagger.json',
      '/config/api.json',
      '/config/swagger.json',
    ], function (path) {
      if (fs.existsSync(cwd + path)) {
        docs = require(cwd + path);
        docs._origin_ = cwd + path;
      }
    });
  }

  if (docs) {
    return docs;
  } else {
    throw new Error('Could not find swagger documentation file');
  }
};

//
// Get Authenticate Function
//
// Parameters:
//   config
//     [Object] - router configuration
//
//     Authenticate
//       [Boolean] - if true, use fleek-authenticate
//         OR
//       [Generator] - custom generator
//         OR
//       [Undefined] - no-op
//
exports.getAuthenticateFunction = function (config) {
  if (config.authenticate === true) {
    throw new Error('uh-oh! fleek-authenticator isn\'t implemented yet. try back later');
    return fleekAuthenticate; // TODO: implement this

  } else if (genit.isGenerator(config.authenticate)) {
    return config.authenticate;

  } else {
    return function *(next) { yield next; };
  }
};

//
// Get Validate Function
//
// Parameters:
//   config
//     [Object] - router configuration
//
//     Validate
//       [Boolean] - if true, use fleek-validate
//         OR
//       [Object] - use fleek-validator with the config object
//         OR
//       [Generator] - custom generator
//         OR
//       [Undefined] - no-op
//
exports.getValidateFunction = function (config, docs, app) {
  if (config.validate === true) {
    return fleekValidate({
      swagger : docs,
    });

  } else if (genit.isGenerator(config.validate)) {
    return config.validate;

  } else if (_.isObject(config.validate)) {
    return fleekValidate(_.defaults(config.validate, {
      swagger : docs,
    }));

  } else {
    return function *(next) { yield next; };
  }
};

//
// Get Response Function
//
// Parameters:
//   config
//     [Object] - router configuration
//
//     Validate
//       [Boolean] - if true, use fleek-response
//         OR
//       [Object] - use fleek-response with the config object
//         OR
//       [Generator] - custom generator
//         OR
//       [Undefined] - no-op
//
exports.getResponseFunction = function (config, docs, app) {
  if (config.response === true) {
    return fleekResponse({
      swagger : docs,
    });

  } else if (genit.isGenerator(config.response)) {
    return config.response;

  } else if (_.isObject(config.response)) {
    return fleekResponse(_.defaults(config.response, {
      swagger : docs,
    }));

  } else {
    return function *(next) { yield next; };
  }
};

exports.addPrefix = function (prefixName, path, config, docs) {
  var result = path;
  var prefixVal = config[prefixName] ? config[prefixName] : docs[prefixName];
  if (prefixVal) {
    if (_.isString(prefixVal)) {
      result = helpers.joinPaths(prefixVal, path);

    } else if (prefixVal === true) {
      var docPrefixVal = docs[prefixName];
      if (docPrefixVal) {
        result = helpers.joinPaths(docPrefixVal, path);
      } else {
        throw new Error('could not find a prefix property ' + prefixName + ' in the swagger documentation');
      }
    }
  }

  return result;
};
