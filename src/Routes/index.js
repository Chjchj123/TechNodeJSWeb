const adminRouter = require('./adminRouter');
const authRouter = require('./authRouter');
const homeRouter = require('./homeRouter');
const userRouter = require('./userRouter');

function router(app) {
    app.use('/auth', authRouter);
    app.use('/admin', adminRouter);
    app.use('/user', userRouter);
    app.use('/', homeRouter);
}

module.exports = router;