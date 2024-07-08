import { Message } from "discord.js";
import { Database } from "bun:sqlite";

const db = new Database("discordosu.sqlite", { create: true });

export async function setUser({ message }: { message: Message }) {
  const content = message.content.split(" ");

  if (content.length < 2) {
    message.channel.send("Please provide a valid username to link");
    return;
  }

  const res = await fetch(
    `${process.env.GET_PLAYER_V1_API}?scope=info&name=${content[1]}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();

  if (data.status !== "success") {
    message.channel.send(`User \`${content[1]}\` does not exist on blobsu`);
    return;
  }

  const $discord = message.author.username;
  const $osuid = data.player.info.id;

  const query = db.prepare(
    "insert INTO userdata (discord, osuid) values ($discord, $osuid);"
  );
  query.run($discord, $osuid);

  message.channel.send(`Your name is now configured to \`${content[1]}\` `);
}
