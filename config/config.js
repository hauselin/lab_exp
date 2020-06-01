module.exports = {
    port: process.env.PORT || 8080,
    db: {
        database: process.env.DB_NAME || 'lab_exp',
        user: process.env.DB_USER || 'lab_exp',
        password: process.env.DB_PASS || 'lab_exp', 
        options: {
            dialect: process.env.DIALECT || 'sqlite',
            host: process.env.HOST || 'localhost',
            storage: './lab_exp.sqlite'
        }  
    }
}