export function formatDate(date: Date) {
  const parsed = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

      .formatToParts(date)
      .map(({ type, value }) => [type, value])
  );

  return `${parsed.day} ${parsed.literal} ${parsed.month} ${parsed.literal} ${parsed.year}`;
}
