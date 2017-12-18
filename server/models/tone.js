'use strict'

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3')

var tone_analyzer = new ToneAnalyzerV3({
    username: process.env.TONE_API_USER,
    password: process.env.TONE_API_PASSWORD,
    version_date: process.env.TONE_API_VERSION
})

module.exports = function(Tone) {
    Tone.chatAnalysis = function(req, cb) {
        tone_analyzer.tone_chat(req, function(err, response) {
        if (err)
            cb(err)
        else
            cb(null, response)
        }
    )}
};
