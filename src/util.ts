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

export async function writeIntoFile(db_content: db | {}) {

  let users = db_content ? Object.keys(db_content) : [];
  console.log("< db_content:", db_content);

  let date = moment().format("DD-MM-YYYY HH:mm");
  let msg = "This is on " + date + "... \n";

  var promises = await users.map((key, index) => {
    if (key === "loaded") return;
    let user = db_content[Number(key)];
    msg += "User #" + index + 1 + "\n";
    msg += "..." + user["first_name"] + " > " + key + "\n";
    let sub_keys = Object.keys(user);
    sub_keys.forEach(element => {
      msg += `...` + element + " > " + user[element] + "\n";
    });
    msg += "\n---\n"
  })
  /**
   * 1. User and id e.g. Xueyong > 56328814
   * 2. List of functions and # of times e.g. getweather > 5
   * 3. Verses collated and # of times e.g. john3:30 > 5
   *  
  */
  Promise.all(promises).then(function (results) {
    console.log("< message: ", msg);
    writeFile("./db/db.txt", msg, function (err) {
      if (err) console.log(err);
    });
  })

}

export function readFile() {
  const testFolder = './db/';
  let latest_file_name = "";
  let db_object = {};

  fs.readdir(testFolder, (err, files) => {
    let db_file = files[0];
    let srcPath = testFolder + db_file
    fs.readFile(srcPath, "UTF-8", function (err, data) {
      if (err) throw err;
      console.log("< data: ", data);
      let arr = data.split("\n");
      console.log(arr);
    });
  })
}