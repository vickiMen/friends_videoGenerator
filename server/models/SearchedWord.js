const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SearchedWordSchema = new Schema({
    word: String,
    matchedEpisodes: [Schema(
        {
            videoId: String,
            timeStamp: {
                start: String,
                duration: String
            }
        },
        {
            _id: false
        })
    ],
    isReady: Boolean
},{strict:false})

const SearchedWord = mongoose.model('SearchedWord', SearchedWordSchema)

module.exports = SearchedWord