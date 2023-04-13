import { getBumpQueueButton } from "./bump"
import { getJoinQueueButton } from "./join"
import { getLeaveQueueButton } from "./leave"

export const getQueueButtons = (isDisabled = false) => {
  const join = getJoinQueueButton(isDisabled);
  const leave = getLeaveQueueButton();
  const bump = getBumpQueueButton(isDisabled);

  if (isDisabled) {
    return [leave];
  }

  return [join, leave, bump];
}