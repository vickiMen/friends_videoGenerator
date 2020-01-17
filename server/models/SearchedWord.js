// import * as mongoose from 'mongoose'
// import { Schema } as Schema from 'mongoose'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SearchedWordSchema = new Schema({
    word: String,
    matchedEpisodes: [Schema({
            videoId: String,
            timeStamp: {
                start: String,
                end: String,
                duration: String
            }
        }, {
            _id: false
        })
    ],
    isReady: Boolean
}, { strict: false });
var SearchedWord = mongoose.model('SearchedWord', SearchedWordSchema);
module.exports = SearchedWord;
