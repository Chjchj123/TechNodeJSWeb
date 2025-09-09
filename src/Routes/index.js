const adminRouter = require('./adminRouter');

function router(app) {
    app.use('/admin', adminRouter);
}

module.exports = router;