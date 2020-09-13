# discord-webhooks
A simple way of getting started with [Discord](https://discordapp.com) webhooks.

## Getting started
Install:

    npm install --save discord-webhooks

And run:

    const DiscordWebhook = require("discord-webhooks");

    let myWebhook = new DiscordWebhook("https://discordapp.com/api/webhooks/channel_id/token")

    myWebhook.on("ready", () => {
        myWebhook.execute({
            content:"Hello from a webhook",
            username:"Mr Webhook",
            avatar_url:"https://example.com/image.png"
        });
    });

    myWebhook.on("error", (error) => {
      console.warn(error);
    });

## Discord documentation
Read more about webhooks on the [Discord Documentation](https://github.com/hammerandchisel/discord-api-docs/blob/2f0a074005618a51df2f26122a6d4c7aa216732e/docs/resources/Webhook.md).
