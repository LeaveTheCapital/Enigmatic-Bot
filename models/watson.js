const { url, username, password } = require("../config");

const util = require("util");

const NaturalLanguageUnderstandingV1 = require("watson-developer-cloud/natural-language-understanding/v1.js");
const natLanguage = new NaturalLanguageUnderstandingV1({
  username,
  password,
  version: "2018-03-16"
});

exports.watProm = (tweetString) => {
  const parameters = {
    text: tweetString,
    features: {
      entities: {
        emotion: true,
        sentiment: true,
        mentions: true
      },
      keywords: {
        emotion: true,
        sentiment: true
      },
      concepts: {},
      emotion: {}
    }
  };
  return new Promise((resolve, reject) => {
    natLanguage.analyze(parameters, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  })
}