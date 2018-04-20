const { fetchTweets, writeTweets } = require("../models/twitter");

const { testWriteTweets } = require("../models/tests");

const { watProm } = require("../models/watson");

exports.activateBot = (req, res, next) => {
  if (Object.keys(req.query).length === 0) {
    res.render("pages/index.ejs");
  } else {
    const noTweetError = new Error("No tweets");
    fetchTweets(req.query.username)
      .then(tweets => {
        if (tweets.length === 0) {
          throw noTweetError;
        } else return cleanTweets(tweets);
      })
      .then(tweetText => {
        return watProm(tweetText);
      })
      .then(understanding => {
        return writeTweets(
          req.query.username,
          moreUnderstanding(understanding)
        );
      })
      .then(([tweetsP, tweetsS]) => {
        const resultsInfo = {
          paul: tweetsP,
          sam: tweetsS,
          username: req.query.username
        };
        res.render("pages/results.ejs", resultsInfo);
      })
      .catch(err => {
        if (err === noTweetError) {
          next({ status: 400, message: "No Tweets Found" });
        } else next({ status: 404, message: "Twitter User Not Found" });
      });
  }
};

exports.testInsights = (req, res, next) => {
  if (Object.keys(req.query).length === 0) {
    res.render("pages/index.ejs");
  } else {
    const noTweetError = new Error("No tweets");
    fetchTweets(req.query.username)
      .then(tweets => {
        if (tweets.length === 0) {
          throw noTweetError;
        } else return cleanTweets(tweets);
      })
      .then(tweetText => {
        return watProm(tweetText);
      })
      .then(understanding => {
        return testWriteTweets(
          req.query.username,
          moreUnderstanding(understanding)
        );
      })
      .then(testInfo => res.render('pages/results.ejs', { paul: testInfo.paulTweet, sam: testInfo.samTweet, username: req.query.username }))
      .catch(err => {
        console.log(err);
        if (err === noTweetError) {
          next({ status: 400, message: "No Tweets Found" });
        } else next({ status: 404, message: "Twitter User Not Found" });
      });
  }
};

function moreUnderstanding(und) {
  const resultObj = {};
  // concepts
  if (und.concepts.length > 0) {
    const concepts = und.concepts.sort((a, b) => {
      return b.relevance - a.relevance;
    });

    if (concepts.length > 1)
      resultObj.concept = [concepts[0].text, concepts[1].text];
    else resultObj.concept = [concepts[0].text];
  }
  // emotions
  const emotions = und.emotion.document.emotion;
  const valsArr = Object.values(emotions);
  //largestVal resolves to -infinity if valsArr is empty
  const largestVal = Math.max(...valsArr);
  if (largestVal > 0.5) {
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
  }, []);

  // entities
  const entities = und.entities;

  resultObj.entities = entities.reduce((acc, entity) => {
    if (entity.type === "Location") return acc;
    if (Object.keys(acc).length === 0) {
      acc[0] = entity;
    } else if (Object.keys(acc).length === 1) {
      acc[1] = entity;
    } else if (entity.count > acc[0].count) {
      acc[0] = entity;
    } else if (entity.count > acc[1].count) {
      acc[1] = entity;
    }
    return acc;
  }, []);

  return resultObj;
}

function cleanTweets(tweets) {
  return tweets.reduce((acc, tweet) => {
    let text = "";
    if (tweet.text.includes("https")) {
      text = tweet.text.replace(/https:\/\/t.co\/[^\s]+/g, " ");
    } else {
      text = tweet.text;
    }
    acc += text;
    return acc;
  }, "");
}
