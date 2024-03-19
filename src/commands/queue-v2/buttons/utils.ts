import { getJoinQueueButton } from "./join";
import { getLeaveQueueButton } from "./leave";

export const getQueueButtons = (isDisabled = false) => {
  if (isDisabled) {
    return [];
  }
  const join = getJoinQueueButton();
  const leave = getLeaveQueueButton();
  return [join, leave];
};
