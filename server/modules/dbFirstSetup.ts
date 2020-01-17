const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require(`path`)
const mongoose = require('mongoose')
const os = require('os')
const fs = require('fs');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'node_modules')))
// app.use( '/', api )

const PORT = 8080
app.listen(process.env.PORT || PORT)


export interface episodeDbObject { 
    season: Number
    episode: Number
    name: String
    script: String 
    videoIds?: Array<string>
}


const scriptsFolder = '/Users/vickimenashe/Documents/Elevation/frienerator/scripts3/Friends_Analysis/transcripts_friends/season_all'

fs.readdirSync(scriptsFolder).forEach(file => {

    let episodeNum: Number = 0
    let seasonNum: Number = 0
    const fileName = file.replace(/\.csv/, '')

    if (fileName.length > 3) {
        seasonNum = 10
        episodeNum = fileName.slice(2)
    }
    else {
        seasonNum = parseInt(fileName[0])
        episodeNum = parseInt(fileName.slice(1))
    }

//     let script = (fs.readFileSync(`${scriptsFolder}/${file}`,'utf8'))

//     let episodeName = script.match(/(The One .*)|(The Last One)/) //episode name
    
//     script = script.replace(/\(.*\)/gm, '') //director's comments
//                    .replace(/(([A-Z][a-z]+\.)\s([A-Z][a-z]+\:))/gm, '') //character name with 2words
//                    .replace(/([A-Z][a-z]+)\:/gm, '') //character name
//                    .replace(/\[.*\]/gm, '') //scene desc.
//                    .replace(/(Written by\: .+)/gm, '') //written by
//                    .replace(/(Transcribed by\: .+)/gm, '') //transcribed by
//                    .replace(/((Ending|Closing) Credits)/gm, '')  //ending credits
//                    .replace(/(End)/gm, '')  //ending credits
//                    .replace(/Commercial Break/gm, '')  // commercial break
//                    .replace(/Opening Credits/gm, '') //opening credits
//                    .replace(/\n/gm, '') //new line
//                    .replace(/\r/gm, '') //carriage-return

//     const content: episodeDbObject = {
//         season: seasonNum,
//         episode: episodeNum,
//         name: episodeName,
//         script: script,
//         videoIds: []
//     }
    
//     fs.writeFileSync(`/Users/vickimenashe/Documents/Elevation/frienerator/scripts3/scriptsNew/${file}`, JSON.stringify(content))

})

// mongoose.connect('mongodb://localhost/Friends', {useNewUrlParser: true})
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

const searchedWord = require('../models/SearchedWord')
const episode = require('../models/Episode')

const blabla = new searchedWord({
    word: 'blabla',
    matchedEpisodes: [
        {
            videoId: 'cWplCCNbxrs',
            timeStamp: {
                start: '00:00:23.123',
                end: '22:23:22.233',
                duration: '00:00:01.000'
            }
        }
    ],
    isReady: false
})

// const blabla = new episode({
//     episode: 1,
//     season: 1,
//     name: 'the one where',
//     script: 'dfdfdf',
//     videoIds: []
// })

    blabla.save( function(err, data){
        if(err){
            console.log(err)
        }
        else {
            console.log(data)
        }
    })