import { capitalize } from '@/shared/lib/string'
import {
	format,
	isThisYear,
	isToday,
	isTomorrow,
	isYesterday,
	parse
} from 'date-fns'
import { t } from 'i18next'

import { getDateFnsLocale } from '@/shared/i18n/dateFnsLocale'

import { WeekStartDayIndex } from '@/services/settings/domain'
import { HourFormat } from '../domain/time'

export const getWeekStartDate = (
	date: Date,
	weekStartDayIndex: WeekStartDayIndex
): Date => {
	const resultDate = new Date(date)
	const currentDay = resultDate.getDay()
	const shiftToWeekStart = (currentDay - weekStartDayIndex + 7) % 7

	resultDate.setDate(resultDate.getDate() - shiftToWeekStart)
	return resultDate
}

export function formatTitleDate(date: Date): string {
	if (isToday(date)) {
		return t('date.Today')
	}
	if (isYesterday(date)) {
		return t('date.Yesterday')
	}
	if (isTomorrow(date)) {
		return t('date.Tomorrow')
	}

	if (isThisYear(date)) {
		return format(date, t('date.pattern'), { locale: getDateFnsLocale() })
	}

	return format(date, t('date.patternWYear'), { locale: getDateFnsLocale() })
}

export function formatCalendarTitle(date: Date): string {
	let title = ''

	if (isThisYear(date)) {
		title = format(date, t('date.monthPattern'), { locale: getDateFnsLocale() })
	} else {
		title = format(date, t('date.monthPatternWYear'), {
			locale: getDateFnsLocale()
		})
	}

	return capitalize(title)
}

export function formatNavDate(date: Date): string {
	if (isToday(date)) {
		return t('date.Today')
	}

	if (isThisYear(date)) {
		return format(date, t('date.shortPattern'), { locale: getDateFnsLocale() })
	}

	return format(date, t('date.shortPatternWYear'), {
		locale: getDateFnsLocale()
	})
}

export const formatTime = (time: string, hourFormat: HourFormat = '24') => {
	const parsed = parse(time, 'HH:mm:ss', new Date())
	const pattern = hourFormat === '24' ? 'H:mm' : 'h:mm a'
	return format(parsed, pattern)
}
