import { getJoinQueueButton } from "./join"
import { getLeaveQueueButton } from "./leave"

export const getQueueButtons = (isDisabled = false) => {
  const join = getJoinQueueButton(isDisabled);
  const leave = getLeaveQueueButton();

  if (isDisabled) {
    return [];
  }

  return [join, leave];
}