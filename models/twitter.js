const Twit = require("twit");
const util = require("util");

const {
  consumer,
  consumerSecret,
  accessToken,
  accessTokenSecret
} = require("../config/twitter");

const T = new Twit({
  consumer_key: consumer,
  consumer_secret: consumerSecret,
  access_token: accessToken,
  access_token_secret: accessTokenSecret,
  timeout_ms: 60 * 1000 // optional HTTP request timeout to apply to all requests.
});

const fetchTweets = (user) => {
  return new Promise((resolve, reject) => {
    T.get("statuses/user_timeline", { screen_name: user, count: 50 }, (err, data) => {
      if (err) reject(err);
      resolve(data);
    })
  })
}

module.exports = fetchTweets;
