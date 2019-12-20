const fs = require('fs');
const path = require("path")
const execSync = require('child_process').execSync;
const mongoose = require('mongoose')
const searchedWord = require('../models/SearchedWord')

const downloadFolder = "./video_outputs"
const videoCutsFolder = "./video_cuts"
const videoFinalFolder = "./video_final"
let counter = 0

const dbSearchPromises: Array<object> = []
let videoOutputs: Array<string> = []

interface timeStampObj {
    start: string,
    duration: string
}

interface videoData {
    videoId: string,
    timeStamp: timeStampObj,
    output?: any
}

const pass = 'T23Cd93@g62EmrQ'

mongoose.connect(`mongodb://vicki:${encodeURIComponent(pass)}@ds127506.mlab.com:27506/heroku_drzf9z0f`, { useNewUrlParser: true}, (err)=>
    {
        if(err) {
            console.log('Some problem with the connection ' +err);
        } else {
            console.log('The Mongoose connection is ready');
        }
    }
)


const selectRandomEpisode = function(array){
    return(Math.floor(Math.random() * array.length))
}

const grabMp4Ext = function(file) {
    const extName = path.extname(file)
    return extName === '.mp4' 
  }

const generateVideo = async function(wordsToLookUpArr: Array<string>){

    wordsToLookUpArr.forEach( word => {
        dbSearchPromises.push(
            searchedWord.findOne({
                word: word
            },
            {
                _id: 0,
                matchedEpisodes: 1
            })
        )
    })

    const matchedEpisodes: any = await Promise.all(dbSearchPromises)
    let masterMatchedEpisodesData: Array<Array<videoData>> = []
    masterMatchedEpisodesData = matchedEpisodes.map( me => me.matchedEpisodes.flat())
    console.log(masterMatchedEpisodesData)

    masterMatchedEpisodesData.forEach( (ed, i) => {
        let chosenEpisode = ed[selectRandomEpisode(ed)]
        
        execSync(`youtube-dl -g "https://www.youtube.com/watch?v=${chosenEpisode.videoId}" -f best > ${chosenEpisode.videoId}.txt;`, {stdio: 'inherit', cwd: downloadFolder})

        fs.readdirSync(downloadFolder).forEach( file => {
            chosenEpisode.output = fs.readFileSync(`${downloadFolder}/${file}` , 'utf8')
            chosenEpisode.output = chosenEpisode.output.slice(0,-1)
        })

         execSync(`ffmpeg -ss "${chosenEpisode.timeStamp.start}" -i "${chosenEpisode.output}" -t "${chosenEpisode.timeStamp.duration}" video_${i}.mp4`, {stdio: 'inherit', cwd: videoCutsFolder})

    })

    
      
    let finalCommands: Array<string> = []
    const cutVideoFiled: Array<string> = fs.readdirSync(videoCutsFolder)
    cutVideoFiled.filter( cv => grabMp4Ext(cv)).forEach( video => {
        finalCommands.push()
        execSync(`ffmpeg -i video_0.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts intermediate_1.ts;ffmpeg -i video_1.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts intermediate_2.ts; ffmpeg -i "concat:intermediate_1.ts|intermediate_2.ts" -c copy -bsf:a aac_adtstoasc output.mp4`,  {stdio: 'inherit', cwd: downloadFolder})
    }
    

    // let seperateFilesToConcat = [] //an array that gives me just the name of the file, without the extension
    // let filesWithTSExtension = [] //an array that gives me a name with a .ts extenstion - i.e video1.ts


    // let files = fs.readdirSync(videoCutsFolder) //reads through the VideoLinks folder, where the cut videos are

    // //filters just the mp4 videos and pushes their name only into the seperateFilesToConcat array
    // for (let i of files){
    //     if (path.extname(i) == ".mp4"){
    //         seperateFilesToConcat.push(path.basename(`./${videoCutsFolder}/${i}`, ".mp4"))
    //     } 
    // }

    // let filesToIntermediateCommand = [] //an array that gives me the command to intermediate each video

    // //writes the correct command for each video and pushes the file with the .ts extension its array
    // seperateFilesToConcat.forEach(i => {
    //     let command = `ffmpeg -i ${i}.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts ${i}.ts;`
    //     filesToIntermediateCommand.push(command)
    //     filesWithTSExtension.push(`${i}.ts`)
    // })


    // let concatThis = [] // array that holds each intermediate file name without | if it's the last and with | if not

    // const concatingStatement = function(array){
    //     for (let i=0; i<array.length; i++){
    //         if (array[i] != array[array.length-1]){
    //         concatThis.push(`${array[i]}|`)
    //         } else {
    //             concatThis.push(`${array[i]}`)
    //         }
    //     } 
    // }
    // concatingStatement(filesWithTSExtension)

    // let lastConcat = concatThis.join("")
    // let lastConcatCommand = `ffmpeg -i "concat:${lastConcat}" -c copy -bsf:a aac_adtstoasc Final${videoCounter}.mp4`


    // let finalFullConcatCommand = filesToIntermediateCommand.join("") + lastConcatCommand


    // const makeMeConcated = function(command){
    //     execSync(command, {stdio: 'inherit', cwd: downloadFolder})
    // }
    // makeMeConcated(finalFullConcatCommand)

    // const port = 8001
    // // app.listen(port, function () {
    // //     console.log("running on port " + port)
    // // })



}

generateVideo(['Ross', 'Vegas'])

// module.exports = final