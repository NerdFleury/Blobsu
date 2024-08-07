import { EmbedBuilder, Message } from "discord.js";
import { emotes } from "../constants/emotes";
import { calculatePp } from "../assets/calculatepp";

const MODS = {
  NM: 0,
  NF: 1 << 0,
  EZ: 1 << 1,
  TD: 1 << 2,
  HD: 1 << 3,
  HR: 1 << 4,
  SD: 1 << 5,
  DT: 1 << 6,
  RX: 1 << 7,
  HT: 1 << 8,
  NC: 1 << 9,
  FL: 1 << 10,
  AT: 1 << 11,
  SO: 1 << 12,
  AP: 1 << 13,
  PF: 1 << 14,
  "4K": 1 << 15,
  "5K": 1 << 16,
  "6K": 1 << 17,
  "7K": 1 << 18,
  "8K": 1 << 19,
  FADEIN: 1 << 20,
  RANDOM: 1 << 21,
  CINEMA: 1 << 22,
  TARGET: 1 << 23,
  KEY9: 1 << 24,
  KEYCOOP: 1 << 25,
  KEY1: 1 << 26,
  KEY3: 1 << 27,
  KEY2: 1 << 28,
  SCOREV2: 1 << 29,
  MR: 1 << 30,
};

const rankConversions = emotes.rankings;

const modes = {
  "?r": 0,
  "?rs": 0,
  "?rt": 1,
  "?rm": 3,
  "?rc": 2,
  "?rx": 4,
};

const modeNames = {
  "?r": "Standard",
  "?rs": "Standard",
  "?rt": "Taiko",
  "?rm": "Mania",
  "?rc": "Catch",
  "?rx": "Relax",
};

function getMods(bitmask: number): string[] {
  const activeMods: string[] = [];

  for (const [modName, modValue] of Object.entries(MODS)) {
    if ((bitmask & modValue) !== 0) {
      activeMods.push(modName);
    }
  }

  return activeMods;
}

export async function recentscore({
  datatype,
  value,
  message,
}: {
  datatype: "id" | "name";
  value: string | number;
  message: Message;
}) {
  let type = value;
  const contents = message.content.split(" ");
  const mode: "?rs" | "?rc" | "?rm" | "?rt" | "?rx" = modes[contents[0]];

  if (datatype === "id") {
    type = parseInt(value);
  }

  const response = await fetch(
    `${process.env.GET_RECENT}/?scope=recent&${datatype}=${type}&mode=${mode}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (data.scores.length == 0) {
    const embed = new EmbedBuilder()
      .setColor(0x008080)
      .setDescription(
        `No recent ${modeNames[contents[0]]} scores found for user \`${
          data.player.name
        }\` on blobsu!.`
      );
    return embed;
  }

  const calculate_pp = await calculatePp({
    beatmap_id: data.scores[0].beatmap.id,
    nkatu: data.scores[0].nkatu,
    ngeki: data.scores[0].ngeki,
    n100: data.scores[0].n100,
    n50: data.scores[0].n50,
    misses: data.scores[0].nmiss,
    mods: data.scores[0].mods,
    mode: data.scores[0].mode,
    combo: data.scores[0].beatmap.max_combo,
  });

  const ppdata = await calculate_pp;

  const dateString = data.scores[0].play_time;
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  const formattedDate = `${month}/${day}/${year}`;

  let modsUsed = getMods(data.scores[0].mods).join("");

  if (modsUsed.length == 0) {
    modsUsed = "NM";
  }

  const formattedScore = data.scores[0].score.toLocaleString("en-US");

  const embed = new EmbedBuilder()
    .setColor("#FFFFFF")
    .setAuthor({
      name: `Recent Blobsu ${modeNames[contents[0]]} Play for ${
        data.player.name
      }`,
    })
    .setTitle(
      `${data.scores[0].beatmap.title} [${
        data.scores[0].beatmap.version
      }] [${ppdata.difficulty.stars.toFixed(2)}★]`
    )
    .setURL(
      `https://osu.ppy.sh/beatmapsets/${data.scores[0].beatmap.set_id}#osu/${data.scores[0].beatmap.id}`
    )
    .addFields({
      name: "__Stats:__",
      value: `**Score:** ${formattedScore}\n**Combo:** ${
        data.scores[0].max_combo
      }/${
        data.scores[0].beatmap.max_combo
      }x\n**Mods:** ${modsUsed}\n**Ranking:** ${
        rankConversions[data.scores[0].grade]
      }\n**Accuracy:** ${data.scores[0].acc.toFixed(2)}%\n**Hits:** ${
        data.scores[0].n300
      }/${data.scores[0].n100}/${data.scores[0].n50}/${
        data.scores[0].nmiss
      }\n**PP:** ${data.scores[0].pp.toFixed(
        2
      )}pp (${ppdata.performance.pp.toFixed(2)}pp for FC)`,
      inline: true,
    })
    .setThumbnail(
      `https://assets.ppy.sh/beatmaps/${data.scores[0].beatmap.set_id}/covers/list.jpg`
    )
    .setFooter({
      text: `Beatmap by ${data.scores[0].beatmap.creator} played @ ${formattedTime} on ${formattedDate}`,
      iconURL:
        "https://cdn.discordapp.com/attachments/1262061807766474835/1262062085886709871/blob-haikei.png?ex=66953a69&is=6693e8e9&hm=9ff87b7eb7962b58b083cc0aca3c20752c927696508e72f7a4d3db5fcca65c27&",
    });

  return embed;
}
