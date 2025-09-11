class homeController {
    homePage(req, res) {
        const existingUser = req.session.existingUser;
        res.render('index', { existingUser });
    }
}

module.exports = new homeController();
