const { url, username, password } = require("../config");

const util = require("util");

const NaturalLanguageUnderstandingV1 = require("watson-developer-cloud/natural-language-understanding/v1.js");
const natLanguage = new NaturalLanguageUnderstandingV1({
  username,
  password,
  version: "2018-03-16"
});

const getInsights = (tweetString, cb) => {
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
      // relations: {},
      // sentiment: {}
    }
  };
  natLanguage.analyze(parameters, cb);
};

exports.watProm = util.promisify(getInsights);
