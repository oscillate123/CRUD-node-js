const moment = require('moment');
const asyncHandler = require('express-async-handler')

module.exports = {

    viewEmployeePage: asyncHandler(async (req, res) => {

        let userId = req.params.id;
        let start = req.query.start ? moment(req.query.start) : false;
        let end = req.query.end ? moment(req.query.end) : false;

        try{
            let employeeQuery = "SELECT * FROM biostar2_ac.t_usr WHERE USRUID = '" + userId + "' ";
            let employeeResult = await db.query(employeeQuery);

            let CFtypeQuery = "SELECT * FROM biostar2_ac.t_usrcusfld WHERE USRUID = '" + employeeResult[0].USRUID + "' and CUSFLDUID = '1'"; 
            // biostar2_ac.t_cufldtyp & t_usrcusfld (user custom fields - custom fields added in biostar2 portal) 
            let CFResult = await db.query(CFtypeQuery);

            let timecardQuery = "SELECT * FROM biostar_tna.timecard WHERE user_id = " + employeeResult[0].USRID + ";";
            let timecardResult = await db.query(timecardQuery);

            // Remove time entries not within specified time span
            let filteredTimecardResult = timecardResult.filter((timeEntry) => {
                let timeEntryDate = moment(timeEntry.date);
                                
                if (start != false && start > timeEntryDate){
                    console.log('Removed: ' + timeEntryDate);
                    return false;
                } 

                if (end != false && end < timeEntryDate){
                    console.log('Removed: ' + timeEntryDate);
                    return false;
                }

                return true;
            });

            res.render('view-employee.ejs', {
                employee: employeeResult[0],
                timecard: filteredTimecardResult,
                personnummer: CFResult.length ? CFResult[0].VAL : 'N/A',
                moment: moment,
            });
        }catch(e){
            res.redirect('/home/');
        }
    }),

    // new object here

};

