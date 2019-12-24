"use strict";
exports.__esModule = true;
var mongoose = require("mongoose");
// import { Schema } as Schema from 'mongoose'
// const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var SearchedWordSchema = new Schema({
    word: String,
    matchedEpisodes: [Schema({
            videoId: String,
            timeStamp: {
                start: String,
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
