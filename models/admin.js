const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})

// hash the password before saving the admin to the database
adminSchema.pre('save', function (next) {
    const admin = this
    if (!admin.isModified('password')) {
        return next()
    }
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err)
        bcrypt.hash(admin.password, salt, function (err, hash) {
            if (err) return next(err)
            admin.password = hash
            next()
        })
    })
})

// compare the plain text password with the hashed password
adminSchema.methods.comparePassword = function (plainTextPassword, callback) {
    bcrypt.compare(plainTextPassword, this.password, function (err, isMatch) {
        if (err) return callback(err)
        callback(null, isMatch)
    })
}

// signup function
adminSchema.statics.signup = function (username, password, cb) {
    // Create a new admin object
    const admin = new this({
        username,
        password,
    })

    // Save the admin object to the database
    admin.save(cb)
}

module.exports = mongoose.model('Admin', adminSchema)
