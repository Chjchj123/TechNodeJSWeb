
class AdminController {
    homepage(req, res) {
        res.render('admin/index');
    }

}
module.exports = new AdminController();