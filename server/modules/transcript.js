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
var fs = require('fs');
var execSync = require('child_process').execSync;
var mongoose = require('mongoose');
var searchedWord = require('../models/SearchedWord');
var pass = 'T23Cd93@g62EmrQ';
mongoose.connect("mongodb://vicki:" + encodeURIComponent(pass) + "@ds127506.mlab.com:27506/heroku_drzf9z0f", { useNewUrlParser: true }, function (err) {
    if (err) {
        console.log('Some problem with the connection ' + err);
    }
    else {
        console.log('The Mongoose connection is ready');
    }
});
var dbUpdatePromises = [];
var words = []; // all words in transctipts
var times = []; // all timestamps in transcript
var durations = []; // all durations for words
var parsedTimes = [];
var timeData = []; // all relevant time info for each word
var scriptsFolder = '/Users/vickimenashe/Documents/Elevation/frienerator/server/modules/youtube_transcripts';
var durationCalc = function (startTime, nextStartTime) {
    return nextStartTime - startTime;
};
var parseToSeconds = function (timeStamp) {
    var a = timeStamp.split(':');
    var b = a[2].split('.');
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+b[0]) + (+b[1]) / 1000;
    return seconds;
};
var parseSecToStr = function (timeFloat) {
    var pad = function (num, size) { return ('000' + num).slice(size * -1); }, time = parseFloat(timeFloat).toFixed(3), hours = Math.floor(time / 60 / 60), minutes = Math.floor(time / 60) % 60, seconds = Math.floor(time - minutes * 60), milliseconds = time.slice(-3);
    return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milliseconds, 3);
};
var retrieveTimeStamppData = function (youtubeVideoID) {
    return __awaiter(this, void 0, void 0, function () {
        var downloadCommand, script, strDurations, i, j;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    downloadCommand = "youtube-dl --skip-download -o '%(id)s.%(ext)s' --write-auto-sub 'https://www.youtube.com/watch?v=";
                    downloadCommand += youtubeVideoID + '\'';
                    execSync("" + downloadCommand, { stdio: 'inherit', cwd: scriptsFolder });
                    script = (fs.readFileSync(scriptsFolder + "/" + youtubeVideoID + ".en.vtt", 'utf8'));
                    script = script.replace(/(\<c\> )/gm, '')
                        .replace(/(\<\/c\>)/gm, '')
                        .replace(/(WEBVTT\nKind: captions\nLanguage: en)/gm, '')
                        .replace(/(-->.*align.*)\n.*/gm, '')
                        .replace(/\s/gm, '')
                        .replace(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}/, '')
                        .replace(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}(?=[a-zA-Z]+)/gm, '');
                    words = script.match(/[a-zA-Z']+/gm);
                    times = script.match(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}/gm);
                    words.forEach(function (w, i) { return timeData.push({
                        word: w,
                        matchedEpisodes: [
                            {
                                videoId: youtubeVideoID,
                                timeStamp: {
                                    start: times[i]
                                }
                            }
                        ],
                        isReady: false
                    }); });
                    times.forEach(function (t, i) { return parsedTimes[i] = parseToSeconds(t); });
                    parsedTimes.forEach(function (pt, i) { return durations.push(durationCalc(pt, parsedTimes[i + 1])); });
                    strDurations = durations.map(function (d) { return parseSecToStr(d); });
                    strDurations[strDurations.length - 1] = '00:00:03:123';
                    timeData.forEach(function (td, i) { return td.matchedEpisodes[0].timeStamp.duration = strDurations[i]; });
                    for (i = 0; i < timeData.length; i++) {
                        for (j = i + 1; j < timeData.length; j++) {
                            if (timeData[i].word == timeData[j].word) {
                                timeData[i].matchedEpisodes.push(timeData[j].matchedEpisodes[0]);
                                timeData.splice(j, 1);
                            }
                        }
                    }
                    timeData.forEach(function (td, i) {
                        dbUpdatePromises.push(searchedWord.updateMany({
                            word: td.word
                        }, {
                            $addToSet: {
                                matchedEpisodes: {
                                    $each: td.matchedEpisodes
                                }
                            }
                        }, {
                            multi: true
                        }));
                        timeData.splice(i, 1);
                    });
                    timeData.forEach(function (td) {
                        var newDbObject = new searchedWord({
                            word: td.word,
                            matchedEpisodes: td.matchedEpisodes,
                            isReady: td.isReady
                        });
                        dbUpdatePromises.push(newDbObject.save());
                    });
                    return [4 /*yield*/, Promise.all(dbUpdatePromises)
                        // timeData.forEach( td => console.log(td.matchedEpisodes[0].timeStamp.duration))
                        //TODO: write code that saves timeData into the 'episodes' collection, using the videoID property
                        //TODO: delete file after done
                        // console.log(timeData)
                    ];
                case 1:
                    _a.sent();
                    // timeData.forEach( td => console.log(td.matchedEpisodes[0].timeStamp.duration))
                    //TODO: write code that saves timeData into the 'episodes' collection, using the videoID property
                    //TODO: delete file after done
                    // console.log(timeData)
                    return [2 /*return*/, timeData];
            }
        });
    });
};
// retrieveTimeStamppData('NXTIZqrg8wU')
module.exports = retrieveTimeStamppData;
