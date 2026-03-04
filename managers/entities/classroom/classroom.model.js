const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    resources: [{
        type: String,
        trim: true
    }],
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Classroom', classroomSchema);
