/**
 * NZ Time Utility — Pacific/Auckland
 * 
 * All date/time operations in this app must use this utility
 * to ensure correct New Zealand time (handles daylight saving automatically).
 */
import momentTz from 'moment-timezone';

export const NZ_TIMEZONE = 'Pacific/Auckland';

/**
 * Returns the current NZ time as a moment object
 */
export const nowNZ = () => momentTz().tz(NZ_TIMEZONE);

/**
 * Returns the current NZ time as a native JS Date
 * Use this as a drop-in replacement for `new Date()`
 */
export const nowNZDate = (): Date => nowNZ().toDate();

/**
 * Returns start of the current ISO week (Monday 00:00:00) in NZ time
 */
export const startOfWeekNZ = (): Date => nowNZ().startOf('isoWeek').toDate();

/**
 * Returns end of the current ISO week (Sunday 23:59:59) in NZ time
 */
export const endOfWeekNZ = (): Date => nowNZ().endOf('isoWeek').toDate();

/**
 * Returns today's date formatted as YYYY-MM-DD in NZ time
 * Use this for daily claim checks
 */
export const todayNZ = (): string => nowNZ().format('YYYY-MM-DD');

/**
 * Converts any date/string to a NZ moment object
 */
export const toNZMoment = (date: Date | string) => momentTz(date).tz(NZ_TIMEZONE);

/**
 * Returns start of today (00:00:00) in NZ time
 */
export const startOfTodayNZ = (): Date => nowNZ().startOf('day').toDate();

/**
 * Returns the current server NZ time info (for admin status endpoint)
 */
export const getNZServerTimeInfo = () => {
  const nz = nowNZ();
  return {
    timezone: NZ_TIMEZONE,
    currentTime: nz.format('YYYY-MM-DD HH:mm:ss'),
    utcOffset: nz.format('Z'),
    isDaylightSaving: nz.isDST(),
  };
};
