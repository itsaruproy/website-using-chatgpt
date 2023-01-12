const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Post', postSchema)
