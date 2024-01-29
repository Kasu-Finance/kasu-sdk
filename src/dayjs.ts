/* eslint-disable func-names */
import { default as _dayjs } from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'

_dayjs.extend(advancedFormat)

const dayjs = _dayjs

export default dayjs
