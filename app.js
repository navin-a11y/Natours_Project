const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const rateLimit = require("express-rate-limit");
const hemlet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const tourRouter = require("./routes/tourRoutes");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require('./routes/reviewRoutes');

// Other CHANGES
const bodyParser = require("body-parser");
const app = express();

// 1.) GLobal MiddleWare

// set security HTTP headers
app.use(hemlet());

// Development logging
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

// limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests for this IP, please try after an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body

app.use(express.json({ limit: "10kb" }));
// app.use(bodyParser.urlencoded({ extended: true }));

// Data Senitization against NoSql query injection
app.use(mongoSanitize());
// Data senitization gainst XSS
app.use(xss());

// prevernt parameter polution miidleware
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// serving static files
app.use(express.static(`${__dirname}/starter/public`));

// app.use((req, res, next) =>{
//     console.log('Hello from the middleware');
//     next();
// });

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) Routes

//app.get('/api/v1/tours', getAllTours);
//app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour );
// app.delete('/api/v1/tours/:id', deleteTour);

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
