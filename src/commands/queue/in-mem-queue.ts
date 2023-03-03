import { ChatInputCommandInteraction, User } from "discord.js";
import { SystemError } from "../../error/system-error";
import { getUserAsMention } from "../../utils/user";
import { QueueActions } from "./utils";
import { bold } from '../../utils/text';

export class InMemQueue {
  private inMemQueues = new Map<string, Set<string>>();
  private queueNamePrefix = 'queue';

  getCurrentQueueNames = () => [...this.inMemQueues.keys()]
    .map((name) => name.toLocaleLowerCase());

  private doesQueueExist = (name: string) => {
    const currentQueues = this.getCurrentQueueNames();
    return currentQueues.includes(name.toLowerCase());
  }

  private getMembersByQueueName = (name: string) => {
    if (this.inMemQueues.has(name)) {
      return [...this.inMemQueues.get(name)!.keys()];
    }
    throw new SystemError(`Sorry, ${bold(name)} is not a queue anymore.`);
  }

  private getQueueMembersMessage = (name: string) => {
    const queueMembers = this.getMembersByQueueName(name);
    return [
      `Current queue: ${bold(name)}`,
      ...queueMembers.map((value, index) => `${index + 1}. ${value}`)
    ].join('\n');
  }

  private getIncrementedQueueName = () => {
    const queueSize = this.inMemQueues.size || 1;
    return this.queueNamePrefix + queueSize;
  }

  handleAction = async (interaction: ChatInputCommandInteraction, action: string, queueName: string | null) => {
    switch (action) {
      case QueueActions.START:
        await this.startQueue(queueName, interaction);
        break;
      case QueueActions.SHOW:
        if (!queueName) {
          throw new SystemError('Provide a queue name you want to see.');
        }

        if (!this.doesQueueExist(queueName)) {
          throw new SystemError(`${queueName}* does not exist.`);
        }

        await this.showQueue(queueName, interaction);
        break;
      default:
        break;
    }
  }

  private startQueue = async (queueName: string | null, interaction: ChatInputCommandInteraction) => {
    if (queueName && this.doesQueueExist(queueName)) {
      throw new SystemError(`Sorry, "${queueName}" is already taken.`);
    }

    const { user } = interaction;
    const queueNameOrDefault = queueName || this.getIncrementedQueueName()
    const userMention = getUserAsMention(user);
    const queue = new Set<string>();
    queue.add(userMention);

    this.inMemQueues.set(queueNameOrDefault, queue)
    const content = this.getQueueMembersMessage(queueNameOrDefault)
    await interaction.reply(content);
  }

  private showQueue = async (queueName: string, interaction: ChatInputCommandInteraction) => {
    const content = this.getQueueMembersMessage(queueName);
    await interaction.reply(content);
  }
}