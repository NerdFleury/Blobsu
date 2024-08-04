import type { Message, Client } from "discord.js";
import { Database } from "bun:sqlite";
import type { UserCommandObject } from "../constants/types";

export async function FocusUserOfCommand({
  messageContents,
  message,
  db,
  client,
}: {
  messageContents: String[];
  message: Message;
  db: Database;
  client: Client;
}) {
  if (messageContents.length == 1) {
    try {
      const $discord = message.author.username;
      const query = db.prepare(
        "select osuid from userdata where discord=$discord;"
      );
      const res: any = query.get($discord);
      return { datatype: "id", data: res.osuid } as UserCommandObject;
    } catch {
      message.reply(
        "User not found on database, did you perhaps forget to set your username with `>setuser`?"
      );
    }
  }
  if (messageContents.length == 2) {
    if (messageContents[1].startsWith("<@")) {
      try {
        const user = await client.users.fetch(
          messageContents[1].replace(/[<>@]/g, "")
        );
        const $user = user.username;
        const query = db.prepare(
          "select osuid from userdata where discord=$user;"
        );
        const res: any = query.get($user);
        return { datatype: "id", data: res.osuid } as UserCommandObject;
      } catch (error) {}
    } else {
      return {
        datatype: "name",
        data: messageContents[1],
      } as UserCommandObject;
    }
  }

  return null;
}
