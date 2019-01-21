var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/css', express.static('css'));


var connection = mysql.createConnection({
  host: 'local',
  user: 'myRoot',
  database: 'test_db'
});


/*---- RETRIEVE ALL THE SYSTEM NAMES AND DISPLAY TO THE DROPDOWN LIST ----*/
app.get('/', function(req, res) {
  var q = 'SELECT DISTINCT login_system FROM tbl_login ORDER BY login_system';
  connection.query(q, function(err, results) {
    if (err) throw err;
    res.render('home', {result: results});
  });
});
/* ---------------------------------------------------------------------- */


/* --- RETRIEVE THE SYSTEM NAME, USERNAME AND PASSWORD FOR THE SYS NAME SELECTED IN THE DD LIST ---*/
app.post('/',  function(req, res){
  var systemSelected = req.body.option_system_name;
  var retrieveQuery = 'SELECT * FROM tbl_login WHERE login_system = \'' + systemSelected + '\'';
  
  connection.query(retrieveQuery, function(err, results) {
    if (err) throw err;
    res.render('retrieve', {retrieveResult: results});

  });
});
/* ----------------------------------------------------------------------------------------------- */


/* --- RETRIEVE ALL RECORDS ---*/
app.get('/retrieve_all',  function(req, res){
  var retrieveQuery = 'SELECT * FROM tbl_login';
  
  connection.query(retrieveQuery, function(err, results) {
    if (err) throw err;
    res.render('retrieve_all', {retrieveResult: results});

  });

});
/* ------------------------------ */




/* ---- RETRIEVE RECORDS FOR THE SEARCHED SYSTEM  ------ */
app.post('/search',  function(req, res){
  var systemSearch = req.body.search_system;
  var allRowsQuery = 'SELECT * from tbl_login';
  var allRowsCount;
  var searchQuery = 'SELECT * FROM tbl_login WHERE login_system LIKE \'%' + systemSearch + '%\'';


  connection.query(allRowsQuery, function(err, countResults) {
      if (err) throw err;
      allRowsCount = countResults.length;
  });


  connection.query(searchQuery, function(err, results) {
      if (err) throw err;

      if(!systemSearch || results.length === allRowsCount){
        res.render('search_error', {sysError: "Your search string is empty."});
      } 

      else if (results.length == 0){
        res.render('search_error', {sysError: "The searched system does not exist in the database."})
      }

      else{
           res.render('search', {searchResult: results});
      }
  });
});
/* --------------------------------------------------------- */



/* ---- DISPLAY THE ADD NEW RECORD PAGE  ------ */
app.get('/add_info', function(req, res){
  res.render('add_info');
});
/* -------------------------------------------- */


/* ------- REGISTER NEW LOGIN INFO TO DATABASE ---- */
app.post('/reg_info', function(req, res){
  var systemOwner = req.body.system_owner;
  var systemName = req.body.system_name;
  var systemUsername = req.body.system_username;
  var systemPassword = req.body.system_password;

  var values =  {prim_key: null, login_user: systemOwner, login_system: systemName, login_username: systemUsername, login_pw: systemPassword};
  var registerQuery = 'INSERT INTO tbl_login SET ?';
 
  if(!systemOwner || !systemName || !systemUsername || !systemPassword){
    res.render('reg_error');
  } else{
    connection.query(registerQuery, values, function(err, results){
    if (err) throw err;
    res.render('reg_info', {result: values});
  });
  }
});
/* ----------------------------------------------- */


/* ---------- DISPLAY THE LOGIN INFO EDIT PAGE --------------- */
app.get('/search_edit_info', function(req, res){
  var q = 'SELECT DISTINCT login_system FROM tbl_login ORDER BY login_system';
  connection.query(q, function(err, results) {
    if (err) throw err;
    res.render('search_edit_info', {result: results});
  });
});
/* ---------------------------------------------------------------- */


app.post('/search_edit_info', function(req, res){
  var systemEditSearch = req.body.option_system_name;
  var editQuery = 'SELECT * FROM tbl_login WHERE login_system LIKE \'%' + systemEditSearch + '%\'';

  connection.query(editQuery, function(err, editSearchResults){
    if (err) throw err;
    res.render('edit_info', {result: editSearchResults});
  })
});

app.post('/edit_info', function(req, res){
  var updateSystemName = req.body.system_name;
  var updateUsername = req.body.system_username;
  var updatePassword = req.body.system_password;
  var values = [updateUsername, updatePassword, updateSystemName];

  var updateQuery = 'UPDATE tbl_login SET login_username = ?, login_pw = ? WHERE login_system = ?';
  connection.query(updateQuery, values, function(err, results){
    if(err) throw err;
    res.render('save_edit_info', {result: values});
  });
});




app.listen(8000, function() {
  console.log('Password Manager is now running; listening on port 8000...');
});
