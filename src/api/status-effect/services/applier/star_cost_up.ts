export default (detail: StatusEffectDetail, cost: number) => {
  return cost * ((detail.value as number) / 100);
};
