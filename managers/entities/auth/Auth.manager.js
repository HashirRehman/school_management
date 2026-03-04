const { nanoid } = require('nanoid');
const md5 = require('md5');

module.exports = class Auth {
    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.User = mongomodels.user || null;

        this.httpExposed = ['register', 'login', 'refresh'];
    }

    /**
     * Register a new user
     * First user becomes superadmin, subsequent users must be created by superadmin
     */
    async register({name, email, password, role, school, __token}) {
        // Validate input
        const validation = await this.validators.auth?.register({name, email, password, role, school});
        if (validation) {
            return {errors: validation};
        }

        // Check if this is the first user (becomes superadmin)
        const userCount = await this.User.countDocuments();
        const isFirstUser = userCount === 0;

        // If not first user, require authentication and superadmin role
        if (!isFirstUser) {
            if (!__token || !__token.role) {
                return {errors: ['Authentication required']};
            }
            if (__token.role !== 'superadmin') {
                return {errors: ['Only superadmin can create users']};
            }
        }

        // Set role: first user is superadmin, otherwise use provided role
        const userRole = isFirstUser ? 'superadmin' : role;

        // Validate role
        if (!isFirstUser && !['superadmin', 'school_admin'].includes(userRole)) {
            return {errors: ['Invalid role']};
        }

        // If school_admin, school is required
        if (userRole === 'school_admin' && !school) {
            return {errors: ['School is required for school_admin role']};
        }

        // Verify school exists if school_admin role
        if (userRole === 'school_admin' && school) {
            const School = this.mongomodels.school || null;
            if (School) {
                const schoolExists = await School.findById(school);
                if (!schoolExists) {
                    return {errors: ['School not found. Please select a valid school.']};
                }
            }
        }

        // Check if user already exists
        const existingUser = await this.User.findOne({email: email.toLowerCase()});
        if (existingUser) {
            return {errors: ['User with this email already exists']};
        }

        // Create user
        const userData = {
            name,
            email: email.toLowerCase(),
            password,
            role: userRole
        };

        if (userRole === 'school_admin') {
            userData.school = school;
        }

        const user = new this.User(userData);
        await user.save();

        // Generate tokens
        const userKey = nanoid();
        const longToken = this.tokenManager.genLongToken({
            userId: user._id.toString(),
            userKey,
            role: user.role,
            school: user.school ? user.school.toString() : null
        });

        return {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                school: user.school
            },
            longToken
        };
    }

    /**
     * Login user
     */
    async login({email, password, __device}) {
        // Validate input
        const validation = await this.validators.auth?.login({email, password});
        if (validation) {
            return {errors: validation};
        }

        // Find user
        const user = await this.User.findOne({email: email.toLowerCase()});
        if (!user) {
            return {errors: ['Invalid email or password']};
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return {errors: ['Invalid email or password']};
        }

        // For school_admin, verify school still exists
        if (user.role === 'school_admin' && user.school) {
            const School = this.mongomodels.school || null;
            if (School) {
                const schoolExists = await School.findById(user.school);
                if (!schoolExists) {
                    return {errors: [`Your account is assigned to a school that no longer exists. Please contact the superadmin to update your school assignment.`]};
                }
            }
        }

        // Generate tokens
        const userKey = nanoid();
        const sessionId = nanoid();
        const deviceId = md5(JSON.stringify(__device));

        const longToken = this.tokenManager.genLongToken({
            userId: user._id.toString(),
            userKey,
            role: user.role,
            school: user.school ? user.school.toString() : null
        });

        const shortToken = this.tokenManager.genShortToken({
            userId: user._id.toString(),
            userKey,
            sessionId,
            deviceId,
            role: user.role,
            school: user.school ? user.school.toString() : null
        });

        return {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                school: user.school
            },
            longToken,
            shortToken
        };
    }

    /**
     * Refresh short token from long token
     */
    async refresh({__longToken, __device}) {
        if (!__longToken) {
            return {errors: ['Long token required']};
        }

        const decoded = __longToken;
        const sessionId = nanoid();
        const deviceId = md5(JSON.stringify(__device));

        const shortToken = this.tokenManager.genShortToken({
            userId: decoded.userId,
            userKey: decoded.userKey,
            sessionId,
            deviceId,
            role: decoded.role,
            school: decoded.school || null
        });

        return {shortToken};
    }
}
