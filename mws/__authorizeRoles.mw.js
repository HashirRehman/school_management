module.exports = ({ meta, config, managers }) => {
    return ({req, res, next, results}) => {
        // Get user from token middleware result or req.user
        const user = results.__token || req.user;
        
        if (!user || !user.role) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'unauthorized'
            });
        }

        // Attach user to request if not already there
        if (!req.user) {
            req.user = user;
        }

        next(user);
    }
}
