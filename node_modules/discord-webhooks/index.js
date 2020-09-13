const request = require("request");
const EventEmitter = require("events").EventEmitter;
const util = require("util");

const endpoint = "https://discordapp.com/api/";

function DiscordWebhook(url) {
  this.url = url;
  this.execute = function(payload) {
    request({
      url:endpoint+"webhooks/"+this.id+"/"+this.token,
      method:"POST",
      body:payload,
      json:true
    }, (e,r,b) => {
      if (e) throw e;
    });
  }
  request(url, (e,r,b) => {
    if (e) {
      this.emit("error", e);
      return;
    }

    try {
      data = JSON.parse(b);
      this.name = data.name;
      this.channel_id = data.channel_id;
      this.token = data.token;
      this.avatar = data.avatar;
      this.guild_id = data.guild_id;
      this.id = data.id;
      this.emit("ready");
    } catch (e) {
      this.emit("error", e);
    }
  });
  EventEmitter.call(this);
}

util.inherits(DiscordWebhook, EventEmitter);

module.exports = DiscordWebhook;
