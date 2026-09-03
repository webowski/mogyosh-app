import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TextInput, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { textStyles } from '@/shared/styles/text'
import { Button } from '@/shared/ui/Button'
import { useAuth } from '../model/useAuth'

export function LoginScreen() {
	const { t } = useTranslation()
	const { loginWithEmail, loginWithGoogle, errorKind } = useAuth()

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

	if (magicLinkSent) {
		return (
			<View style={styles.Container}>
				<Text style={textStyles.heading5}>{t('auth.Check your email')}</Text>
				<Text style={styles.Description}>
					{t('auth.Magic link sent description')}
				</Text>
				<Button
					onPress={() => setMagicLinkSent(false)}
					variant='secondary'
					size='lg'
					widthMode='full'
				>
					{t('auth.Back')}
				</Button>
			</View>
		)
	}

	return (
		<View style={styles.Container}>
			<Text style={textStyles.heading5}>{t('auth.Sign in')}</Text>
			<Text style={styles.Description}>{t('auth.Sign in description')}</Text>

			<TextInput
				style={styles.Input}
				value={email}
				onChangeText={setEmail}
				placeholder={t('auth.Email placeholder')}
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
				{t('auth.Continue with email')}
			</Button>

			<View style={styles.Divider}>
				<View style={styles.Divider__line} />
				<Text style={styles.Divider__text}>{t('auth.or')}</Text>
				<View style={styles.Divider__line} />
			</View>

			<Button
				onPress={handleGoogleLogin}
				variant='secondary'
				size='lg'
				widthMode='full'
				loading={isSubmitting}
				disabled={isSubmitting}
			>
				{t('auth.Continue with Google')}
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
		backgroundColor: theme.colors.surfaceDeep
	},
	Description: {
		color: theme.colors.mutedText,
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
