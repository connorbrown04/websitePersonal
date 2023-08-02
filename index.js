//express
import express from "express";
import fileUpload from "express-fileupload";
//handlebars
import handlebars from "express-handlebars";
//path
import { unlink } from 'node:fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'node:path';
//imagemin plugins
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminPngquant from 'imagemin-pngquant';
import imageminOptipng from 'imagemin-optipng';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminJpegtran from 'imagemin-jpegtran';
//login plugins
import mysql from 'mysql';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

//because replit doesn't get these by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//create app
const app = express();

//setup handlebars
app.set('view engine', 'hbs');
app.engine('hbs', handlebars.engine({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  partialsDir: __dirname + '/views/partials/'
}));

//serve from public
app.use('/', express.static('public'));
app.use(fileUpload());

//serve main page
app.get('/', (req, res) => {
  res.render('main', {layout : 'index', home: true});
});

//serve resume page
app.get('/resume', (req, res) => {
  res.render('resume', {layout : 'index', resume: true});
});

//serve resume page
app.get('/projects', (req, res) => {
  res.render('projects', {layout : 'index', projects: true});
});

//listen on port 3000
app.listen(3000, () => {
  console.log('Listening on port 3000');
});

//recieve and optimize images sent from projects.html 
app.post('/projects/optimizer', (req, res) => {
  //extract data
  const { fileuploadd } = req.files;
  const { conversionType } = req.body;
  const { lossLess } = req.body;
  const { qual } = req.body;

  // If no image submitted, exit
  if (!fileuploadd) return res.sendStatus(400);
  
  //format name of file, no whitespace/reduced symbols
  fileuploadd.name = fileuploadd.name.replace(/[\s!-,]+/g, '');
  console.log(fileuploadd.name);

  // Move the uploaded image to recieved folder
  fileuploadd.mv('recieved/' + fileuploadd.name);

  //save recieved file path
  const uFilePath = __dirname + '/recieved/' + fileuploadd.name;
  
  //save extension name
  const fileExt = path.extname(uFilePath).replace(".", "");
  
  //extension: corrisponding plugin
  const lossyPlugins = { jpg: imageminMozjpeg, jpeg: imageminMozjpeg, png: imageminPngquant, webp: imageminWebp };
  const losslessPlugins = { jpg: imageminJpegtran, jpeg: imageminJpegtran, png: imageminOptipng };
  
  //save plugin from appropriate dict
  let plugin = lossLess == "lossless" ? losslessPlugins[fileExt] : lossyPlugins[fileExt];

  //use webp plugin if requested
  if(conversionType == "webp") plugin = imageminWebp;
  
  //optimize image through imagemin
  imagemin(["./recieved/" + fileuploadd.name], {
    destination: "./to-upload/",
    plugins: [
      plugin({ quality: qual })
    ],
  }).then((data) => {
    //save optimized image path
    const sFilePath = __dirname + '/' + data[0].destinationPath;

    //configure response and send file
    res.attachment(sFilePath);
    res.append("filename", path.basename(sFilePath));
    res.sendFile(sFilePath, () => {
      //delete files
      unlink(uFilePath, (err) => {
        if (err) throw err;
      });
      unlink(sFilePath, (err) => {
        if (err) throw err;
      });
    });
  })
});

dotenv.config({ path: './.env'});

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  //database: process.env.DATABASE
})

db.connect((error) => {
  if(error) {
    console.log(error);
  } else {
    console.log("MySQL connected");
  }
})

app.get('/projects/reqLogin', (req, res) => {
  res.sendFile(__dirname + '/views/partials/login.hbs');
});

app.get('/projects/reqRegister', (req, res) => {
  res.sendFile(__dirname + '/views/partials/register.hbs');
});
