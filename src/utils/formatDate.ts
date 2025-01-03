export function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }

  const parsed = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return `${parsed.day} ${parsed.literal || ""} ${parsed.month} ${
    parsed.literal || ""
  } ${parsed.year}`;
}
