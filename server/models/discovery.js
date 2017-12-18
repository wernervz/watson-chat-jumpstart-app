'use strict';

var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');

var discovery = new DiscoveryV1({
    username: process.env.DISCOVERY_USERNAME,
    password: process.env.DISCOVERY_PASSWORD,
    version_date: process.env.DISCOVERY_API_VERSION
});

module.exports = function(Discovery) {
    Discovery.query = function(req, cb) {
        req.environment_id = process.env.DISCOVERY_ENV_ID
        req.collection_id = process.env.DISCOVERY_COLLECTION_ID
        discovery.query(req, (err, data) => {
            if (err) {
                return cb(err)
            }
            cb(null, data)
        })
    }
};
