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

initDatabase();

app.get('/', function (req, res) {
  res.render('index');
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
          fields.image = 'https://localhost:5000/' + files.image.name;
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

app.get('/add', function (res, req, next) {
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

  addCols('./public/products.csv', {
    sum: function (line, idx) {
      let s = 0;
      line = line.split(',').map(d => +(d.trim()));
      for (let i = 0; i < line.length; i++) {
        s += line[i];
      }
      return s;
    }
  });
  res.res.redirect('back');
})

app.get('/csvfile', async function(req, res) {
  var img = await Calculation.findById({_id : '5ef0f302f42e484bec762a6b'});
  // console.log(img.image);
  res.render('csvfile', {
    img : img.image
  });
})

app.listen('5000', () => {
  console.log('Server running on port 5000');
})