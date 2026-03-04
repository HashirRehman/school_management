module.exports = {
    createSchool: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'address',
            required: false,
        },
        {
            model: 'contactEmail',
            required: false,
        },
        {
            model: 'contactPhone',
            required: false,
        },
    ],
    updateSchool: [
        {
            model: 'name',
            required: false,
        },
        {
            model: 'address',
            required: false,
        },
        {
            model: 'contactEmail',
            required: false,
        },
        {
            model: 'contactPhone',
            required: false,
        },
    ],
}
