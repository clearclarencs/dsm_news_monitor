const webhooks = require('./webhooks.json')
const fetch = require('node-fetch');
const Webhook = require("webhook-discord")

var monitor_url = "https://london.doverstreetmarket.com/new-items";
var already_sent = [] //array of codes of posts already reported
var error_webhook = ""

//get json of webhooks

var headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "referer": monitor_url,
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "WhatsApp/2.19.360 A"
    }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

async function scan(){
    (async () => {
        const response = await fetch(monitor_url, {"headers":headers});
        var body = await response.text();
        var status_code = await response.status_code;
        if (status_code = 200){
            var spl = body.split("<div class=\"DCMP_Block\" data-block-id=\"");
            spl.shift();
            for (post of spl) {
                try{
                    var sep = post.split("<p class=\"spacing__15\">"); // split object into code+title and image+description+buton
                    var title = (sep[0]).replace(/<[^>]*>?/gm, '').split("\">"); // split first into code and title
                    var code = title[0]; //extract code
                    if (!(already_sent.includes(code))) {
                        title = title[1].trim(); //extract title
                        var imgurl = sep[1].split("src=\"")[1].split("\"")[0]
                        try{
                            var url = sep[1].split("href=\"")[1].split("\"")[0] //get url to item from a href from title, image or button
                        }catch{
                            var url = monitor_url //if nop link set link to news page
                        }
                        des = sep[1].replace(/<[^>]*>?/gm, '').trim()
                        if (des.includes("&copy;")){ //last news object has extra content so removes it
                            des = des.split("&copy;")[0].trim() //split object by footer and remove it
                        }
                        des = des.replace(/(\r\n|\n|\r)/gm, ""); //removes any line breaks from description (\n)
                        if (des.includes("e-shop")){ //find button and use top select news type then remove from description
                            var type = 'E-SHOP'
                            des = des.split("    ")[0]
                        }else if (des.includes("e-flash")){
                            var type = 'E-FLASH'
                            des = des.split("    ")[0]
                        }else if (des.includes("enter now")){
                            var type = 'RAFFLE'
                            des = des.split("    ")[0]
                        }else { //if no button item is usually an instore item however is rarely due to not yet loaded which is unpreventable
                            var type = 'INSTORE/UNKNOWN'
                        }
                        webhooklst = webhooks["ALL"]
                        webhooklst = webhooklst.concat(webhooks[(type)]);
                        for (webhook of webhooklst){
                            const Hook = new Webhook.Webhook(webhook)
                            const msg = new Webhook.MessageBuilder()
                                            .setName(" ")
                                            .setColor("#aabbcc")
                                            .setTitle(title)
                                            .setDescription(des)
                                            .setURL(url)
                                            .setTime()
                                            .setImage(imgurl)
                                            .addField("Type", type, true)
                                            .setFooter("A clearclarencs monitor", "https://cdn.discordapp.com/avatars/428998164058472458/0ad1206a8227fea26775a95b26a68c00.png")
                            Hook.send(msg);
                        }
                        already_sent.push(code);
                    }else{
                        continue;

                    };
                }catch(err) { //will throw often as news object split isnt perfect and selects header items
                    continue;
                }
                await sleep (1500);
            };
            return;
        }else{
            const Hook = new Webhook.Webhook(error_webhook)
            Hook.err("DSM Monitor", "Error getting wabpage "+status_code.toString())
            return ;
        }
    })();
    
}

async function monitor (){
    while (true) {
        try{
            scan();
        }catch{
            const Hook = new Webhook.Webhook(error_webhook)
            Hook.err("DSM Monitor", "Error")
        }
        await sleep(60000)
    }
};

monitor();