import {
  format,
  isToday,
  isYesterday,
  differenceInYears,
  differenceInDays,
} from "date-fns";

export function getDateLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  const now = new Date();

  let formatStr: string;

  if (differenceInDays(now, date) < 7) {
    formatStr = "EEEE"; // Within a week
  } else if (differenceInYears(now, date) < 1) {
    formatStr = "EEE, dd MMM"; // Less than a year ago
  } else {
    formatStr = "EEE, dd MMM yyyy"; // Over a year ago
  }

  return format(date, formatStr);
}
