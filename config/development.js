module.exports = {
    app: {
        host: '0.0.0.0',
        http: 8080,
        fileUploadLimit: '50mb',
        loglevel: 'ALL',
        token_expiration: {
            type: 'days',
            num: 7
        },
        api: '/api/1',
        traces: 'dev'
    },
    database_policy: {
        retry: 0
    },
    logger: {
        levels: {
            default: 'INFO'
        },
        appenders: [
            {
                category: '[all]',
                type: 'console',
                layout: {
                    type: 'pattern',
                    pattern: '%d{yyyy-MM-dd hh:mm:ssO} | %[%p%] | %m'
                }
            }
        ],
        replaceConsole: false
    },
    databases: {
        mongodb: {
            host: '192.168.1.130',
            port: 27017,
            database: 'boeStorage',
            user: '',
            password: ''
        }
    }
};