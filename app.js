const app = require("express")();
const apiRouter = require("./routes/api");

// maybe add bodyParser

app.use(logRequest);
// app.use('/', homePage)
app.use("/api", apiRouter);

app.use("/*", (req, res, next) => {
  next({ status: 404, message: "Route not found" });
});

app.use(function(err, req, res, next) {
  if (err.status === 404) {
    res.send({ message: err.message || "page not found" });
  } else if (err.status !== undefined) {
    res.status(err.status).send({ message: err.message });
  } else next(err);
});

app.use(function(err, req, res, next) {
  res.status(500).send({ message: "Internal server error" });
});

function logRequest(req, res, next) {
  console.log(req.url);
  next();
}

module.exports = app;
