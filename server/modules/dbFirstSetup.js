"use strict";
exports.__esModule = true;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require("path");
var mongoose = require('mongoose');
var os = require('os');
var fs = require('fs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'node_modules')));
// app.use( '/', api )
var PORT = 8080;
app.listen(process.env.PORT || PORT);
var scriptsFolder = '/Users/vickimenashe/Documents/Elevation/frienerator/scripts3/Friends_Analysis/transcripts_friends/season_all';
fs.readdirSync(scriptsFolder).forEach(function (file) {
    var episodeNum = 0;
    var seasonNum = 0;
    var fileName = file.replace(/\.csv/, '');
    if (fileName.length > 3) {
        seasonNum = 10;
        episodeNum = fileName.slice(2);
    }
    else {
        seasonNum = parseInt(fileName[0]);
        episodeNum = parseInt(fileName.slice(1));
    }
    var script = (fs.readFileSync(scriptsFolder + "/" + file, 'utf8'));
    var episodeName = script.match(/(The One .*)|(The Last One)/); //episode name
    script = script.replace(/\(.*\)/gm, '') //director's comments
        .replace(/(([A-Z][a-z]+\.)\s([A-Z][a-z]+\:))/gm, '') //character name with 2words
        .replace(/([A-Z][a-z]+)\:/gm, '') //character name
        .replace(/\[.*\]/gm, '') //scene desc.
        .replace(/(Written by\: .+)/gm, '') //written by
        .replace(/(Transcribed by\: .+)/gm, '') //transcribed by
        .replace(/((Ending|Closing) Credits)/gm, '') //ending credits
        .replace(/(End)/gm, '') //ending credits
        .replace(/Commercial Break/gm, '') // commercial break
        .replace(/Opening Credits/gm, '') //opening credits
        .replace(/\n/gm, '') //new line
        .replace(/\r/gm, ''); //carriage-return
    var content = {
        season: seasonNum,
        episode: episodeNum,
        name: episodeName,
        script: script,
        videoIds: []
    };
    fs.writeFileSync("/Users/vickimenashe/Documents/Elevation/frienerator/scripts3/scriptsNew/" + file, JSON.stringify(content));
});
mongoose.connect('mongodb://localhost/Friends', { useNewUrlParser: true });
var pass = 'T23Cd93@g62EmrQ';
mongoose.connect("mongodb://vicki:" + encodeURIComponent(pass) + "@ds127506.mlab.com:27506/heroku_drzf9z0f", { useNewUrlParser: true }, function (err) {
    if (err) {
        console.log('Some problem with the connection ' + err);
    }
    else {
        console.log('The Mongoose connection is ready');
    }
});
var searchedWord = require('../models/SearchedWord');
var Episode = require('../models/Episode');
// const blabla = new searchedWord({
//     word: 'blabla',
//     matchedEpisodes: [
//         {
//             videoId: 'cWplCCNbxrs',
//             timeStamp: {
//                 start: '00:00:23.123',
//                 duration: '00:00:01.000'
//             }
//         }
//     ],
//     isReady: false
// })
var blabla = new Episode({
    episode: 1,
    season: 1,
    name: 'the one where',
    script: 'dfdfdf',
    videoIds: []
});
blabla.save();
