import { isNumber } from "util";

require('dotenv').config();
let TelegramBot = require('node-telegram-bot-api');
let mongojs = require('mongojs');
let MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
const ngrok = require('ngrok');

let request = require('request');
let moment = require('moment');
let moment_tz = require('moment-timezone');
let emoji = require('node-emoji').emoji;
const scrapeIt = require("scrape-it")
const axios = require('axios');
//let googleTranslate = require('google-translate')(apiKey);

let token = process.env.TELEGRAM_TOKEN;
let privateGenderAPIKey = process.env.privateGenderAPIKey;
let darkskyAPIKey = process.env.darkskyAPIKey;
let googleAPIKey = process.env.googleAPIKey;
let googleTimeZoneAPIKey = process.env.googleTimeZoneAPIKey;
let holidayAPIKey = process.env.holidayAPIKey;
let exchangeRateAPIKey = process.env.exchangeRateAPIKey;
let myId = Number(process.env.myId);
const environment = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const HOST = environment !== "development" ? process.env.HOST : "LOCALHOST";
let DOMAIN = process.env.LOCAL_URL || "https://localhost";
let DB_HOST = process.env.DB_HOST;

let bot = new TelegramBot(token, { polling: true });
// Method that creates the bot and starts listening for updates
const takeOff = () => {
    //Setup WebHook way
    const bot = new TelegramBot(token, {
        webHook: {
            host: HOST
            , port: PORT
        }
        , onlyFirstMatch: true
    });

    bot.getMe()
        .then(me => {
            bot.setWebHook(DOMAIN + ':443/bot' + TELEGRAM_TOKEN);
            let info = [];
            const date = new Date();
            info.push('------------------------------');
            info.push('Bot successfully deployed!');
            info.push('------------------------------');
            info.push('Bot info:');
            info.push(`- ID: ${me.id}`);
            info.push(`- Name: ${me.first_name}`);
            info.push(`- Username: ${me.username}`);
            info.push('\n');
            info.push('Server info:');
            info.push(`- Host: ${HOST}`);
            info.push(`- Port: ${PORT}`);
            info.push(`- Domain: ${DOMAIN}`);
            info.push(`- Node version: ${process.version}`);
            info.push('\n');
            info.push('Time Info:');
            info.push(
                `- Date: ${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`);
            info.push(
                `- Time: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            );
            info.push('------------------------------');
            console.log(info.join('\n'));
        })
        .catch(console.log);

    // Here I'd call a setListeners to set all the event listeners for the updates
};

if (!DOMAIN) {
    // If no URL is provided for the WebHook from environment letiables, we open an ngrok tunnel
    bot.openTunnel(PORT)
        .then(host => {
            // Once we have the ngrok tunnel host, we set the coresponding letiable
            DOMAIN = host;
            console.log(`Ngrok tunnel opened at ${host}`);
            // Then start listening for updates
            takeOff();
        })
        .catch(console.log);
} else {
    // If environment letiables define a url, we start listening for the updates without opening a tunnel
    takeOff();
}

let bot_name = "Marvin";
let numOfBebePhotos = 3;

let connection_string = "mongodb://" + DB_HOST + ":27017" + "/biblebutler";
//Connecting to the db at the start of the code
console.log("This is my connection_string: ");
console.log(connection_string);

let db;
if (HOST !== "LOCALHOST") {
    MongoClient.connect(connection_string, function (err, db) {
        if (err) {
            bot.sendMessage(myId, "Error connecting to db, rescue me soon! ssh root@76.8.60.212");
            throw err;
        } else {
            console.log("successfully connected to the database");
        }
    })

    db = mongojs(connection_string, ['verses', 'users', 'locations', 'verses', 'holidays', "xrates"], (err, res) => {
        if (err) {
            bot.sendMessage(myId, "Error connecting to db, rescue me soon! ssh root@76.8.60.212");
            throw err
        } else {
            console.log("successfully connected to the database");
        }
        console.log("Trying to connect to db..");
    });
}

// Any kind of message
let fallback = {
    previous_context: "",
    get_context: () => {
        return this.previous_context;
    },
    set_context: (context_name) => {
        this.previous_context = context_name;
    },
    clear_context: () => {
        this.previous_context = "";
    },
    check_context_cleared: () => {
        return this.previous_context ? false : true;
    },
    latest_message: {},
    latest_message_type: "",
    get_latest_message: () => {
        // console.log("Retrieving Message!", this.latest_message);
        return this.latest_message;
    },
    set_latest_message: (msg: any) => {
        this.latest_message = msg;
        // console.log("Message set!", this.latest_message);
    },
    update_latest_message: (old_message: any, new_message: any) => {
        if (old_message.message_id === this.latest_message.message_id) {
            this.latest_message = new_message;
            return new_message.message_id;
        } else {
            return false;
        }
    },
    clear_latest_message_id: () => {
        this.latest_message_id = "";
    },
    check_latest_message_id: () => {
        return this.latest_message_id === ("" || undefined);
    },

};
// Inform xy bot is online
bot.sendMessage(myId, "Im back online @" + HOST + "! No actions required.");

async function basic_fallback(chatDetails, msg: any, type_of_fallback = "normal") {
    //type: weather or sunrise
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;


    // Will only reply when its a text message
    if (msg.text) {
        const trimmed_message = msg.text.trim();
        // Check if its a verse and it does not have any context
        const matchVerse = /^(?:\d|I{1,3})?\s?\w{2,}\.?\s*\d{1,}\:\d{1,}-?,?\d{0,2}(?:,\d{0,2}){0,2}/gm.exec(trimmed_message);
        const is_command = /^\/[\w]+/gm.exec(trimmed_message);
        let num_entered = Number(trimmed_message);
        const is_number = !isNaN(num_entered);
        // let context = await fallback.get_context();
        let context_cleared = await fallback.check_context_cleared();
        if (context_cleared) {
            if (matchVerse) {
                if (type_of_fallback === "edit_update") {
                    let new_message = await marvinNewGetVerseMethod(chatDetails, matchVerse[0], "edit_update");
                };
                if (type_of_fallback === "normal") {
                    // Find a more optimized method
                    let verse_info = await marvinNewGetVerseMethod(chatDetails, matchVerse[0], "normal");
                };
                return;
            } else if (is_number) {
                // Check for number
                number_fallback(chatDetails, trimmed_message);
            } else if (is_command) {
                // Check if is a random word, send a menu
                // Check if its any of the existing commands
                if (commandArchive.includes(trimmed_message.replace("/", ""))) {
                    console.log("/command exist");
                } else {
                    bot.sendMessage(fromId, "Unrecognized command. Say what?");
                }
            } else {
                // Invoke the menu
                menu(chatDetails, msg);
            }
        }

    }

    if (msg.document) {
        // Echo back
        bot.sendDocument(chatDetails.fromId, { file_id: msg.document.thumb ? msg.document.thumb.file_id : msg.document.file_id });
        echoToOwner(chatDetails, msg);
    }
}
async function context_fallback(chatDetails, msg: any, type_of_fallback = "normal") {
    // Will only reply when its a text message
    if (msg.text) {
        const trimmed_message = msg.text.trim();
        // Check if its a verse and it does not have any context
        const matchVerse = /^(?:\d|I{1,3})?\s?\w{2,}\.?\s*\d{1,}\:\d{1,}-?,?\d{0,2}(?:,\d{0,2}){0,2}/gm.exec(trimmed_message);
        if (matchVerse) {
            if (type_of_fallback === "edit_update") {
                let new_message = await marvinNewGetVerseMethod(chatDetails, matchVerse[0], "edit_update");
            };
        };

        // Check for number
        number_fallback(chatDetails, trimmed_message);
        // Check if its an insult below

    }
}

function number_fallback(chatDetails: chatDetails, num_entered: number) {
    teachMeMath(chatDetails, num_entered);
}

function echoToOwner(chatDetails: chatDetails, msg, personalized = false, locationDetails = { locationName: "", lat: 0, lng: 0 }) {
    //chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    //location details
    let { locationName, lat, lng } = locationDetails;

    if (msg.location && !personalized) {
        bot.sendMessage(myId, first_name + " from " + chatName + " sent this location: ");
        bot.sendLocation(myId, lat, lng);
    }
    if (msg.text && !personalized) {
        bot.sendMessage(myId, first_name + " from " + chatName + " sent this message: " + msg.text);
    }
    if (msg.document && !personalized) {
        bot.sendMessage(myId, first_name + " from " + chatName + " sent me a document. ");
        bot.sendDocument(myId, { file_id: (msg.document.thumb ? msg.document.thumb.file_id : msg.document.file_id) });
    }

    if (personalized) {
        bot.sendMessage(myId, first_name + " from " + chatName + " " + msg);
    }
};
bot.on('message', async (msg) => {
    let chat = msg.chat;
    let chatId = msg.chat.id;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;


    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };
    basic_fallback(chatDetails, msg);
});
bot.on('edited_message', async (edited_message) => {
    let chat = edited_message.chat;
    let chatId = edited_message.chat.id;
    let fromId = edited_message.from.id;
    let userId = edited_message.from.id;
    let first_name = edited_message.from.first_name;
    let messageId = edited_message.message_id
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };
    if (edited_message.text) {
        if (edited_message.text.includes("/")) {
            // Doesn't matter cos the /methods are not handled in fallback
            await fallback.clear_context();
        }
    }
    let check_context_cleared = await fallback.check_context_cleared();
    if (check_context_cleared)
        basic_fallback(chatDetails, edited_message, "edit_update");
    else
        context_fallback(chatDetails, edited_message, "edit_update");

})
bot.on('location', async (msg) => {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };
    let location = msg.location;
    let currentContext = await fallback.get_context();
    if (location && (fallback.check_context_cleared() || fallback.get_context() !== "foodpls")) {
        let locationDetails = {
            lat: msg.location.latitude,
            lng: msg.location.longitude,
            locationName: "Your position",
        };
        weatherReportMethod(locationDetails, chatDetails);
    }
});

/*
 this method will try to call methods based on messages to BA, as if its a conversation
 */
bot.onText(/^marvin (.+)/i, function (msg, match) {
    //chat details
    let chat = msg.chat;
    let chatId = msg.chat.id;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let messageId = msg.message_id
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };

    console.log("< Message received: ", msg);
    const command = /^get verse/.exec(match[1]);
    if (command) {
        let matches = /^marvin (.+verse)(.+[0-9]$)/ig.exec(msg.text.trim());
        let fetchingVerse = matches[2].trim();

        if (fetchingVerse) marvinNewGetVerseMethod(chatDetails, fetchingVerse, "normal", "NIV");
        else bot.sendMessage(fromId, "Invalid verse. Please enter a valid verse for me thank you!" + emoji.hushed);

    } else if (/^marvin (.*get)(.+[0-9]$)/ig.exec(msg.text.trim())) {
        //just the verse, since im the only one that's gonna use this
        let matches = /^marvin (.*get)(.+[0-9]$)/ig.exec(msg.text.trim());
        let fetchingVerse = matches[2].trim();

        marvinNewGetVerseMethod(chatDetails, fetchingVerse, "normal");

    } else if (/^marvin (.+sad)/ig.exec(msg.text.trim())) { //this is when people tell marvin, they are sad
        let opt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Yes", callback_data: "yes", },
                    { text: "No", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            },
            parse_mode: "Markdown",
        };

        bot.sendMessage(fromId, "What happened " + first_name + "? " + emoji.slightly_frowning_face + " Do you need a verse?", opt)
            .then(function (ans) {
                bot.once('callback_query', function (msg) {
                    let feeling = "needEncouragement";
                    let response = msg.data;
                    console.log("This is my response: " + response);
                    if (response === "yes") {
                        let chosenFeeling = "needEncouragement";
                        let arrayOfFeelings = verseArchive[chosenFeeling];
                        if (!arrayOfFeelings) {
                            bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                            if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error! " + emoji.sob);
                        }
                        let chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
                        marvinNewGetVerseMethod(chatDetails, chosenVerse, "sad");
                        bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                    } else {
                        bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                        bot.sendVideo(fromId, "./server/data/pikachu_holding_can.mp4");
                    }
                    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " just told me he/she is sad " + emoji.sob);
                })
            })
        bot.sendVideo(fromId, "./server/data/sad_bat.mp4");

    } else if (/^marvin (.+angry)/ig.exec(msg.text.trim())) {
        let opt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Music", callback_data: "music", },
                    { text: "Verse", callback_data: "verse", },
                    { text: "No", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        let secondOpt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Yes", callback_data: "yes", },
                    { text: "No", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        let thirdOpt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Jackie", callback_data: "no", },
                    { text: "Latte", callback_data: "no", },
                    { text: "Baby", callback_data: "no", }],
                    [{ text: "Bebe", callback_data: "bebe", },
                    { text: "Ginger", callback_data: "no", },
                    { text: "Puffy", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        bot.sendMessage(fromId, "What happened " + first_name + "? " + emoji.slightly_frowning_face + " Do you need a song or a verse?", opt)
            .then(function (ans) {
                bot.once('callback_query', function (msg) {
                    let feeling = "needEncouragement";
                    let response = msg.data;
                    //console.log("This is my response: " + response);

                    switch (response) {
                        case 'music':
                            bot.sendMessage(fromId, "Fetching the youtube link now..");
                            //bot.sendDocument(fromId, "./server/data/Brokenness Aside.mp3");
                            bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                            bot.sendMessage(fromId, "https://www.youtube.com/watch?v=ZOBIPb-6PTc " + emoji.sob);
                            bot.sendMessage(fromId, "Do you want the song? Although I have to first verify that you're not a bot & not a stranger " + emoji.hushed, secondOpt)
                                .then(function () {
                                    bot.once('callback_query', function (secondMsg) {
                                        let secondResponse = secondMsg.data;
                                        //console.log("this is the secondResponse: " + secondResponse);
                                        switch (secondResponse) {
                                            case 'yes':
                                                bot.sendMessage(fromId, "Here's the question! Sending photo..");
                                                bot.sendMessage(fromId, "What is the name of my dog? " + emoji.thinking_face + " (Only one try, make it count!)", thirdOpt)
                                                    .then(function () {
                                                        bot.once('callback_query', function (thirdMsg) {
                                                            let thirdResponse = thirdMsg.data;
                                                            console.log("this is the thirdMsg: " + thirdMsg);
                                                            if (thirdResponse.toUpperCase() === "BEBE") {
                                                                let songOption = {
                                                                    duration: 615,
                                                                    performer: "Elevation Worship",
                                                                    title: "Do it again"
                                                                };

                                                                bot.sendMessage(fromId, "YOU GOT IT RIGHT! " + emoji.heart_eyes + " Fetching song now..");
                                                                bot.sendAudio(fromId, "./server/data/Do It Again.mp3", songOption);
                                                                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " managed to get bebe's name, sent the song 'Do It Again' over! " + emoji.sob);
                                                            } else {
                                                                let theRandomizedPhotoNumber = Math.ceil(Math.random() * numOfBebePhotos);
                                                                console.log("theRandomizedPhotoNumber: " + theRandomizedPhotoNumber);
                                                                bot.sendMessage(fromId, "Sadly that is incorrect");
                                                                bot.sendMessage(fromId, "Here's a photo of her for you anyways! " + emoji.heart_eyes);
                                                                bot.sendPhoto(fromId, "./server/data/bebe" + theRandomizedPhotoNumber + ".jpg");
                                                                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " managed to didnt bebe's name, sent her photo over! Hehe " + emoji.sob);
                                                            }
                                                        })
                                                    });
                                                break;
                                            default:
                                                bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                                                break;
                                        }
                                    })
                                });
                            break;

                        case 'verse':
                            let chosenFeeling = "angry";
                            let arrayOfFeelings = verseArchive[chosenFeeling];
                            if (!arrayOfFeelings) {
                                bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                                if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error! " + emoji.sob);
                            }
                            let chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
                            marvinNewGetVerseMethod(chatDetails, chosenVerse, "sad");
                            bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                            break;

                        default:
                            bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else!");
                            bot.sendVideo(fromId, "./server/data/pikachu_holding_can.mp4");
                            break;
                    }
                    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " just told me he/she is angry " + emoji.sob);
                })
            })

    } else if (/^marvin (.+broken.*)/ig.exec(msg.text.trim())) {
        let opt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Music", callback_data: "music", },
                    { text: "Verse", callback_data: "verse", },
                    { text: "No", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        let secondOpt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Yes", callback_data: "yes", },
                    { text: "No", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        let thirdOpt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "9 Weeks old", callback_data: "no", },
                    { text: "6 Months old", callback_data: "no", },
                    { text: "12 Weeks old", callback_data: "no", }],
                    [{ text: "1 Year old", callback_data: "bebe", },
                    { text: "9 Months old", callback_data: "no", },
                    { text: "2 Years old", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        bot.sendMessage(fromId, "What happened " + first_name + "? " + emoji.slightly_frowning_face + " Do you need a song or a verse?", opt)
            .then(function (ans) {
                bot.once('callback_query', function (msg) {
                    let feeling = "needEncouragement";
                    let response = msg.data;
                    //console.log("This is my response: " + response);

                    switch (response) {
                        case 'music':
                            bot.sendMessage(fromId, "Fetching the youtube link now..");
                            //bot.sendDocument(fromId, "./server/data/Brokenness Aside.mp3");
                            bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                            bot.sendMessage(fromId, "https://www.youtube.com/watch?v=rJMWrBsSwMk " + emoji.sob);
                            bot.sendMessage(fromId, "Do you want the song? Although I have to first verify that you're not a bot & not a stranger " + emoji.hushed, secondOpt)
                                .then(function () {
                                    bot.once('callback_query', function (secondMsg) {
                                        let secondResponse = secondMsg.data;
                                        //console.log("this is the secondResponse: " + secondResponse);
                                        switch (secondResponse) {
                                            case 'yes':
                                                bot.sendMessage(fromId, "Here's the question!");
                                                bot.sendMessage(fromId, "How old was my dog when she first joined the family? " + emoji.thinking_face + " (Only one try, make it count!)", thirdOpt)
                                                    .then(function () {
                                                        bot.once('callback_query', function (thirdMsg) {
                                                            let thirdResponse = thirdMsg.data;
                                                            console.log("this is the thirdMsg: " + thirdMsg);
                                                            if (thirdResponse.toUpperCase() === "BEBE") {
                                                                let songOption = {
                                                                    duration: 351,
                                                                    performer: "All Sons & Daughters",
                                                                    title: "Brokenness Aside"
                                                                };

                                                                bot.sendMessage(fromId, "YOU GOT IT RIGHT! " + emoji.heart_eyes + " Fetching song now..");
                                                                bot.sendAudio(fromId, "./server/data/Brokenness Aside.mp3", songOption);
                                                                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " managed to get bebe's age when she first joined, sent the song 'Brokenness Aside' over! " + emoji.sob);
                                                            } else {
                                                                let theRandomizedPhotoNumber = Math.ceil(Math.random() * numOfBebePhotos);
                                                                bot.sendMessage(fromId, "Sadly that is incorrect");
                                                                bot.sendMessage(fromId, "Here's a photo of her for you anyways! " + emoji.heart_eyes);
                                                                bot.sendPhoto(fromId, "./server/data/bebe" + theRandomizedPhotoNumber + ".jpg");
                                                                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " managed to didnt bebe's age when she first joined, sent her photo over! Hehe " + emoji.sob);
                                                            }
                                                        })
                                                    });
                                                break;
                                            default:
                                                bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                                                break;
                                        }
                                    })
                                });
                            break;

                        case 'verse':
                            let chosenFeeling = "needStrength";
                            let arrayOfFeelings = verseArchive[chosenFeeling];
                            if (!arrayOfFeelings) {
                                bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                                if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error! " + emoji.sob);
                            }
                            let chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
                            marvinNewGetVerseMethod(chatDetails, chosenVerse, "sad");
                            bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                            break;

                        default:
                            bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                            break;
                    }
                    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " just told me he/she is angry " + emoji.sob);
                })
            })


    } else if (/^marvin (.+broke[^n].*)/ig.exec(msg.text.trim())) {
        //https://www.youtube.com/watch?v=dNwt7LQiYck
        let opt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Music", callback_data: "music", },
                    { text: "Verse", callback_data: "verse", },
                    { text: "No", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        let secondOpt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Yes", callback_data: "yes", },
                    { text: "No", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        let thirdOpt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Puffy", callback_data: "no", },
                    { text: "Coco", callback_data: "no", },
                    { text: "Janelle", callback_data: "no", }],
                    [{ text: "Pepper", callback_data: "bebe", },
                    { text: "Baby", callback_data: "no", },
                    { text: "Bebe", callback_data: "no", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        bot.sendMessage(fromId, "What happened " + first_name + "? " + emoji.slightly_frowning_face + " Do you need a song or a verse?", opt)
            .then(function (ans) {
                bot.once('callback_query', function (msg) {
                    let feeling = "brokenHearted";
                    let response = msg.data;
                    //console.log("This is my response: " + response);

                    switch (response) {
                        case 'music':
                            bot.sendMessage(fromId, "Fetching the youtube link now..");
                            //bot.sendDocument(fromId, "./server/data/Brokenness Aside.mp3");
                            bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                            bot.sendMessage(fromId, "https://www.youtube.com/watch?v=dNwt7LQiYck" + emoji.sob);
                            bot.sendMessage(fromId, "Do you want the song? Although I have to first verify that you're not a bot & not a stranger " + emoji.hushed, secondOpt)
                                .then(function () {
                                    bot.once('callback_query', function (secondMsg) {
                                        let secondResponse = secondMsg.data;
                                        //console.log("this is the secondResponse: " + secondResponse);
                                        switch (secondResponse) {
                                            case 'yes':
                                                bot.sendMessage(fromId, "Here's the question!");
                                                bot.sendPhoto(fromId, "./server/data/bebe4.jpg");
                                                bot.sendMessage(fromId, "What's the name of the smaller dog? " + emoji.thinking_face + " (Only one try, make it count!)", thirdOpt)
                                                    .then(function () {
                                                        bot.once('callback_query', function (thirdMsg) {
                                                            let thirdResponse = thirdMsg.data;
                                                            console.log("this is the thirdMsg: " + thirdMsg);
                                                            if (thirdResponse.toUpperCase() === "BEBE") {
                                                                let songOption = {
                                                                    duration: 295,
                                                                    performer: "Elevation Worship",
                                                                    title: "Give Me Faith"
                                                                };

                                                                bot.sendMessage(fromId, "YOU GOT IT RIGHT! " + emoji.heart_eyes + " Fetching song now..");
                                                                bot.sendAudio(fromId, "./server/data/Give Me Faith.mp3", songOption);
                                                                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " managed to get bebe's age when she first joined, sent the song 'Brokenness Aside' over! " + emoji.sob);
                                                            } else {
                                                                let theRandomizedPhotoNumber = Math.ceil(Math.random() * numOfBebePhotos);
                                                                bot.sendMessage(fromId, "Sadly that is incorrect");
                                                                bot.sendMessage(fromId, "Here's a photo of her for you anyways! " + emoji.heart_eyes);
                                                                bot.sendPhoto(fromId, "./server/data/bebe" + theRandomizedPhotoNumber + ".jpg");
                                                                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " managed to didnt bebe's age when she first joined, sent her photo over! Hehe " + emoji.sob);
                                                            }
                                                        })
                                                    });
                                                break;
                                            default:
                                                bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                                                break;
                                        }
                                    })
                                });
                            break;

                        case 'verse':
                            let chosenFeeling = "brokenHearted";
                            let arrayOfFeelings = verseArchive[chosenFeeling];
                            if (!arrayOfFeelings) {
                                bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                                if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error! " + emoji.sob);
                            }
                            let chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
                            marvinNewGetVerseMethod(chatDetails, chosenVerse, "sad");
                            bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                            break;

                        default:
                            bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                            break;
                    }
                    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " just told me he/she is angry " + emoji.sob);
                })
            })

    } else if (/^marvin (.+lost.*)/ig.exec(msg.text.trim())) {
        //Jesus I come
        //https://www.youtube.com/watch?v=_8Fx06jskfY

    } else if (/^marvin (.+am.*your bb.*)/ig.exec(msg.text.trim())) {
        //TODO: Access the db check my credentials and save, up to 100 bb

    } else if (/^marvin (.+goodjob.*)/ig.exec(msg.text.trim())) {
    } else if (/^marvin (.+lost.*)/ig.exec(msg.text.trim())) {
    } else if (/^marvin (.+songs.*)/ig.exec(msg.text.trim())) {
    } else if (/^marvin (.+save.*(favourite|favorite).*verse.*)/ig.exec(msg.text.trim())) {
        //TODO: Access the db check my credentials and save, up to 100 verses
        //TODO: verse structure = {verse, text, description}

    } else if (/^marvin (.+be.*your.*bb.*)/ig.exec(msg.text.trim())) {
        //TODO: Access the db check my credentials and check if user is bb
        //TODO: verse structure = {verse, text, description}

        let opt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Xueyong", callback_data: "no", },
                    { text: "Joshua", callback_data: "no", },
                    { text: "Xue", callback_data: "xue", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };

        db.users.count({ _id: userId }, function (err, doc) {
            if (doc === 1) {
                //exist and is already my bb
                bot.sendMessage(fromId, "Aww you do? But you are already my bb! " + emoji.heart_eyes);
                bot.sendSticker(fromId, bbStickerArchive[Math.floor(Math.random() * bbStickerArchive.length)]);
                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " is reminded of his/her bb status! Check from db is a success!");
            } else {
                //to add her/him as bb
                bot.sendMessage(fromId, "Aww you do? If so, here's a question you have to pass to be my bb! " + emoji.kissing_smiling_eyes);
                bot.sendMessage(fromId, "What does my owner's sisters call him?", opt)
                    .then(function (ans) {
                        bot.once("callback_query", function (msg) {
                            let response = msg.data.toLowerCase();
                            switch (response) {
                                case 'xue':
                                    //correct answer
                                    console.log("you got the answer correct!");

                                    db.users.insert({
                                        _id: userId,
                                        firstName: first_name,
                                        bb: true
                                    }, function (err, doc) {
                                        if (doc) bot.sendMessage(fromId, "Correct! You are my bb now! Welcome to my exclusive circle! " + emoji.blush);
                                    });
                                    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " is added into database as my bb" + emoji.smiley);
                                    //bot.sendMessage(fromId, "You are my bb now! Welcome to my inner circle!" + emoji.blush);
                                    break;
                                case 'no':
                                    //wrong answer
                                    console.log("you got the answer wrong!");
                                    bot.sendMessage(fromId, "You got the answer wrong!");
                                    bot.sendMessage(fromId, "Come back to me after you know my owner! I wouldn't be here without him you know! " + emoji.triumph);
                                    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " is got the answer wrong and is NOT added into database as my bb" + emoji.white_frowning_face);
                                    break;
                            }
                        })
                    })
                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " is sadly not bb! Check from db did not find anything!");

            }
        });
    }
    //----------------------------------------------- Weather related use---------------------------------------------------------
    else if (/^marvin (.+)weather.*/ig.exec(msg.text.trim())) {
        let weatherMatches = /^marvin (.+)weather.*/ig.exec(msg.text.trim());
        let splitWord = weatherMatches[1].split(/\W+/);
        let name = splitWord[splitWord.length - 2].trim();

        getLatLongMethod(chatDetails, name);

        // db.locations.count({ name: name }, function (err, doc) {
        //     if (doc === 1) {
        //         db.locations.find({ name: name }, function (err, doc) {
        //             if (err) throw err;
        //             if (doc) {
        //                 //console.log(doc[0]);
        //                 //bot.sendMessage(fromId, doc[0].name);
        //                 let locationDetails = {
        //                     name: doc[0].name,
        //                     lat: doc[0].lat,
        //                     long: doc[0].long,
        //                 };
        //                 //console.log("locationDetails: ");
        //                 //console.log(locationDetails);
        //                 weatherReportMethod(locationDetails, chatDetails);
        //             }
        //         });
        //     } else { //the name of the location doesnt exist in the db yet
        //         getLatLongMethod(name, chatDetails);
        //     }
        // });

    }
    //-----------------------------------------------Only for admin to use---------------------------------------------------------
    else if (/^marvin (.+connect test.*)/ig.exec(msg.text.trim())) {
        //console.log(db);
        let verses = db.collection('verses');
        // log each of the first ten docs in the collection
        db.verses.find({}).limit(1).forEach(function (err, doc) {
            if (err) throw err;
            if (doc) {
                bot.sendMessage(fromId, "I'm connected!");
                bot.sendMessage(fromId, doc.text);
            }
        });
    } else if (/^marvin (.+bb list elephant.*)/ig.exec(msg.text.trim())) {
        //console.log(db);
        let verses = db.collection('verses');
        // log each of the first ten docs in the collection
        bot.sendMessage(fromId, "I'm connected! And here are your first ten bbs");
        db.users.find({ "bb": true }).limit(10).forEach(function (err, doc) {
            if (err) throw err;
            if (doc) {
                bot.sendMessage(fromId, doc.firstName);
            }
        });

    } else if (/^marvin (.+verse list elephant.*)/ig.exec(msg.text.trim())) {
        //console.log(db);
        let verses = db.collection('verses');
        // log each of the first ten docs in the collection
        bot.sendMessage(fromId, "I'm connected! And here are your first ten verses");
        db.verses.find().limit(10).forEach(function (err, doc) {
            if (err) throw err;
            if (doc) {
                bot.sendMessage(fromId, doc.verse + ": " + doc.counter);
            }
        });

    } else if (/^marvin (.+holiday list setup elephant)(.*)/ig.exec(msg.text.trim())) {

        //getting the country name for current year every month
        let matches = /^marvin (.+holiday list setup elephant)(.*)/ig.exec(msg.text.trim());
        let holidayMatches = matches[2].trim();
        let splitWords = holidayMatches.split(/\W+/);
        bot.sendMessage(fromId, splitWords.toString());

        let holidayDetails = {
            holidayCountry: splitWords[0],
            holidayYear: splitWords[1],
        };
        console.log(holidayDetails);
        // log each of the first ten docs in the collection
        holidayRetrieveAndSaveOnly(chatDetails, holidayDetails)

    } else if (/^marvin (.+translate test)(.*)/ig.exec(msg.text.trim())) {
        let wordMatches = /^marvin (.+translate test)(.*)/ig.exec(msg.text.trim());
        console.log("This is wordMatches:" + wordMatches);
        let wordMatchesWords = wordMatches[1].split(/\W+/);
        console.log("This is wordMatchesWords:" + wordMatchesWords);

        //googleTranslate.translate('My name is Joshua', 'es', function (err, translation) {
        //    let translatedMessage = translation.translatedText;
        //    console.log(translatedMessage);
        //    // =>  Mi nombre es Brandon
        //    bot.sendMessage(fromId, translatedMessage);
        //});

    } else if (/^marvin (where.*am.*i)(.*)/ig.exec(msg.text.trim())) {
        let opt = {
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                // "keyboard": [
                //     [{
                //         text: "My location",
                //         request_location: true,
                //     }],
                //     {texit:"Cancel"}
                // ]
            }
        };
        bot.sendMessage(fromId, first_name + ", please share your location with me!" + emoji.hushed, opt)
            .then(function () {
                bot.once('message', function (msg) {
                    console.log("message is here!!");
                    console.log(msg);
                })
            });

        //googleTranslate.translate('My name is Joshua', 'es', function (err, translation) {
        //    let translatedMessage = translation.translatedText;
        //    console.log(translatedMessage);
        //    // =>  Mi nombre es Brandon
        //    bot.sendMessage(fromId, translatedMessage);
        //});

    }
    //-----------------------------------------------Exchange rate related use---------------------------------------------------------
    else if (/^marvin (.+)/ig.exec(msg.text.trim())) {
        let matches = /^marvin (.+)/ig.exec(msg.text.trim());
        let text1 = matches[1].trim().toUpperCase();
        let resp = match[1];
        bot.sendMessage(fromId, resp);
    }
});
bot.onText(/^what.*your.*name/i, function (msg, match) {
    //console.log("This is the message:" + msg);
    //console.log("This is the match:" + match);

    let chat = msg.chat;
    let chatId = msg.chat.id;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }

    let resp = match[1];
    bot.sendMessage(fromId, "My name is " + bot_name + "! Nice to meet you");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " asked me for my name. " + emoji.kissing_smiling_eyes);
});

// -------------------------------Functional Methods---------------------------------------

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
async function emojiFinder(key_word) {
    const url = "https://emojifinder.com/" + key_word;
    const results = await scrapeIt(url, {
        emojis: {
            listItem: "#results input",
            data: {
                content: {
                    attr: "value",
                }
            }
        }
    }, (err, data) => {
        if (err) {
            console.log("An error occured!", err);
            return;
        }
    });
    if (results) {
        let emojis: emoji[] = results.data.emojis;
        let chosen_emoji = emojis[Math.floor(Math.random() * emojis.length)];
        if (chosen_emoji && chosen_emoji.content) return chosen_emoji.content;
        else
            return emoji.blush;
    }
}
function getReplyOpts(type: string) {
    let opt = {};
    if (type === "force_only") {
        opt = {
            reply_markup: {
                force_reply: true,
            },
            parse_mode: "Markdown",
        }
    }
    if (type === "main_menu") {
        opt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Get food ard me", callback_data: "foodpls" },
                    { text: "Get exchange rate", callback_data: "getxrate", }],
                    [{ text: "Get weather", callback_data: "getweather", },
                    { text: "Get sunrise", callback_data: "getsunrise", }],
                    [{ text: "Insult", callback_data: "insult", }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
            },
            parse_mode: "Markdown",
        }
    }
    if (type === "back_to_main_menu") {
        opt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Back to main menu", callback_data: "menu", }],
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
            },
            parse_mode: "Markdown",
        }
    }
    if (type === "more_insult") {
        opt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "More insults?", callback_data: "insult", },
                    { text: "Back to main menu", callback_data: "menu", }],
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
            },
            parse_mode: "Markdown",
        }
    }
    if (type === "location_based") {
        opt = {
            reply_markup: {
                keyboard: [
                    [{
                        text: "Get my current location", request_location: true,
                    }],
                    [{ text: "Cancel" }],
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
            }
        };
    }
    if (type === "feeling") {
        opt = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Angry", callback_data: "angry", },
                    { text: "Broken Hearted", callback_data: "brokenHearted", }],
                    [{ text: "Insecure", callback_data: "insecure", },
                    { text: "Confused", callback_data: "confused", },
                    { text: "Faithless", callback_data: "needFaith", }],
                    [{ text: "upset", callback_data: "needEncouragement", },
                    { text: "unforgiving", callback_data: "needForgiveness", },
                    { text: "Tired", callback_data: "needStrength", },
                    ]
                ],
                one_time_keyboard: true,
                resize_keyboard: true,
                force_reply: true,
            }
        };
    }

    return opt;
};
// -------------------------------Location Methods---------------------------------------
function getLatLongMethod(chatDetails: chatDetails, locationInput, type = "weather") {
    //type: weather or sunrise
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    // insert function for reverse geolocation search
    let locationSearch = "https://maps.googleapis.com/maps/api/geocode/json?address=" + locationInput + "&key=" + googleAPIKey;
    console.log("LocationSearch URL", locationSearch);
    request(locationSearch, function (err, res, body) {
        if (res.status === "ZERO_RESULTS") {
            //error occurred show that no results can be found
            bot.sendMessage(fromId, "Encountered an error with the location " + emoji.hushed);
            return;
        }

        let info = JSON.parse(body);
        //console.log(info);
        let address = info.results[0].formatted_address;
        let placeID = info.results[0].place_id;
        let types = info.results[0].types;
        let lat = info.results[0].geometry.location.lat;
        let lng = info.results[0].geometry.location.lng;
        let latlng = [lat, lng];
        //bot.sendMessage(fromId, "This is your lat : long: " + lat + " : " + lng);

        if (type === "weather") {
            weatherReportMethod({ locationName: locationInput, lat, lng }, chatDetails);
        }
        else if (type === "sunrise") {
            getSunriseMethod(chatDetails, { locationName: locationInput, lat, lng });
        }
        else if (type === "food") {
            getNearestFood(chatDetails, { locationName: locationInput, lat, lng });
        }
    });
}
function weatherReportMethod(locationDetails, chatDetails: chatDetails) {
    //chat details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    //location details
    let { locationName, lat, lng } = locationDetails;

    let weatherSearch = "https://api.darksky.net/forecast/" + darkskyAPIKey + "/" + lat + "," + lng + "?units=si"; //set units as si Unit
    // console.log("Weather API Search: ", weatherSearch);
    request(weatherSearch, async (err, res, body) => {
        if (res.status === "ZERO_RESULTS") {
            //error occurred show that no results can be found
            bot.sendMessage(fromId, "Encountered an error with the location " + emoji.hushed);
            return;
        }
        let info = JSON.parse(body);
        let weatherInfo: weatherDetails = {
            temp: 0, apparentTemp: 0, hourlySummary: "", hourlyIcon: "", dailySummary: "", dailyIcon: ""
        };
        weatherInfo.temp = info.currently.temperature;
        weatherInfo["apparentTemp"] = info.currently.apparentTemperature;
        weatherInfo["hourlySummary"] = info.hourly.summary;
        weatherInfo["hourlyIcon"] = info.hourly.icon;
        weatherInfo["dailySummary"] = info.daily.summary;
        weatherInfo["dailyIcon"] = info.daily.icon;
        let chosen_emoji = await emojiFinder(weatherInfo.dailyIcon);

        let message = capitalizeFirstLetter(locationName) + "'s currently *" + weatherInfo.temp + "*°C but feels like *" + weatherInfo.apparentTemp + "*°C \n" +
            "Oh! and weather report says: " + weatherInfo.hourlySummary + chosen_emoji;
        bot.sendMessage(fromId, message);
    });
    bot.sendMessage(fromId, "Currently searching for your weather report.. " + emoji.bow);
}
function getNearestFood(chatDetails: chatDetails, locationDetails: any) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    //location details
    let { locationName, lat, lng } = locationDetails;

    axios({
        method: 'GET',
        url: 'https://api.yelp.com/v3/businesses/search',
        params: {
            term: "food",
            latitude: locationDetails.lat,
            longitude: locationDetails.lng,
            radius: 200, // in meters
            limit: 15, // max 50
            sort_by: "distance", // default: best_match
            price: "1,2,3,4",
            open_now: false, // default: false
        },
        headers: {
            Authorization: "Bearer " + process.env.yelpAPIKey
        },
    }).then((response) => {
        let msg = "";
        let url = "";
        let chosen_stall = response.data.businesses[Math.floor(Math.random() * response.data.businesses.length)];
        fallback.clear_context();
        if (chosen_stall) {
            let { coordinates, display_phone, distance, id, image_url, is_closed, location, display_address, price, rating, url, alias } = chosen_stall;
            msg = first_name + ", I found a shop called *" + alias + "*, currently " + (is_closed ? "closed" : "open") + "!\n";
            msg += "It's about " + distance.toFixed(2) + "m away. Not too bad?" + emoji.hushed + "\n";
            msg += "The actual address is __" + location.address1 + "__\n";
            msg += "Price: *" + price + "*,\nRating: *" + rating + "*\n";
        } else {
            msg = "Sorry I did not managed to find anything from [Yelp](https://www.yelp.com/)! " + emoji.white_frowning_face;
        }
        bot.sendMessage(fromId, msg, { parse_mode: "Markdown" });
        if (chosen_stall && chosen_stall.url)
            bot.sendMessage(fromId, "Oh oh! I've managed to grab the url too!\n" + chosen_stall.url);
    }).catch((err) => {
        if (err) {
            console.log("this is err: ", err);
            // bot.sendMessage(myId, err.request._header + "\n" + err.request._headers.host + err.request.path + "\n\n" + err.message);
            return;
        }
    })
    bot.sendMessage(fromId, "Currently searching for food around " + capitalizeFirstLetter(locationName) + ".. " + emoji.bow);
};
function getSunriseMethod(chatDetails: chatDetails, locationDetails) {
    //chat details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    //location details
    let { locationName, lat, lng } = locationDetails;

    let timezoneSearch = "https://maps.googleapis.com/maps/api/timezone/json?location=" + lat + "," + lng + "&timestamp=" + moment().unix() + "&key=" + googleTimeZoneAPIKey;
    //console.log(timezoneSearch);

    request(timezoneSearch, function (TZerr, TZres, TZbody) {
        let info2 = JSON.parse(TZbody);
        // console.log(info2);
        if (info2.status !== "OK") {
            //error occurred show that no results can be found
            bot.sendMessage(fromId, "Encountered an error with the time zone " + emoji.hushed);
            return;
        }
        let dateOffset = info2.rawOffset;
        let timeZoneId = info2.timeZoneId;
        let timeZoneName = info2.timeZoneName;
        let timeZoneDetails = { dateOffset: dateOffset, timeZoneId: timeZoneId, timeZoneName: timeZoneName }
        let today = moment().tz(timeZoneId).format("YYYY-MM-DD");
        let tomorrow = moment().tz(timeZoneId).add(1, 'd').format("YYYY-MM-DD");
        let sunriseSearch = "https://api.sunrise-sunset.org/json?lat=" + lat + "&lng=" + lng +
            "&date=" + today + "&formatted=0";

        request(sunriseSearch, function (err, res, body) {
            let info = JSON.parse(body);
            if (info.status !== "OK") {
                //error occurred show that no results can be found
                bot.sendMessage(fromId, "Encountered an error with the sunrise report " + emoji.hushed);
                return;
            }
            let sunrise = info.results.sunrise;
            let sunset = info.results.sunset;
            let sunriseDetails = { sunrise: sunrise, sunset: sunset };
            formattingSunriseMessage(chatDetails, sunriseDetails, timeZoneDetails, locationName);
        });

    });
    bot.sendMessage(fromId, "Currently searching for " + capitalizeFirstLetter(locationName) + "'s sunrise timing.. " + emoji.bow);

    // bot.sendMessage(fromId, "Currently searching for " + capitalizeFirstLetter(locationName) + "'s sunrise timing.. " + emoji.bow);
}
async function formattingSunriseMessage(chatDetails: chatDetails, sunriseDetails, timeZoneDetails, locationInput) {
    //chat related
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    //time zone details
    let { dateOffset, timeZoneId, timeZoneName } = timeZoneDetails;

    //sunrise related
    let sunrise = sunriseDetails.sunrise;
    let sunset = sunriseDetails.sunset;
    let sunriseArray = sunrise.split("+");
    let sunsetArray = sunset.split("+");
    let formattedSunrise = moment(sunriseArray[0]).add(dateOffset, 's').format("h:mm:ss a");
    let formattedSunset = moment(sunsetArray[0]).add(dateOffset, 's').format("h:mm:ss a");
    let formattedDate = moment(sunriseArray[0]).add(dateOffset, 's').format("Do MMMM YYYY");

    //get the duration from till the next sunrise/sunset
    let sunriseDurationFromNow = moment(sunrise).from(moment().tz(timeZoneId));
    let sunsetDurationFromNow = moment(sunset).from(moment().tz(timeZoneId));
    //console.log(sunsetDurationFromNow);

    let message = capitalizeFirstLetter(locationInput) + "'s sunrise details:";

    message = message + "\nThe current " + timeZoneName + " is " + moment().tz(timeZoneId).format("h:mm:ss a");

    if (moment().tz(timeZoneId).isBefore(sunrise) && moment().tz(timeZoneId).isSame(sunset, "Day")) {
        message = message + "\n" + emoji.sunrise + " Today's sunrise is " + sunriseDurationFromNow + " @ " + formattedSunrise + " " + timeZoneName
    } else {
        message = message + "\n" + emoji.sunrise + " Today's sunrise was @ " + formattedSunrise + " " + timeZoneName
    }
    if (moment().tz(timeZoneId).isBefore(sunset) && moment().tz(timeZoneId).isSame(sunset, "Day")) {
        message = message + "\n" + emoji.city_sunset + " Today's sunset is " + sunsetDurationFromNow + " @ " + formattedSunset + " " + timeZoneName
    } else {
        message = message + "\n" + emoji.city_sunset + " Today's sunset was " + sunsetDurationFromNow + " @ " + formattedSunset + " " + timeZoneName
    }

    bot.sendMessage(fromId, message);
}
// -------------------------------Other Methods---------------------------------------
async function marvinNewGetVerseMethod(chatDetails: chatDetails, fetchingVerse, type: string, version = "NIV") {
    //chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    let matches = /^([1-4]*\s*[a-zA-Z]+)\s*(.+)/ig.exec(fetchingVerse.trim());
    let book = matches[1].trim();
    let chapterAndVerse = matches[2].trim();
    fetchingVerse = book + chapterAndVerse;

    console.log("From new get verse method: ", fetchingVerse);

    // let testingUrl = "https://bible-api.com/" + fetchingVerse + "?translation=kjv";
    let url = "http://labs.bible.org/api/?passage=" + book + "+" + chapterAndVerse;
    console.log("URL: ", url);
    //let url = "https://ibibles.net/quote.php?" + version + "-" + book + "/" + chapter + ":" + verse;
    request(url, async (error, response, body) => {

        let info = "";
        try { info = JSON.parse(body); } catch{
            info = body.replace(/<b>/g, "").replace(/<\/b>/g, "");
        }
        if (response.statusCode != 200) {
            //bot.sendMessage(fromId, "Encountered error! Please check the verse again.");
            bot.sendMessage(fromId, "Invalid verse. Please enter a valid verse for me thank you!" + emoji.hushed);
            if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error retrieving verse from me!");
        } else {
            try {
                let verseReference = info;
                // console.log(verseReference);
                if (type === "normal") {
                    let msg_details = await bot.sendMessage(fromId, emoji.book + " Here you go " + capitalizeFirstLetter(first_name) +
                        "! From " + capitalizeFirstLetter(fetchingVerse) + "\n" + info);
                    fallback.set_latest_message(msg_details);
                }
                if (type === "edit_update") {
                    let latest_message = await fallback.get_latest_message();
                    bot.editMessageText(emoji.book + " Here you go " + capitalizeFirstLetter(first_name) +
                        "! From " + capitalizeFirstLetter(fetchingVerse) + "\n" + info, { chat_id: latest_message.chat.id, message_id: latest_message.message_id })
                    return info;
                }
                if (type === "feeling") {
                    let msg_details = await bot.sendMessage(fromId, emoji.book + " Here you go " + capitalizeFirstLetter(first_name) +
                        "! From " + capitalizeFirstLetter(fetchingVerse) + "\n" + info);
                    fallback.set_latest_message(msg_details);
                }
                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName +
                    ". Success retrieval of " + fetchingVerse +
                    "!" + emoji.kissing_smiling_eyes);

            } catch (err) {
                console.log("err in marvinNewGetVerseMethod: ", err);
            }

        }
    });
    if (type === "normal") bot.sendMessage(fromId, "Fetching verse now..");
    if (type === "feeling") bot.sendMessage(fromId, "Hope this encourages you " + first_name + ". Fetching verse now..");
}
/**
 * Only if the currency is not acquired then enter this method
 * @param chatDetails details about the chat, ID, person's name etc
 * @param exchangeRateDetails from and to currency to get the exchange rate as of the date
 */
function getExchangeRateMethod(chatDetails: chatDetails, exchangeRateDetails) {
    //chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    //currency related details
    let amount = exchangeRateDetails.amount;
    let fromCurrency = exchangeRateDetails.from;
    let toCurrency = exchangeRateDetails.to;
    let date = exchangeRateDetails.date;

    let exchangeRateURL = "http://api.fixer.io/latest?symbols=" + toCurrency + "&base=" + fromCurrency;
    //console.log(exchangeRateURL);
    //TODO: Request the url done
    //TODO: #2 insert into the DB
    //TODO: #3 callback the insert query to send the message out
    request(exchangeRateURL, async function (err, res, body) {
        let info = JSON.parse(body);

        //error handling
        if (info.error || Object.keys(info.rates).length == 0) {
            //error occurred show that no results can be found
            bot.sendMessage(fromId, "Encountered an error with retrieving exchange rate " + emoji.hushed);
            return;
        }

        //values from info
        let infoDate = info.date;
        let infoRates = info.rates;
        let base = info.base;
        let keys = Object.keys(infoRates);
        let numOfKeys = keys.length;
        let infoValue = [];

        keys.forEach(function (key) {
            let value = infoRates[key];
            infoValue.push(value);
            //do something with value;
        });

        //set up a updated exchangeRate details to pass to send
        let updatedExchangeRateDetails = {
            amount: amount,
            from: fromCurrency,
            to: toCurrency,
            date: date,
            rate: numOfKeys == 1 ? infoRates[toCurrency] : infoValue,
        };
        sendExchangeRateMethod(chatDetails, updatedExchangeRateDetails);

    });
}
/**
 * Only if the currency is already acquired then enter this method
 * @param chatDetails details about the chat, ID, person's name etc
 * @param exchangeRateDetails from and to currency to get the exchange rate as of the date
 */
function sendExchangeRateMethod(chatDetails: chatDetails, exchangeRateDetails) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    // currency related details
    let { amount, rate, date } = exchangeRateDetails;
    let fromCurrency = exchangeRateDetails.from;
    let toCurrency = exchangeRateDetails.to;
    let totalAmount = amount * rate;

    // message options
    let opt = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Correct!", callback_data: "correct", },
                { text: "Please invert", callback_data: "flip", }],
            ],
            one_time_keyboard: true,
            resize_keyboard: true,
            force_reply: true,
        },
        parse_mode: 'Markdown',
    }

    // message related
    let message = "";

    if (amount !== 1) {
        //amount got value
        message = amount + fromCurrency + " to " + toCurrency + " is " + totalAmount.toFixed(2) + toCurrency
            + " @ " + rate.toFixed(2) + toCurrency + "/" + fromCurrency + " " + emoji.hushed;

    } else {
        //amount is left blank or is 1
        message = "The rate is *" + rate + "*" + toCurrency + "/" + fromCurrency + " " + emoji.hushed + "\n\nIs this what you are looking for or you wish to flip the currency?";
    }
    bot.sendMessage(fromId, message, opt)
        .then((ans) => {
            bot.once('callback_query', async (callback_message) => {
                if (callback_message.data === "correct") {
                    bot.sendMessage(fromId, "Great! Good to serve you " + first_name + "!" + emoji.hushed);
                }
                if (callback_message.data === "flip") {
                    message = "Got it! The rate is *" + (1 / rate).toFixed(2) + "*" + fromCurrency + "/" + toCurrency + emoji.smile;
                    bot.sendMessage(fromId, message, { parse_mode: "Markdown" });
                }
            })
        });

    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved exchange rate " +
        fromCurrency + " to " + toCurrency + " at the rate of " + rate + "! Success!");
}
async function getGender(first_name: string) {

    let url = "https://gender-api.com/get?name=" + first_name + "&key=" + process.env.privateGenderAPIKey;
    const response = await axios({
        method: "GET",
        url: "https://gender-api.com/get",
        params: {
            name: first_name,
            key: process.env.privateGenderAPIKey,
        }
    }).catch((err) => {
        if (err) {
            console.log("Encountered error getting Gender", err);
            return;
        }
    })

    if (response.data) {
        let word = {
            cap_pronoun: "",
            pronoun: "",
            pronoun2: "",
            pronoun3: "",

        };
        switch (response.data.gender) {
            case 'male':
                word = {
                    cap_pronoun: "He",
                    pronoun: "he",
                    pronoun2: "his",
                    pronoun3: "him",
                };
                break;
            case 'female':
                word = {
                    cap_pronoun: "She",
                    pronoun: "she",
                    pronoun2: "her's",
                    pronoun3: "her",
                };
                break;
        }
        return word;
    };

};
function teachMeMath(chatDetails: chatDetails, number: number) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    let url = "http://numbersapi.com/" + number;

    request(url, (err, res, body) => {
        if (err) {
            console.log("Error occured!", err);
            let message = {
                raw: err,
                fromId,
                first_name,
            }
            bot.sendMessage(myId, JSON.stringify(message));
        }
        if (body) {

            bot.sendMessage(fromId, body);
            if (userId !== myId) bot.sendMessage(myId, "I taught " + capitalizeFirstLetter(first_name) + " from " + chatName + "about " + number + "!");

        }
    });
    bot.sendMessage(fromId, "Oh *" + number + "*? Let me see if I know anything about this number.. " + emoji.stuck_out_tongue,
        { parse_mode: "Markdown" });
}
// -------------------------------Beta Methods---------------------------------------
// Still in beta mode:
function getVerseMethod(chatDetails: chatDetails, key_word) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    const search = key_word.replace(' ', '%20');
    const version = "NIV";
    const url = `https://www.biblegateway.com/passage/?search=${search}&version=${version}`
    console.log("URL: ", url);
    const result = scrapeIt(url, {
        title: key_word,
    }, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        if (data) {
            bot.sendMessage(chatDetails.fromId, "Fetching verse now..");
            console.log(JSON.stringify(result.data, null, 2));
            bot.sendMessage(chatDetails.fromId, result.data);
            fallback.set_context("getvverse");
            return result.data;
        }
    });
};
async function runMenuOptions2(chatDetails: chatDetails, msg) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    if (msg.data) {
        let chosen_function = msg.data;

        fallback.set_context(chosen_function);
        switch (chosen_function) {
            case "foodpls":
                foodpls(chatDetails, msg);
                break;
            case "getxrate":
                getxrate(chatDetails, msg);
                break;
            case "getweather":
                getweather(chatDetails, msg);
                break;
            case "getsunrise":
                getsunrise(chatDetails, msg);
                break;
            case "insult":
                insult(chatDetails, msg);
                break;
            case "menu":
            default:
                menu(chatDetails, msg);
                break;
        }
    }
}
// -------------------------------SubFunction Methods---------------------------------------

async function foodpls(chatDetails: chatDetails, msg) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    fallback.set_context("foodpls");
    bot.sendMessage(fromId, first_name + ", where are you currently at? " + emoji.hushed, await getReplyOpts(chatName !== "individual chat" ? "force_only" : "location_based"))
        .then(() => {
            bot.once('message', (msg) => {
                // console.log("hungrygowhere message is here!!", msg);
                if (msg.text && msg.text !== "cancel") {
                    getLatLongMethod(chatDetails, msg.text, "food");
                }
                if (msg.location) {

                    let locationDetails = {
                        lat: msg.location.latitude,
                        lng: msg.location.longitude,
                        locationName: "your position",
                    };
                    getNearestFood(chatDetails, locationDetails);
                }
            });
        });
}
async function insult(chatDetails: chatDetails, msg) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    let insults = ["Dumbass", "Out of 100,000 sperm, you were the fastest?", "Look, you aint funny. Your life is just a joke."];
    let chosenInsult = insults[Math.floor(Math.random() * insults.length)];
    bot.sendMessage(fromId, chosenInsult);
    if (userId !== myId) echoToOwner(chatDetails, " managed to get the insult! Success!", true);
}
async function getverse(chatDetails: chatDetails, msg) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    fallback.set_context("getverse");
    bot.sendMessage(fromId, first_name + ", what verse do you like to get? " + emoji.hushed, await getReplyOpts("force_only"))
        .then(function () {
            bot.once('message', async (msg) => {
                let verse = "john3:30-31";
                let fetchingVerse = msg.text;
                if (fetchingVerse) {
                    const matchVerse = /^(?:\d|I{1,3})?\s?\w{2,}\.?\s*\d{1,}\:\d{1,}-?,?\d{0,2}(?:,\d{0,2}){0,2}/gm.exec(fetchingVerse.trim());
                    if (matchVerse) {
                        await fallback.clear_context();
                        marvinNewGetVerseMethod(chatDetails, matchVerse[0], "normal");
                    } else {
                        let gender = await getGender(first_name);
                        bot.sendMessage(fromId, "What is that? Doesnt seem to be a verse to me.. " + emoji.open_book);
                        await fallback.clear_context();
                        if (userId !== myId)
                            bot.sendMessage(myId, "I encountered verse retrieval error with " +
                                capitalizeFirstLetter(first_name) + " from " + chatName + "! " +
                                gender.cap_pronoun + " gave me *" + fetchingVerse + "*??",
                                { parse_mode: "Markdown" }
                            );

                    }
                }
            });
        });

}
async function menu(chatDetails: chatDetails, msg) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    let message = "Hi " + first_name + ", I am your personal assistance and I hope to be of help today. " + emoji.blush + "\n\n";
    message += "Here are functions I can help you with:\n"
    message += "/getverse - Get verses for you!\n"
    message += "/feeling- Get verses for you *based on your feelings*!\n"
    message += "/foodpls - Get the nicest food around you through Yelp\n"
    message += "/getweather - Get the weather based on your location\n"
    message += "/getxrate - Get the latest exchange rate\n"
    message += "/getsunrise - Get the timing of sunrise around you!\n"
    bot.sendMessage(fromId, message, { parse_mode: "Markdown" });
    if (userId !== myId) bot.sendMessage(myId, "Main menu was called by " + first_name + " from " + chatName);
}
async function getxrate(chatDetails: chatDetails, msg) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    bot.sendMessage(fromId, first_name + ", what currency do you wish to change from & to? " + emoji.thinking_face +
        "\n(e.g. sgd2cad, usd2myr, 100sgd2cad, 92.4sgd2myr) ", await getReplyOpts("force_only"))
        .then(function () {
            bot.once('message', async (msg) => {

                let text1 = msg.text.toUpperCase().trim();
                //error checks
                let error = false;
                if (text1.length < 7) {
                    error = true;
                } else if (text1.length == 7 && text1.split("")[text1.split("").length - 4] !== "2") {
                    error = true;
                } else if (text1.length == 7 && !/^[a-z]/ig.exec(text1[0])) {
                    error = true;
                } else if (text1.length > 7 && !/([\d|.]+)([A-Z]{3})2([A-Z]{3})/ig.exec(text1)) {
                    error = true;
                }
                if (error) {
                    bot.sendMessage(fromId, "Incorrect format used! Try again!");
                    return;
                }

                //format the message to include 1
                if (text1.length == 7) {
                    text1 = 1 + text1;
                }

                let xrateToken = /([\d|.]+)([A-Za-z]{3})2([A-Za-z]{3})/ig.exec(text1);
                let amount = xrateToken[1];
                let from = xrateToken[2];
                let to = xrateToken[3];

                //TODO: check if the to currency is legit *impt!
                let currentDate = moment().format("DD-MM-YYYY");
                let exchangeRateDetails = {
                    from: from,
                    to: to,
                    date: currentDate,
                    amount: amount.length > 0 ? Number(amount) : 1
                };
                let id = currentDate + "_" + from + "_" + to;
                getExchangeRateMethod(chatDetails, exchangeRateDetails);
                bot.sendMessage(fromId, "Currently searching for exchange rate.. " + emoji.bow);

            });
        });
}
async function getweather(chatDetails: chatDetails, msg) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    bot.sendMessage(fromId, first_name + ", what location's weather report do you like to get? " + emoji.hushed, await getReplyOpts("force_only"))
        .then(function () {
            bot.once('message', function (message) {
                if (message.text) {
                    getLatLongMethod(chatDetails, message.text, "weather");
                } else if (message.location) {
                    let locationDetails = {
                        lat: message.location.latitude,
                        lng: message.location.longitude,
                        locationName: "Your position",
                    };
                    weatherReportMethod(locationDetails, chatDetails);
                }
            });
        });
}
async function getsunrise(chatDetails: chatDetails, msg) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    bot.sendMessage(fromId, first_name + ", what location's sun rise and sun set you wish to get? " + emoji.hushed, await getReplyOpts("force_only"))
        .then(function () {
            bot.once('message', function (msg) {
                getLatLongMethod(chatDetails, msg.text, "sunrise");
            });
        });
}

// -------------------------------Incompleted Methods---------------------------------------
//TODO: incomplete as of 6 June 17(tues)
/**
 *
 * @param chatDetails details about the chat, ID, person's name etc
 * @param fetchingVerse the verse to be fetched
 * @param type type of prayer to be prayed, so can do up the filling according to the tone of the prayer
 */
function marvinCraftPrayer(chatDetails: chatDetails, fetchingVerse, type) {
    //chat details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    let url = "https://bible-api.com/" + fetchingVerse + "?translation=kjv";

    let genderVerification = "https://gender-api.com/get?name=" + first_name + "&key=" + privateGenderAPIKey;

    request(url, function (error, response, body) {
        let statusCode = response.statusCode;
        switch (statusCode) {
            case 10:
                if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error " + statusCode + "! See Valid country codes" + emoji.sob);
                break;
            case 20:
                break;

        }
    });

    request(url, function (error, response, body) {
        if (response.statusCode != 200) {
            //bot.sendMessage(fromId, "Encountered error! Please check the verse again.");
            bot.sendMessage(fromId, "Invalid verse. Please enter a valid verse for me thank you!" + emoji.hushed);
            if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error retrieving verse from me!");
        } else {
            let info = JSON.parse(body);
            let formattedVerse = info.text;
            let translation_name = info.translation_name;
            //console.log(formattedVerse);
            switch (type) {
                case "normal":
                    bot.sendMessage(fromId, emoji.book + " Here you go " + capitalizeFirstLetter(first_name) + "!");
                    break;
                case "sad":
                    bot.sendMessage(fromId, emoji.book + " Here you go " + capitalizeFirstLetter(first_name) + ", " + fetchingVerse + " says:");
                    break;
            }
            bot.sendMessage(fromId, formattedVerse + "\n(" + translation_name + ")");
            if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Success retrieval of " + fetchingVerse + "! " + emoji.kissing_smiling_eyes);
        }
    });
    bot.sendMessage(fromId, "Let me take some time to think..");

}
// -------------------------------Deprecated Methods---------------------------------------
function getVerseMethod1(chatDetails: chatDetails, fetchingVerse, type = "kjv") {
    //chat details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    let url = "https://bible-api.com/" + fetchingVerse + "?translation=kjv";

    request(url, function (error, response, body) {
        if (response.statusCode != 200) {
            //bot.sendMessage(fromId, "Encountered error! Please check the verse again.");
            bot.sendMessage(fromId, "Invalid verse. Please enter a valid verse for me thank you!" + emoji.hushed);
            if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error retrieving verse from me!");
        } else {
            let info = JSON.parse(body);
            let formattedVerse = info.text;
            let translation_name = info.translation_name;
            //console.log(formattedVerse);
            switch (type) {
                case "normal":
                    bot.sendMessage(fromId, emoji.book + " Here you go " + capitalizeFirstLetter(first_name) + "!");
                    break;
                case "sad":
                    bot.sendMessage(fromId, emoji.book + " Here you go " + capitalizeFirstLetter(first_name) + ", " + fetchingVerse + " says:");
                    break;
            }
            bot.sendMessage(fromId, formattedVerse + "\n(" + translation_name + ")");
            if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Success retrieval of " + fetchingVerse + "! " + emoji.kissing_smiling_eyes);
        }
    });
    bot.sendMessage(fromId, "Fetching verse now..");
}
function holidayRetrieveAndSaveOnly(chatDetails: chatDetails, holidayDetails) {
    //chat details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    //holiday details
    let holidayCountry = holidayDetails.holidayCountry;
    let holidayYear = holidayDetails.holidayYear;

    let listOfCountries = {
        "singapore": "SG",

    };

    //go through the twelve months
    for (let holidayMonth = 9; holidayMonth < 10; holidayMonth++) {
        let holidayURL = "https://holidayapi.com/v1/holidays?key=" + holidayAPIKey +
            "&country=" + holidayCountry + "&year=" + holidayYear + "&month=" + holidayMonth;

        console.log(holidayURL);
        request(holidayURL, function (err, res, body) {
            //console.log(res);
            let info = JSON.parse(body);
            if (info.status !== 200) {
                //error occurred show that no results can be found
                bot.sendMessage(fromId, "Encountered an error with the holiday search " + emoji.hushed);
                return;
            }
            let holidayId = info.holidays[0].date + "-" + info.holidays[0].name;
            console.log(holidayId);
            let newHolidayObject = {
                _id: holidayId,
                date: info.holidays[0].date,
                details: info.holidays
            };
            console.log(newHolidayObject);
            db.holidays.find({ _id: holidayId }, function (err, doc) {
                if (doc !== 1) { //dont exist in the system
                    //availableCountries: doc[0].availableCountries + holidayCountry,
                    db.holidays.insert({ _id: holidayId }, newHolidayObject);
                    bot.sendMessage(fromId, "I'm connected! And populated the db with holiday " + holidayCountry + " " + holidayMonth + " month" + holidayYear);
                } else {

                }

            });

        });
    }
    bot.sendMessage(fromId, "I'm connected! And am populating the db with holiday");
}
function getHolidayMethod(chatDetails: chatDetails, holidayDetails) {
    //chat related
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    //holiday details
    let holidayCountry = holidayDetails.holidayCountry;
    let holidayYear = holidayDetails.holidayYear;
    let holidayMonth = holidayDetails.holidayMonth;

    //TODO: get the holiday details for the Country for the month from DB and send it out


    bot.sendMessage(fromId, "Currently searching for your holidays for " + holidayCountry + ".. " + emoji.bow);
}
function bbAutoChecker(chatDetails: chatDetails) {
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;

    db.users.count({ _id: userId }, function (err, doc) {
        if (doc === 1) {
            //exist and is already my bb
            if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " already added " + first_name + "'s id hehe! Check from db is a success!");
        } else {
            db.users.update({
                _id: userId
            }, {
                    $set: {
                        profile: {
                            chatId: userId,
                        }
                    }
                }, function (err, doc) {
                    if (doc && userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + "'s ChatId is added into database" + emoji.smiley);
                });

        }
    });
}

// -------------------------------From here onwards, its all the commands ---------------------------------------

bot.onText(/\/menu/i, async (msg, match) => {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };
    bot.sendMessage(fromId, "Hi " + first_name + ", how may I help?");
    bot.sendMessage(myId, "Main menu was called by " + first_name + " from " + chatName);
    // menu(chatDetails, msg);

});
bot.onText(/\/foodpls|^\/wheretoeat/i, async (msg, match) => {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };
    fallback.set_context("foodpls");
    bot.sendMessage(fromId, first_name + ", where are you currently at? " + emoji.hushed, await getReplyOpts(chatName !== "individual chat" ? "force_only" : "location_based"))
        .then(() => {
            bot.once('message', (msg) => {
                console.log("hungrygowhere message is here!!", msg);
                if (msg.text && msg.text.toLowerCase() !== "cancel") {
                    getLatLongMethod(chatDetails, msg.text, "food");
                }
                if (msg.location) {
                    let locationDetails = {
                        lat: msg.location.latitude,
                        lng: msg.location.longitude,
                        locationName: "your position",
                    };
                    getNearestFood(chatDetails, locationDetails);
                }
                // foodpls(chatDetails, msg);
            });
        });
});
bot.onText(/\/getverse/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;

    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
        raw: msg.chat,
    };
    getverse(chatDetails, msg);
});
bot.onText(/\/getweather|^\/getweatherreport/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };

    let opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    getweather(chatDetails, msg);
});
bot.onText(/\/getsunrise/i, async (msg, match) => {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };

    getsunrise(chatDetails, msg);

});
bot.onText(/\/getxrate/i, function (msg, match) {
    //chat details
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };
    getxrate(chatDetails, msg);
});
bot.onText(/\/bbchecker/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }

    if (db) {
        db.users.count({ _id: userId }, function (err, doc) {
            if (doc === 1) {
                bot.sendMessage(fromId, "Yes " + first_name + "! You are my bb! " + emoji.heart_eyes);
                bot.sendSticker(fromId, bbStickerArchive[Math.floor(Math.random() * bbStickerArchive.length)]);
                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " is my bb! Check from db is a success!");
            } else {
                let bbRejectionArchive = [
                    "You are not my bb! Who are you?" + emoji.scream_cat,
                    first_name + "? Who is that?",
                    "It is an exclusive club, sadly you're not in it"
                ];
                bot.sendMessage(fromId, bbRejectionArchive[Math.floor(Math.random() * bbRejectionArchive.length)]);
                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " is sadly not bb! Check from db did not find anything!");

            }
        });
    } else {
        let fallbackArchive = [
            "Bb is currently under maintenance right now. " + emoji.scream_cat,
            first_name + ", that is a nice name! But bb is currently under maintenance",
            "And she will be loved~ oh, sorry I was distracted. I'm currently under maintenance right"
        ];
        bot.sendMessage(fromId, fallbackArchive[Math.floor(Math.random() * fallbackArchive.length)]);
        if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " is sadly not bb! Check from db did not find anything!");

    }

});
bot.onText(/\/insult|^\/scold/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }

    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };

    insult(chatDetails, msg);
});
bot.onText(/\/help/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendMessage(fromId, "This spectacular bot have a few commands." +
        "\n/feeling - to fetch verses for you based on how you feel" +
        "\n/insult - to get insulted" +
        "\n/getverse - get verses!" +
        "\n/givefeedback - give Marvin some feedback!" +
        "\n/shock - shock sticker " + emoji.astonished +
        "\n/stun - stun sticker " + emoji.astonished +
        "\n/smirk - smirk sticker " + emoji.smirk +
        "\n/sad - sad sticker " + emoji.sad +
        "\n/cryandhug - cry and hug sticker " + emoji.kissing_closed_eyes +
        "\n/hug - hug sticker " + emoji.kissing_closed_eyes +
        "\n/seeyou - see you sticker " + emoji.wave +
        "\n/hmph - you messed up sticker " + emoji.angry +
        "\n/hungry - eating sticker " + emoji.dizzy_face +
        "\n/shower - showered sticker " + emoji.pensive +
        "\n/what - eating sticker " +
        "\n/hooray - eating sticker " +
        "\n/excuseme - eating sticker " +
        "\n/yay - eating sticker ");
});
bot.onText(/\/stun/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD3QADCmwYBDSUSN5gf-BdAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved stun sticker! Success!");
});
bot.onText(/\/shock/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADtgADgIb7Aby3UMCUrWlLAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved shocked sticker! Success!");
});
bot.onText(/\/smirk/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADVwADgIb7ATi-G5xKUFDXAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved smirk sticker! Success!");
});
bot.onText(/\/sad/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADqgADCmwYBH3hVuODnzmHAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved sad sticker! Success!");
});
bot.onText(/\/hug/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADJwADgIb7AdaPu2jO6dqEAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved hug sticker! Success!");
});
bot.onText(/\/cryandhug/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADSwIAAgpsGAQbEtx-V7ZvjwI");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved hug and cry sticker! Success!");
});
bot.onText(/\/seeyou/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD4gADCmwYBLCrvcBMyDZOAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved seeyou sticker! Success!");
});
bot.onText(/\/goodjob/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADyAADgIb7AX8U8p_THYSoAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved goodjob sticker! Success!");
});
bot.onText(/\/timeout/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADygADgIb7AZK4fXnBJmnuAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " retrieved timeout sticker! Success!");
});
bot.onText(/\/hmph/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD9wADCmwYBHX_3XyzdCFOAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/hungry/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }

    bot.sendSticker(fromId, "CAADBQADkwADgIb7ASqDY-wF1yfNAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/shower/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADMQADgIb7AcRkgvZqwyZHAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/what/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD3AADgIb7AaNZlTOZ0wS6Ag");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/hooray/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADlQADgIb7AV2EtE7v4bfMAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/excuseme/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADIwADgIb7AbOEWEF0Jj_NAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/yay/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD8QADCmwYBFPlx-n0MfKuAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/cry/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADMwcAAgXm3gKC13HomeNgZQI");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Successful cry sticker!");
});
bot.onText(/\/xysmirk/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADAQADFAEAAtYvmwaMu5doAAF_xU8C");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Successful xy's smirk sticker!");
});
bot.onText(/\/buthor/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADlAADlHOkCWQseZcY0ktXAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Successful butt sticker!");
});
bot.onText(/\/aiyo/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADpAADCmwYBKxm5xAl3mikAg");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Successful aiyo sticker!");
});
bot.onText(/\/hehe/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADZAADlHOkCRItMD6WpTB3Ag");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Successful hehe sticker!");
});
bot.onText(/\/aniyo/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADXgADlHOkCdKqgJ7HMfk2Ag");
    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Successful aiyo sticker!");
});
bot.onText(/\/givefeedback/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }

    let opt = {
        reply_markup: {
            force_reply: true,
        }
    };

    bot.sendMessage(fromId, capitalizeFirstLetter(first_name) + ", how can I improve? " + emoji.hushed, opt)
        .then(function () {
            bot.once('message', function (msg) {
                bot.sendMessage(fromId, "Okie! I will take note! Thank you " + emoji.blush);
                if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " mentioned: "
                    + msg.text + ". " + emoji.kissing_smiling_eyes);
            });
        });

});
bot.onText(/\/talktomarvin/i, async (msg, match) => {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };

    bot.sendMessage(fromId, capitalizeFirstLetter(first_name) + ", Yes? " + emoji.hushed);

});
bot.onText(/\/getvverse/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };

    let opt = {
        reply_markup: {

            force_reply: true,
        }
    };

    bot.sendMessage(fromId, first_name + ", what verse do you like to get? " + emoji.hushed, opt)
        .then(function () {
            bot.once('message', function (msg) {

                let verse = "john3:30-31";
                let fetchingVerse = msg.text;
                if (fetchingVerse) {
                    const result: any = getVerseMethod(chatDetails, fetchingVerse);
                    bot.sendMessage(fromId, emoji.book + " Here you go " + capitalizeFirstLetter(first_name) + "!");
                    bot.sendMessage(fromId, result.verse);
                    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName +
                        ". Success retrieval of " + fetchingVerse +
                        "! Fetch from DB is a success! " + emoji.kissing_smiling_eyes);
                }

            });
        });
});
bot.onText(/\/getnewverse/i, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };

    let opt = {
        reply_markup: {
            force_reply: true,
        }
    };

    bot.sendMessage(fromId, first_name + ", what verse do you like to get? " + emoji.hushed, opt)
        .then(function () {
            bot.once('message', function (msg) {
                let verse = "john3:30-31";
                let version = "niv";
                let fetchingVerse = msg.text;
                if (fetchingVerse) {
                    //marvinGetVerseMethod(chatDetails, fetchingVerse, "normal");
                    marvinNewGetVerseMethod(chatDetails, fetchingVerse, "normal", version);
                }

            });
        });
});
bot.onText(/\/feeling/, async (msg, match) => {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }

    let messageId = msg.message_id
    let chatDetails = {
        fromId,
        chatName,
        first_name,
        userId,
        messageId,
    };

    bot.sendMessage(fromId, first_name + ", How are you feeling? " + emoji.hushed, await getReplyOpts("feeling"))
        .then(function (ans) {
            bot.once('callback_query', (msg) => {
                //bot.onText(/.+/g, function (msg, match) {
                let feeling = "happy";

                let chosenFeeling = msg.data;
                let arrayOfFeelings = verseArchive[chosenFeeling];
                if (!arrayOfFeelings) {
                    bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                    if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + ". Encountered error! " + emoji.sob);
                }
                let chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
                if (chosenVerse) marvinNewGetVerseMethod(chatDetails, chosenVerse, "feeling");
                else {
                    // inform me
                    echoToOwner(chatDetails, "Failed to get verse for feeling: " + chosenFeeling + " trying to get verse: " + chosenVerse, true);
                }
            });
        });

});

bot.onText(/\/getHoliday/i, async (msg, match) => {
    //chat details
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    let chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    bot.sendMessage(fromId, first_name + ", what location's holiday you wish to get? " + emoji.hushed, await getReplyOpts("force_only"))
        .then(function () {
            bot.once('message', (msg) => {
                db.holidays.count({}, function (err, doc) {

                });

            });
        });
});
// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
    let fromId = msg.from.id;
    let resp = match[1];
    bot.sendMessage(fromId, resp);
});
bot.onText(/\/set/, function (msg, match) {
    let chat = msg.chat;
    let fromId = msg.from.id;
    let userId = msg.from.id;
    let first_name = msg.from.first_name;
    let chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }

    let message = first_name + ", there's currently only New International Version. " +
        "\nApologies for the inconveniences caused.";

    let keyboard = [
        [{ text: 'KJV' }, { text: 'WEB' }]
    ];
    let replyObject = {
        reply_markup: keyboard,
        resize_keyboard: true
    };

    bot.sendMessage(fromId, message);
    bot.sendSticker(fromId, "CAADBQADqgADCmwYBH3hVuODnzmHAg");
    if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". He/ She wants to set up the version!");

});

let verseArchive = {
    brokenHearted: [
        "Psalm 34:17-18",
        "Psalm 147:3",
        "Psalm 73:26"
    ],
    alone: [
        "Isaiah41:10",
        "Psalm 23:4",
        "Hebrews 13:5",
    ],
    insecure: [
        "Deut 31:8",
        "Psalm 73:23-24",
        "Ephesians 4:13-14",
        "Ephesians 2:1-2",
        "1 Samuel 14:7"
    ],
    stress: [
        "James 1:2-4",
        "John14:27",
        "Proverbs 14:3",
        "1 Corinthians 3:11",
        "Luke 21:19",
        "Psalm 94:19",
        "Matt 11:28",
        "Philippians 4:6",
        "Romans 8:28",
        "Psalm 119:143"
    ],
    confused: [
        "matt 7:7",
        "2 tim 2:7",
        "1 Cor 14:33",
        "Isaiah 40:31"
    ],
    needFaith: [
        "1 John 5:5",
        "1 Tim 4:12",
        "Galatians 2:20",
        "James 1:6",
        "John 3:36",
        "John 4:35"
    ],
    needEncouragement: [
        "Proverbs 18:10",
        "Proverbs 3:5-6",
        "Isaiah 41:10",
        "John 14:33",
        "John 14:27",
        "1 Peter 5:7",
        "Isaiah 26:3"
    ],
    needForgiveness: [
        "Matt 6:14-15",
        "1 John 1:9",
        "Acts 3:19",
        "Isaiah 1:18",
        "Daniel 9:9",
        "Colossians 1:13-14"
    ],
    angry: [
        "Ephesians 4:26-27",
        "James 1:19-20",
        "Ecclesiastes 7:9",
        "Proverbs 15:18",
        "Colossians 3:8"
    ],
    needStrength: [
        "PPhilippians 4:13",
        "Isaiah 40:29",
        "Psalm 119:28",
        "Ephesians 6:10",
        "2 Corinthians 12:9",
        "Psalm 46:1",
        "Psalm 22:19",
        "Psalm 28:7-8",
        "Isaiah 12:2",
        "Isaiah 40:31",
        "Habakkuk 3:19"
    ]
};

let youtubeArchive = {
    happy: [],
    conviction: [],
    reminder: [],
};

let prayerArchive = {
    confidence: {
        lack: {
            self: [],
            future: [],
            career: [],
        },
        more: [],
    },
    faith: {
        lack: {},
        more: {},
        reminder: {},
    },
    hope: {
        lack: {},
        more: {}
    },
    love: {
        lack: {},
        more: {},
    },
    Sensitivity: {
        people: {},
        god: ["Dear Jesus, I want to commit", " into your hands, I pray that as ", "goes about reading Your word. I pray you will open up "]
    }

};

let bbStickerArchive = [
    "CAADBQAD-wADCmwYBGNNElnBua4CAg",
    "CAADBQADNwADgIb7AV1SxhrjoTO7Ag",
    "CAADBQADjwADgIb7Ae-7bZnnY0_qAg",
    "CAADBQADxwADCmwYBETPPM5CdJhGAg"
];

let commandArchive = "getxrate,getweather,help,insult,foodpls,getverse,talktomarvin,givefeedback,feeling,getsunrise,stun,smirk,sad,hug,cryandhug,seeyou,hmph,hungry,shower,what,hooray,excuseme,yay,timeout,goodjob,cry,buthor,hehe,aniyo,xysmirk"