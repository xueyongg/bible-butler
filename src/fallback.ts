export let fallback = {
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
    latest_inline_message: {},
    // Normal message
    get_latest_message: () => {
        // console.log("Retrieving Message!", this.latest_message);
        return this.latest_message;
    },
    set_latest_message: (message: any) => {
        this.latest_message = message;
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
    // Inline Message
    get_latest_inline_message: () => {
        // console.log("Retrieving Message!", this.latest_message);
        return this.latest_inline_message;
    },
    set_latest_inline_message: (msg: any) => {
        this.latest_inline_message = msg;
        // console.log("Message set!", this.latest_message);
    },
    clear_latest_inline_message: () => {
        this.latest_inline_message = {};
    },
    check_latest_inline_message: () => {
        return this.latest_inline_message ? false : true;
    },
};