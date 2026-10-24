require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

const ALLOWED_USERS = ['YOUR_DISCORD_USER_ID_HERE'];

let PRESET_MESSAGE = 'No preset set yet.';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (!ALLOWED_USERS.includes(interaction.user.id)) {
    return interaction.reply({
      content: 'You are not allowed to use this command.',
      ephemeral: true,
    });
  }

  const command = interaction.commandName;

  if (command === 'setpreset') {
    const message = interaction.options.getString('message');
    PRESET_MESSAGE = message;

    return interaction.reply({
      content: `✅ Preset message set to:\n\`\`\`\n${message}\n\`\`\``,
      ephemeral: true,
    });
  }
  
  if (command === 'sendpreset') {
    const channelId = interaction.options.getString('channelid');
    const times = interaction.options.getInteger('times');
    const delaySeconds = 1; 

    if (PRESET_MESSAGE === 'No preset set yet.') {
      return interaction.reply({
        content: '❌ No preset message has been set yet. Use `/setpreset` first.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        return interaction.editReply({ content: 'Invalid channel or not a text channel.' });
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle('Confirm Preset Send')
        .setColor(0xEB459E)
        .addFields(
          { name: 'Channel', value: `${channel.name} (\`${channel.id}\`)`, inline: true },
          { name: 'Times', value: `${times}`, inline: true },
          { name: 'Delay', value: `1 second (fixed)`, inline: true },
          { name: 'Preset Message', value: PRESET_MESSAGE.length > 1000 ? PRESET_MESSAGE.slice(0, 1000) + '...' : PRESET_MESSAGE }
        );

      await handleConfirmation(interaction, confirmEmbed, async () => {
        let success = 0;
        let failed = 0;

        for (let n = 1; n <= times; n++) {
          try {
            await channel.send(PRESET_MESSAGE);
            success++;
            console.log(`[PRESET ${n}/${times}] Sent to #${channel.name}`);
          } catch (err) {
            failed++;
            console.error(`[PRESET ${n}/${times}] Failed:`, err.message);
          }
          if (n < times) await sleep(delaySeconds * 1000);
        }

        return { success, failed };
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  }

  if (command === 'dm') {
    const userId = interaction.options.getString('userid');
    const message = interaction.options.getString('message');
    const times = interaction.options.getInteger('times');
    const delaySeconds = interaction.options.getInteger('delay') || 2;

    await interaction.deferReply({ ephemeral: true });

    try {
      const user = await client.users.fetch(userId);

      const confirmEmbed = new EmbedBuilder()
        .setTitle('Confirm Mass DM')
        .setColor(0x5865F2)
        .addFields(
          { name: 'Target', value: `${user.tag} (\`${user.id}\`)`, inline: true },
          { name: 'Times', value: `${times}`, inline: true },
          { name: 'Delay', value: `${delaySeconds}s`, inline: true },
          { name: 'Message', value: message.length > 1000 ? message.slice(0, 1000) + '...' : message }
        );

      await handleConfirmation(interaction, confirmEmbed, async () => {
        let success = 0;
        let failed = 0;

        for (let n = 1; n <= times; n++) {
          try {
            await user.send(message);
            success++;
            console.log(`[DM ${n}/${times}] Sent to ${user.tag}`);
          } catch (err) {
            failed++;
            console.error(`[DM ${n}/${times}] Failed:`, err.message);
          }
          if (n < times) await sleep(delaySeconds * 1000);
        }

        return { success, failed };
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  }

  if (command === 'say') {
    const channelId = interaction.options.getString('channelid');
    const message = interaction.options.getString('message');
    const times = interaction.options.getInteger('times');
    const delaySeconds = interaction.options.getInteger('delay') || 2;

    await interaction.deferReply({ ephemeral: true });

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        return interaction.editReply({ content: 'Invalid channel or not a text channel.' });
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle('Confirm Mass Message')
        .setColor(0x57F287)
        .addFields(
          { name: 'Channel', value: `${channel.name} (\`${channel.id}\`)`, inline: true },
          { name: 'Times', value: `${times}`, inline: true },
          { name: 'Delay', value: `${delaySeconds}s`, inline: true },
          { name: 'Message', value: message.length > 1000 ? message.slice(0, 1000) + '...' : message }
        );

      await handleConfirmation(interaction, confirmEmbed, async () => {
        let success = 0;
        let failed = 0;

        for (let n = 1; n <= times; n++) {
          try {
            await channel.send(message);
            success++;
            console.log(`[SAY ${n}/${times}] Sent to #${channel.name}`);
          } catch (err) {
            failed++;
            console.error(`[SAY ${n}/${times}] Failed:`, err.message);
          }
          if (n < times) await sleep(delaySeconds * 1000);
        }

        return { success, failed };
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  }

  if (command === 'embed') {
    const channelId = interaction.options.getString('channelid');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const colorInput = interaction.options.getString('color') || '#5865F2';
    const times = interaction.options.getInteger('times');
    const delaySeconds = interaction.options.getInteger('delay') || 2;

    await interaction.deferReply({ ephemeral: true });

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        return interaction.editReply({ content: 'Invalid channel or not a text channel.' });
      }

      let color = 0x5865F2;
      if (colorInput.startsWith('#')) {
        color = parseInt(colorInput.slice(1), 16);
      } else {
        color = parseInt(colorInput, 16);
      }
      if (isNaN(color)) color = 0x5865F2;

      const previewEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);

      const confirmEmbed = new EmbedBuilder()
        .setTitle('Confirm Mass Embed')
        .setColor(0xFEE75C)
        .addFields(
          { name: 'Channel', value: `${channel.name} (\`${channel.id}\`)`, inline: true },
          { name: 'Times', value: `${times}`, inline: true },
          { name: 'Delay', value: `${delaySeconds}s`, inline: true },
          { name: 'Title', value: title },
          { name: 'Description', value: description.length > 500 ? description.slice(0, 500) + '...' : description }
        );

      await handleConfirmation(interaction, confirmEmbed, async () => {
        let success = 0;
        let failed = 0;

        for (let n = 1; n <= times; n++) {
          try {
            await channel.send({ embeds: [previewEmbed] });
            success++;
            console.log(`[EMBED ${n}/${times}] Sent to #${channel.name}`);
          } catch (err) {
            failed++;
            console.error(`[EMBED ${n}/${times}] Failed:`, err.message);
          }
          if (n < times) await sleep(delaySeconds * 1000);
        }

        return { success, failed };
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  }
});

async function handleConfirmation(interaction, confirmEmbed, sendFunction) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm & Send')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)
  );

  const reply = await interaction.editReply({
    embeds: [confirmEmbed],
    components: [row],
  });

  const collector = reply.createMessageComponentCollector({
    filter: i => i.user.id === interaction.user.id,
    time: 60_000,
  });

  collector.on('collect', async i => {
    if (i.customId === 'cancel') {
      await i.update({ content: '❌ Cancelled.', embeds: [], components: [] });
      collector.stop();
      return;
    }

    if (i.customId === 'confirm') {
      await i.update({ content: 'Starting...', embeds: [], components: [] });

      const result = await sendFunction();

      await interaction.followUp({
        content: `✅ Finished!\n• Successfully sent: **${result.success}**\n• Failed: **${result.failed}**`,
        ephemeral: true,
      });
      collector.stop();
    }
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      interaction.editReply({ content: 'Timed out.', embeds: [], components: [] }).catch(() => {});
    }
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.login(process.env.TOKEN);
