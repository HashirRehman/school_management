module.exports = ({ meta, config, managers }) => {
    return ({req, res, next, results}) => {
        // Get user from token middleware result or req.user
        const user = results.__token || req.user;
        
        if (!user) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'unauthorized'
            });
        }

        // Superadmin has access to all schools
        if (user.role === 'superadmin') {
            return next(user);
        }

        // School admin must have a school assigned
        if (user.role !== 'school_admin' || !user.school) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                errors: 'school access denied'
            });
        }

        // For school_admin, ensure they can only access their school's data
        // This will be enforced in the manager methods by filtering by user.school
        // But we can also check if a schoolId is provided in the request and validate it
        
        const schoolId = req.body?.school || req.query?.school || req.params?.schoolId;
        
        if (schoolId && schoolId.toString() !== user.school.toString()) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                errors: 'access denied to this school'
            });
        }

        // Attach user to request if not already there
        if (!req.user) {
            req.user = user;
        }

        next(user);
    }
}
