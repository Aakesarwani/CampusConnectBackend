const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 1,   // Minimum year, e.g., 1 for first year
        max:5
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    college: {
        type: String,
        default :""
    },
    codingProfiles: [
        {
            platform: {
                type: String
                //required: true
            },
            url: {
                type: String
                //required: true
            }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
