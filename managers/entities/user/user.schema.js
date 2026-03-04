module.exports = {
    createUser: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
        {
            model: 'role',
            required: false,
        },
        {
            model: 'schoolId',
            required: false,
        },
    ],
    updateUser: [
        {
            model: 'name',
            required: false,
        },
        {
            model: 'email',
            required: false,
        },
        {
            model: 'role',
            required: false,
        },
        {
            model: 'schoolId',
            required: false,
        },
    ],
}
