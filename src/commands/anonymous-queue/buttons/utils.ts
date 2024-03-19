import { getAnonJoinQueueButton } from "./join";
import { getAnonLeaveQueueButton } from "./leave";

export const getQueueButtons = (isDisabled = false) => {
  if (isDisabled) {
    return [];
  }
  const join = getAnonJoinQueueButton();
  const leave = getAnonLeaveQueueButton();
  return [join, leave];
};
