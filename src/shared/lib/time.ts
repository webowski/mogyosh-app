import { format, isThisYear, isToday, isTomorrow, isYesterday } from 'date-fns'

import { getDateFnsLocale } from '@/shared/i18n/dateFnsLocale'
import { t } from 'i18next'

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
