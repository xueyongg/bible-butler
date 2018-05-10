const writeFile = require('write');
const fs = require('fs');
let moment = require('moment');

export function getPagination(current, maxpage) {
  var keys = [];
  if (current > 1) keys.push({ text: `«1`, callback_data: '1' });
  if (current > 2) keys.push({ text: `‹${current - 1}`, callback_data: (current - 1).toString() });
  keys.push({ text: `-${current}-`, callback_data: current.toString() });
  if (current < maxpage - 1) keys.push({ text: `${current + 1}›`, callback_data: (current + 1).toString() })
  if (current < maxpage) keys.push({ text: `${maxpage}»`, callback_data: maxpage.toString() });

  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [keys]
    })
  };
}

export async function writeIntoFile(chatDetails: chatDetails, msg) {
  // chat related details
  let { fromId, chatName, first_name, userId, messageId } = chatDetails;

  /**
   * 1. User and id e.g. Xueyong > 56328814
   * 2. List of functions and # of times e.g. getweather > 5
   * 3. Verses collated and # of times e.g. john3:30 > 5
   * 4. Write in new files with file name & time stamp e.g. database.2015-05-08
   * 5. create new directory if new month
   *  
  */

  let date = moment().format("DD-MM-YYYY HH:mm");
  let message = "This is content...\n";
  writeFile("./db/db.txt", message, function (err) {
    if (err) console.log(err);
  });


  // let savPath, srcPath;
  // fs.readFile(srcPath, 'utf8', function (err, data) {
  //     if (err) throw err;
  //     //Do your processing, MD5, send a satellite to the moon, etc.
  //     fs.writeFile(savPath, data, function (err) {
  //         if (err) throw err;
  //         console.log('complete');
  //     });
  // });

}

export function readFile() {
  const testFolder = './db/';
  let latest_file_name = "";
  let db_object = {};

  fs.readdir(testFolder, (err, files) => {
    let db_file = files[0];
    let srcPath = testFolder + db_file
    fs.readFile(srcPath, 'utf8', function (err, data) {
      if (err) throw err;
      console.log(data);
    });
  })
}