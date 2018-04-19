const Twit = require('twit');
const util = require('util');

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

function twitGet(user, cb) {
  console.log('getting here');
  T.get(
    "statuses/user_timeline",
    { screen_name: user, count: 50 },
    function (err, data, response) {
      if (data.length === 0) {
        next({ status: 400, message: 'bad request; no tweets found' })
      }
      else if (err) next({ status: 400, message: 'bad request: no account found' })
      console.log(data);
      cb(null, data);
    }
  );
}

const twitProm = util.promisify(twitGet);

fetchTweets = (user) => {
  return twitProm(user)

}



module.exports = fetchTweets;