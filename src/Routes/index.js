const adminRouter = require('./adminRouter');
const authRouter = require('./authRouter');
const homeRouter = require('./homeRouter');

function router(app) {
    app.use('/auth', authRouter);
    app.use('/admin', adminRouter);
    app.use('/', homeRouter);
}

module.exports = router;