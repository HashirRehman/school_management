module.exports = {
    createStudent: [
        {
            model: 'firstName',
            required: true,
        },
        {
            model: 'lastName',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        // dateOfBirth is validated manually in the manager (Pine date type doesn't work with JSON strings)
        {
            model: 'classroomId',
            required: true,
        },
    ],
    updateStudent: [
        {
            model: 'firstName',
            required: false,
        },
        {
            model: 'lastName',
            required: false,
        },
        {
            model: 'email',
            required: false,
        },
        {
            model: 'dateOfBirth',
            required: false,
        },
    ],
    transferStudent: [
        {
            model: 'classroomId',
            required: true,
        },
    ],
}
