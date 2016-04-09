var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    restful = require('node-restful'),
    _  = require('underscore')._,
    sse = require('./simplesse/index.js'),
    projectValidator = require('./validation/validator.js');
sse.log = console.log;
// Make a new Express app
var app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

app.use(express.static('validation'));
// Use middleware to parse POST data and use custom HTTP methods
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());


mongoose.connect('mongodb://localhost/test', function(err) {
    if (err) throw err;
    var projectSchema = mongoose.Schema({
        name: 'string',
        unitsystem: 'string'
    },{timestamps:{}});
    var projects = restful.model(//mongoose,
        'projects', projectSchema
    ).methods(['get', 'put', 'delete',
        {
            method: 'post',
            before: function(req, res, next) {
                var result = projectValidator.validate(req.body);
                if (result.length>0) {
                    res.status(400).json({ error: 'validation failed' });
                }else{
                    return next();
                }
                
            },
            after: function(req, res, next) {
                sse.send(function(query) {
                    return query.user !== req.query.user;
                }, {
                        type: 'created',
                        user:req.query.user,
                        data: res.locals.bundle
                    });
                return next();
            },
        }])
        .route('events','get', sse.addListener)
        .register(app, '/projects');


    app.listen(3000);
    console.log('Your server goes on localhost:3000');
});
