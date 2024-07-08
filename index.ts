import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import { Database } from "bun:sqlite";
import { setUser } from "./utils/commands/setuser";
import { recentscore } from "./utils/commands/recentscore";

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

  if (message.content.startsWith(">setuser")) {
    setUser({ message });
  }

  if (message.content.startsWith(">r")) {
    const contents = message.content.split(" ");
    if (contents.length == 1) {
      try {
        const $discord = message.author.username;
        const query = db.prepare(
          "select osuid from userdata where discord=$discord;"
        );
        const res: any = query.get($discord);
        const osuid = res.osuid;
        const embed = await recentscore({
          datatype: "id",
          value: osuid,
          message: message,
        });
        message.channel.send({ embeds: [embed] });
      } catch {
        message.reply(
          "User not found on database, did you perhaps forget to set your username with `>setuser`?"
        );
      }
    }
    if (contents.length == 2) {
      if (contents[1].startsWith("<@")) {
        try {
          const user = await client.users.fetch(
            contents[1].replace(/[<>@]/g, "")
          );
          const $user = user.username;
          const query = db.prepare(
            "select osuid from userdata where discord=$user;"
          );
          const res: any = query.get($user);
          const osuid = res.osuid;
          const embed = await recentscore({
            datatype: "id",
            value: osuid,
            message: message,
          });
          message.channel.send({ embeds: [embed] });
        } catch (error) {
          message.reply(
            "User not found on database, did they perhaps forget to set their username with `>setuser`?"
          );
        }
      } else {
        try {
          const embed = await recentscore({
            datatype: "name",
            value: contents[1],
            message: message,
          });
          message.channel.send({ embeds: [embed] });
        } catch (error) {
          message.reply("User not found on blobsu");
        }
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
