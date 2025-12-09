import { ActionRowBuilder } from "@discordjs/builders";
import {
    ButtonBuilder,
    ButtonInteraction,
    EmbedBuilder,
} from "discord.js";
import { SystemError } from "../../../error/system-error";
import { ButtonInteractionHandler } from "../../types";
import { BetFields, BetStatus } from "../fields";
import {
    getCreatorId,
    getOptionLabelsFromButtons,
    findFieldByName,
} from "../utils";
import { getClosedBetButtons, BetButtonIds } from "../buttons";

export const CloseBet: ButtonInteractionHandler = {
    id: BetButtonIds.CLOSE,
    label: "Close bet",
    run: async (interaction: ButtonInteraction) => {
        const {
            user,
            message: { embeds, components },
        } = interaction;
        const [embed] = embeds;

        if (!embed || !embed.data.fields) {
            throw new SystemError("Could not find bet data.");
        }

        const creatorId = getCreatorId(embed.data.fields);
        if (user.id !== creatorId) {
            const exposeLoser = Math.random() < 0.5;
            if (exposeLoser) {
                await interaction.reply({
                    content: `Look at this loser <@${user.id}> trying to close the bet 💀`,
                });
            } else {
                // Silently acknowledge - no message, just stops button loading
                await interaction.deferUpdate();
            }
            return;
        }

        const status = findFieldByName(embed.data.fields, BetFields.STATUS);
        if (status !== BetStatus.OPEN) {
            await interaction.reply({
                content: "This bet is already closed!",
                ephemeral: true,
            });
            return;
        }

        const { option1Label, option2Label } = getOptionLabelsFromButtons(components);

        const updatedFields = embed.data.fields.map((field) => {
            if (field.name === BetFields.STATUS) {
                return { ...field, value: BetStatus.CLOSED };
            }
            return field;
        });

        const updatedEmbed = new EmbedBuilder({
            ...embed.data,
            fields: updatedFields,
            title: "🎰 Wager - Betting Closed!",
        }).setColor(0xffa500); // Orange color for closed state

        const buttons = getClosedBetButtons(option1Label, option2Label);
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

        await interaction.update({
            embeds: [updatedEmbed],
            components: [actionRow],
        });
    },
};

