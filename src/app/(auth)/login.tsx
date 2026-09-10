import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TextInput, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useAuth } from '@/features/Auth/model/useAuth'
import SVGIconGoogle from '@/shared/images/icons/google.svg'
import SVGIconYandex from '@/shared/images/icons/yandex.svg'
import { textStyles } from '@/shared/styles/text'
import { Button } from '@/shared/ui/Button'

export default function LoginScreen() {
	const { t } = useTranslation()
	const { theme } = useUnistyles()
	const { loginWithEmail, loginWithGoogle, loginWithYandex, errorKind } =
		useAuth()

	const [email, setEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [magicLinkSent, setMagicLinkSent] = useState(false)

	const handleEmailLogin = async () => {
		if (!email.trim()) return

		setIsSubmitting(true)
		try {
			await loginWithEmail(email.trim())
			setMagicLinkSent(true)
		} catch {
			// errorKind already set in hook
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleGoogleLogin = async () => {
		setIsSubmitting(true)
		try {
			await loginWithGoogle()
		} catch {
			// errorKind already set in hook
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleYandexLogin = async () => {
		setIsSubmitting(true)
		try {
			await loginWithYandex()
		} catch {
			// errorKind already set in hook
		} finally {
			setIsSubmitting(false)
		}
	}

	if (magicLinkSent) {
		return (
			<View style={styles.Container}>
				<Text style={textStyles.heading5}>
					{t('screen.auth.Check your email')}
				</Text>
				<Text style={styles.Description}>
					{t('screen.auth.Magic link sent description')}
				</Text>
				<Button
					onPress={() => setMagicLinkSent(false)}
					variant='secondary'
					widthMode='full'
				>
					{t('screen.auth.Back')}
				</Button>
			</View>
		)
	}

	return (
		<View style={styles.Container}>
			<View style={{ marginBottom: 4 }}>
				<Text style={[textStyles.heading1, { marginBottom: 6 }]}>
					{t('screen.auth.Sign in')}
				</Text>
				<Text style={[textStyles.p, styles.Description]}>
					{t('screen.auth.Sign in description')}
				</Text>
			</View>

			<TextInput
				style={styles.Input}
				value={email}
				onChangeText={setEmail}
				placeholder={t('screen.auth.Email')}
				keyboardType='email-address'
				autoCapitalize='none'
				autoCorrect={false}
				editable={!isSubmitting}
			/>

			<Button
				onPress={handleEmailLogin}
				variant='default'
				size='lg'
				widthMode='full'
				loading={isSubmitting}
				disabled={isSubmitting || !email.trim()}
			>
				{t('screen.auth.Login via email')}
			</Button>

			<View style={styles.Divider}>
				<View style={styles.Divider__line} />
				<Text style={styles.Divider__text}>{t('screen.auth.or')}</Text>
				<View style={styles.Divider__line} />
			</View>

			<Button
				onPress={handleYandexLogin}
				variant='secondary'
				size='lg'
				widthMode='full'
				loading={isSubmitting}
				disabled={isSubmitting}
				style={{ gap: 10 }}
			>
				<SVGIconYandex width={28} height={28} fill={theme.colors.major} />
				<Text style={{ fontWeight: '600', fontSize: 16 }}>
					{t('screen.auth.Login via Yandex')}
				</Text>
			</Button>

			<Button
				onPress={handleGoogleLogin}
				variant='secondary'
				size='lg'
				widthMode='full'
				loading={isSubmitting}
				disabled={isSubmitting}
				style={{ gap: 10 }}
			>
				<SVGIconGoogle width={28} height={28} fill={theme.colors.major} />
				<Text style={{ fontWeight: '600', fontSize: 16 }}>
					{t('screen.auth.Login via Google')}
				</Text>
			</Button>

			{errorKind && (
				<Text style={styles.ErrorText}>
					{t(`error.${errorKind}.description`)}
				</Text>
			)}
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	Container: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 24,
		gap: 16,
		backgroundColor: theme.colors.surface
	},
	Description: {
		color: theme.colors.major,
		marginBottom: 8
	},
	Input: {
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: theme.colors.major,
		backgroundColor: theme.colors.surface
	},
	Divider: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginVertical: 8
	},
	Divider__line: {
		flex: 1,
		height: 1,
		backgroundColor: theme.colors.border
	},
	Divider__text: {
		color: theme.colors.mutedText
	},
	ErrorText: {
		color: theme.colors.danger,
		textAlign: 'center'
	}
}))
