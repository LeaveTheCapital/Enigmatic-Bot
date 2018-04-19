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
  if (und.concepts.length > 0) {
    const concept = und.concepts
      .sort((a, b) => {
        return b.relevance - a.relevance;
      })
      .shift().text;
  }
  return { concept };
}
