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
        let group = req.query.group;
    
        try{
            
            let employeeQuery = "SELECT * FROM biostar2_ac.t_usr ORDER BY USRUID;"
            let employeeResult = await db.query(employeeQuery);

            let timecardQuery = "SELECT * FROM biostar_tna.timecard ORDER BY date DESC;";
            let timecardResult = await db.query(timecardQuery);

            let CFtypeQuery = "SELECT * FROM biostar2_ac.t_usrcusfld WHERE CUSFLDUID = '1'";
            let CFResult = await db.query(CFtypeQuery);

            let modQuery = "SELECT * FROM biostar_tna.modifiedpunchlog;";
            let modResult = await db.query(modQuery);

            let groupQuery = "SELECT * FROM biostar2_ac.t_usrgr WHERE DEP = 1;";
            let groupResult = await db.query(groupQuery);


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

            // User Group (key = USRUID)
            let usr_group = {};
            employeeResult.forEach((employee) => {
                usr_group[employee.USRUID] = employee.USRGRUID;
            });

            // User Group name (key = USRGRUID) 
            let usr_group_names = {};
            groupResult.forEach((group) => {
                usr_group_names[group.USRGRUID] = group.NM;
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
                let punch_in = timeEntry.punch_in
                let punch_out = timeEntry.punch_out
                let group_id = usr_group[usruids[JSON.parse(timeEntry.user).user_id]]
                                
                if (start != false && start > timeEntryDate){
                    return false;
                } 

                if (end != false && end < timeEntryDate){
                    return false;
                }

                if (punch_in === null && punch_out === null){
                    return false;
                }

                if (group_id != group && group){
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
                offset: moment().utcOffset()+120, // CHANGE TIMEZONE HERE IF THE TIME IS OFF IN THE VIEW - IT IS NOT MY FAULT OK?!?!?!? This number needs to be changed, depending on the server it is installed on!!! This is BioStars fault.
                usr_group: usr_group,
                usr_group_names: usr_group_names,
                groups: groupResult,
                start: start,
                end: end,
                selectedGroup: group,
            });
        }catch(e){
            console.error(e);
            res.redirect('/');
        }
    }),
};