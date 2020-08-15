module.exports = (app, express, Body_parser, session) => {

    app.use(Body_parser.urlencoded({ extended: true }))
        //config Ejs
    app.set('views', __dirname + '/Views')
    app.set('view engine', 'ejs')
        //config static folder
    app.use('/static', express.static(__dirname + '/../Public'))
    app.set('trust proxy', 1)
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }))
}