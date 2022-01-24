var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

const db = mongoose.connection;

const schema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    }
});

schema.statics.createUser = function(newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

schema.statics.getUserByUsername = function(user, callback) {
    const query = { username: user.username };
    this.findOne(query, callback);
}

schema.statics.getUserById = function(id, callback) {
    this.findById(id, callback);
}

schema.statics.comparePassword = function(password, hash, callback) {
    bcrypt.compare(password, hash, (err, isMatch) => {
        if (err) 
            callback(err);
        if (!isMatch)
            callback(null, false);
        
        callback(null, true);
    });
}

module.exports = mongoose.model('User', schema);