import { ChatInputCommandInteraction, User } from "discord.js";
import { SystemError } from "../../error/system-error";
import { getUserAsMention } from "../../utils/user";
import { QueueActions } from "./constants";
import { bold, numberedList } from "../../utils/text";

export class InMemQueue {
  private inMemQueues = new Map<string, Set<string>>();
  private queueNamePrefix = "queue";

  getCurrentQueueNames = () =>
    [...this.inMemQueues.keys()].map((name) => name.toLocaleLowerCase());

  getQueue = (name: string) => this.inMemQueues.get(name);

  private getMembersByQueueName = (name: string) => {
    if (this.inMemQueues.has(name)) {
      return [...this.inMemQueues.get(name)!.keys()];
    }
    throw new SystemError(`Sorry, ${bold(name)} is not a queue anymore.`);
  };

  private getQueueMembersMessage = (name: string) => {
    const queueMembers = this.getMembersByQueueName(name);
    return [
      `Current queue: ${bold(name)}`,
      numberedList(queueMembers)
    ].join("\n");
  };

  private getIncrementedQueueName = () => {
    const queueSize = this.inMemQueues.size || 1;
    return this.queueNamePrefix + queueSize;
  };

  handleAction = async (
    interaction: ChatInputCommandInteraction,
    action: string,
    queueName: string | null
  ) => {
    const { user } = interaction;
    switch (action) {
      case QueueActions.LIST:
        await this.listQueues(interaction);
        break;
      case QueueActions.START:
        if (!this.isQueueNameTaken(queueName)) return;
        await this.startQueue(queueName, interaction);
        break;
      case QueueActions.SHOW:
        if (!this.isQueueNameProvided(queueName)) return;
        if (!this.doesQueueExist(queueName)) return;
        await this.showQueue(queueName, interaction);
        break;
      case QueueActions.JOIN:
        if (!this.isQueueNameProvided(queueName)) return;
        if (!this.doesQueueExist(queueName)) return;
        this.isUserNotInQueue(user, queueName);
        await this.joinQueue(queueName, interaction);
      case QueueActions.LEAVE:
        if (!this.isQueueNameProvided(queueName)) return;
        if (!this.doesQueueExist(queueName)) return;
        if (!this.isUserInQueue(user, queueName)) return;
        await this.leaveQueue(queueName, interaction);
      case QueueActions.DELETE:
        if (!this.isQueueNameProvided(queueName)) return;
        if (!this.doesQueueExist(queueName)) return;
        await this.deleteQueue(queueName, interaction);
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
    interaction: ChatInputCommandInteraction
  ) => {
    const { user } = interaction;
    const queueNameOrDefault = name || this.getIncrementedQueueName();
    const userMention = getUserAsMention(user);
    const queue = new Set<string>();
    queue.add(userMention);

    this.inMemQueues.set(queueNameOrDefault, queue);
    const content = this.getQueueMembersMessage(queueNameOrDefault);
    await interaction.reply(content);
  };

  private showQueue = async (
    name: string,
    interaction: ChatInputCommandInteraction
  ) => {
    const content = this.getQueueMembersMessage(name);
    await interaction.reply(content);
  };

  private joinQueue = async (
    name: string,
    interaction: ChatInputCommandInteraction
  ) => {
    const { user } = interaction;
    const queue = this.inMemQueues.get(name);
    queue?.add(getUserAsMention(user));
    const content = this.getQueueMembersMessage(name);
    await interaction.reply(content);
  };

  private leaveQueue = async (
    name: string,
    interaction: ChatInputCommandInteraction
  ) => {
    const { user } = interaction;
    const queue = this.inMemQueues.get(name);
    queue?.delete(getUserAsMention(user));

    // If still has remaining members in queue, then return list of members
    if (queue?.size) {
      const content = this.getQueueMembersMessage(name);
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

  private isQueueNameProvided = (name: string | null): name is string => {
    if (!name) {
      throw new SystemError("Provide a queue name.");
    }
    return true;
  };

  private doesQueueExist = (name: string) => {
    if (!this.getQueue(name)) {
      throw new SystemError(`${name} does not exist.`);
    }
    return true;
  };

  private isQueueNameTaken = (name: string | null) => {
    if (name && !!this.getQueue(name)) {
      throw new SystemError(`Sorry, ${name} is already taken.`);
    }
    return true;
  };

  private isUserNotInQueue = (user: User, queueName: string) => {
    const getUserMention = getUserAsMention(user);
    const queue = this.inMemQueues.get(queueName);

    if (queue?.has(getUserMention)) {
      throw new SystemError(`You're already in the queue for: ${queueName}`);
    }

    return true;
  };

  private isUserInQueue = (user: User, queueName: string) => {
    const getUserMention = getUserAsMention(user);
    const queue = this.inMemQueues.get(queueName);

    if (!queue?.has(getUserMention)) {
      throw new SystemError(`You're not in the queue for: ${queueName}`);
    }

    return true;
  };
}
