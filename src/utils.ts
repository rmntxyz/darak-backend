// 04:00:00 am
function getRefTimestamp(date) {
  const refDate = new Date(date);
  if (refDate.getHours() < 4) {
    refDate.setDate(refDate.getDate() - 1);
  }
  refDate.setHours(4, 0, 0, 0);
  return refDate.getTime();
}

export { getRefTimestamp };
