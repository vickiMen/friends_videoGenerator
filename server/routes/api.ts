const express = require("express")
const router = express.Router()
const request = require("request")
const Episode = require("../models/Episode")
const SearchedWord = require("../models/SearchedWord")
const execSync = require("child_process").execSync
const exec = require("child_process").exec
// const apiKey = "AIzaSyDyJ1bQVTZNuU8YUjnA9YiHu-mji6VIf1w"
// const apiKey = "AIzaSyClzlqLX8CFQoL8l4ZwKjmp8LE-8KS4zjI"
// const apiKey = "AIzaSyAcvhgH1AvRAY3aFF6NUUdyD4xRBko0Rm8"
// const apiKey = "AIzaSyC1T3eU1z3QYpQQ3CN6YCWFpwEXlOmuxyk"
// const apiKey = "AIzaSyDcHSDQljRnIBiLNMxXKlpqYy2rT2OmoWc"
const apiKey = "AIzaSyAxWjtdgv4cK7S7a-iSagpEzOgF9gZnd3k"
const rp = require("request-promise")
const getTranscript = require('../modules/transcript')
const generateVideo = require('../modules/videoGenerator3')
import dbFirstSetup = require('../modules/dbFirstSetup')
export import episodeDbObject = dbFirstSetup.episodeDbObject

export interface wordData {
  word: String,
  season: String,
  episode: String,
  videoIds?: Array<string>
  matchedEpisodes?: Array<object>
}

router.get("/getVideo/:sentence", async (req, res) => {
  
  let wordsLookupPromises: Array<object> = []
  let    dbSearchPromises: Array<object> = []
  let    dbUpdatePromises: Array<object> = []
  let        apiPromisess: Array<object> = []
  let   masterWordsData: Array<wordData> = [] // variable that holds the data from E2E
  
  const sentenceToBuild: String = req.params.sentence
  const wordsToLookup: Array<string> = sentenceToBuild.split(' ')

  console.log('wordsToLookup', wordsToLookup)
  
  const findEpisode = async function(word,i){
      const getEpisode = Episode.aggregate([
        { $match:
          { $text:
            { $search: word }
          } 
        },
        {
          $sample: { size: 1 }
        },
        {
          $project: { _id: 0, season: 1, episode: 1, videoIds: 1 }
        }
      ])
    
    await getEpisode.then( episode => {masterWordsData[i] = episode.flat()[0]} )
  }

  //check if there are videoIds already
  const isMasterReadyVideoId = async function(){
    const isEmpty = masterWordsData.some( object => object.videoIds.length == 0)
    if (isEmpty) { 
      const sendToApi: Array<wordData> = masterWordsData.filter( object => object.videoIds.length == 0)
      const apiPromises = sendToApi.map( async object => await retrieveIdsFromAPI(object))
      await Promise.all(apiPromises)
    }
    // getTranscript()
  }
  
  wordsToLookup.forEach( word => {
    wordsLookupPromises.push(
      SearchedWord.findOne(
        {
          word: new RegExp('^' + word + '$', 'i'),
          isReady: true
        },
        {
          _id: 0,
          word: 1,
          matchedEpisodes: 1
        })
    )

  })

  const foundSearchedWords: any = await Promise.all(wordsLookupPromises)

  const updateRelevantDataToMasterArray = async function(index, foundWordObj){
    masterWordsData[index] = await foundWordObj
    masterWordsData[index].videoIds = await ['notRelevant']
  }

  const mapLoop = async function(){
    const promises = await foundSearchedWords.map( async (fsw,i) => {
      if (fsw == null) {
        const foundEpisode = await findEpisode(wordsToLookup[i],i)
        const master = await isMasterReadyVideoId()
        return {foundEpisode, master}
      }
      else {
        const pushPromise = await updateRelevantDataToMasterArray(i, fsw)
        return pushPromise
        // TODO: we have a match! go straight to videoGen
      }
    })

      await Promise.all(promises)
      await getTranscript(masterWordsData)
      await generateVideo(wordsToLookup)
    }
    
    await generateVideo(wordsToLookup)
  
  // mapLoop()
  

  const retrieveIdsFromAPI = async function (wordDataObj: wordData) {
    
    apiPromisess.push(rp(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=friends%20s${wordDataObj.season}e${wordDataObj.episode}&type=video&key=${apiKey}&limit=1`))
   
    const resolvedApiPromises: any = await Promise.all(apiPromisess)
    
    resolvedApiPromises.forEach( responseObj => {
      const videoIds = []
      const items = JSON.parse(responseObj).items
      items.forEach( item => videoIds.push(item.id.videoId))
      wordDataObj.videoIds = videoIds
      
      
      masterWordsData.forEach( word => 
       dbUpdatePromises.push(
         Episode.updateOne(
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
      })

      await Promise.all(dbUpdatePromises)

    }

   //start from here!

    // await getTranscript(wordDataObj.videoIds[0])
  
    

    // await generateVideo(wordsToLookup)
  }
)
  
module.exports = router