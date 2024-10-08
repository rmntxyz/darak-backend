export default (detail: StatusEffectDetail, reward: Reward) => {
  if (reward.type === "star_point") {
    return -reward.amount * ((detail.value as number) / 100);
  }
  return 0;
};
