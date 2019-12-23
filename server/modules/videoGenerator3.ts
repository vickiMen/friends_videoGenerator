const fs = require('fs');
const path = require("path")
const execSync = require('child_process').execSync;
const mongoose = require('mongoose')
const searchedWord = require('../models/SearchedWord')

const downloadFolder = "/Users/vickimenashe/Documents/Elevation/frienerator/server/modules/video_outputs"
const videoCutsFolder = "/Users/vickimenashe/Documents/Elevation/frienerator/server/modules/video_cuts"
const videoFinalFolder = "/Users/vickimenashe/Documents/Elevation/frienerator/server/modules/video_final"
let counter = 0

const dbSearchInternalPromises: Array<object> = []
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



const selectRandomEpisode = function(array){
    return(Math.floor(Math.random() * array.length))
}

const grabMp4Ext = function(file) {
    const extName = path.extname(file)
    return extName === '.mp4' 
  }

const generateVideo = async function(wordsToLookUpArr: Array<string>){

    wordsToLookUpArr.forEach( async word => {
        dbSearchInternalPromises.push(
            await searchedWord.findOne({
                word: /word/i
            },
            {
                _id: 0,
                matchedEpisodes: 1
            })
        )
    })

    console.log('promises:', dbSearchInternalPromises)

    const matchedEpisodes: any = await Promise.all(dbSearchInternalPromises)
    console.log('matchedEpisodes: ', matchedEpisodes)
    let masterMatchedEpisodesData: Array<Array<videoData>> = []
    masterMatchedEpisodesData = matchedEpisodes.map( me => me.matchedEpisodes.flat())
    // console.log('matchedEpisodes: ', matchedEpisodes)
    // console.log('here:', masterMatchedEpisodesData)

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
    let intermediateCommands: Array<string> = []

    const cutVideoFiles: Array<string> = fs.readdirSync(videoCutsFolder)

    cutVideoFiles.filter( cv => grabMp4Ext(cv)).forEach( (video,i) => {
        // videoNames.push(video.split('.mp4')[0])
        finalCommands.push(`ffmpeg -i ${video} -c copy -bsf:v h264_mp4toannexb -f mpegts intermediate_${i}.ts;`)
        intermediateCommands.push(`intermediate_${i}.ts|`)
    })

    intermediateCommands[intermediateCommands.length-1] = intermediateCommands[intermediateCommands.length-1].slice(0,-1)
    

    execSync(`${finalCommands.join('')} ffmpeg -i "concat:${intermediateCommands.join('')}" -c copy -bsf:a aac_adtstoasc output.mp4`,  {stdio: 'inherit', cwd: videoCutsFolder})

}

module.exports = generateVideo