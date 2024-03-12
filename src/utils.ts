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

function applyLocalizations(entity, locale) {
  if (!entity) {
    return entity;
  }

  const localizations = entity.localizations;

  if (!localizations) {
    return entity;
  }

  const localization = localizations.find((l) => l.locale === locale);

  if (!localization) {
    delete entity.localizations;
    return entity;
  }

  // remove id and locale from localization
  delete localization.id;

  // replace entity fields with localized fields
  for (const key in localization) {
    entity[key] = localization[key];
  }

  delete entity.localizations;

  return entity;
}

export { getRefTimestamp, getRefDay, applyLocalizations };
