class homeController {
    homePage(req, res) {
        res.render('index');
    }
}

module.exports = new homeController();
