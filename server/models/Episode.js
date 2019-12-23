const mongoose = require('mongoose')

const Schema = mongoose.Schema

const EpisodeSchema = new Schema({
    season: Number,
    episode: Number,
    name: String,
    script: String,
    videoIds: Array
})

const Episode = mongoose.model('episode', EpisodeSchema)

module.exports = Episode