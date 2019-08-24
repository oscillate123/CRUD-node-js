const fs = require('fs');
const moment = require('moment');

module.exports = {
    addUserPage: (req, res) => {
        res.render('add-user.ejs', {
            message: '',
        });
    },
    addUser: (req, res) => {
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        let message = '';
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let position = req.body.position;
        let number = req.body.number;
        let username = req.body.username;
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = username + '.' + fileExtension;

        let usernameQuery = "SELECT * FROM biostar_tna.user WHERE user_name = '" + username + "'";

        db.query(usernameQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                message = 'username already exists';
                res.render('add-user.ejs', {
                    message,
                });
            } else {
                // check the filetype before uploading it
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        // send the User's details to the database
                        let query = "INSERT INTO biostar_tna.user (first_name, last_name, position, number, image, user_name) VALUES ('" +
                            first_name + "', '" + last_name + "', '" + position + "', '" + number + "', '" + image_name + "', '" + username + "')";
                        db.query(query, (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            res.redirect('/');
                        });
                    });
                } else {
                    message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                    res.render('add-user.ejs', {
                        message,
                    });
                }
            }
        });
    },
    viewEmployeePage: (req, res) => {
        let userId = req.params.id;

        
        let employeeQuery = "SELECT * FROM biostar2_ac.t_usr WHERE USRID = '" + userId + "' ";
        db.query(employeeQuery, (err, employeeResult) => {
            if (err) {
                return res.status(500).send(err);
            }

            let CFtypeQuery = "SELECT * FROM biostar2_ac.t_usrcusfld WHERE USRUID = '" + employeeResult[0].USRUID + "' and CUSFLDUID = '1'"; // biostar2_ac.t_cufldtyp & t_usrcusfld
            db.query(CFtypeQuery, (err, CFResult) => {
                if (err) {
                    return res.status(500).send(err);
                }
            
                let timecardQuery = "SELECT * FROM biostar_tna.timecard WHERE user_id = " + userId + " ";
                db.query(timecardQuery, (err, timecardResult) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    
                    res.render('view-employee.ejs', {
                        user: employeeResult[0],
                        timecard: timecardResult,
                        personnummer: CFResult.length ? CFResult[0].VAL : 'N/A',
                        moment: moment,
                        /* CFResult.length ? CFResult[0].VAL - frågetecknet är för att göra ett kortfattat "if else statement", kallas för ternery statement, för att om det saknas värde
                        * så i CFResult[0].VAL så kommer : 'N/A' strängen att användas istället, när man kallas på variabeln personnummer.
                        */
                    });
                });
            });
        });
    },
    editUser: (req, res) => {
        let userId = req.params.id;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let position = req.body.position;
        let number = req.body.number;

        let query = "UPDATE biostar_tna.user SET `first_name` = '" + first_name + "', `last_name` = '" + last_name + "', `position` = '" + position + "', `number` = '" + number + "' WHERE `Users`.`id` = '" + UserId + "'";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/');
        });
    },
    deleteUser: (req, res) => {
        let userId = req.params.id;
        let getImageQuery = 'SELECT image from biostar_tna.user WHERE id = "' + userId + '"';
        let deleteUserQuery = 'DELETE FROM biostar_tna.user WHERE id = "' + userId + '"';

        db.query(getImageQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            let image = result[0].image;

            fs.unlink(`public/assets/img/${image}`, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
                db.query(deleteUserQuery, (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.redirect('/');
                });
            });
        });
    }
};

