import { resolve } from "dns";
const path = require("path")
const os = require('os');
const fs = require('fs');
const execSync = require('child_process').execSync;
const mongoose = require('mongoose')
const searchedWord = require('../models/SearchedWord')
// import * as searchedWord from '../models/SearchedWord'
import * as api from '../routes/api'
export import wordData = api.wordData


const dbUpdatePromises: Array<object> = []

interface scriptData {
    youtubeId: string,
    words: Array<string>,
    times: Array<string>
}

interface timeStampObject {
    start: string,
    end?: string,
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

let                  words: Array<string> = [] // all words in transctipts
let                  times: Array<string> = [] // all timestamps in transcript
const     timeData: Array<timeDataObject> = [] // all relevant time info for each word
const   firstDbUpdatePromises: Array<any> = []
let       downloadCommands: Array<String> = []
let            scripts: Array<scriptData> = [] // storing all of the normalized data for each script
let      relevantObjects: Array<wordData> = []
let youtubeVideoIDs: Array<Array<string>> = []


const scriptsFolder = '/Users/vickimenashe/Documents/Elevation/frienerator/server/modules/youtube_transcripts'

const durationCalc = function(startTime: number, nextStartTime: number){
    return nextStartTime - startTime
}

const parseToSeconds = function(timeStamp: string){
    const a = timeStamp.split(':')
    const b = a[2].split('.')
    const seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+b[0]) + (+b[1]) / 1000 
    return seconds
}

const parseSecToStr = function(timeFloat: any) {
    const pad = function(num: number, size: number) { return ('000' + num).slice(size * -1); },
    time: any = parseFloat(timeFloat).toFixed(3),
    hours = Math.floor(time / 60 / 60),
    minutes = Math.floor(time / 60) % 60,
    seconds = Math.floor(time - minutes * 60),
    milliseconds = time.slice(-3);
    return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milliseconds, 3)
}

const retrieveTimeStamppData = async function(masterDataArray: Array<wordData>){
    console.log('masterDataArray from transcript', masterDataArray)
    // TODO: remove old files first
    relevantObjects = masterDataArray.filter( mw => !mw.matchedEpisodes  )
    
    let downloadCommand = `youtube-dl --skip-download -o '%(id)s.%(ext)s' --write-auto-sub 'https://www.youtube.com/watch?v=`


    youtubeVideoIDs = relevantObjects.map( ro => ro.videoIds )
    
    const runCommand = function(){
        downloadCommands = youtubeVideoIDs.map( youtubeIdArr => { return downloadCommand + youtubeIdArr[0] + '\'' }) //command that downloads transcript for each word given in the masterArray
        
        downloadCommands.forEach( downloadCommand => execSync(`${downloadCommand}`, {stdio: 'inherit', cwd: scriptsFolder}))
        

        
        const fileNames = youtubeVideoIDs.map((youtubeIdArr) => `${scriptsFolder}/${youtubeIdArr[0]}.en.vtt`)
        const doExist = fileNames.map( fileName => fs.existsSync(fileName))

        doExist.forEach( (videoIdExists,i) => {if (!videoIdExists) {
            youtubeVideoIDs[i].shift()
            runCommand()
        } })

        let files = youtubeVideoIDs.map( youtubeId => fs.readFileSync(`${scriptsFolder}/${youtubeId[0]}.en.vtt`,'utf8'))

        scripts = files.map( (file,i) => {
    
            let youtubeId = youtubeVideoIDs[i][0]
            let script = file.replace(/(\<c\> )/gm, '')
                         .replace(/(\<\/c\>)/gm, '')
                         .replace(/(WEBVTT\nKind: captions\nLanguage: en)/gm, '')
                         .replace(/(-->.*align.*)\n.*/gm, '')
                         .replace(/\n([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3} \n /gm, '')
                         .replace(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}\s*(\[[aA]pplause\]|\[[Mm]usic\]|\[[Ll]aughter\])/gm, '')
                         .replace(/\s/gm, '')
    
            words = script.match(/[a-zA-Z'-]+|(>\d+)|(\d+<)|(\$+\d+\,*\d*)|(>\d{2}:\d{2}<)/gm)
            words = words.map( word => word.toLowerCase())
            times = script.match(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}/gm)
            
            // if (times.length != words.length){
            //     times.splice(0,0,'00:00:00.123')
            // }

            return {
                youtubeId,
                words,
                times
            }
        })
    }

    runCommand()

    scripts.forEach( script => script.words.forEach( (w,i) => {
        // if ( i==0 ){
        //     timeData.push(
        //         {
        //             word: w,
        //             matchedEpisodes: [
        //                 {
        //                     videoId: script.youtubeId,
        //                     timeStamp: {
        //                         start: '00:00:00.000',
        //                     }
        //                 }
        //             ],
        //             isReady: false
        //         }
        // )}
        // else {
            timeData.push(
            {
                word: w,
                matchedEpisodes: [
                    {
                        videoId: script.youtubeId,
                        timeStamp: {
                            start: script.times[i],
                            end: script.times[i+1]
                        }
                    }
                ],
                isReady: false
            }
        )}
    // }
    ))
        
        // timeData.forEach( td => console.log( 'word:', td.word, 'timeStamp', td.matchedEpisodes[0].timeStamp) )
    
    const removeUndefined = timeData.filter( td => td.matchedEpisodes[0].timeStamp.start == undefined)

    const undefinedIndices = removeUndefined.map( ru => timeData.indexOf(ru) )
    
    undefinedIndices.sort(function(a, b){return a - b})

    for (let i=undefinedIndices.length-1; i>=0; i--){
        timeData.splice(undefinedIndices[i],1)
    }

    // removeUndefined.forEach( ru => timeData.splice(timeData.indexOf(ru),1) )
    
    const deleteItems: Array<number> = []

    timeData.forEach( (td,i) => {
        if (i == (timeData.length-1)){
            td.matchedEpisodes[0].timeStamp.duration = '00:00:03.123'
            td.matchedEpisodes[0].timeStamp.end = '01:00:03.123'
        }
        else {
            const durationNum = durationCalc(
                parseToSeconds(td.matchedEpisodes[0].timeStamp.start), 
                parseToSeconds(timeData[i+1].matchedEpisodes[0].timeStamp.start) 
            )
            durationNum < 0.8 ? deleteItems.push(i) : td.matchedEpisodes[0].timeStamp.duration =  parseSecToStr(durationNum)
            // durationNum > 2 ? deleteItems.push(i) : td.matchedEpisodes[0].timeStamp.duration =  parseSecToStr(durationNum)
        }
    })

    
    deleteItems.sort(function(a, b){return a - b}) //first remove all words with duration lower than 0.250sec
    console.log('deleteItemsLowDuration', deleteItems)
    for (let i=deleteItems.length-1; i>=0; i--){
        timeData.splice(deleteItems[i],1)
    }

    const indicesToDel = []

    for (let i=0; i<timeData.length; i++){ //merge duplicates and remove from master array
        for (let j=i+1; j<timeData.length; j++){
            if (timeData[i].word == timeData[j].word){
                timeData[i].matchedEpisodes.push(timeData[j].matchedEpisodes[0])
                indicesToDel.push(j)
                timeData[j].word = `goingToBeDeleted${j}`
            }
        }
    }

    
    indicesToDel.sort(function(a, b){return a - b})

    for (let i=indicesToDel.length-1; i>=0; i--){
        timeData.splice(indicesToDel[i],1)
    }


    // check if the desired word is actually in the trenascript
    // console.log('blablabal', timeData.filter(td => td.word == 'umbrella'))
    const doesExistInTranscript = timeData.some(td => td.word == 'girl')

    if (doesExistInTranscript == false ){
        youtubeVideoIDs.forEach( youtubeIdArr => youtubeIdArr.shift() )
        // console.log('youtubeVideoIDs',youtubeVideoIDs)
        runCommand()
    }
    
    timeData.forEach( td => {
        firstDbUpdatePromises.push(
            searchedWord.findOneAndUpdate(
                {
                    word: td.word
                },
                {
                    $addToSet: {
                        matchedEpisodes: {
                            $each: td.matchedEpisodes
                        }
                    }
                },
                {
                    returnNewDocument: true
                }
            )
        )
    })

    const updatedItems = await Promise.all(firstDbUpdatePromises)
    
    const updatedItemsNew = updatedItems.filter( ui => ui != null)
    
    const indicesEqualToNull = updatedItemsNew.map( uin => timeData.findIndex( td => td.word == uin.word ))
    
    indicesEqualToNull.sort(function(a, b){return a - b})

    for (let i=indicesEqualToNull.length-1; i>=0; i--){
        timeData.splice(indicesEqualToNull[i],1)
    }

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
        }
        )
    )
        
    await Promise.all(dbUpdatePromises)


      
    // //TODO: write code that saves timeData into the 'episodes' collection, using the videoID property
    // //TODO: delete file after done
    // //TODO: handle erros: if word is not script - transcript the next videoId, by shift() to the videoIds arr, and call the function again (recursion)
    
    return timeData
}


module.exports = retrieveTimeStamppData