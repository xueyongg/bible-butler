const writeFile = require('write');
const fs = require('fs');
let moment = require('moment');
import { local_db } from './fallback';

export function getPagination(current, maxpage) {
  var keys = [];
  if (current > 1) keys.push({ text: `«1`, callback_data: '1' });
  if (current > 2) keys.push({ text: `‹${current - 1}`, callback_data: (current - 1).toString() });
  keys.push({ text: `-${current}-`, callback_data: current.toString() });
  if (current < maxpage - 1) keys.push({ text: `${current + 1}›`, callback_data: (current + 1).toString() })
  if (current < maxpage) keys.push({ text: `${maxpage}»`, callback_data: maxpage.toString() });

  return {
    reply_markup: {
      inline_keyboard: [keys],
    }
  };
}

export async function writeIntoFile(db_content: db | {}) {
  delete db_content['loaded'];
  let users = db_content ? Object.keys(db_content) : [];
  console.log("< db_content:", db_content);

  let date = moment().format("DD-MM-YYYY HH:mm");
  let msg = "This is on " + date + "..\n---";

  var promises = await users.map((key, index) => {
    if (key === "loaded") return;
    try {
      let current_index = (Number(index) + 1);
      let user = db_content[Number(key)];
      msg += "\nUser #" + current_index + "\n";
      msg += "..." + user["first_name"] + " > " + key + "\n";
      let sub_keys = Object.keys(user);
      sub_keys.forEach(element => {
        msg += `...` + element + " > " + user[element] + "\n";
      });
      msg += "\n---"
    } catch (e) { throw e }
  })
  /**
   * 1. User and id e.g. Xueyong > 56328814
   * 2. List of functions and # of times e.g. getweather > 5
   * 3. Verses collated and # of times e.g. john3:30 > 5
  */
  Promise.all(promises).then(function (results) {
    console.log("< message: ", msg);
    writeFile("./db/db.txt", msg, function (err) {
      if (err) console.log(err);
    });
  })

}

export function readFile() {
  // Read and load into temp db
  const testFolder = './db/';
  let latest_file_name = "";

  fs.readdir(testFolder, (err, files) => {
    if (files[0]) {
      let db_file = files[0];
      let srcPath = testFolder + db_file
      fs.readFile(srcPath, "UTF-8", function (err, data) {
        if (err) throw err;

        let arr = data.replace("\n", "").split("---");
        let date_time = /\s*(3[01]|[12][0-9]|0?[1-9])-(1[012]|0?[1-9])-((?:19|20)\d{2})\s([0-4][0-9]):([0-6][0-9])\s*/gm.exec(arr[0]);
        let temp_db = {
          loaded: date_time ? date_time[0].trim() : moment().format("DD-MM-YYYY HH:mm"),
        };
        let users = arr.slice(1, arr.length);
        users.forEach((user, index) => {
          if (!user) return;
          let ind_user_arr = user.split("...");

          let id = Number(ind_user_arr[1].split(">")[1].trim());
          let first_name = ind_user_arr[2].split(">")[1].trim();

          temp_db[id] = {
            first_name,
          }
          ind_user_arr.slice(3, ind_user_arr.length).forEach((element, index) => {
            let context_name = element.replace("\n", "").split(">")[0].trim();
            let context_counter = element.replace("\n", "").split(">")[1].trim();
            try { temp_db[id][context_name] = Number(context_counter) } catch (err) { throw err }
          });
        });
        local_db.reload(temp_db);
      });
    } else {
      local_db.reload({ loaded: moment().format("DD-MM-YYYY HH:mm") });
    }
  })
}

export async function setupReadAutoWriteIntoFile(type = "setup") {
  let duration = 3600000; //In millisecond e.g. 3600000 ms = 1 hour
  setTimeout(() => {
    writeIntoFile(local_db.get("abc"));
    setupReadAutoWriteIntoFile("recursive");
  }, duration);
  if (type === "setup") {
    readFile();
  }
}
