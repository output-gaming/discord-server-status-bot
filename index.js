
/**
 * Server Status - A Discord bot to display the status of Source Servers, using https://git.io/Jfl4X
 *
 * Copyright (C) 2020  Extacy
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const Discord = require("discord.js");
const server = require('gamedig');

const client = new Discord.Client({autoReconnect: true});
const config = require("./config.json");

let messageIds = [];

client.on("ready", () => {
    
    console.log(`Logged in as "${client.user.username}"`);
    startBot();
});

client.login(config.token);

async function startBot() {
    await loadMessages();
    updateServers();
    
}

async function loadMessages() {

    if (config.servers.length != config.messages.length) {
        console.log("Saved message ID's isn't enough for saved servers!");
        console.log("You need to run init.js!");
        process.exit(1);
    }

    for (let i = 0; i < config.messages.length; i++) {
        messageIds.push(config.messages[i]);
    }
}



async function updateServers() {
    
    //setup timestamp
    var d = new Date();
    var now = d.toLocaleTimeString();

    serverEmbeds = [];
    

    for (let i = 0; i < config.servers.length; i++) {
        console.log('Querying server:',config.servers[i].name);
        let result = await server.query({
            type: config.servers[i].type,
            host: config.servers[i].ip,
            port: config.servers[i].port,
            });

        console.log('Querying complete on:',config.servers[i].name);
        
        let live = !(result instanceof Error);
        const embed = new Discord.MessageEmbed()
            .setColor(live ? "#0099ff" : "#ff4242")
            .setTitle(live ? result.name : `${config.servers[i].name} | Offline`)
            .setThumbnail(live? config.servers[i].icon : "https://i.imgur.com/I2pNIWW.png")
            .addField("Players", `${result.players.length}/${result.maxplayers}`, true)
            if(result.map){
                embed.addField("Current Map", result.map, true)
            }
            else if(config.servers[i].connect === true){
                embed.addField("Connect", `steam://connect/${config.servers[i].ip}:${config.servers[i].port}`, true);
            }
            embed.addField('Updated', now, true);

        serverEmbeds.push({
            "players": result.players.length,
            "embed": embed
        });
    }

    serverEmbeds.sort(function(a, b) {
        return b["players"] - a["players"];
    });

    let channel = await client.channels.fetch(config.channel);

    for (let i = 0; i < serverEmbeds.length; i++) {
        let message = await channel.messages.fetch(messageIds[i]);
        await message.edit(serverEmbeds[i]["embed"]);
    }

    setTimeout(() => {
        updateServers();
    }, config.interval);
}