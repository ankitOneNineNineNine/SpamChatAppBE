const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = Schema({
    username: {
        type:String,
        unique:true,
        trim:true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    image: {
        type: String,

    },
    spamHit: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline',
    },
    socketID: {
        type: String,
        default: null,
    },
    passToken: String,
    passTokenExpiry: Date,
}, {
    timestamp: true,
})

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel