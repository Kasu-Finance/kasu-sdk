/* eslint-disable func-names */
import _dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

/* eslint-disable */
_dayjs.extend(advancedFormat)
_dayjs.extend(duration)
_dayjs.extend(utc)
/* eslint-enable */

const dayjs = _dayjs

export default dayjs
