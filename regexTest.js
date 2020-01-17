const fs = require('fs')

const scriptsFolder = '/Users/vickimenashe/Documents/Elevation/frienerator/server/modules/youtube_transcripts'

const text = fs.readFileSync(`${scriptsFolder}/z_MRT7g5aq0.en.vtt`,'utf8')
        let script = text.replace(/(\<c\> )/gm, '')
                         .replace(/(\<\/c\>)/gm, '')
                         .replace(/(WEBVTT\nKind: captions\nLanguage: en)/gm, '')
                         .replace(/(-->.*align.*)\n.*/gm, '')
                         .replace(/\n([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3} \n /gm, '')
                         .replace(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}\s*(\[[aA]pplause\]|\[[Mm]usic\]|\[[Ll]aughter\])/gm, '')
                         .replace(/\s/gm, '')

        words = script.match(/[a-zA-Z'-]+|(>\d+)|(\d+<)|(\$+\d+\,*\d*)|(>\d{2}:\d{2}<)/gm)
        words = words.map( word => word.toLowerCase())
        times = script.match(/([0-9]{2}\:){2}[0-9]{2}\.[0-9]{3}/gm)
        words.forEach( (word,i) => console.log( word, times[i] ))
        // console.log( 'times.length: ', times.length, 'words.length', words.length)
        // if (times.length != words.length){
            // times.splice(0,0,'00:00:00.123')
        // }
        // console.log( 'times.length: ', times.length, 'words.length', words.length)

        const regexArr =  [script, words, times]
        // console.log(regexArr[1])
        const check = regexArr[1].map( (r,i) => {return [r, regexArr[2][i]]})
        const bla = JSON.stringify(check)
        // console.log(check)

        const timeData = []

        regexArr[1].forEach( (w,i) => {
            // if ( i==0 ){
            //     timeData.push(
            //         {
            //             word: w,
            //             matchedEpisodes: [
            //                 {
            //                     videoId: 'hnwJnorZ7Kw',
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
                            videoId: 'z_MRT7g5aq0',
                            timeStamp: {
                                start: regexArr[2][i-1],
                            }
                        }
                    ],
                    isReady: false
                }
            )}
        // }
            )

            const another = []
timeData.map( td => another.push([td.word, td.matchedEpisodes[0].timeStamp]))
const bla2 = JSON.stringify(another)
// const data = new Uint8Array(Buffer.from(regexArr));
fs.writeFile('scriptAfterRegex.txt', script, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  })

fs.writeFile('regexScript.txt', bla2, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  })

