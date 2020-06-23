const express = require('express');
const app = express();
var fs = require('fs');
const formidable = require('formidable');
const path = require('path');
const bodyParser = require('body-parser');
const Calculation = require('./models/Calculation');
const initDatabase = require('./config/database');
const { nextTick, exit } = require('process');

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));


initDatabase();

app.get('/',async function (req, res) {
  var imagesdata = await Calculation.find({});
  res.render('index', {
    imagesdata: imagesdata
  });
})

app.post('/import', function (req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (files.image.name !== '') {
      let oldpath = files.image.path;
      let newpath = './public/' + files.image.name;
      fs.readFile(oldpath, function (err, data) {
        if (err) {
          console.log(err);
          res.redirect('back');
          return;
        }
        // Write the file
        fs.writeFile(newpath, data, function (err) {
          if (err) {
            console.log(err);
            res.redirect('back');
            return;
          }
          fields.image = 'https://quiet-mountain-15010.herokuapp.com/' + files.image.name;
          let calculation = new Calculation(fields);
          calculation.save(function (err, result) {
            if (err) {
              console.log(err);
              res.redirect('back');
            } else {
              // console.log('result' + result);
              res.redirect('back');
              fs.unlink(oldpath, function (err) {
                if (err) {
                  console.log(err);
                  res.redirect('back');
                  return;
                }
              });
            }
          });
        });
      });
    } else {
      res.redirect('back');
    }
  });
})

app.get('/add/:id', async function (res, req, next) {
  var id = req.req.params.id;
  var addition = await Calculation.findById({_id: id})
  function addCols(path, data) {
    let csv = fs.readFileSync(path, 'utf8');
    csv = csv.split('\n').map(line => line.trim());
    let colNames = Object.keys(data);
    for (let i = 0; i < colNames.length; i++) {
      let c = colNames[i];
      if (typeof data[c] === 'function') {
        csv = csv.map((line, idx) => idx === 0
          ? line + ',' + c
          : line + ',' + data[c](line, idx)
        );
      } else if (Array.isArray(data[c])) {
        csv = csv.map((line, idx) => idx === 0
          ? line + ',' + c
          : line + ',' + data[c][idx - 1]
        );
      }
    }
    fs.createWriteStream(path, {
      flag: 'w',
      defaultEncoding: 'utf8'
    }).end(csv.join('\n'));
    
  }
  var url = addition.image;
  var pathname = new URL(url).pathname;

  addCols('./public' + pathname , {
    Updated_added_Salary: function (line, idx) {
      let s = 0;
      line = line.split(',').map(d => +(d.trim()));
      s = line[1] + line[2]
      return s;
    }
  });
  res.res.redirect('back');
})

app.get('/substract/:id', async function (res, req, next) {
  var id = req.req.params.id;
  var addition = await Calculation.findById({_id: id})
  function subCols(path, data) {
    let csv = fs.readFileSync(path, 'utf8');
    csv = csv.split('\n').map(line => line.trim());
    let colNames = Object.keys(data);
    for (let i = 0; i < colNames.length; i++) {
      let c = colNames[i];
      if (typeof data[c] === 'function') {
        csv = csv.map((line, idx) => idx === 0
          ? line + ',' + c
          : line + ',' + data[c](line, idx)
        );
      } else if (Array.isArray(data[c])) {
        csv = csv.map((line, idx) => idx === 0
          ? line + ',' + c
          : line + ',' + data[c][idx - 1]
        );
      }
    }
    fs.createWriteStream(path, {
      flag: 'w',
      defaultEncoding: 'utf8'
    }).end(csv.join('\n'));
    
  }

  var url = addition.image;
  var pathname = new URL(url).pathname;

  subCols('./public' + pathname , {
    Updated_Minus_Salary: function (line, idx) {
      let s = 0;
      line = line.split(',').map(d => +(d.trim()));
      s = line[1]-line[3]
      return s;
    }
  });
  res.res.redirect('back');
})

app.get('/double/:id', async function (res, req, next) {
  var id = req.req.params.id;
  var addition = await Calculation.findById({_id: id})
  function doubleCols(path, data) {
    let csv = fs.readFileSync(path, 'utf8');
    csv = csv.split('\n').map(line => line.trim());
    let colNames = Object.keys(data);
    for (let i = 0; i < colNames.length; i++) {
      let c = colNames[i];
      if (typeof data[c] === 'function') {
        csv = csv.map((line, idx) => idx === 0
          ? line + ',' + c
          : line + ',' + data[c](line, idx)
        );
      } else if (Array.isArray(data[c])) {
        csv = csv.map((line, idx) => idx === 0
          ? line + ',' + c
          : line + ',' + data[c][idx - 1]
        );
      }
    }
    fs.createWriteStream(path, {
      flag: 'w',
      defaultEncoding: 'utf8'
    }).end(csv.join('\n'));
    
  }
  var url = addition.image;
  var pathname = new URL(url).pathname;

  doubleCols('./public' + pathname , {
    Double_Salary: function (line, idx) {
      let s = 0;
      line = line.split(',').map(d => +(d.trim()));
      s = line[1]*2
      return s;
    }
  });
  res.res.redirect('back');
})


let port = (process.env.PORT || '5000')
app.listen(port ,process.env.IP,  function () {
  console.log('Server running on port 5000');
})