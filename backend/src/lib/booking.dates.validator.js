/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

/**
 * Custom validator function to check if the array is non-empty, contains valid future dates, and has no duplicates.
 *
 * @param {Array} array - The array of dates to be validated.
 * @returns {boolean} - Returns true if the array contains valid future dates without duplicates, otherwise false.
 */
exports.validateBookingDates = (array) => {
  if (array.length === 0) return false; // Array should not be empty

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const uniqueDates = new Set(); // Using a Set to track unique dates

  // Check if each element is a valid date and in the future, and there are no duplicates
  for (const date of array) {
    const parsedDate = new Date(date);
    const normalizedDate = exports.normalizeBookingDate(date);

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(parsedDate) || !normalizedDate) return false;

    parsedDate.setHours(0, 0, 0, 0);

    if (parsedDate <= currentDate) return false;

    // Check for duplicates
    if (uniqueDates.has(normalizedDate)) return false;
    uniqueDates.add(normalizedDate);
  }

  return true;
};

/**
 * Checks various date-related conditions for a given array of date strings.
 *
 * @param {string[]} dateArray - An array of date strings in the format 'YYYY-MM-DD'.
 * @returns {Object} An object containing various date-related conditions:
 *   - isAnyDateInPast: A boolean indicating if any date is in the past.
 *   - earliestDate: The earliest date in the array.
 *   - latestDate: The latest date in the array.
 *   - isEarliestDateOverCurrentDate: A boolean indicating if the earliest date is after the current date.
 *   - isLatestDateOverCurrentDate: A boolean indicating if the latest date is after the current date.
 */
exports.bookingDatesBeforeCurrentDate = (dateArray) => {
  // Convert dates to Date objects
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if any date is in the past
  const isAnyDateInPast = dateArray.some((dateString) => {
    const parsedDate = new Date(dateString);
    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate < currentDate;
  });

  // Convert dates to Date objects and find the earliest and latest dates
  const dateObjects = dateArray.map((dateString) => new Date(dateString));
  const earliestDate = new Date(Math.min(...dateObjects));
  const latestDate = new Date(Math.max(...dateObjects));

  // Check if the earliest date is over the current date
  const isEarliestDateOverCurrentDate = earliestDate < currentDate;

  // Check if the latest date is over the current date
  const isLatestDateOverCurrentDate = latestDate < currentDate;

  return {
    isAnyDateInPast,
    earliestDate,
    latestDate,
    isEarliestDateOverCurrentDate,
    isLatestDateOverCurrentDate
  };
};

/**
 * Normalize a date-like input into a stable YYYY-MM-DD string.
 *
 * @param {string|Date} dateInput - Date-like input.
 * @returns {string|null} Normalized date string or null if invalid.
 */
exports.normalizeBookingDate = (dateInput) => {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }

  const parsedDate = new Date(dateInput);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(parsedDate)) return null;

  const year = parsedDate.getFullYear();
  const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0');
  const date = `${parsedDate.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${date}`;
};

/**
 * Returns true when at least one booking date overlaps another list of dates.
 *
 * @param {Array<string|Date>} firstDateArray - First list of booking dates.
 * @param {Array<string|Date>} secondDateArray - Second list of booking dates.
 * @returns {boolean} Whether there is an overlap.
 */
exports.hasOverlappingBookingDates = (firstDateArray = [], secondDateArray = []) => {
  const firstDateSet = new Set(
    firstDateArray
      .map((dateInput) => exports.normalizeBookingDate(dateInput))
      .filter(Boolean)
  );

  return secondDateArray.some((dateInput) => {
    const normalizedDate = exports.normalizeBookingDate(dateInput);
    return normalizedDate && firstDateSet.has(normalizedDate);
  });
};

/**
 * Filters dates to only keep today or future dates in normalized form.
 *
 * @param {Array<string|Date>} dateArray - Booking dates to filter.
 * @returns {string[]} Normalized dates that are still upcoming.
 */
exports.getUpcomingBookingDates = (dateArray = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dateArray
    .map((dateInput) => {
      const parsedDate = new Date(dateInput);

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(parsedDate)) return null;

      parsedDate.setHours(0, 0, 0, 0);

      if (parsedDate < today) return null;

      return exports.normalizeBookingDate(parsedDate);
    })
    .filter(Boolean);
};
