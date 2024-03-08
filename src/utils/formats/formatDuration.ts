

import dayjs from 'dayjs';

const formatDuration = (timestamp: number) => {
  const date = dayjs.unix(timestamp);

  const now = dayjs();
  const diff = now.diff(date);
  const duration = dayjs.duration(diff);

  const parts = [];
  if (duration.years() > 0) parts.push(`${duration.years()} year${duration.years() > 1 ? 's' : ''}`);
  if (duration.months() > 0) parts.push(`${duration.months()} month${duration.months() > 1 ? 's' : ''}`);

  return parts.join(' • ');
};





export default formatDuration;