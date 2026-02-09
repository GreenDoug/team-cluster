import { useEffect, useMemo, useState } from "react";

const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit"
});
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "long",
  day: "numeric",
  year: "numeric"
});

const formatDateTime = date => {
  const time = TIME_FORMATTER.format(date);
  const fullDate = DATE_FORMATTER.format(date);
  return `${time} · ${fullDate}`;
};

export default function useLiveDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => formatDateTime(now), [now]);
}