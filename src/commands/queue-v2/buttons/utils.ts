import { getBumpQueueButton } from "./bump"
import { getJoinQueueButton } from "./join"
import { getLeaveQueueButton } from "./leave"

export const getQueueButtons = (isDisabled = false) => {
  const join = getJoinQueueButton(isDisabled);
  const leave = getLeaveQueueButton();
  const bump = getBumpQueueButton(isDisabled);

  const base = [join, leave];

  if (isDisabled) {
    return base;
  }

  return base.concat(bump)
}