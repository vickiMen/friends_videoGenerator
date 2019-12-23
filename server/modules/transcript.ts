import { resolve } from "dns";

const fs = require('fs');
const execSync = require('child_process').execSync;
const mongoose = require('mongoose')
const searchedWord = require('../models/SearchedWord')

const dbUpdatePromises: Array<object> = []

interface timeStampObject {
    start: string,
    duration?: string
}

interface matchedEpisodeObject {
    videoId: string,
    timeStamp: timeStampObject 
}

interface timeDataObject {
    word: string,
    matchedEpisodes: Array<matchedEpisodeObject>,
    isReady: boolean
}

let              words: Array<string> = [] // all words in transctipts
let              times: Array<string> = [] // all timestamps in transcript
const           durations: Array<any> = [] // all durations for words
const      parsedTimes: Array<number> = []
const timeData: Array<timeDataObject> = [] // all relevant time info for each word

const scriptsFolder = '/Users/vickimenashe/Documents/Elevation/frienerator/server/modules/youtube_transcripts'

const durationCalc = function(startTime: Number, nextStartTime: Number){
    return nextStartTime - startTime
}

const parseToSeconds = function(timeStamp: string){
    const a = timeStamp.split(':')
    const b = a[2].split('.')
    const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+b[0]) + (+b[1]) / 1000 
    return seconds
}

const parseSecToStr = function(timeFloat: Number) {
    const pad = function(num, size) { return ('000' + num).slice(size * -1); },
    time: any = parseFloat(timeFloat).toFixed(3),
    hours = Math.floor(time / 60 / 60),
    minutes = Math.floor(time / 60) % 60,
    seconds = Math.floor(time - minutes * 60),
    milliseconds = time.slice(-3);
    return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milliseconds, 3)
}

const retrieveTimeStamppData = async function(youtubeVideoID: string){

    // fs.unlinkSync(scriptsFolder)

    let downloadCommand = `youtube-dl --skip-download -o '%(id)s.%(ext)s' --write-auto-sub 'https://www.youtube.com/watch?v=`

    downloadCommand += youtubeVideoID + '\''
    
    execSync(`${downloadCommand}`, {stdio: 'inherit', cwd: scriptsFolder})
    
    let script = (fs.readFileSync(`${scriptsFolder}/${youtubeVideoID}.en.vtt`,'utf8'))
    script = script.replace(/(\<c\> )/gm, '')
                   .replace(/(\<\/c\>)/gm, '')
                   .replace(/(WEBVTT\nKind: captions\nLanguage: en)/gm, '')
                   .replace(/(-->.*align.*)\n.*/gm, '')
                   .replace(/\s/gm, '')
                   .replace(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}/, '')
                   .replace(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}(?=[a-zA-Z]+)/gm, '')


    words = script.match(/[a-zA-Z']+/gm)
    times = script.match(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}/gm)
    
    words.forEach( (w,i) => timeData.push(
        {
            word: w,
            matchedEpisodes: [
                {
                    videoId: youtubeVideoID,
                    timeStamp: {
                        start: times[i],
                    }
                }
            ],
            isReady: false
        }
    ))

    times.forEach( (t,i) => parsedTimes[i] = parseToSeconds(t))
    parsedTimes.forEach( (pt,i) => durations.push(durationCalc(pt, parsedTimes[i+1])))
    
    const strDurations = durations.map( d => parseSecToStr(d))
    strDurations[strDurations.length-1] = '00:00:03:123'
    timeData.forEach( (td,i) => td.matchedEpisodes[0].timeStamp.duration = strDurations[i])
    
    
    for (let i=0; i<timeData.length; i++){
        for (let j=i+1; j<timeData.length; j++){
            if (timeData[i].word == timeData[j].word){
                timeData[i].matchedEpisodes.push(timeData[j].matchedEpisodes[0])
                timeData.splice(j,1)
            }
        }
    }

    timeData.forEach( (td,i) => {
        dbUpdatePromises.push(
            searchedWord.updateOne(
            {
                word: td.word
            },
            {
                $addToSet: {
                    matchedEpisodes: {
                        $each: td.matchedEpisodes
                    }
                }
            })
        )
        timeData.splice(i,1)
    })


    timeData.forEach(td => {
        const newDbObject = new searchedWord({
            word: td.word,
            matchedEpisodes: td.matchedEpisodes,
            isReady: td.isReady
        })
        dbUpdatePromises.push( newDbObject.save() )
    })

    
    
    dbUpdatePromises.push(searchedWord.updateMany(
        {
            $where: "this.matchedEpisodes.length >= 10",
            isReady: false  
        },
        {
            $set: {
                isReady: true
            }
        })
    )
        
    await Promise.all(dbUpdatePromises)


    // timeData.forEach( td => console.log(td.matchedEpisodes[0].timeStamp.duration))
      
    //TODO: write code that saves timeData into the 'episodes' collection, using the videoID property
    //TODO: delete file after done
    // console.log(timeData)
    return timeData
}


// retrieveTimeStamppData('NXTIZqrg8wU')

module.exports = retrieveTimeStamppData