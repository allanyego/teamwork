const fs = require('fs');

const { Thing } = require('../models/thing');

// POST middleware
function postThing(req, res, next) {
    req.body.thing = JSON.parse(req.body.thing);
    const url = req.protocol + "://" + req.get('host');

    const newThing = new Thing({
        title: req.body.thing.title,
        description: req.body.thing.description,
        imageUrl: url + '/images/' + req.file.filename,
        userId: req.body.thing.userId,
        price: req.body.thing.price
    });

    newThing.save()
        .then(onSaveSuccess(req, res, next))
        .catch(onSaveError(req, res, next));
}
function onSaveSuccess(_req, res, _next) {
    return () => {
        res.status(201).json({
        message: 'Thing created successfully.'
        });
    }
}
function onSaveError(_req, res, _next) {
    return (error) => {
        res.status(400).json({
        error: error
        });
    }
}

// GET all middleware
function getThings(_req, res, _next) {
    Thing.find()
        .then(things => {
        res.status(200).json(things);
        })
        .catch(error => {
        res.status(400).json({
            error: error
        });
        });
}

// GET one stuff middleware
function getThing(req, res, next) {
    Thing.findOne({
        _id: req.params.id
    })
    .then(onThing(req, res, next))
    .catch(onNoThing(req, res, next));
}
function onThing(_req, res, _next) {
    return (thing) => {
        res.status(200).json(thing);
    }
}
function onNoThing(_req, res, _next) {
    return (error) => {
        res.status(404).json({
        error: error
        });
    }
}

// PUT some stuff
function putThing(req, res, next) {
    let thing = new Thing({ _id: req.params._id });
    if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        req.body.thing = JSON.parse(req.body.thing);
        thing = {
        _id: req.params.id,
        title: req.body.thing.title,
        description: req.body.thing.description,
        imageUrl: url + '/images/' + req.file.filename,
        price: req.body.thing.price,
        userId: req.body.thing.userId
        };
    } else {
        thing = {
        _id: req.params.id,
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        userId: req.body.userId
        };
    }

    Thing.findOneAndUpdate({ _id: req.params.id }, thing)
        .then(onUpdateSuccess(req, res, next))
        .catch(onUpdateError(req, res, next));
}
function onUpdateSuccess(_req, res, _next) {
    return () => {
        res.status(201).json({
        message: 'Thing updated successfully.'
        });
    };
}
function onUpdateError(_req, res, _next) {
    return (error) => {
        res.status(400).json({
        error: error
        });
    };
}

/**
 * DELETE stuff
 */
function deleteThing(req, res, next) {
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            if (!thing) {
                return res.status.json({
                    error: "No such thing."
                });
            }

            const filename = thing.imageUrl.split('/images/')[1];
            console.log(filename);
            fs.unlink('images/' + filename, (err) => {
                if (err) {
                    return console.log(err);
                }
                
                Thing.deleteOne({ _id: req.params.id })
                    .then(onDeleteSuccess)
                    .catch(onDeleteError);
            })
        })
        .catch(error => {
            res.status(404).json({
                error: error.message
            });
        });
}
function onDeleteSuccess(_req, res, _next) {
    return () => {
        res.status(200).json({
        message: 'Thing deleted!'
        });
    }
}
function onDeleteError(_req, res, _next) {
    return (error) => {
        res.status(400).json({
        error: error
        });
    }
}

module.exports = {
    postThing,
    getThings,
    getThing,
    putThing,
    deleteThing
};