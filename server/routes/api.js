"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express = require("express");
var router = express.Router();
var request = require("request");
var Episode = require("../models/Episode");
var SearchedWord = require("../models/SearchedWord");
var execSync = require("child_process").execSync;
var exec = require("child_process").exec;
var apiKey = "AIzaSyClzlqLX8CFQoL8l4ZwKjmp8LE-8KS4zjI";
var rp = require("request-promise");
var getTranscript = require('../modules/transcript');
var generateVideo = require('../modules/videoGenerator3');
router.get("/getVideo/:sentence", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sentenceToBuild, wordsToLookUpArr, dbSearchPromises, dbUpdatePromises, masterVideoIds, apiPromisess, foundwords, masterWordsData, resolvedApiPromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sentenceToBuild = req.params.sentence;
                wordsToLookUpArr = sentenceToBuild.split(" ");
                dbSearchPromises = [];
                dbUpdatePromises = [];
                masterVideoIds = [];
                apiPromisess = [];
                // 1. Search for words in the episodes
                wordsToLookUpArr.forEach(function (word) {
                    console.log(wordsToLookUpArr);
                    dbSearchPromises.push(Episode.aggregate([
                        {
                            $match: {
                                script: {
                                    $regex: " " + word + " ", $options: 'i'
                                }
                            }
                        },
                        {
                            $sample: { size: 1 }
                        },
                        {
                            $project: { _id: 0, season: 1, episode: 1 }
                        }
                    ]));
                });
                return [4 /*yield*/, Promise.all(dbSearchPromises)
                    // const newFoundwords = foundwords.flat()
                    // console.log('foundWOrds: ', foundwords.flat())
                ];
            case 1:
                foundwords = _a.sent();
                masterWordsData = foundwords.flat();
                console.log(masterWordsData);
                foundwords.flat().forEach(function (word) {
                    // console.log('word: ', word)
                    apiPromisess.push(rp("https://www.googleapis.com/youtube/v3/search?part=snippet&q=friends%20s" + word.season + "e" + word.episode + "&type=video&key=" + apiKey + "&limit=1"));
                });
                return [4 /*yield*/, Promise.all(apiPromisess)];
            case 2:
                resolvedApiPromises = _a.sent();
                resolvedApiPromises.forEach(function (responseObj, i) {
                    var newArr = [];
                    var items = JSON.parse(responseObj).items;
                    items.forEach(function (item) { return newArr.push(item.id.videoId); });
                    masterWordsData[i].videoIds = newArr;
                });
                masterWordsData.forEach(function (word) {
                    return dbUpdatePromises.push(Episode.update({
                        season: word.season,
                        episode: word.episode
                    }, {
                        $set: {
                            videoIds: word.videoIds
                        }
                    }));
                });
                return [4 /*yield*/, Promise.all(dbUpdatePromises)
                    // videoIdsArr = videoIdsArr.map(ids => {return ids[0]})
                    // 3. Get transcript for each episode (Dor's + Vicki's part)
                ];
            case 3:
                _a.sent();
                // videoIdsArr = videoIdsArr.map(ids => {return ids[0]})
                // 3. Get transcript for each episode (Dor's + Vicki's part)
                return [4 /*yield*/, masterWordsData.forEach(function (wordData) {
                        console.log('what am i sending?', wordData.videoIds[0]);
                        getTranscript(wordData.videoIds[0]);
                    })
                    //   // 5. Get video part for each word (Efrat's part)
                    //   const newArr = []
                    //   for (let i=0; i<5; i++){
                    //         newArr.push(timeDataArr[0][i])
                    //     }
                ];
            case 4:
                // videoIdsArr = videoIdsArr.map(ids => {return ids[0]})
                // 3. Get transcript for each episode (Dor's + Vicki's part)
                _a.sent();
                //   // 5. Get video part for each word (Efrat's part)
                //   const newArr = []
                //   for (let i=0; i<5; i++){
                //         newArr.push(timeDataArr[0][i])
                //     }
                generateVideo(wordsToLookUpArr);
                return [2 /*return*/];
        }
    });
}); });
// console.log(timeDataArr[0][0].matchedEpisodes)
// router.get("/testTranscript", (req, res) => {
//   const videoId = ["4_OvFVR5pNs", "1JVrynCAapg"];
//   getTranscript(videoId);
//   res.end();
// });
// const getTranscript = videoIds => {
//   let commands = "";
//   const scriptsFolder = "../youtube_transcripts";
//   videoIds.forEach(id => {
//     commands = `${commands} youtube-dl --skip-download -o '%(id)s.%(ext)s' --write-auto-sub 'https://www.youtube.com/watch?v=${id}'`;
//     // console.log(commands)
//   });
//   execSync(`${commands}`, { stdio: "inherit", cwd: scriptsFolder });
// };
module.exports = router;
// const express = require('express')
// const router = express.Router()
// const request = require('request')
// const transcript = require('../modules/transcript')
// const Episode = require('../models/Episode')
// const SearchedWord = require('../models/SearchedWord')
// // const fs = require('fs');
// const execSync = require('child_process').execSync;
// const exec = require('child_process').exec;
// const apiKey = 'AIzaSyClzlqLX8CFQoL8l4ZwKjmp8LE-8KS4zjI'
// const generateVideo = require('../modules/videoGenerator3')
// const bodyParser = require('body-parser')
// const checkDuplicatedWords = async function(searchedWord){
//     const isFound = await SearchedWord.find({word: SearchedWord.word})
//     if (isFound) {
//         isFound.matchedEpisodes.push(searchedWord.matchedEpisodes[0])
//     }
//     else {
//         const newSearchedWord = new searchedWord(searchedWord)
//         await newSearchedWord.save()
//     }
// }
// const selectRandomEpisode = function(number){
//     const x = Math.floor(Math.random() * number)
// }
// const getWords = function(){
//     const words = []
//     router.get('/getVideo/:sentence', function(req,res){
//         const sentence = req.params.sentence
//         words = sentence.split(' ')
//         res.end()
//     })
//     return words
// }
// getDbObjects = function(word){
//     Episode.aggregate([
//         { $match: { 
//             script: new RegExp(`${word}`, 'i')
//             }
//         },
//         { $sample: { 
//             size: 1 
//            } 
//         }
//     ])
// }
// getIdsFromAPI = function(season,episode){
//     request(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=friends%20s${season}e${episode}&type=video&key=${apiKey}`, function(err, response){
//             const videoIds = []
//             const output = JSON.parse(response.body)
//             output.items.forEach( o => videoIds.push(o.id.videoId))
//         })
//         return videoIds
// }
// getTranscript = function(id){
//         const searchedWord = transcript(id)
//         checkDuplicatedWords(searchedWord) //save to DB
// }
// getVideoOutput = function(arrayOfObjects){
//     generateVideo(arrayOfObjects)
// }
// getWords()
//     .then( words.forEach( word => getDbObjects(word)))
//     .then( mongoObjs.forEach( mongoObj => getIdsFromAPI(mongoObj.season, mongoObj.episode)))
//     .then( ids.forEach( id => getTranscript(id)))
//     .then( timeData => getVideoOutput(timeData))
// module.exports = router
