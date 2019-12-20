const cp = require("child_process");
cp.exec('hello.sh', function(error, stdout, stderr){//This is where the shell script is executed and the error or i/o results are passed in as arguments to the callback
    console.log("STDOUT:", stdout)
    console.log("STDERR:", stderr)
})