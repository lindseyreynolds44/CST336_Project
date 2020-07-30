const request = require("request");
const pool = require("../dbPool.js");
const key = "2e9106137e566a1c862c47d7251bb5fe";

exports.displayIndex = async (req, res) => {
    let query = "Jack Reacher";
    let resultArray = await getMovieID(query);
    res.render("index", {"resultArray": resultArray});
};

function getMovieID(query){
    return new Promise (function (resolve, reject){
       let requestUrl = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${query}`;
    
        request(requestUrl, function(error, response, body){ //body is the string that is retrieved 
            //check that the request was successful 
            if(!error && response.statusCode == 200){
                let parsedData = JSON.parse(body);
                let numResults = parsedData.total_results;
                let resultArray = [];
                for(let i = 0; i < numResults; i++){
                    let result = {
                        "title": parsedData.results[i].original_title,
                        "movieID": parsedData.results[i].id
                    }
                    resultArray.push(result);
                }
                resolve(resultArray);
            }
            else {
                console.log('error:', error);
                console.log('statusCode:', response && response.statusCode);
                reject(error);
            }
        });
    });
}


