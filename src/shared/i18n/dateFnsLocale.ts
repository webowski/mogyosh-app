import { enUS, es, ja, ru } from 'date-fns/locale'
import i18next from 'i18next'

const dateFnsLocales = { ru, en: enUS, es, ja }

export const getDateFnsLocale = () =>
	dateFnsLocales[i18next.language as keyof typeof dateFnsLocales] ?? enUS
