export function getPagination( current, maxpage ) {
    var keys = [];
    if (current>1) keys.push({ text: `«1`, callback_data: '1' });
    if (current>2) keys.push({ text: `‹${current-1}`, callback_data: (current-1).toString() });
    keys.push({ text: `-${current}-`, callback_data: current.toString() });
    if (current<maxpage-1) keys.push({ text: `${current+1}›`, callback_data: (current+1).toString() })
    if (current<maxpage) keys.push({ text: `${maxpage}»`, callback_data: maxpage.toString() });
  
    return {
      reply_markup: JSON.stringify({
        inline_keyboard: [ keys ]
      })
    };
  }