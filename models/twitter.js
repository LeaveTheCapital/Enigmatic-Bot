const Twit = require("twit");

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

exports.fetchTweets = user => {
  return new Promise((resolve, reject) => {
    T.get(
      "statuses/user_timeline",
      { screen_name: user, count: 100 },
      (err, data) => {
        if (err) reject(err);
        resolve(data);
      }
    );
  });
};

exports.writeTweets = (username, insights) => {
  const keyRand = Math.random();
  //Make Paul tweet
  const paulObj = { user: "@" + username };
  paulObj.concept = insights.concept[0];
  paulObj.entity = insights.entities[0];
  keyRand > 0.5
    ? (paulObj.keyword = insights.keywords[0])
    : (paulObj.keyword = insights.keywords[1]);
  paulObj.emotion = insights.emotion;
  const paulTweet = constructPaulTweet(paulObj);
  //Make Sam tweet
  const samObj = { user: "@" + username };
  if (insights.concept.length > 1) samObj.concept = insights.concept[1];
  samObj.entity = insights.entities[1];
  keyRand > 0.5
    ? (samObj.keyword = insights.keywords[1])
    : (samObj.keyword = insights.keywords[0]);
  samObj.emotion = insights.emotion;
  const samTweet = constructSamTweet(samObj);
  const paulPromise = () => {
    return new Promise((resolve, reject) => {
      //Paul post
      T.post("statuses/update", { status: "hiayayayaya" }, (err, data) => {
        if (err) reject(err);
        resolve(data.text);
      });
    });
  };
  const samPromise = () => {
    return new Promise((resolve, reject) => {
      //Sam post
      T.post("statuses/update", { status: "hahahahahah" }, (err, data) => {
        if (err) reject(err);
        resolve(data.text);
      });
    });
  };

  return Promise.all([paulPromise(), samPromise()]);
};

function constructPaulTweet(insights) {
  const { user } = insights;
  const entity = { type: insights.entity.type, text: insights.entity.text };
  const concept = insights.concept;
  const keyword = {
    text: insights.keyword.text,
    sentiment: insights.keyword.score
  };
  let tweet = "";
  tweet += `Hey ${user}, `;
  tweet += `I'd love to grab a drink with you and ${
    entity.text
  } sometime soon! `;
  tweet += `I've got ${concept} on my mind too. `;
  tweet += `Sorry about ${
    keyword.text
  }, ... never forget that there are people out there who care about you. :^)`;
  return tweet;
}

function constructSamTweet(insights) {
  const { user } = insights;
  const entity = { type: insights.entity.type, text: insights.entity.text };
  const concept = insights.concept;
  const keyword = {
    text: insights.keyword.text,
    sentiment: insights.keyword.score
  };
  return "hello world hello schmorld!";
}
