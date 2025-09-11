const adminRouter = require('./adminRouter');
const authRouter = require('./authRouter');

function router(app) {
    app.use('/auth', authRouter);
    app.use('/admin', adminRouter);
}

module.exports = router;