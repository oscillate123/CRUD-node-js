const moment = require('moment');
const asyncHandler = require('express-async-handler')

function getTimecardModifications(timecard, modLookup){
    let punchInKey = {
        user_id: JSON.parse(timecard.user).user_id,
        device_date: timecard.punch_in,
        type: 'PUNCH_TYPE_CHECK_IN',
    }
    let punchOutKey = {
        user_id: JSON.parse(timecard.user).user_id,
        device_date: timecard.punch_out,
        type: 'PUNCH_TYPE_CHECK_OUT',
    }

    let punchInMod = modLookup[JSON.stringify(punchInKey)];
    let punchOutMod = modLookup[JSON.stringify(punchOutKey)]

    // return Array.from(new Set([punchInMod, punchInMod])).filter(Boolean).join(', ');

    if(punchInMod && punchOutMod && ( punchInMod !== punchOutMod )){
        return 'In: ' + punchInMod + ', Ut: ' + punchOutMod;
    }else{
        if(punchInMod){
            return 'In' + (punchInMod === punchOutMod ? ' & Ut' : '') + ': ' + punchInMod;
        }else if(punchOutMod){
            return 'Ut: ' + punchOutMod;
        }
    }
}

module.exports = {

    currentStatus: asyncHandler(async (req, res) => {
        let currentDate = moment().format('YYYY-MM-DD');
        let start = req.query.start ? moment(req.query.start) : moment(currentDate);
        let end = req.query.end ? moment(req.query.end) : false;
    
        try{
            
            let employeeQuery = "SELECT * FROM biostar2_ac.t_usr ORDER BY USRUID;"
            let employeeResult = await db.query(employeeQuery);

            let timecardQuery = "SELECT * FROM biostar_tna.timecard;";
            let timecardResult = await db.query(timecardQuery);

            let CFtypeQuery = "SELECT * FROM biostar2_ac.t_usrcusfld WHERE CUSFLDUID = '1'";
            let CFResult = await db.query(CFtypeQuery);

            let modQuery = "SELECT * FROM biostar_tna.modifiedpunchlog;";
            let modResult = await db.query(modQuery);

            // Personnummer lookup (key = USRUID)
            let personnummer = {};
            CFResult.forEach((cf) => {
                personnummer[cf.USRUID] = cf.VAL;
            });

            // USRUID lookup (key = user_ID(USRID!))
            let usruids = {};
            employeeResult.forEach((employee) => {
                usruids[employee.USRID] = employee.USRUID;
            });

            // MOD lookup
            let modLookup = {};
            modResult.forEach((modification) => {
                let key = {
                    user_id: modification.user_id,
                    device_date: modification.device_datetime,
                    type: modification.type,
                }

                modLookup[JSON.stringify(key)] = modification.modified_by_user_name
            });

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
            
            res.render('current-status.ejs', {
                timecard: filteredTimecardResult,
                personnummer: personnummer,
                usruids: usruids,
                modLookup: modLookup,
                getTimecardModifications: getTimecardModifications,
                moment: moment,
            });
        }catch(e){
            console.error(e);
            res.redirect('/home/');
        }
    }),

    // new object here

};


/* 

// SELECT * FROM biostar_tna.modifiedpunchlog;

SELECT * FROM biostar_tna.punchlog;

SELECT * FROM biostar2_ac.t_usr ORDER BY USRUID;

<th scope="col">Date</th>
                <th scope="col">För- och efternamn</th>
                <th scope="col">Personnummer</th>
                <th scope="col">Punch In</th>
                <th scope="col">Punch Out</th>
                <th scope="col">Ändrat av</th>

*/
