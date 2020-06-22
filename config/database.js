const mongoose  = require('mongoose');

let initDatabase = function() {
  let dbUri = "mongodb+srv://career-buddy:career-buddy@career-buddy-hbanv.mongodb.net/career-buddy?retryWrites=true&w=majority";
  mongoose.connect(dbUri);
  let connection = mongoose.connection;

  connection.on('connected', function() {
    console.log('Successfully connected to the database: '+ dbUri);
  });
  connection.on('error', function(err) {
    console.log('Error Occured while connecting to the database');
    console.log(err);
  });
  connection.on('disconnected', function(){
    console.log('Database Disconnected!');
  });
}

module.exports = initDatabase;