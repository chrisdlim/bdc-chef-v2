import { ChatInputCommandInteraction, User } from "discord.js";
import { SystemError } from "../../error/system-error";
import { getUserAsMention } from "../../utils/user";
import { QueueActions } from "./constants";
import { bold, numberedList } from "../../utils/text";

type HandleActionParams = {
  action: string,
  queueName: string | null,
  queueSize: number | null,
};

class Queue {
  constructor(
    public members: Set<string>,
    public size: number | null) { }

  get isFull() {
    if (!this.size) {
      throw new SystemError('This queue does not have a specified size.');
    }
    return this.size === this.members.size;
  }
}

export class InMemQueue {
  private inMemQueues = new Map<string, Queue>();
  private queueNamePrefix = "queue";

  getCurrentQueueNames = () =>
    [...this.inMemQueues.keys()].map((name) => name.toLocaleLowerCase());

  getQueue = (name: string) => this.inMemQueues.get(name);

  private getQueueMembers = (name: string) => {
    if (this.inMemQueues.has(name)) {
      return [...this.inMemQueues.get(name)!.members!.keys()];
    }
    throw new SystemError(`Sorry, ${bold(name)} is not a queue anymore.`);
  };

  private getQueueMembersList = (name: string) => {
    const queueMembers = this.getQueueMembers(name);
    return numberedList(queueMembers);
  }

  private getCurrentQueueMembersMessage = (name: string, remainingSlots?: number) => {
    const baseMessage = 
      `Current queue: ${bold(name)}. ${remainingSlots ? 
          `Looking for ${remainingSlots} more gamers!` : ''}`.trim()
    return [
      baseMessage,
      this.getQueueMembersList(name),
    ].join("\n");
  };

  private getQueueReadyAnnouncement = (name: string) => {
    return [
      `OOOOOORDER UP, "${bold(name)}" is ready to roll!`,
      this.getQueueMembersList(name),
    ].join('\n');
  };

  private getIncrementedQueueName = () => {
    const queueSize = this.inMemQueues.size || 1;
    return this.queueNamePrefix + queueSize;
  };

  handleAction = async (
    interaction: ChatInputCommandInteraction,
    { action, queueName, queueSize }: HandleActionParams,
  ) => {
    const { user } = interaction;

    switch (action) {
      case QueueActions.LIST:
        await this.listQueues(interaction);
        break;
      case QueueActions.START:
        this.verifyQueueNameIsAvailable(queueName);
        await this.startQueue(queueName, queueSize, interaction);
        break;
      case QueueActions.SHOW:
        this.verifyQueueNameIsProvided(queueName);
        this.verifyQueueExists(queueName);
        await this.showQueue(queueName, interaction);
        break;
      case QueueActions.JOIN:
        this.verifyQueueNameIsProvided(queueName);
        this.verifyQueueExists(queueName);
        this.verifyUserNotInQueue(user, queueName);
        await this.joinQueue(queueName, interaction);
        break;
      case QueueActions.LEAVE:
        this.verifyQueueNameIsProvided(queueName);
        this.verifyQueueExists(queueName);
        this.verifyUserIsInQueue(user, queueName);
        await this.leaveQueue(queueName, interaction);
        break;
      case QueueActions.DELETE:
        this.verifyQueueNameIsProvided(queueName);
        this.verifyQueueExists(queueName);
        await this.deleteQueue(queueName, interaction);
        break;
      default:
        break;
    }
  };

  // Queue actions

  private listQueues = async (interaction: ChatInputCommandInteraction) => {
    const queues = this.getCurrentQueueNames();
    const content = [
      'Current queues:',
      numberedList(queues)
    ].join('\n');
    await interaction.reply(content);
  }

  private startQueue = async (
    name: string | null,
    queueSize: number | null,
    interaction: ChatInputCommandInteraction
  ) => {
    const { user } = interaction;
    const queueNameOrDefault = name || this.getIncrementedQueueName();
    const userMention = getUserAsMention(user);

    const queue = new Queue(
      new Set<string>([userMention]),
      queueSize
    );

    this.inMemQueues.set(queueNameOrDefault, queue);
    const content = this.getCurrentQueueMembersMessage(queueNameOrDefault);

    await interaction.reply(content);
  };

  private showQueue = async (
    name: string,
    interaction: ChatInputCommandInteraction
  ) => {
    const content = this.getCurrentQueueMembersMessage(name);
    await interaction.reply(content);
  };

  private joinQueue = async (
    name: string,
    interaction: ChatInputCommandInteraction
  ) => {
    const { user } = interaction;

    const queue = this.inMemQueues.get(name);
    queue?.members.add(getUserAsMention(user));

    const content = this.getCurrentQueueMembersMessage(name);
    await interaction.reply(content);

    if (queue?.isFull) {
      await interaction.editReply(this.getQueueReadyAnnouncement(name));
      await interaction.reply('alskdjasdlkasd');
    }
  };

  private leaveQueue = async (
    name: string,
    interaction: ChatInputCommandInteraction
  ) => {
    console.log('trying to leave queue?...');
    const { user } = interaction;
    const queue = this.inMemQueues.get(name);
    queue?.members.delete(getUserAsMention(user));

    // If still has remaining members in queue, then return list of members
    if (queue?.members.size) {
      const content = this.getCurrentQueueMembersMessage(name);
      await interaction.reply(content);
    } else {
      // Close the queue if everyone left
      this.deleteQueue(name, interaction);
    }
  };

  private deleteQueue = async (
    name: string,
    interaction: ChatInputCommandInteraction
  ) => {
    if (this.inMemQueues.has(name)) {
      this.inMemQueues.delete(name);
      await interaction.reply(
        `No one's hungry? Alright, closing the queue: **${name}**.`
      );
    }
  };

  // Queue validation

  private verifyQueueNameIsProvided = (name: string | null): name is string => {
    if (!name) {
      throw new SystemError("Provide a queue name.");
    }
  };

  private verifyQueueExists = (name: string) => {
    if (!this.getQueue(name)) {
      throw new SystemError(`${name} does not exist.`);
    }
  };

  private verifyQueueNameIsAvailable = (name: string | null) => {
    if (name && !!this.getQueue(name)) {
      throw new SystemError(`Sorry, ${name} is already taken.`);
    }
  };

  private verifyUserNotInQueue = (user: User, queueName: string) => {
    const getUserMention = getUserAsMention(user);
    const queue = this.inMemQueues.get(queueName);

    if (queue?.members.has(getUserMention)) {
      throw new SystemError(`You're already in the queue for: ${queueName}`);
    }
  };

  private verifyUserIsInQueue = (user: User, queueName: string) => {
    const getUserMention = getUserAsMention(user);
    const queue = this.inMemQueues.get(queueName);

    if (!queue?.members.has(getUserMention)) {
      throw new SystemError(`You're not in the queue for: ${queueName}`);
    }
  };
}
