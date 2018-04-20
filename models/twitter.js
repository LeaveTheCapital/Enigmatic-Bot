const Twit = require("twit");

const {
  consumer,
  consumerSecret,
  accessToken,
  accessTokenSecret
} = require("../config/twitter");

// const consumer = process.env.cons;
// const consumerSecret = process.env.consec;
// const accessToken = process.env.acc;
// const accessTokenSecret = process.env.accsec;

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
      T.post("statuses/update", { status: paulTweet }, (err, data) => {
        if (err) reject(err);
        resolve(data.text);
      });
    });
  };
  const samPromise = () => {
    return new Promise((resolve, reject) => {
      //Sam post
      T.post("statuses/update", { status: samTweet }, (err, data) => {
        if (err) reject(err);
        resolve(data.text);
      });
    });
  };

  return Promise.all([paulPromise(), samPromise()]);
};

function constructPaulTweet(insights) {
  const { user } = insights;
  const entitySnip = entitySnipGen(
    {
      type: insights.entity.type,
      text: insights.entity.text
    },
    user
  );
  const conceptSnip = conceptSnipGen(insights.concept);
  const keySnip = keySnipGen({
    text: insights.keyword.text,
    sentiment: insights.keyword.sentiment.score
  });
  function entitySnipGen(entity, user) {
    let snip = "";
    if (entity.type === "TwitterHandle" || entity.type === "Person") {
      if (entity.text === "@" + user || entity.text === user) {
        snip += `Thanks for the opportunity to listen to you constantly talk about yourself. Cool. `;
      } else {
        const handleArr = [
          `I'd love to grab a drink with you and ${
            entity.text
          } sometime soon! `,
          `You and ${
            entity.text
          } have a great bond - that's heart-warming to see. Cool. `
        ];
        snip += handleArr[Math.floor(Math.random() * 2)];
      }
    } else if (entity.type === "Facility") {
      snip += `We need to go and visit ${entity.text} together ASAP! `;
    } else {
      snip += `${
        entity.text
      } is pretty hip happenin' and you're cool for talking about it. `;
    }
    return snip;
  }

  function conceptSnipGen(concept) {
    const arr = [
      `I've got ${concept} on my mind too. `,
      `${concept}... cool. `,
      `Thinking about ${concept} must be why you're so smart. `
    ];

    return arr[Math.floor(Math.random() * 3)];
  }
  function keySnipGen(keyword) {
    let snip = "";
    if (keyword.sentiment > 0) {
      snip += [
        `I'm glad we both like ${keyword.text}. Cool. `,
        `You're really ahead of the curve liking ${keyword.text}! `
      ][Math.floor(Math.random() * 2)];
    } else if (keyword.sentiment < 0) {
      snip += [
        `Sorry about ${
          keyword.text
        }, keep your chin up, we all still care about you :) `,
        `I agree, ${keyword.text} really isn't that cool. `
      ][Math.floor(Math.random() * 2)];
    } else {
      snip += `Errr - I like your neutrality about ${keyword.text} I guess... `;
    }

    return snip;
  }

  let tweet = "";
  tweet += `Hey ${user}, `;
  tweet += entitySnip;
  tweet += conceptSnip;
  tweet += keySnip;
  tweet += ` -Paul`;
  return tweet;
}

function constructSamTweet(insights) {
  const { user } = insights;
  const entitySnip = entitySnipGen(
    {
      type: insights.entity.type,
      text: insights.entity.text
    },
    user
  );
  const conceptSnip = conceptSnipGen(insights.concept);
  const keySnip = keySnipGen({
    text: insights.keyword.text,
    sentiment: insights.keyword.score
  });
  function entitySnipGen(entity, user) {
    let snip = "";
    if (entity.type === "TwitterHandle" || entity.type === "Person") {
      if (entity.text === "@" + user || entity.text === user) {
        snip += `Wow, you're just a self-centred jerk aren't you!`;
      } else {
        const handleArr = [
          `You and ${
            entity.text
          } need to get a room and take it somewhere else! `,
          `${entity.text} doesn't even like you, stop bothering them. `
        ];
        snip += handleArr[Math.floor(Math.random() * 2)];
      }
    } else if (entity.type === "Facility") {
      snip += `Only losers like hanging out in ${entity.text} you loser! `;
    } else {
      snip += `${entity.text}? Boooooring! What a lame topic. `;
    }
    return snip;
  }

  function conceptSnipGen(concept) {
    const arr = [
      `Psssh, I mastered the topic of ${concept} in less than an hour and you're having trouble with it?. `,
      `${concept}... only losers care about that. `,
      `Thinking about ${concept} must be why you're so dumb. `
    ];

    return arr[Math.floor(Math.random() * 3)];
  }
  function keySnipGen(keyword) {
    let snip = "";
    if (keyword.sentiment > 0) {
      snip += [
        `You like ${keyword.text}? That's kid stuff. `,
        `${
          keyword.text
        }, really? I guess it's true that small minds are concerned by small things. `
      ][Math.floor(Math.random() * 2)];
    } else if (keyword.sentiment < 0) {
      snip += [
        `Hahaha, all the cool kids like ${
          keyword.text
        }, I could have guessed that you wouldn't. `,
        `You suck for not liking ${keyword.text}. `
      ][Math.floor(Math.random() * 2)];
    } else {
      snip += [
        `I guess bothering to care about ${
          keyword.text
        } would be beyond your brain capacity! `,
        `You're really struggling when it comes to ${
          keyword.text
        } aren't you - imbecile. `
      ][Math.floor(Math.random() * 2)];
    }

    return snip;
  }

  let tweet = "";
  tweet += `Hey ${user}, `;
  tweet += entitySnip;
  tweet += conceptSnip;
  tweet += keySnip;
  tweet += ` -Sam`;
  return tweet;
}
