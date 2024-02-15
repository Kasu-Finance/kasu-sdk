/* eslint-disable func-names */
import { default as _dayjs } from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import duration from 'dayjs/plugin/duration'

_dayjs.extend(advancedFormat)
_dayjs.extend(duration)

const dayjs = _dayjs

export default dayjs
