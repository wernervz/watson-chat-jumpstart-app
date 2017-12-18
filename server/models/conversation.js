'use strict'

const LOG = require('winston')

const ConversationV1 = require('watson-developer-cloud/conversation/v1')

const conversation = new ConversationV1({
    username: process.env.CONVERSATION_API_USER,
    password: process.env.CONVERSATION_API_PASSWORD,
    version_date: ConversationV1.VERSION_DATE_2017_05_26
})

module.exports = function (Conversation) { 
    Conversation.sendMessage = function(req, cb) {
        LOG.debug(req)
        // The request should be in the format expected by the WCS service sendMessage method.
        req.workspace_id = process.env.CONVERSATION_WORKSPACE_ID
        conversation.message(req, (err, response) => {
            if (err) {
                return cb(err)
            }
            LOG.debug(response)
            cb(null, response)
        })
    }
}
