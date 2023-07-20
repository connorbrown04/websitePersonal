import express from "express";
import fileUpload from "express-fileupload";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { unlink } from 'node:fs';

import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// root directory (localhost:3000/) now has all 
// files and folders in the 'public' folder
app.use('/', express.static('public'));
app.use(fileUpload());

// Optional, express automatically loads index.html
app.get('/', (req, res) => {
  res.sendFile('/public/index.html');
});

// app.listen returns a http.Server object
// which is passed as an argument to socket.io
const server = app.listen(3000, () => {
  console.log('Listening on port 3000');
});


import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminPngquant from 'imagemin-pngquant';
import imageminOptipng from 'imagemin-optipng';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminJpegtran from 'imagemin-jpegtran';


app.post('/upload', (req, res) => {
  //Get the file that was set to our field named "image"
  const { fileuploadd } = req.files;
  const { conversionType } = req.body;
  const { lossLess } = req.body;
  const { qual } = req.body;
  console.log(`${conversionType}: ${lossLess}`);

  // If no image submitted, exit
  if (!fileuploadd) return res.sendStatus(400);

  fileuploadd.name = fileuploadd.name.replace(/[\s!-,]+/g, '');
  console.log(fileuploadd.name);

  // Move the uploaded image to our upload folder
  fileuploadd.mv('recieved/' + fileuploadd.name);

  const uFilePath = __dirname + '/recieved/' + fileuploadd.name;

  const lossyPlugins = { jpeg: imageminMozjpeg, png: imageminPngquant, webp: imageminWebp };
  const losslessPlugins = { jpeg: imageminJpegtran, png: imageminOptipng };

  const plugin = lossLess == "lossless" ? losslessPlugins[conversionType] : lossyPlugins[conversionType];
  console.log(losslessPlugins[conversionType]);

  imagemin(["./recieved/" + fileuploadd.name], {
    destination: "./to-upload/",
    plugins: [
      plugin({ quality: qual })
    ],
  }).then((data) => {
    const sFilePath = __dirname + '/' + data[0].destinationPath;

    res.attachment(sFilePath);
    res.append("filename", path.basename(sFilePath));
    res.sendFile(sFilePath, () => {
      unlink(uFilePath, (err) => {
        if (err) throw err;
      });
      unlink(sFilePath, (err) => {
        if (err) throw err;
      });
    });


  })


});



// async function compressImg() {
//   const files = await imagemin(["./input/*.{jpeg,jpg,png}"], {
//     destination: "./to-upload/",
//     plugins: [
//       imageminWebp({quality: 50})
//     ],
//   });

//   console.log(files);
//   //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
// };

// imagemin(["./recieved/*.{jpeg,jpg,png}"], {
//     destination: "./to-upload/",
//     plugins: [
//     imageminWebp({quality: 50})
//   ],
// }).then((response) => {
//   console.log(response[0].destinationPath);
// });