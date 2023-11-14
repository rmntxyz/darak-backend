// 05:00:00 am
const REF_TIME = 5; // 0 ~ 23
const REF_DAY = 1; // 1 ~ 31

function getRefTimestamp(date) {
  const refDate = new Date(date);
  if (refDate.getHours() < REF_TIME) {
    refDate.setDate(refDate.getDate() - 1);
  }
  refDate.setHours(REF_TIME, 0, 0, 0);
  return refDate.getTime();
}

// first day of the month
function getRefDay(date) {
  const refDate = new Date(date);
  refDate.setDate(REF_DAY);
  refDate.setHours(0, 0, 0, 0);
  return refDate.getTime();
}

export { getRefTimestamp, getRefDay };
