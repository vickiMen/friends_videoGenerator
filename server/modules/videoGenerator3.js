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
var path = require("path");
var execSync = require('child_process').execSync;
var mongoose = require('mongoose');
var searchedWord = require('../models/SearchedWord');
var downloadFolder = "./video_outputs";
var videoCutsFolder = "./video_cuts";
var counter = 0;
var dbSearchPromises = [];
var videoOutputs = [];
var pass = 'T23Cd93@g62EmrQ';
mongoose.connect("mongodb://vicki:" + encodeURIComponent(pass) + "@ds127506.mlab.com:27506/heroku_drzf9z0f", { useNewUrlParser: true }, function (err) {
    if (err) {
        console.log('Some problem with the connection ' + err);
    }
    else {
        console.log('The Mongoose connection is ready');
    }
});
var selectRandomEpisode = function (array) {
    return (Math.floor(Math.random() * array.length));
};
var generateVideo = function (wordsToLookUpArr) {
    return __awaiter(this, void 0, void 0, function () {
        var matchedEpisodes, masterMatchedEpisodesData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wordsToLookUpArr.forEach(function (word) {
                        dbSearchPromises.push(searchedWord.findOne({
                            word: word
                        }, {
                            _id: 0,
                            matchedEpisodes: 1
                        }));
                    });
                    return [4 /*yield*/, Promise.all(dbSearchPromises)];
                case 1:
                    matchedEpisodes = _a.sent();
                    masterMatchedEpisodesData = [];
                    masterMatchedEpisodesData = matchedEpisodes.map(function (me) { return me.matchedEpisodes.flat(); });
                    console.log(masterMatchedEpisodesData);
                    masterMatchedEpisodesData.forEach(function (ed, i) {
                        var chosenEpisode = ed[selectRandomEpisode(ed)];
                        execSync("youtube-dl -g \"https://www.youtube.com/watch?v=" + chosenEpisode.videoId + "\" -f best > " + chosenEpisode.videoId + ".txt;", { stdio: 'inherit', cwd: downloadFolder });
                        fs.readdirSync(downloadFolder).forEach(function (file) {
                            chosenEpisode.output = fs.readFileSync(downloadFolder + "/" + file, 'utf8');
                            chosenEpisode.output = chosenEpisode.output.slice(0, -1);
                        });
                        execSync("ffmpeg -ss \"" + chosenEpisode.timeStamp.start + "\" -i \"" + chosenEpisode.output + "\" -t \"" + chosenEpisode.timeStamp.duration + "\" video_" + i + ".mp4", { stdio: 'inherit', cwd: videoCutsFolder });
                    });
                    return [2 /*return*/];
            }
        });
    });
};
generateVideo(['Ross', 'Vegas']);
// module.exports = final
