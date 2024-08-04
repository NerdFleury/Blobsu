import { Client, GatewayIntentBits, ActivityType, Message } from "discord.js";
import { Database } from "bun:sqlite";
import { setUser } from "./utils/commands/setuser";
import { recentscore } from "./utils/commands/recentscore";
import { FocusUserOfCommand } from "./utils/tools/finduser";
import type { UserCommandObject } from "./utils/constants/types";

const db = new Database("discordosu.sqlite", { create: true });
const query = db.query(
  `create TABLE IF NOT EXISTS userdata (id INTEGER AUTO INCREMENT PRIMARY KEY, discord TEXT NOT NULL, osuid TEXT NOT NULL);`
);
query.run();
console.log("database created");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("Bot is ready");
  client.user?.setActivity("over Blobsu server", {
    type: ActivityType.Watching,
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("?setuser")) {
    setUser({ message });
  }

  if (message.content.startsWith("?r")) {
    const contents = message.content.split(" ");
    const data: UserCommandObject | null = await FocusUserOfCommand({
      messageContents: contents,
      message: message,
      db: db,
      client: client,
    });

    try {
      if (data) {
        const embed = await recentscore({
          datatype: data?.datatype,
          value: data?.data,
          message: message,
        });
        message.channel.send({ embeds: [embed] });
      }
    } catch {
      if (contents.length == 1) {
        message.reply(
          "User not found on database, did you perhaps forget to set your username with `?setuser`?"
        );
      } else {
        message.reply(
          "User not found on database, did they perhaps forget to their username with `?setuser`?"
        );
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
