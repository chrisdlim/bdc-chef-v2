import { ChatInputCommandInteraction, User } from "discord.js";
import { getUserAsMention, getUserWithDiscriminator } from "../../utils/user";
import { QueueActions } from "./constants";
import { bold, numberedList } from "../../utils/text";
import { SystemError } from "../../error/system-error";

// Move this to a config file pls chris
const easterEggNames = process.env.EASTER_EGG_NAMES?.split(",");

type HandleActionParams = {
  action: string | null;
  queueSize: number;
};

class Queue {
  constructor(
    public members: Set<string> = new Set<string>(),
    public size: number = 5
  ) {}

  get isFull() {
    return this.size === this.members.size;
  }

  setSize(size: number) {
    this.size = size;
  }
}

export class InMemQueue {
  private inMemQueue = new Queue();
  private queueName = "gamer-queue";

  private getQueueMembers = () => {
    return [...this.inMemQueue.members.keys()];
  };

  private getQueueMembersList = () => {
    const queueMembers = this.getQueueMembers();
    return numberedList(queueMembers);
  };

  private getCurrentQueueMembersMessage = (message?: string) => {
    const remainingSlots = this.inMemQueue.size - this.inMemQueue.members.size;
    const baseMessage =
      message ||
      `${bold(this.queueName)}. ${
        remainingSlots ? `Looking for ${remainingSlots} more gamer(s)!` : ""
      }`.trim();
    return [baseMessage, this.getQueueMembersList()].join("\n");
  };

  private getQueueReadyAnnouncement = () => {
    return [
      `OOOOORDER UP, "${bold(this.queueName)}" is ready to roll!`,
      this.getQueueMembersList(),
    ].join("\n");
  };

  private isUserInQueue = (user: User) => {
    const userMention = getUserAsMention(user);
    return this.inMemQueue?.members.has(userMention);
  };

  private addUserToQueue = (user: User) => {
    const userMention = getUserAsMention(user);
    this.inMemQueue.members.add(userMention);
  };

  private removeUserFromQueue = (user: User) => {
    const userMention = getUserAsMention(user);
    this.inMemQueue.members.delete(userMention);
  };

  private getActionOrDefault = (action: string | null, user: User) => {
    if (action) return action;
    return this.isUserInQueue(user) ? QueueActions.SHOW : QueueActions.JOIN;
  };

  handleAction = async (
    interaction: ChatInputCommandInteraction,
    { action, queueSize }: HandleActionParams
  ) => {
    const { user } = interaction;

    if (queueSize) {
      this.inMemQueue.setSize(queueSize);
    }

    const actionOrDefault = this.getActionOrDefault(action, user);

    switch (actionOrDefault) {
      case QueueActions.JOIN:
        await this.joinQueue(interaction);
        break;
      case QueueActions.LEAVE:
        if (!this.isUserInQueue(user)) {
          throw new SystemError("You aren't in the queue.");
        }
        await this.leaveQueue(interaction);
        break;
      case QueueActions.SHOW:
        await this.showQueue(interaction);
        break;
      case QueueActions.CLEAR:
        await this.clearQueue(interaction);
        break;
      default:
        break;
    }
  };

  // Queue actions

  private showQueue = async (interaction: ChatInputCommandInteraction) => {
    const baseMessage =
      "You're aleady waiting to cook! Here's the current lineup:";
    const content = this.getCurrentQueueMembersMessage(baseMessage);
    await interaction.reply({ content, ephemeral: true });
  };

  private joinQueue = async (interaction: ChatInputCommandInteraction) => {
    const { user } = interaction;

    this.addUserToQueue(user);

    const getContent = this.inMemQueue.isFull
      ? this.getQueueReadyAnnouncement
      : this.getCurrentQueueMembersMessage;

    const easterEggMsg = easterEggNames?.includes(
      getUserWithDiscriminator(user)
    )
      ? `Btw, your meals taste like ass ${getUserAsMention(user)}`
      : "";

    const content = [getContent(), easterEggMsg].join("\n");
    await interaction.reply(content);
  };

  private leaveQueue = async (interaction: ChatInputCommandInteraction) => {
    this.removeUserFromQueue(interaction.user);

    // If still has remaining members in queue, then return list of members
    if (this.inMemQueue.members.size) {
      const content = this.getCurrentQueueMembersMessage();
      await interaction.reply(content);
    } else {
      await interaction.reply("Where the f my chefs go?? Queue is empty.");
    }
  };

  private clearQueue = async (interaction: ChatInputCommandInteraction) => {
    this.inMemQueue.members.clear();
    await interaction.reply(`No one's hungry? Alright, clearing the queue.`);
  };
}
