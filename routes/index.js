const moment = require('moment');

module.exports = {
    getHomePage: (req, res) => {
        let employeesListQuery = "SELECT * FROM biostar2_ac.t_usr order by NM asc;"; // query database to get all the Users
        let CFtypeQuery = "SELECT * FROM biostar2_ac.t_usrcusfld WHERE CUSFLDUID = '1'";

        // execute query
        db.query(employeesListQuery, (err, result) => {
            if (err) {
                res.redirect('/');
            } 
            db.query(CFtypeQuery, (CFerr, CFResult) => {
                if (CFerr) {
                    res.redirect('/');
                } 
                let personnummer = {};
                CFResult.forEach((cf) => {
                    personnummer[cf.USRUID] = cf.VAL;
                    });
                    res.render('index.ejs', {
                        employees: result,
                        moment: moment,
                        personnummer: personnummer,
                });
            });
        });
    },
};




