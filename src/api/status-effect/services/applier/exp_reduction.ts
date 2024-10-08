export default (detail: StatusEffectDetail, exp: number) => {
  return Math.floor(-exp * ((detail.value as number) / 100));
};
