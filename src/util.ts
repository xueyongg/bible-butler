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


  let latest_file_name = readFile();
  let data_unix_seconds = moment().unix();
  // writeFile('./db/' + data_unix_seconds + ".txt", 'This is content...', function (err) {
  //   if (err) console.log(err);
  // });

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

function readFile() {
  const testFolder = './db/';
  let latest_file_name = "";

  fs.readdir(testFolder, async (err, files) => {
    console.log(files);
    let arr = [];
    const max = await files.reduce(function (prev, current) {
      return (prev.y > current.y) ? prev : current
    }) //returns object;
    Promise.resolve(max).then((value) => {
      return value;
    });
  })
}