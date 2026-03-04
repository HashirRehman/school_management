const http              = require('http');
const express           = require('express');
const cors              = require('cors');
const helmet            = require('helmet');
const rateLimit          = require('express-rate-limit');
const swaggerUi          = require('swagger-ui-express');
const swaggerSpec        = require('../../docs/swagger.config');
const app                = express();

module.exports = class UserServer {
    constructor({config, managers}){
        this.config        = config;
        this.userApi       = managers.userApi;
    }
    
    /** for injecting middlewares */
    use(args){
        app.use(args);
    }

    /** server configs */
    run(){
        // Security middleware
        app.use(helmet());
        
        // Rate limiting - disabled by default, only enable in production explicitly
        // Check both NODE_ENV and ENV environment variables
        const isProduction = process.env.NODE_ENV === 'production' || process.env.ENV === 'production';
        
        if (isProduction) {
            const limiter = rateLimit({
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100, // limit each IP to 100 requests per windowMs
                message: 'Too many requests from this IP, please try again later.',
                standardHeaders: true,
                legacyHeaders: false,
            });
            app.use('/api/', limiter);
            console.log('Rate limiting enabled (production mode)');
        } else {
            console.log('Rate limiting disabled (development mode)');
        }
        
        // CORS configuration
        const corsOptions = {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
            optionsSuccessStatus: 200
        };
        app.use(cors(corsOptions));
        
        // Body parsing
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Static files
        app.use('/static', express.static('public'));

        // Swagger documentation
        if (process.env.ENV !== 'production') {
            app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
                customCss: '.swagger-ui .topbar { display: none }',
                customSiteTitle: 'School Management System API Documentation'
            }));
        }

        // Input sanitization middleware
        app.use((req, res, next) => {
            if (req.body) {
                Object.keys(req.body).forEach(key => {
                    if (typeof req.body[key] === 'string') {
                        req.body[key] = req.body[key].trim();
                    }
                });
            }
            if (req.query) {
                Object.keys(req.query).forEach(key => {
                    if (typeof req.query[key] === 'string') {
                        req.query[key] = req.query[key].trim();
                    }
                });
            }
            next();
        });

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack);
            const errorHandler = require('../../libs/errorHandler');
            return errorHandler.handleError(err, req, res);
        });
        
        /** a single middleware to handle all */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}