import { ONE_DAY, REF_DATE, RESET_HOUR } from "./constant";

function getRefTimestamp(date) {
  const refDate = new Date(date);
  if (refDate.getHours() < RESET_HOUR) {
    refDate.setDate(refDate.getDate() - 1);
  }
  refDate.setHours(RESET_HOUR, 0, 0, 0);
  return refDate.getTime();
}

// first day of the month
function getDayFromRefDate(date) {
  const diff = getRefTimestamp(date) - REF_DATE;

  return (diff / ONE_DAY) % 7;
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

export { getRefTimestamp, getDayFromRefDate, applyLocalizations };
