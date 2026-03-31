import { enUS, ru } from 'date-fns/locale'
import i18next from 'i18next'

const dateFnsLocales = { ru, en: enUS }

export const getDateFnsLocale = () =>
	dateFnsLocales[i18next.language as keyof typeof dateFnsLocales] ?? enUS
