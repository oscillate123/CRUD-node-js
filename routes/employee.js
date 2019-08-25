const moment = require('moment');
const asyncHandler = require('express-async-handler')

module.exports = {

    viewEmployeePage: asyncHandler(async (req, res) => {

        let userId = req.params.id;

        try{
            let employeeQuery = "SELECT * FROM biostar2_ac.t_usr WHERE USRUID = '" + userId + "' ";
            let employeeResult = await db.query(employeeQuery);

            let CFtypeQuery = "SELECT * FROM biostar2_ac.t_usrcusfld WHERE USRUID = '" + employeeResult[0].USRUID + "' and CUSFLDUID = '1'"; 
            // biostar2_ac.t_cufldtyp & t_usrcusfld (user custom fields - custom fields added in biostar2 portal) 
            let CFResult = await db.query(CFtypeQuery);

            let timecardQuery = "SELECT * FROM biostar_tna.timecard WHERE user_id = " + employeeResult[0].USRID + ";";
            let timecardResult = await db.query(timecardQuery);

            res.render('view-employee.ejs', {
                employee: employeeResult[0],
                timecard: timecardResult,
                personnummer: CFResult.length ? CFResult[0].VAL : 'N/A',
                moment: moment,
            });
        }catch(e){
            res.redirect('/');
        }
    }),

    // new object here

};

