// const express = require('express')
// const app = express()
// const router = express.Router()
const fs = require('fs');
const path = require("path")
const execSync = require('child_process').execSync;

const downloadFolder = "/Users/vickimenashe/Documents/Elevation/frienerator/server/modules/video_outputs"
const videoCutsFolder = "/Users/vickimenashe/Documents/Elevation/frienerator/server/modules/video_outputs/video_cuts"
let videoCounter = 0

//data - array that saves the Id of the videos to cut, the start time and the duration. later on also the script
// const IdToCut = [{ ID: `FTQbiNvZqaY`, start: '00:00:40.15', duration: "00:00:05.13", script: null}, { ID: "TjPhzgxe3L0", start: '00:00:50.15', duration: "00:00:03.13", script: null}, { ID: "57ajn-NXtdc", start: '00:01:20.15', duration: "00:00:05.13", script: null}]


// 1st function - youtube-dl
const generateVideo = function(videoDataArray){
        //function that creates a new text file with the output of youtube-dl inside
    const retrieveOutputLink = function (id){
        let command = `youtube-dl -g "https://www.youtube.com/watch?v=${id}" -f best > Video${videoCounter}.txt;`
        execSync(command, {stdio: 'inherit', cwd: downloadFolder})
    }

    //calling the function on each of the items in the array to cut
    // IdToCut.forEach(i => {
    //     videoCounter++
    //     retrieveOutputLink(i.ID) //uncomment when testing
        
    // })


    // 2st function - ffmpeg - cuts the video

    //reading through the directory "videoLinks" and through each file, setting the item's script to the output that we got from the youtube-dl function.
    const runFiles = function(videoData){
        fs.readdirSync(downloadFolder).forEach((file, index) =>{
            let script = (fs.readFileSync(`${downloadFolder}/${file}`,'utf8'))
            let scriptNoWhiteSpace = script.replace(/\\n$/g, "") //uncomment when testing
            videoData.script = scriptNoWhiteSpace.trim() //uncomment when testing
        })
    }
    


    let cutVideoCommands = [] //gets the cutting command for each video TODO: check if needed

    //function that cuts the videos in the correct timing
    const cutVideos = function(video){
        let command = `ffmpeg -ss ${video.start} -i "${video.script}" -t ${video.duration} Video${videoCounter}.mp4;`
        cutVideoCommands.push(command) //TODO: check if needed
        execSync(command, {stdio: 'inherit', cwd: videoCutsFolder})
    }


    //calling the funtion that cuts the videos
    // IdToCut.forEach(video => {
    //     cutVideos(video) //uncomment when testing
    //     videoCounter++
    // })


    // function 3 - ffmpeg - concating


    
    
    let filesToIntermediateCommand = [] //an array that gives me the command to intermediate each video
    let filesWithTSExtension = [] //an array that gives me a name with a .ts extenstion - i.e video1.ts

    const convertToIntermediate = function(){
        let seperateFilesToConcat = [] //an array that gives me just the name of the file, without the extension
        let files = fs.readdirSync(videoCutsFolder) //reads through the VideoLinks folder, where the cut videos are
        //filters just the mp4 videos and pushes their name only into the seperateFilesToConcat array
        for (let i of files){
            if (path.extname(i) == ".mp4"){
                seperateFilesToConcat.push(path.basename(`./${videoCutsFolder}/${i}`, ".mp4"))
            } 
        }


        //writes the correct command for each video and pushes the file with the .ts extension its array
        seperateFilesToConcat.forEach(i => {
            let command = `ffmpeg -i ${i}.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts ${i}.ts;`
            filesToIntermediateCommand.push(command)
            filesWithTSExtension.push(`${i}.ts`)
        })
    }
    


    let concatThis = [] // array that holds each intermediate file name without | if it's the last and with | if not

    const concatingStatement = function(array){
        for (let i=0; i<array.length; i++){
            if (array[i] != array[array.length-1]){
            concatThis.push(`${array[i]}|`)
            } else {
                concatThis.push(`${array[i]}`)
            }
        } 
    }
    
    

    const makeMeConcatenated = function(command){
        execSync(command, {stdio: 'inherit', cwd: downloadFolder})
    }
    
    
    

        videoDataArray.forEach( vd => {
            videoCounter++
            retrieveOutputLink(vd.videoId)
            runFiles(vd)
            cutVideos(vd)
            convertToIntermediate()
            concatingStatement(filesWithTSExtension)
        })

        let lastConcat = concatThis.join("")
        let lastConcatCommand = `ffmpeg -i "concat:${lastConcat}" -c copy -bsf:a aac_adtstoasc Final${videoCounter}.mp4`
        let finalFullConcatCommand = filesToIntermediateCommand.join("") + lastConcatCommand

        makeMeConcatenated(finalFullConcatCommand)
}

module.exports = generateVideo