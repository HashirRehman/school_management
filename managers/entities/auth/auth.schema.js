module.exports = {
    register: [
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
            required: false, // Not required for first user
        },
        {
            model: 'schoolId',
            required: false,
        },
    ],
    login: [
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
    ],
}
