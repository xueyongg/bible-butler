interface weatherDetails {
    temp: number,
    apparentTemp: number,
    hourlySummary: String,
    hourlyIcon: String,
    dailySummary: String,
    dailyIcon: String,
}

interface emoji {
    content: String,
}

interface chatDetails {
    fromId: number,
    chatName: String,
    first_name: String,
    userId: number,
    messageId: number,
}

interface reply {
    msg: String | Boolean;
    maxPage: number;
}

interface db {
    id: {
        first_name: String,
        getweather: number,
        foodpls: number,
        insult: number,
        getverse: number,
        getxrate: number,
        getsunrise: number,
        feeling: number,
        verses: String[],
    }
}