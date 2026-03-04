const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
        index: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound unique index: email must be unique per school
studentSchema.index({ email: 1, school: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
