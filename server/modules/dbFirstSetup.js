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
// const scriptsFolder = './scripts3/Friends_Analysis/transcripts_friends/season_all'
// fs.readdirSync(scriptsFolder).forEach(file => {
//     let episodeNum: Number = 0
//     let seasonNum: Number = 0
//     const fileName = file.replace(/\.csv/, '')
//     if (fileName.length > 3) {
//         seasonNum = 10
//         episodeNum = fileName.slice(2)
//     }
//     else {
//         seasonNum = fileName[0]
//         episodeNum = fileName.slice(1)
//     }
//     const e = (fs.readFileSync(`${scriptsFolder}/${file}`,'utf8'))
//     let episodeName = e.match(/(The One .*)|(The Last One)/) //episode name
//     let e1 = e.replace(/\(.*\)/gm, '') //director's comments
//     let e2 = e1.replace(/(([A-Z][a-z]+\.)\s([A-Z][a-z]+\:))/gm, '') //character name with 2words
//     let e3 = e2.replace(/([A-Z][a-z]+)\:/gm, '') //character name
//     let e4 = e3.replace(/\[.*\]/gm, '') //scene desc.
//     let e5 = e4.replace(/(Written by\: .+)/gm, '') //written by
//     let e6 = e5.replace(/(Transcribed by\: .+)/gm, '') //transcribed by
//     let e7 = e6.replace(/((Ending|Closing) Credits)/gm, '')  //ending credits
//     let e8 = e7.replace(/(End)/gm, '')  //ending credits
//     let e9 = e8.replace(/Commercial Break/gm, '')  // commercial break
//     let e10 = e9.replace(/Opening Credits/gm, '') //opening credits
//     let e11 = e10.replace(/\n/gm, '') //new line
//     let e12 = e11.replace(/\r/gm, '') //carriage-return
//     const content: episodeDbObject = {
//         season: seasonNum,
//         episode: episodeNum,
//         name: episodeName,
//         script: e12
//     }
//     fs.writeFileSync(`./scripts3/scriptsOutput/${file}`, JSON.stringify(content))
// })
// mongoose.connect('mongodb://localhost/Friends', {useNewUrlParser: true})
// const pass = 'T23Cd93@g62EmrQ'
// mongoose.connect(`mongodb://vicki:${encodeURIComponent(pass)}@ds127506.mlab.com:27506/heroku_drzf9z0f`, { useNewUrlParser: true}, (err)=>
//     {
//         if(err) {
//             console.log('Some problem with the connection ' +err);
//         } else {
//             console.log('The Mongoose connection is ready');
//         }
//     }
// )
var searchedWord = require('../models/SearchedWord');
var blabla = new searchedWord({
    word: 'blabla',
    matchedEpisodes: [
        {
            videoId: 'cWplCCNbxrs',
            timeStamp: {
                start: '00:00:23.123',
                duration: '00:00:01.000'
            }
        }
    ],
    isReady: false
});
blabla.save();
