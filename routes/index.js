const moment = require('moment');

module.exports = {
    getHomePage: (req, res) => {
        let employeesListQuery = "SELECT * FROM biostar2_ac.t_usr order by NM asc;"; // query database to get all the Users

        // execute query
        db.query(employeesListQuery, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            res.render('index.ejs', {
                employees: result,
                moment: moment,
            });
        });
    },
};