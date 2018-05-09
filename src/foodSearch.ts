import { emojiFinder } from "../server.js";
export function foodMessageOrganiser(chatDetails: chatDetails, msg, businesses) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    if (businesses) {
        let no_of_businesses = businesses.length || 0;
        let replyOptions = {
            reply_markup: {
                inline_keyboard: [

                ]
            },
            resize_keyboard: true,
            force_reply: true,
        }

        let msg = first_name + ", I've found *" + no_of_businesses + "* stalls around you.\n\n";

        businesses.array.forEach((element, index) => {
            let { coordinates, display_phone, distance, id, image_url, is_closed, location, display_address, price, rating, url, alias } = element;
            msg += "*" + alias + "* (" + price + ")\n"
            msg += location.address1 + "\n"
            msg += distance.toFixed(2) + "m" + emojiFinder("happy") + "\n\n";
        });
    } else {
        return false;
    }
}