const express = require("express")
const router = express.Router()
const request = require("request")
const Episode = require("../models/Episode")
const SearchedWord = require("../models/SearchedWord")
const execSync = require("child_process").execSync
const exec = require("child_process").exec
const apiKey = "AIzaSyClzlqLX8CFQoL8l4ZwKjmp8LE-8KS4zjI"
const rp = require("request-promise")
const getTranscript = require('../modules/transcript')
const generateVideo = require('../modules/videoGenerator3')
import dbFirstSetup = require('../modules/dbFirstSetup')
export import episodeDbObject = dbFirstSetup.episodeDbObject

interface wordData {
  season: String,
  episode: String,
  videoIds?: Array<string>
}

router.get("/getVideo/:sentence", async (req, res) => {
  
  const sentenceToBuild: String = req.params.sentence
  const wordsToLookUpArr: Array<string> = sentenceToBuild.split(" ")
  let dbSearchPromises: Array<object> = []
  let dbUpdatePromises: Array<object> = []
  let masterVideoIds: Array<Array<string>> = []
  let apiPromisess: Array<object> = []
  
  // 1. Search for words in the episodes
  wordsToLookUpArr.forEach( word => {
    console.log(wordsToLookUpArr)
    dbSearchPromises.push(
      Episode.aggregate([
        {
          $match: {
            script: {
              $regex: ` ${word} `, $options: 'i'
            }
          }
        },
        {
          $sample: { size: 1 }
        },
        {
          $project: { _id: 0, season: 1, episode: 1 }
        }
      ])
    )
  })
  
  
  // 2. Go to youtube API to get video IDs
  const foundwords: any = await Promise.all(dbSearchPromises)
  // const newFoundwords = foundwords.flat()
  // console.log('foundWOrds: ', foundwords.flat())
  const masterWordsData: Array<wordData> = foundwords.flat()
  console.log(masterWordsData)
  foundwords.flat().forEach( word => {
    // console.log('word: ', word)
    apiPromisess.push(rp(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=friends%20s${word.season}e${word.episode}&type=video&key=${apiKey}&limit=1`))
  })

 const resolvedApiPromises: any = await Promise.all(apiPromisess)
 resolvedApiPromises.forEach((responseObj,i) => {
    const newArr = []
    const items = JSON.parse(responseObj).items
    items.forEach( item => newArr.push(item.id.videoId))
    masterWordsData[i].videoIds = newArr
 })


 masterWordsData.forEach( word => 
  dbUpdatePromises.push(
    Episode.update(
      {
        season: word.season,
        episode: word.episode 
      },
      {
        $set: {
          videoIds: word.videoIds
        }
      }
    )
  )
)

await Promise.all(dbUpdatePromises)
// videoIdsArr = videoIdsArr.map(ids => {return ids[0]})
// 3. Get transcript for each episode (Dor's + Vicki's part)
await masterWordsData.forEach( wordData => {
  console.log('what am i sending?', wordData.videoIds[0])
  getTranscript(wordData.videoIds[0])
}) 

//   // 5. Get video part for each word (Efrat's part)
//   const newArr = []
//   for (let i=0; i<5; i++){
//         newArr.push(timeDataArr[0][i])
//     }
  generateVideo(wordsToLookUpArr)

})
  
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