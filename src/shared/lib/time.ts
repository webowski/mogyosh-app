import { format, isThisYear, isToday, isTomorrow, isYesterday } from 'date-fns'

import { getDateFnsLocale } from '@/shared/i18n/dateFnsLocale'
import { t } from 'i18next'

export function formatTitleDate(date: Date): string {
	if (isToday(date)) {
		return t('Today')
	}
	if (isYesterday(date)) {
		return t('Yesterday')
	}
	if (isTomorrow(date)) {
		return t('Tomorrow')
	}

	if (isThisYear(date)) {
		return format(date, t('datePattern'), { locale: getDateFnsLocale() })
	}

	return format(date, t('datePatternWYear'))
}

export function formatNavDate(date: Date): string {
	if (isToday(date)) {
		return t('Today')
	}

	if (isThisYear(date)) {
		return format(date, t('dateShortPattern'), { locale: getDateFnsLocale() })
	}

	return format(date, t('dateShortPatternWYear'))
}
