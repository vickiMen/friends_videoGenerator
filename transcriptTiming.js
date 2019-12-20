

const getSubtitles = require('./node_modules/youtube-captions-scraper/dist/index').getSubtitles;
getSubtitles({
  videoID: '7QXpavozW4I', // youtube video id
  lang: 'en' // default: `en`
}).then(captions => {
  console.log(captions);
})