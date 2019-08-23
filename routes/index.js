module.exports = {
    getHomePage: (req, res) => {
        let query = "SELECT * FROM biostar_tna.user"; // query database to get all the Users

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            res.render('index.ejs', {
                user: result,
            });
        });
    },
};