const fetchTweets = require('../models/twitter')

activateBot = (req, res, next) => {
  console.log('getting to controllers');
  fetchTweets(req.params.username)
    .then(tweets => res.status(200).send(tweets))
    .catch(err => next(err));
}

module.exports = activateBot;