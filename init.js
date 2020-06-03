const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client({autoReconnect: true});
let config = JSON.parse(fs.readFileSync("config.json"));

client.on("ready", async () => {
    await createMessages();
    fs.writeFileSync("config.json", JSON.stringify(config, null, 4), (err) => {
        if (err)
            console.log(err);
        else
            console.log("Message IDs saved to config.json! You can now run index.js");
    });
});

async function createMessages() {
    let equal  =  Object.keys(config.servers).length === config.messages.length;
    if(equal){
        console.log('Messages all setup');
        return;
    }else{
        let addMessages = Object.keys(config.servers).length - config.messages.length;
        console.log('adding '+ addMessages +' server/s');
        let channel = await client.channels.fetch(config.channel);
        for (let i = 0; i < addMessages; i++) {
            let message = await channel.send(new Discord.MessageEmbed());
            config["messages"].push(message.id);
        }
        console.log('Init complete you can now close this process..');  
    }
   
}

client.login(config.token);
