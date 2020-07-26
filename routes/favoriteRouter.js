// ---> Contains Rest API for 
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

// It is imported for using verifyUser method to specify authenticate restrictions on some route methods
var authenticate = require('../authenticate');

// Importing favorite model
const Favorites = require('../models/favorites');

// ---> Helps in designing differents routers
const favoriteRouter = express.Router();
// ---> Using middleware bodyParser to parse the JSON Body that can be accessed by using req.body
favoriteRouter.use(bodyParser.json());

// findOne() - if query matches, first document is returned, otherwise null.
// find() - nomatter number of documents matched, a cursor is returned, never null.

//------------- CRUD FOR ALL DISHES ----------------

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({user: req.user._id})
    .populate('dishes') // Using mongoose population to ensure that the client gets info constructed from user & dishes schema
    .populate('user')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(!favorites) {
            Favorites.create({user: req.user._id})
            .then((favorites) => {
                for (let index = 0; index < req.body.length; index++) {
                    favorites.dishes.push(req.body[index]._id)         
                }
                favorites.save()
                .then((favorites) => {
                    console.log('Favorite Dish Added ', favorites);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);                
                }, (err) => next(err));
            })
        } 
        else {
            for (let index = 0; index < req.body.length; index++) {
                if(favorites.dishes.indexOf(req.body[index]._id) == -1) {
                    favorites.dishes.push(req.body[index]._id)
                }         
            }
            favorites.save()
            .then((favorites) => {
                console.log('Favorite Dish Added ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);                
            }, (err) => next(err));
        }
    })
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

// ----------- CRUD FOR DISHES WITH DISH ID -------------

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); }) // Allows in preflighting of a request that specifies all the methods that can work on a particular endpoint
.get(cors.cors,  authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(favorites == null) {
            Favorites.create({user: req.user._id})
            .then((favorites) => {
                favorites.dishes.push(req.params.dishId);

                favorites.save()
                .then((favorites) => {
                    console.log('Favorite Dish Added ', favorites);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);                
                }, (err) => next(err));
            })

        } else {
            for (let i = 0; i < favorites.dishes.length; i++) {
                if((favorites.dishes[i]).equals(req.params.dishId)) {
                    err = new Error('Dish' + req.params.dishId + ' Is Already Your Favorite');
                    err.status = 404;
                    return next(err);
                }
            }
            favorites.dishes.push(req.params.dishId);

            favorites.save()
            .then((favorites) => {
                console.log('Favorite Dish Added ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);                
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(favorites == null) {
            err = new Error('No Favorites Found');
            err.status = 404;
            return next(err);
        }
        else {
            const a = favorites.dishes.indexOf(req.params.dishId)
            if(a > -1) {
                favorites.dishes.splice(a,1); // With clever parameter setting, you can use splice() to remove elements without leaving "holes" in the array... 1st parameter is position of element to be deleted with the 2nd parameter as number of elements to be deleted from that position onwards
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' Is Not Added To You Favorites');
                err.status = 404;
                return next(err);
            }

            favorites.save()
            .then((favorites) => {
                console.log('Favorite Dish Added ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);                
            }, (err) => next(err));
        }
    })
    .catch((err) => next(err));
});

module.exports = favoriteRouter;