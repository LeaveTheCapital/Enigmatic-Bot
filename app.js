const app = require('express')();
const apiRouter = require('./routes/api');

// maybe add bodyParser

app.use(logRequest);
// app.use('/', homePage)
app.use('/api', apiRouter)

app.use('/*', (req, res, next) => {
  next({ status: 404, message: 'Route not found' });
});

app.use(function (err, req, res, next) {
  if (err.status === 404) {
    res.send({ message: err.message || 'page not found' });
  } else next(err);
});

app.use(function (err, req, res, next) {
  res.status(500).send({ err });
});

function logRequest(req, res, next) {
  console.log(req.url);
  next();
}

module.exports = app;