require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [

  new SlashCommandBuilder()
    .setName('dm')
    .setDescription('bypass and dm a user')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('The user ID to DM')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('times')
        .setDescription('How many times to send the message')
        .setRequired(true)
        .setMinValue(1))
    .addIntegerOption(option =>
      option.setName('delay')
        .setDescription('Delay between messages in seconds (default 2)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(60)),

  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send any raid message you want')
    .addStringOption(option =>
      option.setName('channelid')
        .setDescription('The channel ID to send to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('times')
        .setDescription('How many times to send the message')
        .setRequired(true)
        .setMinValue(1))
    .addIntegerOption(option =>
      option.setName('delay')
        .setDescription('Delay between messages in seconds (default 2)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(60)),

  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send an embed to any channel a set number of times')
    .addStringOption(option =>
      option.setName('channelid')
        .setDescription('The channel ID to send to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Embed title')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Embed description')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Hex color (e.g. #5865F2) – optional')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('times')
        .setDescription('How many times to send the embed')
        .setRequired(true)
        .setMinValue(1))
    .addIntegerOption(option =>
      option.setName('delay')
        .setDescription('Delay between embeds in seconds (default 2)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(60)),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
