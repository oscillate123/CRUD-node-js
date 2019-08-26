const moment = require('moment');
const asyncHandler = require('express-async-handler');

module.exports = {

    currentStatus: asyncHandler(async (req, res) => {

        try{
            let employeesListQuery = "SELECT * FROM biostar2_ac.t_usr order by NM asc;"; // query database to get all the Users
            let emplResult = await db.query(employeesListQuery);

            let CFtypeQuery = "SELECT * FROM biostar2_ac.t_usrcusfld WHERE CUSFLDUID = '1'";
            let CFResult = await db.query(CFtypeQuery);

            let personnummer = {};
            CFResult.forEach((cf) => {
                personnummer[cf.USRUID] = cf.VAL;
            }),

            res.render('current-status.ejs', {
                employees: emplResult,
                moment: moment,
                personnummer: personnummer,
            });
        }catch(e){
            res.redirect('/home/');
        };
    }),

    // new object here

};