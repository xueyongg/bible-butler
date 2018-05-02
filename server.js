var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
var mongojs = require('mongojs');
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
const ngrok = require('ngrok');
var request = require('request');
var moment = require('moment');
var moment = require('moment-timezone');
var emoji = require('node-emoji').emoji;
const scrapeIt = require("scrape-it");
//var googleTranslate = require('google-translate')(apiKey);
var token = process.env.TELEGRAM_TOKEN;
var privateGenderAPIKey = process.env.privateGenderAPIKey;
var darkskyAPIKey = process.env.darkskyAPIKey;
var googleAPIKey = process.env.googleAPIKey;
var googleTimeZoneAPIKey = process.env.googleTimeZoneAPIKey;
var holidayAPIKey = process.env.holidayAPIKey;
var exchangeRateAPIKey = process.env.exchangeRateAPIKey;
var myId = Number(process.env.myId);
const environment = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const HOST = environment !== "development" ? process.env.HOST : "LOCALHOST";
let DOMAIN = process.env.LOCAL_URL || "https://localhost";
let DB_HOST = process.env.DB_HOST;
// console.log("< process:", process);
// console.log("< PORT:", PORT);
// console.log("< TELEGRAM_TOKEN:", TELEGRAM_TOKEN);
// console.log("< HOST:", HOST);
// console.log("< DOMAIN:", DOMAIN);
let bot = new TelegramBot(token, { polling: true });
// Method that creates the bot and starts listening for updates
const takeOff = () => {
    //Setup WebHook way
    const bot = new TelegramBot(token, {
        webHook: {
            host: HOST,
            port: PORT
        },
        onlyFirstMatch: true
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
        info.push(`- Date: ${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`);
        info.push(`- Time: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
        info.push('------------------------------');
        console.log(info.join('\n'));
    })
        .catch(console.log);
    // Here I'd call a setListeners to set all the event listeners for the updates
};
if (!DOMAIN) {
    // If no URL is provided for the WebHook from environment variables, we open an ngrok tunnel
    bot.openTunnel(PORT)
        .then(host => {
        // Once we have the ngrok tunnel host, we set the coresponding variable
        DOMAIN = host;
        console.log(`Ngrok tunnel opened at ${host}`);
        // Then start listening for updates
        takeOff();
    })
        .catch(console.log);
}
else {
    // If environment variables define a url, we start listening for the updates without opening a tunnel
    takeOff();
}
var bot_name = "Marvin";
var numOfBebePhotos = 3;
let connection_string = "mongodb://" + DB_HOST + ":27017" + "/biblebutler";
//Connecting to the db at the start of the code
console.log("This is my connection_string: ");
console.log(connection_string);
let db;
if (HOST !== "LOCALHOST") {
    MongoClient.connect(connection_string, function (err, db) {
        if (err) {
            throw err;
        }
        else {
            console.log("successfully connected to the database");
        }
    });
    db = mongojs(connection_string, ['verses', 'users', 'locations', 'verses', 'holidays', "xrates"], (err, res) => {
        if (err) {
            bot.sendMessage(myId, "Error connecting to db, rescue me soon!");
            throw err;
        }
        else {
            console.log("successfully connected to the database");
        }
        console.log("Trying to connect to db..");
    });
}
//end of connecting to db
//bot.setWebHook('public-url.com', {
//    certificate: '/Users/Xueyong/Desktop/bibleButler/crt.pem', // Path to your crt.pem
//});
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
    var fromId = msg.from.id;
    var resp = match[1];
    bot.sendMessage(fromId, resp);
});
bot.onText(/\/set/, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var message = first_name + ", there's currently only New International Version. " +
        "\nApologies for the inconveniences caused.";
    var keyboard = [
        [{ text: 'KJV' }, { text: 'WEB' }]
    ];
    var replyObject = {
        reply_markup: keyboard,
        resize_keyboard: true
    };
    bot.sendMessage(fromId, message);
    bot.sendSticker(fromId, "CAADBQADqgADCmwYBH3hVuODnzmHAg");
    if (userId !== myId)
        bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". He/ She wants to set up the version!");
});
// Any kind of message
bot.on('message', function (msg) {
    var chat = msg.chat;
    var chatId = msg.chat.id;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    // photo can be: a file path, a stream or a Telegram file_id
    // Will only reply when its username is called
    const trimmed_message = msg.text.trim();
    const matchVerse = /(?:\d|I{1,3})?\s?\w{2,}\.?\s*\d{1,}\:\d{1,}-?,?\d{0,2}(?:,\d{0,2}){0,2}/g.exec(trimmed_message);
    //console.log("This is the match: " + match);
    if (matchVerse) {
        bot.sendMessage(myId, marvinNewGetVerseMethod(chatDetails, matchVerse[0], "normal"));
    }
    else {
        bot.sendMessage(fromId, trimmed_message);
        if (userId !== myId)
            bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Fall back on echo..");
    }
});
/*
 this method will try to call methods based on messages to BA, as if its a conversation
 */
bot.onText(/^marvin (.+)/i, function (msg, match) {
    //chat details
    var chat = msg.chat;
    var chatId = msg.chat.id;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    console.log("< Message received: ", msg);
    const command = /^get verse/.exec(match[1]);
    if (command) {
        var matches = /^marvin (.+verse)(.+[0-9]$)/ig.exec(msg.text.trim());
        var fetchingVerse = matches[2].trim();
        if (fetchingVerse)
            marvinNewGetVerseMethod(chatDetails, fetchingVerse, "normal", "NIV");
        else
            bot.sendMessage(fromId, "Invalid verse. Please enter a valid verse for me thank you!" + emoji.hushed);
    }
    else if (/^marvin (.*get)(.+[0-9]$)/ig.exec(msg.text.trim())) {
        //just the verse, since im the only one that's gonna use this
        var matches = /^marvin (.*get)(.+[0-9]$)/ig.exec(msg.text.trim());
        var fetchingVerse = matches[2].trim();
        marvinNewGetVerseMethod(chatDetails, fetchingVerse, "normal");
    }
    else if (/^marvin (.+sad)/ig.exec(msg.text.trim())) {
        var opt = {
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
        bot.sendMessage(fromId, "What happened " + first_name + "? " + emoji.slightly_frowning_face + " Do you need a verse?", opt)
            .then(function (ans) {
            bot.once('callback_query', function (msg) {
                var feeling = "needEncouragement";
                var response = msg.data;
                console.log("This is my response: " + response);
                if (response === "yes") {
                    var chosenFeeling = "needEncouragement";
                    var arrayOfFeelings = verseArchive[chosenFeeling];
                    if (!arrayOfFeelings) {
                        bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                        if (userId !== myId)
                            bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error! " + emoji.sob);
                    }
                    var chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
                    marvinNewGetVerseMethod(chatDetails, chosenVerse, "sad");
                    bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                }
                else {
                    bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                }
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " just told me he/she is sad " + emoji.sob);
            });
        });
    }
    else if (/^marvin (.+angry)/ig.exec(msg.text.trim())) {
        var opt = {
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
        var secondOpt = {
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
        var thirdOpt = {
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
                var feeling = "needEncouragement";
                var response = msg.data;
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
                                var secondResponse = secondMsg.data;
                                //console.log("this is the secondResponse: " + secondResponse);
                                switch (secondResponse) {
                                    case 'yes':
                                        bot.sendMessage(fromId, "Here's the question! Sending photo..");
                                        bot.sendMessage(fromId, "What is the name of my dog? " + emoji.thinking_face + " (Only one try, make it count!)", thirdOpt)
                                            .then(function () {
                                            bot.once('callback_query', function (thirdMsg) {
                                                var thirdResponse = thirdMsg.data;
                                                console.log("this is the thirdMsg: " + thirdMsg);
                                                if (thirdResponse.toUpperCase() === "BEBE") {
                                                    var songOption = {
                                                        duration: 615,
                                                        performer: "Elevation Worship",
                                                        title: "Do it again"
                                                    };
                                                    bot.sendMessage(fromId, "YOU GOT IT RIGHT! " + emoji.heart_eyes + " Fetching song now..");
                                                    bot.sendAudio(fromId, "./server/data/Do It Again.mp3", songOption);
                                                    if (userId !== myId)
                                                        bot.sendMessage(myId, first_name + " from " + chatName + " managed to get bebe's name, sent the song 'Do It Again' over! " + emoji.sob);
                                                }
                                                else {
                                                    var theRandomizedPhotoNumber = Math.ceil(Math.random() * numOfBebePhotos);
                                                    console.log("theRandomizedPhotoNumber: " + theRandomizedPhotoNumber);
                                                    bot.sendMessage(fromId, "Sadly that is incorrect");
                                                    bot.sendMessage(fromId, "Here's a photo of her for you anyways! " + emoji.heart_eyes);
                                                    bot.sendPhoto(fromId, "./server/data/bebe" + theRandomizedPhotoNumber + ".jpg");
                                                    if (userId !== myId)
                                                        bot.sendMessage(myId, first_name + " from " + chatName + " managed to didnt bebe's name, sent her photo over! Hehe " + emoji.sob);
                                                }
                                            });
                                        });
                                        break;
                                    default:
                                        bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                                        break;
                                }
                            });
                        });
                        break;
                    case 'verse':
                        var chosenFeeling = "angry";
                        var arrayOfFeelings = verseArchive[chosenFeeling];
                        if (!arrayOfFeelings) {
                            bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                            if (userId !== myId)
                                bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error! " + emoji.sob);
                        }
                        var chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
                        marvinNewGetVerseMethod(chatDetails, chosenVerse, "sad");
                        bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                        break;
                    default:
                        bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                        break;
                }
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " just told me he/she is angry " + emoji.sob);
            });
        });
    }
    else if (/^marvin (.+broken.*)/ig.exec(msg.text.trim())) {
        var opt = {
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
        var secondOpt = {
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
        var thirdOpt = {
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
                var feeling = "needEncouragement";
                var response = msg.data;
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
                                var secondResponse = secondMsg.data;
                                //console.log("this is the secondResponse: " + secondResponse);
                                switch (secondResponse) {
                                    case 'yes':
                                        bot.sendMessage(fromId, "Here's the question!");
                                        bot.sendMessage(fromId, "How old was my dog when she first joined the family? " + emoji.thinking_face + " (Only one try, make it count!)", thirdOpt)
                                            .then(function () {
                                            bot.once('callback_query', function (thirdMsg) {
                                                var thirdResponse = thirdMsg.data;
                                                console.log("this is the thirdMsg: " + thirdMsg);
                                                if (thirdResponse.toUpperCase() === "BEBE") {
                                                    var songOption = {
                                                        duration: 351,
                                                        performer: "All Sons & Daughters",
                                                        title: "Brokenness Aside"
                                                    };
                                                    bot.sendMessage(fromId, "YOU GOT IT RIGHT! " + emoji.heart_eyes + " Fetching song now..");
                                                    bot.sendAudio(fromId, "./server/data/Brokenness Aside.mp3", songOption);
                                                    if (userId !== myId)
                                                        bot.sendMessage(myId, first_name + " from " + chatName + " managed to get bebe's age when she first joined, sent the song 'Brokenness Aside' over! " + emoji.sob);
                                                }
                                                else {
                                                    var theRandomizedPhotoNumber = Math.ceil(Math.random() * numOfBebePhotos);
                                                    bot.sendMessage(fromId, "Sadly that is incorrect");
                                                    bot.sendMessage(fromId, "Here's a photo of her for you anyways! " + emoji.heart_eyes);
                                                    bot.sendPhoto(fromId, "./server/data/bebe" + theRandomizedPhotoNumber + ".jpg");
                                                    if (userId !== myId)
                                                        bot.sendMessage(myId, first_name + " from " + chatName + " managed to didnt bebe's age when she first joined, sent her photo over! Hehe " + emoji.sob);
                                                }
                                            });
                                        });
                                        break;
                                    default:
                                        bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                                        break;
                                }
                            });
                        });
                        break;
                    case 'verse':
                        var chosenFeeling = "needStrength";
                        var arrayOfFeelings = verseArchive[chosenFeeling];
                        if (!arrayOfFeelings) {
                            bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                            if (userId !== myId)
                                bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error! " + emoji.sob);
                        }
                        var chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
                        marvinNewGetVerseMethod(chatDetails, chosenVerse, "sad");
                        bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                        break;
                    default:
                        bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                        break;
                }
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " just told me he/she is angry " + emoji.sob);
            });
        });
    }
    else if (/^marvin (.+broke[^n].*)/ig.exec(msg.text.trim())) {
        //https://www.youtube.com/watch?v=dNwt7LQiYck
        var opt = {
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
        var secondOpt = {
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
        var thirdOpt = {
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
                var feeling = "brokenHearted";
                var response = msg.data;
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
                                var secondResponse = secondMsg.data;
                                //console.log("this is the secondResponse: " + secondResponse);
                                switch (secondResponse) {
                                    case 'yes':
                                        bot.sendMessage(fromId, "Here's the question!");
                                        bot.sendPhoto(fromId, "./server/data/bebe4.jpg");
                                        bot.sendMessage(fromId, "What's the name of the smaller dog? " + emoji.thinking_face + " (Only one try, make it count!)", thirdOpt)
                                            .then(function () {
                                            bot.once('callback_query', function (thirdMsg) {
                                                var thirdResponse = thirdMsg.data;
                                                console.log("this is the thirdMsg: " + thirdMsg);
                                                if (thirdResponse.toUpperCase() === "BEBE") {
                                                    var songOption = {
                                                        duration: 295,
                                                        performer: "Elevation Worship",
                                                        title: "Give Me Faith"
                                                    };
                                                    bot.sendMessage(fromId, "YOU GOT IT RIGHT! " + emoji.heart_eyes + " Fetching song now..");
                                                    bot.sendAudio(fromId, "./server/data/Give Me Faith.mp3", songOption);
                                                    if (userId !== myId)
                                                        bot.sendMessage(myId, first_name + " from " + chatName + " managed to get bebe's age when she first joined, sent the song 'Brokenness Aside' over! " + emoji.sob);
                                                }
                                                else {
                                                    var theRandomizedPhotoNumber = Math.ceil(Math.random() * numOfBebePhotos);
                                                    bot.sendMessage(fromId, "Sadly that is incorrect");
                                                    bot.sendMessage(fromId, "Here's a photo of her for you anyways! " + emoji.heart_eyes);
                                                    bot.sendPhoto(fromId, "./server/data/bebe" + theRandomizedPhotoNumber + ".jpg");
                                                    if (userId !== myId)
                                                        bot.sendMessage(myId, first_name + " from " + chatName + " managed to didnt bebe's age when she first joined, sent her photo over! Hehe " + emoji.sob);
                                                }
                                            });
                                        });
                                        break;
                                    default:
                                        bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                                        break;
                                }
                            });
                        });
                        break;
                    case 'verse':
                        var chosenFeeling = "brokenHearted";
                        var arrayOfFeelings = verseArchive[chosenFeeling];
                        if (!arrayOfFeelings) {
                            bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                            if (userId !== myId)
                                bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error! " + emoji.sob);
                        }
                        var chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
                        marvinNewGetVerseMethod(chatDetails, chosenVerse, "sad");
                        bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
                        break;
                    default:
                        bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
                        break;
                }
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " just told me he/she is angry " + emoji.sob);
            });
        });
    }
    else if (/^marvin (.+lost.*)/ig.exec(msg.text.trim())) {
        //Jesus I come
        //https://www.youtube.com/watch?v=_8Fx06jskfY
    }
    else if (/^marvin (.+am.*your bb.*)/ig.exec(msg.text.trim())) {
        //TODO: Access the db check my credentials and save, up to 100 bb
    }
    else if (/^marvin (.+goodjob.*)/ig.exec(msg.text.trim())) {
    }
    else if (/^marvin (.+lost.*)/ig.exec(msg.text.trim())) {
    }
    else if (/^marvin (.+songs.*)/ig.exec(msg.text.trim())) {
    }
    else if (/^marvin (.+save.*(favourite|favorite).*verse.*)/ig.exec(msg.text.trim())) {
        //TODO: Access the db check my credentials and save, up to 100 verses
        //TODO: verse structure = {verse, text, description}
    }
    else if (/^marvin (.+be.*your.*bb.*)/ig.exec(msg.text.trim())) {
        //TODO: Access the db check my credentials and check if user is bb
        //TODO: verse structure = {verse, text, description}
        var opt = {
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
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " is reminded of his/her bb status! Check from db is a success!");
            }
            else {
                //to add her/him as bb
                bot.sendMessage(fromId, "Aww you do? If so, here's a question you have to pass to be my bb! " + emoji.kissing_smiling_eyes);
                bot.sendMessage(fromId, "What does my owner's sisters call him?", opt)
                    .then(function (ans) {
                    bot.once("callback_query", function (msg) {
                        var response = msg.data.toLowerCase();
                        switch (response) {
                            case 'xue':
                                //correct answer
                                console.log("you got the answer correct!");
                                db.users.insert({
                                    _id: userId,
                                    firstName: first_name,
                                    bb: true
                                }, function (err, doc) {
                                    if (doc)
                                        bot.sendMessage(fromId, "Correct! You are my bb now! Welcome to my exclusive circle! " + emoji.blush);
                                });
                                if (userId !== myId)
                                    bot.sendMessage(myId, first_name + " from " + chatName + " is added into database as my bb" + emoji.smiley);
                                //bot.sendMessage(fromId, "You are my bb now! Welcome to my inner circle!" + emoji.blush);
                                break;
                            case 'no':
                                //wrong answer
                                console.log("you got the answer wrong!");
                                bot.sendMessage(fromId, "You got the answer wrong!");
                                bot.sendMessage(fromId, "Come back to me after you know my owner! I wouldn't be here without him you know! " + emoji.triumph);
                                if (userId !== myId)
                                    bot.sendMessage(myId, first_name + " from " + chatName + " is got the answer wrong and is NOT added into database as my bb" + emoji.white_frowning_face);
                                break;
                        }
                    });
                });
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " is sadly not bb! Check from db did not find anything!");
            }
        });
    }
    else if (/^marvin (.+pray for me.*)/ig.exec(msg.text.trim())) {
        var opt = {
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
        /*bot.sendMessage(fromId, "What happened " + first_name + "? " + emoji.slightly_frowning_face + "What can i pray for you?", opt)
         .then(function (ans) {
         bot.once('callback_query', function (msg) {
         var feeling = "needEncouragement";
         var response = msg.data;
         console.log("This is my response: " + response);
         if (response === "yes") {
         var chosenFeeling = "needEncouragement";
         var arrayOfFeelings = verseArchive[chosenFeeling];
         if (!arrayOfFeelings) {
         bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
         if (userId !== myId) bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error! " + emoji.sob);
         }
         var chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
         marvinGetVerseMethod(chatDetails, chosenVerse, "sad");
         bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
         } else {
         bot.sendMessage(fromId, "Oh okay~ Just talk to me if you need anything else! " + emoji.sob);
         }
         if (userId !== myId) bot.sendMessage(myId, first_name + " from " + chatName + " just told me he/she is sad " + emoji.sob);
         })
         })*/
    } //TODO: TO BE COMPLETED
    else if (/^marvin what.*(favourite|favorite).*song/ig.exec(msg.text.trim())) {
        bot.sendMessage(fromId, "Let me share it with you!" + emoji.relieved);
        bot.sendDocument(fromId, "./server/data/Brokenness Aside.mp3");
        if (userId !== myId)
            bot.sendMessage(myId, first_name + " from " + chatName ? chatName : "individual chat" + " asked me for my favourite song. " + emoji.kissing_smiling_eyes);
    }
    else if (/^marvin what.*(favourite|favorite).*gif/ig.exec(msg.text.trim())) {
        bot.sendMessage(fromId, "Let me show you!" + emoji.relieved);
        bot.sendDocument(fromId, "./server/data/Webarebear.gif");
        if (userId !== myId)
            bot.sendMessage(myId, first_name + " from " + chatName ? chatName : "individual chat" + " asked me for my favourite gif. " + emoji.kissing_smiling_eyes);
    }
    else if (/^marvin convey.*(msg|message)/ig.exec(msg.text.trim())) {
        bot.sendMessage(fromId, "What do you want to convey?" + emoji.slightly_smiling_face)
            .then(function (ans) {
            bot.once('message', function (msg) {
                var response = msg.text;
                bot.sendMessage(fromId, "Oh okay! I will convey the message! " + emoji.kissing_closed_eyes);
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " said that: "
                        + response + " "
                        + emoji.astonished);
            });
        });
    }
    else if (/^marvin (.+new comment.*)(.+)/ig.exec(msg.text.trim())) {
        //console.log(db);
        //take out the comment, and save it
        //alert user if got more than 50 comments, and the last comment is how long ago
        var verses = db.collection('verses');
        // log each of the first ten docs in the collection
        db.verses.find({}).limit(1).forEach(function (err, doc) {
            if (err)
                throw err;
            if (doc) {
                bot.sendMessage(fromId, "I'm connected!");
                bot.sendMessage(fromId, doc.text);
            }
        });
    } //TODO: TO BE COMPLETED
    else if (/^marvin (.+)(last comment.*)/ig.exec(msg.text.trim())) {
        //console.log(db);
        //ensure that the validation is done within 30mins
        //first, second, third, fourth, fifth
        //anything ask if want to get the last 10, if yes then take the last 10
        var verses = db.collection('verses');
        // log each of the first ten docs in the collection
        db.verses.find({}).limit(1).forEach(function (err, doc) {
            if (err)
                throw err;
            if (doc) {
                bot.sendMessage(fromId, "I'm connected!");
                bot.sendMessage(fromId, doc.text);
            }
        });
    } //TODO: TO BE COMPLETED
    else if (/^marvin .+last(.+)comment.*/ig.exec(msg.text.trim())) {
        //console.log(db);
        //numeric value
        //then retrieve after confirming that the number is last then 10 and is numeric
        var verses = db.collection('verses');
        // log each of the first ten docs in the collection
        db.verses.find({}).limit(1).forEach(function (err, doc) {
            if (err)
                throw err;
            if (doc) {
                bot.sendMessage(fromId, "I'm connected!");
                bot.sendMessage(fromId, doc.text);
            }
        });
    } //TODO: TO BE COMPLETED
    else if (/^marvin (.+bb rights.*)/ig.exec(msg.text.trim())) {
        //console.log(db);
        //let her/him know what are your rights, give the options and then a brief description. After that ask if they want to add in or edit
        var verses = db.collection('verses');
        // log each of the first ten docs in the collection
        db.verses.find({}).limit(1).forEach(function (err, doc) {
            if (err)
                throw err;
            if (doc) {
                bot.sendMessage(fromId, "I'm connected!");
                bot.sendMessage(fromId, doc.text);
            }
        });
    } //TODO: TO BE COMPLETED
    else if (/^marvin (.+)weather.*/ig.exec(msg.text.trim())) {
        //console.log(db);
        //let her/him know what are your rights, give the options and then a brief description. After that ask if they want to add in or edit
        var weatherMatches = /^marvin (.+)weather.*/ig.exec(msg.text.trim());
        console.log("This is weatherMatches:" + weatherMatches);
        var splitWord = weatherMatches[1].split(/\W+/);
        console.log("this is splitWord: " + splitWord);
        console.log("this is splitWord: " + splitWord[splitWord.length - 2]);
        var name = splitWord[splitWord.length - 2].trim();
        db.locations.count({ name: name }, function (err, doc) {
            if (doc === 1) {
                db.locations.find({ name: name }, function (err, doc) {
                    if (err)
                        throw err;
                    if (doc) {
                        //console.log(doc[0]);
                        //bot.sendMessage(fromId, doc[0].name);
                        var locationDetails = {
                            name: doc[0].name,
                            lat: doc[0].lat,
                            long: doc[0].long,
                        };
                        //console.log("locationDetails: ");
                        //console.log(locationDetails);
                        weatherReportMethod(locationDetails, chatDetails);
                    }
                });
            }
            else {
                getLatLongMethod(name, chatDetails);
            }
        });
    }
    else if (/^marvin (.+connect test.*)/ig.exec(msg.text.trim())) {
        //console.log(db);
        var verses = db.collection('verses');
        // log each of the first ten docs in the collection
        db.verses.find({}).limit(1).forEach(function (err, doc) {
            if (err)
                throw err;
            if (doc) {
                bot.sendMessage(fromId, "I'm connected!");
                bot.sendMessage(fromId, doc.text);
            }
        });
    }
    else if (/^marvin (.+bb list elephant.*)/ig.exec(msg.text.trim())) {
        //console.log(db);
        var verses = db.collection('verses');
        // log each of the first ten docs in the collection
        bot.sendMessage(fromId, "I'm connected! And here are your first ten bbs");
        db.users.find({ "bb": true }).limit(10).forEach(function (err, doc) {
            if (err)
                throw err;
            if (doc) {
                bot.sendMessage(fromId, doc.firstName);
            }
        });
    }
    else if (/^marvin (.+verse list elephant.*)/ig.exec(msg.text.trim())) {
        //console.log(db);
        var verses = db.collection('verses');
        // log each of the first ten docs in the collection
        bot.sendMessage(fromId, "I'm connected! And here are your first ten verses");
        db.verses.find().limit(10).forEach(function (err, doc) {
            if (err)
                throw err;
            if (doc) {
                bot.sendMessage(fromId, doc.verse + ": " + doc.counter);
            }
        });
    }
    else if (/^marvin (.+holiday list setup elephant)(.*)/ig.exec(msg.text.trim())) {
        //getting the country name for current year every month
        var matches = /^marvin (.+holiday list setup elephant)(.*)/ig.exec(msg.text.trim());
        var holidayMatches = matches[2].trim();
        var splitWords = holidayMatches.split(/\W+/);
        bot.sendMessage(fromId, splitWords.toString());
        var holidayDetails = {
            holidayCountry: splitWords[0],
            holidayYear: splitWords[1],
        };
        console.log(holidayDetails);
        // log each of the first ten docs in the collection
        holidayRetrieveAndSaveOnly(chatDetails, holidayDetails);
    }
    else if (/^marvin (.+translate test)(.*)/ig.exec(msg.text.trim())) {
        var wordMatches = /^marvin (.+translate test)(.*)/ig.exec(msg.text.trim());
        console.log("This is wordMatches:" + wordMatches);
        var wordMatchesWords = wordMatches[1].split(/\W+/);
        console.log("This is wordMatchesWords:" + wordMatchesWords);
        //googleTranslate.translate('My name is Joshua', 'es', function (err, translation) {
        //    var translatedMessage = translation.translatedText;
        //    console.log(translatedMessage);
        //    // =>  Mi nombre es Brandon
        //    bot.sendMessage(fromId, translatedMessage);
        //});
    }
    else if (/^marvin (where.*am.*i)(.*)/ig.exec(msg.text.trim())) {
        let opt = {
            reply_markup: {
                force_reply: true,
                "one_time_keyboard": true,
            }
        };
        bot.sendMessage(fromId, first_name + ", please share your location with me!" + emoji.hushed, opt)
            .then(function () {
            bot.once('message', function (msg) {
                console.log("message is here!!");
                console.log(msg);
            });
        });
        //googleTranslate.translate('My name is Joshua', 'es', function (err, translation) {
        //    var translatedMessage = translation.translatedText;
        //    console.log(translatedMessage);
        //    // =>  Mi nombre es Brandon
        //    bot.sendMessage(fromId, translatedMessage);
        //});
    }
    else if (/^marvin (.+)/ig.exec(msg.text.trim())) {
        var matches = /^marvin (.+)/ig.exec(msg.text.trim());
        var text1 = matches[1].trim().toUpperCase();
        var resp = match[1];
        bot.sendMessage(fromId, resp);
    }
});
function marvinGetVerseMethod(chatDetails, fetchingVerse, type) {
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    var url = "https://bible-api.com/" + fetchingVerse + "?translation=kjv";
    request(url, function (error, response, body) {
        if (response.statusCode != 200) {
            //bot.sendMessage(fromId, "Encountered error! Please check the verse again.");
            bot.sendMessage(fromId, "Invalid verse. Please enter a valid verse for me thank you!" + emoji.hushed);
            if (userId !== myId)
                bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error retrieving verse from me!");
        }
        else {
            var info = JSON.parse(body);
            var formattedVerse = info.text;
            var translation_name = info.translation_name;
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
            if (userId !== myId)
                bot.sendMessage(myId, first_name + " from " + chatName + ". Success retrieval of " + fetchingVerse + "! " + emoji.kissing_smiling_eyes);
        }
    });
    bot.sendMessage(fromId, "Fetching verse now..");
}
function marvinNewGetVerseMethod(chatDetails, fetchingVerse, type, version = "NIV") {
    //chate related details
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    var matches = /^([1-4]*\s*[a-zA-Z]+)\s*(.+)/ig.exec(fetchingVerse.trim());
    var book = matches[1].trim();
    var chapterAndVerse = matches[2].trim();
    fetchingVerse = book + chapterAndVerse;
    console.log("From new get verse method: ", fetchingVerse);
    var testingUrl = "https://bible-api.com/" + fetchingVerse + "?translation=kjv";
    var url = "http://labs.bible.org/api/?passage=" + book + "+" + chapterAndVerse;
    //var url = "https://ibibles.net/quote.php?" + version + "-" + book + "/" + chapter + ":" + verse;
    request(url, function (error, response, body) {
        var info = "";
        try {
            info = JSON.parse(body);
        }
        catch (_a) {
            info = body.replace(/<b>/g, "\n").replace(/<\/b>/g, "");
        }
        if (response.statusCode != 200) {
            //bot.sendMessage(fromId, "Encountered error! Please check the verse again.");
            bot.sendMessage(fromId, "Invalid verse. Please enter a valid verse for me thank you!" + emoji.hushed);
            if (userId !== myId)
                bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error retrieving verse from me!");
        }
        else {
            var verseReference = info;
            console.log(verseReference);
            bot.sendMessage(fromId, emoji.book + " Here you go " + capitalizeFirstLetter(first_name) + "!\n" + info);
            if (userId !== myId)
                bot.sendMessage(myId, first_name + " from " + chatName +
                    ". Success retrieval of " + fetchingVerse +
                    "!" + emoji.kissing_smiling_eyes);
        }
    });
    bot.sendMessage(fromId, "Fetching verse now..");
}
function getVerseMethod(key_word) {
    return __awaiter(this, void 0, void 0, function* () {
        const search = key_word[0].replace(' ', '%20');
        const version = "NIV";
        const url = `https://www.biblegateway.com/passage/?search=${search}&version=${version}`;
        const result = yield scrapeIt(url, {
            title: key_word,
            verse: `#en-${version}-30214`,
        });
        console.log(JSON.stringify(result.data, null, 2));
        return result.data;
    });
}
function getLatLongMethod(locationInput, chatDetails, type = "weather") {
    //type: weather or sunrise
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    var locationSearch = "https://maps.googleapis.com/maps/api/geocode/json?address=" + locationInput + "&key=" + googleAPIKey;
    //console.log(locationSearch);
    request(locationSearch, function (err, res, body) {
        if (res.status === "ZERO_RESULTS") {
            //error occurred show that no results can be found
            bot.sendMessage(fromId, "Encountered an error with the location " + emoji.hushed);
            return;
        }
        var info = JSON.parse(body);
        //console.log(info);
        var address = info.results[0].formatted_address;
        var placeID = info.results[0].place_id;
        var types = info.results[0].types;
        var lat = info.results[0].geometry.location.lat;
        var lng = info.results[0].geometry.location.lng;
        var latlng = [lat, lng];
        //bot.sendMessage(fromId, "This is your lat : long: " + lat + " : " + lng);
        //save into db the location name and its latlong
        db.locations.insert({
            name: locationInput,
            lat: lat,
            long: lng
        }, function (err, doc) {
            if (doc) {
                if (type === "weather") {
                    var weatherSearch = "https://api.darksky.net/forecast/" + darkskyAPIKey + "/" + lat + "," + lng + "?units=si"; //set units as si Unit
                    console.log(weatherSearch);
                    request(weatherSearch, function (err, res, body) {
                        if (res.status === "ZERO_RESULTS") {
                            //error occurred show that no results can be found
                            bot.sendMessage(fromId, "Encountered an error with the location " + emoji.hushed);
                            return;
                        }
                        //console.log(res);
                        var info = JSON.parse(body);
                        //console.log(info);
                        var weatherInfo;
                        weatherInfo.temp = info.currently.temperature;
                        weatherInfo["apparentTemp"] = info.currently.apparentTemperature;
                        weatherInfo["hourlySummary"] = info.hourly.summary;
                        weatherInfo["hourlyIcon"] = info.hourly.icon;
                        weatherInfo["dailySummary"] = info.daily.summary;
                        weatherInfo["dailyIcon"] = info.daily.icon;
                        bot.sendMessage(fromId, capitalizeFirstLetter(locationInput) + "'s currently " + weatherInfo.temp + "°C but feels like " + weatherInfo.apparentTemp + "°C \n" +
                            "Oh! and weather report says: " + weatherInfo.hourlySummary);
                    });
                }
                else if (type === "sunrise") {
                    var timezoneSearch = "https://maps.googleapis.com/maps/api/timezone/json?location=" + lat + "," + lng + "&timestamp=" + moment().unix() + "&key=" + googleTimeZoneAPIKey;
                    //console.log(timezoneSearch);
                    request(timezoneSearch, function (TZerr, TZres, TZbody) {
                        var info2 = JSON.parse(TZbody);
                        console.log(info2);
                        if (info2.status !== "OK") {
                            //error occurred show that no results can be found
                            bot.sendMessage(fromId, "Encountered an error with the time zone " + emoji.hushed);
                            return;
                        }
                        var dateOffset = info2.rawOffset;
                        var timeZoneId = info2.timeZoneId;
                        var timeZoneName = info2.timeZoneName;
                        var timeZoneDetails = {
                            dateOffset: dateOffset,
                            timeZoneId: timeZoneId,
                            timeZoneName: timeZoneName
                        };
                        var today = moment().tz(timeZoneId).format("YYYY-MM-DD");
                        var tomorrow = moment().tz(timeZoneId).add(1, 'd').format("YYYY-MM-DD");
                        var sunriseSearch = "https://api.sunrise-sunset.org/json?lat=" + lat + "&lng=" + lng +
                            "&date=" + today + "&formatted=0";
                        //console.log(sunriseSearch);
                        request(sunriseSearch, function (err, res, body) {
                            var info = JSON.parse(body);
                            //console.log(info);
                            if (info.status !== "OK") {
                                //error occurred show that no results can be found
                                bot.sendMessage(fromId, "Encountered an error with the sunrise report " + emoji.hushed);
                                return;
                            }
                            //console.log(res);
                            var sunrise = info.results.sunrise;
                            var sunset = info.results.sunset;
                            var sunriseDetails = { sunrise: sunrise, sunset: sunset };
                            formattingSunriseMessage(sunriseDetails, timeZoneDetails, locationInput, chatDetails);
                        });
                    });
                }
            }
        });
    });
    if (type === "weather")
        bot.sendMessage(fromId, "Currently searching for your weather report.. " + emoji.bow);
    if (type === "sunrise")
        bot.sendMessage(fromId, "Currently searching for " + capitalizeFirstLetter(locationInput) + "'s sunrise timing.. " + emoji.bow);
}
function weatherReportMethod(locationDetails, chatDetails) {
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    var locationName = locationDetails.name;
    var lat = locationDetails.lat;
    var lng = locationDetails.long;
    var weatherSearch = "https://api.darksky.net/forecast/" + darkskyAPIKey + "/" + lat + "," + lng + "?units=si"; //set units as si Unit
    //console.log(weatherSearch);
    request(weatherSearch, function (err, res, body) {
        if (res.status === "ZERO_RESULTS") {
            //error occurred show that no results can be found
            bot.sendMessage(fromId, "Encountered an error with the location " + emoji.hushed);
            return;
        }
        //console.log(res);
        var info = JSON.parse(body);
        //console.log(info);
        var weatherInfo;
        weatherInfo["temp"] = info.currently.temperature;
        weatherInfo["apparentTemp"] = info.currently.apparentTemperature;
        weatherInfo["hourlySummary"] = info.hourly.summary;
        weatherInfo["hourlyIcon"] = info.hourly.icon;
        weatherInfo["dailySummary"] = info.daily.summary;
        weatherInfo["dailyIcon"] = info.daily.icon;
        bot.sendMessage(fromId, capitalizeFirstLetter(locationName) + "'s currently " + weatherInfo.temp + "°C but feels like " + weatherInfo.apparentTemp + "°C \n" +
            "Oh! and weather report says: " + weatherInfo.hourlySummary);
    });
    bot.sendMessage(fromId, "Currently searching for your weather report.. " + emoji.bow);
}
function getSunriseMethod(locationDetails, chatDetails) {
    //chat details
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    //location details
    var locationName = locationDetails.name;
    var lat = locationDetails.lat;
    var lng = locationDetails.long;
    var timezoneSearch = "https://maps.googleapis.com/maps/api/timezone/json?location=" + lat + "," + lng + "&timestamp=" + moment().unix() + "&key=" + googleTimeZoneAPIKey;
    //console.log(timezoneSearch);
    request(timezoneSearch, function (TZerr, TZres, TZbody) {
        var info2 = JSON.parse(TZbody);
        console.log(info2);
        if (info2.status !== "OK") {
            //error occurred show that no results can be found
            bot.sendMessage(fromId, "Encountered an error with the time zone " + emoji.hushed);
            return;
        }
        var dateOffset = info2.rawOffset;
        var timeZoneId = info2.timeZoneId;
        var timeZoneName = info2.timeZoneName;
        var timeZoneDetails = { dateOffset: dateOffset, timeZoneId: timeZoneId, timeZoneName: timeZoneName };
        var today = moment().tz(timeZoneId).format("YYYY-MM-DD");
        var tomorrow = moment().tz(timeZoneId).add(1, 'd').format("YYYY-MM-DD");
        var sunriseSearch = "https://api.sunrise-sunset.org/json?lat=" + lat + "&lng=" + lng +
            "&date=" + today + "&formatted=0";
        request(sunriseSearch, function (err, res, body) {
            var info = JSON.parse(body);
            if (info.status !== "OK") {
                //error occurred show that no results can be found
                bot.sendMessage(fromId, "Encountered an error with the sunrise report " + emoji.hushed);
                return;
            }
            var sunrise = info.results.sunrise;
            var sunset = info.results.sunset;
            var sunriseDetails = { sunrise: sunrise, sunset: sunset };
            formattingSunriseMessage(sunriseDetails, timeZoneDetails, locationName, chatDetails);
        });
    });
    bot.sendMessage(fromId, "Currently searching for " + capitalizeFirstLetter(locationName) + "'s sunrise timing.. " + emoji.bow);
}
function bbAutoChecker(chatDetails) {
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    db.users.count({ _id: userId }, function (err, doc) {
        if (doc === 1) {
            //exist and is already my bb
            if (userId !== myId)
                bot.sendMessage(myId, first_name + " from " + chatName + " already added " + first_name + "'s id hehe! Check from db is a success!");
        }
        else {
            db.users.update({
                _id: userId
            }, {
                $set: {
                    profile: {
                        chatId: userId,
                    }
                }
            }, function (err, doc) {
                if (doc && userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + "'s ChatId is added into database" + emoji.smiley);
            });
        }
    });
}
function formattingSunriseMessage(sunriseDetails, timeZoneDetails, locationInput, chatDetails) {
    //chat related
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    //time zone details
    var dateOffset = timeZoneDetails.dateOffset;
    var timeZoneId = timeZoneDetails.timeZoneId;
    var timeZoneName = timeZoneDetails.timeZoneName;
    //sunrise related
    var sunrise = sunriseDetails.sunrise;
    var sunset = sunriseDetails.sunset;
    var sunriseArray = sunrise.split("+");
    var sunsetArray = sunset.split("+");
    var formattedSunrise = moment(sunriseArray[0]).add(dateOffset, 's').format("h:mm:ss a");
    var formattedSunset = moment(sunsetArray[0]).add(dateOffset, 's').format("h:mm:ss a");
    var formattedDate = moment(sunriseArray[0]).add(dateOffset, 's').format("Do MMMM YYYY");
    //get the duration from till the next sunrise/sunset
    var sunriseDurationFromNow = moment(sunrise).from(moment().tz(timeZoneId));
    var sunsetDurationFromNow = moment(sunset).from(moment().tz(timeZoneId));
    //console.log(sunsetDurationFromNow);
    var message = capitalizeFirstLetter(locationInput) + "'s sunrise details:";
    message = message + "\nThe current " + timeZoneName + " is " + moment().tz(timeZoneId).format("h:mm:ss a");
    if (moment().tz(timeZoneId).isBefore(sunrise) && moment().tz(timeZoneId).isSame(sunset, "Day")) {
        message = message + "\n" + emoji.sunrise + " Today's sunrise is " + sunriseDurationFromNow + " @ " + formattedSunrise + " " + timeZoneName;
    }
    else {
        message = message + "\n" + emoji.sunrise + " Today's sunrise was @ " + formattedSunrise + " " + timeZoneName;
    }
    if (moment().tz(timeZoneId).isBefore(sunset) && moment().tz(timeZoneId).isSame(sunset, "Day")) {
        message = message + "\n" + emoji.city_sunset + " Today's sunset is " + sunsetDurationFromNow + " @ " + formattedSunset + " " + timeZoneName;
    }
    else {
        message = message + "\n" + emoji.city_sunset + " Today's sunset was " + sunsetDurationFromNow + " @ " + formattedSunset + " " + timeZoneName;
    }
    bot.sendMessage(fromId, message);
}
function holidayRetrieveAndSaveOnly(chatDetails, holidayDetails) {
    //chat details
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    //holiday details
    var holidayCountry = holidayDetails.holidayCountry;
    var holidayYear = holidayDetails.holidayYear;
    var listOfCountries = {
        "singapore": "SG",
    };
    //go through the twelve months
    for (var holidayMonth = 9; holidayMonth < 10; holidayMonth++) {
        var holidayURL = "https://holidayapi.com/v1/holidays?key=" + holidayAPIKey +
            "&country=" + holidayCountry + "&year=" + holidayYear + "&month=" + holidayMonth;
        console.log(holidayURL);
        request(holidayURL, function (err, res, body) {
            //console.log(res);
            var info = JSON.parse(body);
            if (info.status !== 200) {
                //error occurred show that no results can be found
                bot.sendMessage(fromId, "Encountered an error with the holiday search " + emoji.hushed);
                return;
            }
            var holidayId = info.holidays[0].date + "-" + info.holidays[0].name;
            console.log(holidayId);
            var newHolidayObject = {
                _id: holidayId,
                date: info.holidays[0].date,
                details: info.holidays
            };
            console.log(newHolidayObject);
            db.holidays.find({ _id: holidayId }, function (err, doc) {
                if (doc !== 1) {
                    //availableCountries: doc[0].availableCountries + holidayCountry,
                    db.holidays.insert({ _id: holidayId }, newHolidayObject);
                    bot.sendMessage(fromId, "I'm connected! And populated the db with holiday " + holidayCountry + " " + holidayMonth + " month" + holidayYear);
                }
                else {
                }
            });
        });
    }
    bot.sendMessage(fromId, "I'm connected! And am populating the db with holiday");
}
function getHolidayMethod(chatDetails, holidayDetails) {
    //chat related
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    //holiday details
    var holidayCountry = holidayDetails.holidayCountry;
    var holidayYear = holidayDetails.holidayYear;
    var holidayMonth = holidayDetails.holidayMonth;
    //TODO: get the holiday details for the Country for the month from DB and send it out
    bot.sendMessage(fromId, "Currently searching for your holidays for " + holidayCountry + ".. " + emoji.bow);
}
/**
 * Only if the currency is not acquired then enter this method
 * @param chatDetails details about the chat, ID, person's name etc
 * @param exchangeRateDetails from and to currency to get the exchange rate as of the date
 */
function getExchangeRateMethod(chatDetails, exchangeRateDetails) {
    //chat related details
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    //currency related details
    var amount = exchangeRateDetails.amount;
    var fromCurrency = exchangeRateDetails.from;
    var toCurrency = exchangeRateDetails.to;
    var date = exchangeRateDetails.date;
    var exchangeRateURL = "http://api.fixer.io/latest?symbols=" + toCurrency + "&base=" + fromCurrency;
    //console.log(exchangeRateURL);
    //TODO: Request the url done
    //TODO: #2 insert into the DB
    //TODO: #3 callback the insert query to send the message out
    request(exchangeRateURL, function (err, res, body) {
        var info = JSON.parse(body);
        //error handling
        if (info.error || Object.keys(info.rates).length == 0) {
            //error occurred show that no results can be found
            bot.sendMessage(fromId, "Encountered an error with retrieving exchange rate " + emoji.hushed);
            return;
        }
        //values from info
        var infoDate = info.date;
        var infoRates = info.rates;
        var base = info.base;
        var keys = Object.keys(infoRates);
        var numOfKeys = keys.length;
        var infoValue = [];
        keys.forEach(function (key) {
            var value = infoRates[key];
            infoValue.push(value);
            //do something with value;
        });
        //set up a updated exchangeRate details to pass to send
        var updatedExchangeRateDetails = {
            amount: amount,
            from: fromCurrency,
            to: toCurrency,
            date: date,
            rate: numOfKeys == 1 ? infoRates[toCurrency] : infoValue,
        };
        //create a new ID
        var id = date + "_" + fromCurrency + "_" + toCurrency;
        db.xrates.insert({
            _id: id,
            from: base,
            to: Object.keys(infoRates),
            date: infoDate,
            rate: numOfKeys == 1 ? infoRates[toCurrency] : infoValue,
        }, function (err, doc) {
            if (err) {
                //error occurred show that no results can be found
                bot.sendMessage(fromId, "Encountered an error with retrieving exchange rate here " + emoji.hushed);
                return;
            }
            if (doc) {
                sendExchangeRateMethod(chatDetails, updatedExchangeRateDetails);
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " retrieved exchange rate " +
                        fromCurrency + " to " + toCurrency + " at the rate of " + infoValue + " got saved in the db! Success!");
            }
        });
    });
}
/**
 * Only if the currency is already acquired then enter this method
 * @param chatDetails details about the chat, ID, person's name etc
 * @param exchangeRateDetails from and to currency to get the exchange rate as of the date
 */
function sendExchangeRateMethod(chatDetails, exchangeRateDetails) {
    //chat related details
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    //currency related details
    var amount = exchangeRateDetails.amount;
    var fromCurrency = exchangeRateDetails.from;
    var toCurrency = exchangeRateDetails.to;
    var rate = exchangeRateDetails.rate;
    var date = exchangeRateDetails.date;
    var totalAmount = amount * rate;
    //message related
    var message = "";
    if (amount !== 1) {
        //amount got value
        message = amount + fromCurrency + " to " + toCurrency + " is " + totalAmount.toFixed(2) + toCurrency
            + " @ " + rate.toFixed(2) + toCurrency + "/" + fromCurrency + " " + emoji.hushed;
    }
    else {
        //amount is left blank or is 1
        message = "The rate is " + rate + toCurrency + "/" + fromCurrency + " " + emoji.hushed;
    }
    bot.sendMessage(fromId, message);
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved exchange rate " +
            fromCurrency + " to " + toCurrency + " at the rate of " + rate + "! Success!");
}
//TODO: incomplete as of 6 June 17(tues)
/**
 *
 * @param chatDetails details about the chat, ID, person's name etc
 * @param fetchingVerse the verse to be fetched
 * @param type type of prayer to be prayed, so can do up the filling according to the tone of the prayer
 */
function marvinCraftPrayer(chatDetails, fetchingVerse, type) {
    var fromId = chatDetails.fromId;
    var chatName = chatDetails.chatName;
    var first_name = chatDetails.first_name;
    var userId = chatDetails.userId;
    var url = "https://bible-api.com/" + fetchingVerse + "?translation=kjv";
    var genderVerification = "https://gender-api.com/get?name=" + first_name + "&key=" + privateGenderAPIKey;
    request(url, function (error, response, body) {
        var statusCode = response.statusCode;
        switch (statusCode) {
            case 10:
                if (userId !== myId)
                    bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error " + statusCode + "! See Valid country codes" + emoji.sob);
                break;
            case 20:
                break;
        }
    });
    request(url, function (error, response, body) {
        if (response.statusCode != 200) {
            //bot.sendMessage(fromId, "Encountered error! Please check the verse again.");
            bot.sendMessage(fromId, "Invalid verse. Please enter a valid verse for me thank you!" + emoji.hushed);
            if (userId !== myId)
                bot.sendMessage(myId, capitalizeFirstLetter(first_name) + " from " + chatName + ". Encountered error retrieving verse from me!");
        }
        else {
            var info = JSON.parse(body);
            var formattedVerse = info.text;
            var translation_name = info.translation_name;
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
            if (userId !== myId)
                bot.sendMessage(myId, first_name + " from " + chatName + ". Success retrieval of " + fetchingVerse + "! " + emoji.kissing_smiling_eyes);
        }
    });
    bot.sendMessage(fromId, "Let me take some time to think..");
}
bot.onText(/^what.*your.*name/i, function (msg, match) {
    //console.log("This is the message:" + msg);
    //console.log("This is the match:" + match);
    var chat = msg.chat;
    var chatId = msg.chat.id;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var resp = match[1];
    bot.sendMessage(fromId, "My name is " + bot_name + "! Nice to meet you");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " asked me for my name. " + emoji.kissing_smiling_eyes);
});
// -------------------------------From here onwards, its all the commands ---------------------------------------
bot.onText(/\/bbchecker/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    // log each of the first ten docs in the collection
    //console.log("This is the userID: " + userId);
    //console.log("This is the first_name: " + first_name);
    //console.log("This is the retrieved user: ");
    if (db) {
        db.users.count({ _id: userId }, function (err, doc) {
            if (doc === 1) {
                bot.sendMessage(fromId, "Yes " + first_name + "! You are my bb! " + emoji.heart_eyes);
                bot.sendSticker(fromId, bbStickerArchive[Math.floor(Math.random() * bbStickerArchive.length)]);
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " is my bb! Check from db is a success!");
            }
            else {
                var bbRejectionArchive = [
                    "You are not my bb! Who are you?" + emoji.scream_cat,
                    first_name + "? Who is that?",
                    "It is an exclusive club, sadly you're not in it"
                ];
                bot.sendMessage(fromId, bbRejectionArchive[Math.floor(Math.random() * bbRejectionArchive.length)]);
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + " is sadly not bb! Check from db did not find anything!");
            }
        });
    }
    else {
        var fallbackArchive = [
            "Bb is currently under maintenance right now. " + emoji.scream_cat,
            first_name + ", that is a nice name! But bb is currently under maintenance",
            "And she will be loved~ oh, sorry I was distracted. I'm currently under maintenance right"
        ];
        bot.sendMessage(fromId, fallbackArchive[Math.floor(Math.random() * fallbackArchive.length)]);
        if (userId !== myId)
            bot.sendMessage(myId, first_name + " from " + chatName + " is sadly not bb! Check from db did not find anything!");
    }
});
bot.onText(/\/insult/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var insults = ["Dumbass", "Out of 100,000 sperm, you were the fastest?", "Look, you aint funny. Your life is just a joke."];
    var chosenInsult = insults[Math.floor(Math.random() * insults.length)];
    bot.sendMessage(fromId, chosenInsult);
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " managed to get the insult! Success!");
});
bot.onText(/\/help/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendMessage(fromId, "This spectacular bot have a few commands." +
        "\n/feeling - to fetch verses for you based on how you feel" +
        "\n/insult - to get insulted" +
        "\n/bbchecker - check if you’re Marvin’s bb! If not, you got to tell him you want to be his bb!" +
        "\n/getverse - get verses!" +
        "\n/givefeedback - give Marvin some feedback!" +
        "\n/set - set the bible version (In progress)" +
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
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD3QADCmwYBDSUSN5gf-BdAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved stun sticker! Success!");
});
bot.onText(/\/shock/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADtgADgIb7Aby3UMCUrWlLAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved shocked sticker! Success!");
});
bot.onText(/\/smirk/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADVwADgIb7ATi-G5xKUFDXAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved smirk sticker! Success!");
});
bot.onText(/\/sad/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADqgADCmwYBH3hVuODnzmHAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved sad sticker! Success!");
});
bot.onText(/\/hug/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADJwADgIb7AdaPu2jO6dqEAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved hug sticker! Success!");
});
bot.onText(/\/cryandhug/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADSwIAAgpsGAQbEtx-V7ZvjwI");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved hug and cry sticker! Success!");
});
bot.onText(/\/seeyou/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD4gADCmwYBLCrvcBMyDZOAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved seeyou sticker! Success!");
});
bot.onText(/\/goodjob/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADyAADgIb7AX8U8p_THYSoAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved goodjob sticker! Success!");
});
bot.onText(/\/timeout/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADygADgIb7AZK4fXnBJmnuAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + " retrieved timeout sticker! Success!");
});
bot.onText(/\/hmph/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD9wADCmwYBHX_3XyzdCFOAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/hungry/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADkwADgIb7ASqDY-wF1yfNAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/shower/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADMQADgIb7AcRkgvZqwyZHAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/what/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD3AADgIb7AaNZlTOZ0wS6Ag");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/hooray/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADlQADgIb7AV2EtE7v4bfMAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/excuseme/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADIwADgIb7AbOEWEF0Jj_NAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/yay/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQAD8QADCmwYBFPlx-n0MfKuAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Success!");
});
bot.onText(/\/cry/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADMwcAAgXm3gKC13HomeNgZQI");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Successful cry sticker!");
});
bot.onText(/\/xysmirk/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADAQADFAEAAtYvmwaMu5doAAF_xU8C");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Successful xy's smirk sticker!");
});
bot.onText(/\/buthor/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADlAADlHOkCWQseZcY0ktXAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Successful butt sticker!");
});
bot.onText(/\/aiyo/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADpAADCmwYBKxm5xAl3mikAg");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Successful aiyo sticker!");
});
bot.onText(/\/hehe/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADZAADlHOkCRItMD6WpTB3Ag");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Successful hehe sticker!");
});
bot.onText(/\/aniyo/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    bot.sendSticker(fromId, "CAADBQADXgADlHOkCdKqgJ7HMfk2Ag");
    if (userId !== myId)
        bot.sendMessage(myId, first_name + " from " + chatName + ". Successful aiyo sticker!");
});
bot.onText(/\/givefeedback/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    bot.sendMessage(fromId, capitalizeFirstLetter(first_name) + ", how can I improve? " + emoji.hushed, opt)
        .then(function () {
        bot.once('message', function (msg) {
            console.log("feedback is here!!");
            console.log(msg);
            bot.sendMessage(fromId, "Okie! I will take note! Thank you " + emoji.blush);
            if (userId !== myId)
                bot.sendMessage(myId, first_name + " from " + chatName + " mentioned: "
                    + msg.text + ". " + emoji.kissing_smiling_eyes);
        });
    });
});
bot.onText(/\/talktomarvin/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    bot.sendMessage(fromId, capitalizeFirstLetter(first_name) + ", Yes? " + emoji.hushed, opt)
        .then(function () {
        bot.once('message', function (msg) {
            console.log("the message is here!!");
            console.log(msg);
            //bot.sendMessage(fromId, "Okie! I will take note! Thank you " + emoji.blush);
            if (userId !== myId)
                bot.sendMessage(myId, first_name + " from " + chatName + " talked to me and said: "
                    + msg.text + ". " + emoji.kissing_smiling_eyes);
        });
    });
});
bot.onText(/\/getverse/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    var opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    bot.sendMessage(fromId, first_name + ", what verse do you like to get? " + emoji.hushed, opt)
        .then(function () {
        bot.once('message', function (msg) {
            console.log("message is here!!");
            console.log(msg);
            var verse = "john3:30-31";
            var fetchingVerse = msg.text;
            if (fetchingVerse)
                marvinNewGetVerseMethod(chatDetails, fetchingVerse, "normal");
        });
    });
});
bot.onText(/\/getvverse/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    var opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    bot.sendMessage(fromId, first_name + ", what verse do you like to get? " + emoji.hushed, opt)
        .then(function () {
        bot.once('message', function (msg) {
            console.log("message is here!!");
            console.log(msg);
            var verse = "john3:30-31";
            var fetchingVerse = msg.text;
            if (fetchingVerse) {
                const result = getVerseMethod(fetchingVerse);
                bot.sendMessage(fromId, emoji.book + " Here you go " + capitalizeFirstLetter(first_name) + "!");
                bot.sendMessage(fromId, result.verse);
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName +
                        ". Success retrieval of " + fetchingVerse +
                        "! Fetch from DB is a success! " + emoji.kissing_smiling_eyes);
            }
        });
    });
});
bot.onText(/\/getnewverse/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    var opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    bot.sendMessage(fromId, first_name + ", what verse do you like to get? " + emoji.hushed, opt)
        .then(function () {
        bot.once('message', function (msg) {
            console.log("message is here!!");
            console.log(msg);
            var verse = "john3:30-31";
            var version = "niv";
            var fetchingVerse = msg.text;
            if (fetchingVerse) {
                //marvinGetVerseMethod(chatDetails, fetchingVerse, "normal");
                marvinNewGetVerseMethod(chatDetails, fetchingVerse, "normal", version);
            }
        });
    });
});
bot.onText(/\/feeling/, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    var opt = {
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
    bot.sendMessage(fromId, first_name + ", How are you feeling? " + emoji.hushed, opt)
        .then(function (ans) {
        bot.once('callback_query', function (msg) {
            //console.log("feeling message is here!!");
            //console.log(msg);
            //bot.onText(/.+/g, function (msg, match) {
            var feeling = "happy";
            var chosenFeeling = msg.data;
            var arrayOfFeelings = verseArchive[chosenFeeling];
            if (!arrayOfFeelings) {
                bot.sendMessage(fromId, "Encountered error!" + emoji.sob);
                if (userId !== myId)
                    bot.sendMessage(myId, first_name + " from " + chatName + ". Encountered error! " + emoji.sob);
            }
            var chosenVerse = arrayOfFeelings[Math.floor(Math.random() * arrayOfFeelings.length)];
            bot.sendMessage(fromId, "Hope this encourages you~ " + emoji.sob);
            if (chosenVerse)
                marvinNewGetVerseMethod(chatDetails, chosenVerse, "sad");
        });
    });
});
bot.onText(/\/getweatherreport/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    bbAutoChecker(chatDetails);
    var opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    bot.sendMessage(fromId, first_name + ", what location's weather report do you like to get? " + emoji.hushed, opt)
        .then(function () {
        bot.once('message', function (msg) {
            console.log("message is here!!");
            //console.log(msg);
            bbAutoChecker(chatDetails);
            db.locations.count({ name: msg.text }, function (err, doc) {
                if (doc === 1) {
                    db.locations.find({ name: msg.text }, function (err, doc) {
                        if (err)
                            throw err;
                        if (doc) {
                            //console.log(doc[0]);
                            //bot.sendMessage(fromId, doc[0].name);
                            var locationDetails = {
                                name: doc[0].name,
                                lat: doc[0].lat,
                                long: doc[0].long,
                            };
                            //console.log("locationDetails: ");
                            //console.log(locationDetails);
                            weatherReportMethod(locationDetails, chatDetails);
                        }
                    });
                }
                else {
                    getLatLongMethod(msg.text, chatDetails, "weather");
                }
            });
        });
    });
});
bot.onText(/\/getsunrise/i, function (msg, match) {
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    bbAutoChecker(chatDetails);
    var opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    bot.sendMessage(fromId, first_name + ", what location's sun rise and sun set you wish to get? " + emoji.hushed, opt)
        .then(function () {
        bot.once('message', function (msg) {
            console.log("Sunrise location message is here!!");
            //console.log(msg);
            db.locations.count({ name: msg.text }, function (err, doc) {
                if (doc === 1) {
                    //console.log("doc is 1");
                    db.locations.find({ name: msg.text }, function (err, doc) {
                        if (err)
                            throw err;
                        if (doc) {
                            //console.log(doc[0]);
                            //bot.sendMessage(fromId, doc[0].name);
                            var locationDetails = {
                                name: doc[0].name,
                                lat: doc[0].lat,
                                long: doc[0].long,
                            };
                            //console.log("locationDetails: ");
                            //console.log(locationDetails);
                            getSunriseMethod(locationDetails, chatDetails);
                        }
                    });
                }
                else {
                    //console.log("doc is not 1");
                    getLatLongMethod(msg.text, chatDetails, "sunrise");
                }
            });
        });
    });
});
bot.onText(/\/getHoliday/i, function (msg, match) {
    //chat details
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    bbAutoChecker(chatDetails);
    //keyboard options
    var opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    bot.sendMessage(fromId, first_name + ", what location's holiday you wish to get? " + emoji.hushed, opt)
        .then(function () {
        bot.once('message', function (msg) {
            console.log("Holiday location message is here!!");
            //console.log(msg);
            db.holidays.count({}, function (err, doc) {
            });
        });
    });
});
bot.onText(/\/getxrate/i, function (msg, match) {
    //chat details
    var chat = msg.chat;
    var fromId = msg.from.id;
    var userId = msg.from.id;
    var first_name = msg.from.first_name;
    var chatName = first_name;
    if (chat) {
        fromId = chat.id;
        chatName = chat.title ? chat.title : "individual chat";
    }
    var chatDetails = {
        fromId: fromId,
        chatName: chatName,
        first_name: first_name,
        userId: userId,
    };
    bbAutoChecker(chatDetails);
    //keyboard options
    var opt = {
        reply_markup: {
            force_reply: true,
        }
    };
    bot.sendMessage(fromId, first_name + ", what currency do you wish to change from & to? " + emoji.thinking_face +
        "\n(e.g. sgd2cad, usd2myr, 100sgd2cad, 92.4sgd2myr) ", opt)
        .then(function () {
        bot.once('message', function (msg) {
            console.log("Exchange rate message is here!!");
            //console.log(msg);
            var text1 = msg.text.toUpperCase().trim();
            //console.log(text1);
            //error checks
            var error = false;
            if (text1.length < 7) {
                error = true;
            }
            else if (text1.length == 7 && text1.split("")[text1.split("").length - 4] !== "2") {
                error = true;
            }
            else if (text1.length == 7 && !/^[a-z]/ig.exec(text1[0])) {
                error = true;
            }
            else if (text1.length > 7 && !/([\d|.]+)([A-Z]{3})2([A-Z]{3})/ig.exec(text1)) {
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
            var xrateToken = /([\d|.]+)([A-Za-z]{3})2([A-Za-z]{3})/ig.exec(text1);
            var amount = xrateToken[1];
            var from = xrateToken[2];
            var to = xrateToken[3];
            //console.log(xrateToken);
            //console.log(amount);
            //console.log(from);
            //console.log(to);
            //TODO: check if the to currency is legit *impt!
            var currentDate = moment().format("DD-MM-YYYY");
            var exchangeRateDetails = {
                from: from,
                to: to,
                date: currentDate,
                amount: amount.length > 0 ? Number(amount) : 1
            };
            let id = currentDate + "_" + from + "_" + to;
            // db.xrates.count({ _id: id, from: from, to: to }, function (err, doc) {
            //     if (doc === 1) {
            //         console.log("doc is 1");
            //         db.xrates.find({ _id: id, from: from, to: to }, function (err, doc) {
            //             if (err) throw err;
            //             if (doc) {
            //                 //console.log(doc[0]);
            //                 exchangeRateDetails = {
            //                     from: doc[0].from,
            //                     to: doc[0].to,
            //                     date: doc[0].date,
            //                     rate: doc[0].rate,
            //                     amount: amount.length > 0 ? Number(amount) : 1
            //                 };
            //                 //console.log("locationDetails: ");
            //                 //console.log(locationDetails);
            //                 sendExchangeRateMethod(chatDetails, exchangeRateDetails);
            //             }
            //         });
            //     } else { //the name of the rate doesnt exist in the db yet
            //         console.log("doc is not 1");
            //         getExchangeRateMethod(chatDetails, exchangeRateDetails);
            //     }
            // });
            getExchangeRateMethod(chatDetails, exchangeRateDetails);
            bot.sendMessage(fromId, "Currently searching for exchange rate.. " + emoji.bow);
        });
    });
});
var verseArchive = {
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
var youtubeArchive = {
    happy: [],
    conviction: [],
    reminder: [],
};
var prayerArchive = {
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
var bbStickerArchive = [
    "CAADBQAD-wADCmwYBGNNElnBua4CAg",
    "CAADBQADNwADgIb7AV1SxhrjoTO7Ag",
    "CAADBQADjwADgIb7Ae-7bZnnY0_qAg",
    "CAADBQADxwADCmwYBETPPM5CdJhGAg"
];
//# sourceMappingURL=server.js.map