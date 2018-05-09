interface weatherDetails {
    temp: number,
    apparentTemp: number,
    hourlySummary: string,
    hourlyIcon: string,
    dailySummary: string,
    dailyIcon: string,
}

interface emoji {
    content: string,
}

interface chatDetails {
    fromId: number,
    chatName: string,
    first_name: string,
    userId: number,
    messageId: number,
}

interface reply {
    msg: String | Boolean;
    maxPage: number;
}