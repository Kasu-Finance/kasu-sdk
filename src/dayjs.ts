/* eslint-disable func-names */
import _dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

/* eslint-disable */
_dayjs.extend(advancedFormat)
_dayjs.extend(duration)
_dayjs.extend(utc)
_dayjs.extend(relativeTime)
/* eslint-enable */

const dayjs = _dayjs

export default dayjs
