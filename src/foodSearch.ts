import { emojiFinder } from "../server";
import { getPagination } from "./util";
let emoji = require('node-emoji').emoji;

export async function foodMessageOrganiser(chatDetails: chatDetails, locationDetails, businesses) {
    // chat related details
    let { fromId, chatName, first_name, userId, messageId } = chatDetails;
    //location details
    let { locationName, lat, lng } = locationDetails;

    if (businesses) {
        let no_of_businesses = businesses.length || 0;
        let items_per_page = 5;
        let maxPage = Math.ceil(no_of_businesses / items_per_page);
        let msg = first_name + ", I've found *" + no_of_businesses + "* stalls around you. \n\n";

        businesses.forEach(async (element, index) => {
            let { coordinates, display_phone, distance, id, image_url, is_closed, location, display_address, price, rating, url, alias } = element;
            msg += emoji.knife_fork_plate + " *" + alias + "* (" + price + ")\n"
            msg += location.address1 + "\n"
            msg += distance.toFixed(2) + "m \n\n";
        });
        return msg;
    } else {
        return false;
    }
}