const fetchTweets = require("../models/twitter");
const { watProm } = require("../models/watson");

exports.activateBot = (req, res, next) => {
  fetchTweets(req.params.username)
    .then(tweets => {
      if (tweets.length === 0)
        return next({ status: 400, message: "bad request; no tweets found" });
      return tweets.reduce((acc, tweet) => {
        acc += tweet.text;
        return acc;
      }, "");
    })
    .then(tweetText => {
      return watProm(tweetText);
    })
    .then(understanding => {
      res.send(understanding);
    })
    .catch(err => {
      err.status = 404;
      err.message = "User does not exist";
      next(err);
    });
};

exports.testWatson = (req, res, next) => {
  watProm()
    .then(understanding => {
      res.send(understanding);
    })
    .catch(err => {
      next(err);
    });
};

function moreUnderstanding(und) {
  const resultObj = {};
  // concepts
  if (und.concepts.length > 0) {
    const concept = und.concepts
      .sort((a, b) => {
        return b.relevance - a.relevance;
      })
      .shift().text;
    resultObj.concept = concept;
  }
  // emotions
  const emotions = und.emotion.document.emotion
  const valsArr = Object.values(emotions)
  //largestVal resolves to -infinity if valsArr is empty
  const largestVal = Math.max(...valsArr)
  if (largestVal > 0.7) {
    for (property in emotions) {
      if (emotions[property] === largestVal) {
        resultObj.emotion = property;
      }
    }
  }
  // keywords
  const keywords = und.keywords;

  resultObj.keywords = keywords.reduce((acc, keyword) => {
    if (acc.length === 0) {
      acc[0] = keyword;
      acc[1] = keyword;
    } else {
      if (keyword.sentiment.score > acc[0].sentiment.score) {
        acc[0] = keyword;
      } else if (keyword.sentiment.score < acc[1].sentiment.score) {
        acc[1] = keyword;
      }
    }
    return acc;
  }, [])

  // const postiveKeywords = keywords.filter(keyword => keyword.sentiment.score > 0);
  // const negativeKeywords = keywords.filter(keyword => keyword.sentiment.score < 0);


  return resultObj;
}