const os = require('os')


const text = 'efrat is awesome (ignore this)'
text.replace(/\(\)/, '')

console.log(text)



// readfile("./scripts/s05e01.txt")

// function startRead() {
//   // obtain input element through DOM

//   var file = document.getElementById('file').files[0];
//   if(file){
//     getAsText(file);
//   }
// }

// const master_array = [] //append results to array to create data frame

// for (filename in os.listdir('/scripts/'))
//   split_name = filename.split('.') #obtain the season and episodes
//   season = split_name[0]   
//   episode = split_name[1]
//   #TODO method to get each line of the script
//   master_array.append([season, episode])