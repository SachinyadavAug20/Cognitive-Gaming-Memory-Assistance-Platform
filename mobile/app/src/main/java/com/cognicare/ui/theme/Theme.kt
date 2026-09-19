package com.cognicare.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// ============================================================
// ELDERLY DEMENTIA-FRIENDLY TYPOGRAPHY
// Based on Alzheimer's Society UK + W3C COGA guidelines:
// - Body: minimum 20sp (we use 22sp)
// - Titles: 28sp+ for cognitive clarity
// - High line height for readability
// - Serif fonts for headlines (familiar, traditional feel)
// ============================================================
private val ElderlyTypography = Typography(
    // Large display — for splash, hero banners
    displayLarge = TextStyle(
        fontSize = 44.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 52.sp,
        fontFamily = FontFamily.Serif
    ),
    displayMedium = TextStyle(
        fontSize = 38.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 46.sp,
        fontFamily = FontFamily.Serif
    ),
    displaySmall = TextStyle(
        fontSize = 32.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 40.sp,
        fontFamily = FontFamily.Serif
    ),
    // Headlines — section headers (e.g., "Today's Routine")
    headlineLarge = TextStyle(
        fontSize = 30.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 38.sp,
        fontFamily = FontFamily.Serif
    ),
    headlineMedium = TextStyle(
        fontSize = 26.sp,
        fontWeight = FontWeight.SemiBold,
        lineHeight = 34.sp,
        fontFamily = FontFamily.Serif
    ),
    headlineSmall = TextStyle(
        fontSize = 24.sp,
        fontWeight = FontWeight.SemiBold,
        lineHeight = 30.sp,
        fontFamily = FontFamily.Serif
    ),
    // Titles — card titles, game names
    titleLarge = TextStyle(
        fontSize = 24.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 30.sp
    ),
    titleMedium = TextStyle(
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 26.sp
    ),
    titleSmall = TextStyle(
        fontSize = 18.sp,
        fontWeight = FontWeight.Medium,
        lineHeight = 24.sp
    ),
    // Body — main readable text (22sp for elderly readability)
    bodyLarge = TextStyle(
        fontSize = 22.sp,
        fontWeight = FontWeight.Normal,
        lineHeight = 30.sp
    ),
    bodyMedium = TextStyle(
        fontSize = 20.sp,
        fontWeight = FontWeight.Normal,
        lineHeight = 28.sp
    ),
    bodySmall = TextStyle(
        fontSize = 18.sp,
        fontWeight = FontWeight.Normal,
        lineHeight = 24.sp
    ),
    // Labels — buttons, tags, chips (larger for touch targets)
    labelLarge = TextStyle(
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 26.sp
    ),
    labelMedium = TextStyle(
        fontSize = 18.sp,
        fontWeight = FontWeight.Medium,
        lineHeight = 24.sp
    ),
    labelSmall = TextStyle(
        fontSize = 16.sp,
        fontWeight = FontWeight.Medium,
        lineHeight = 22.sp
    ),
)

// Light theme — warm ivory background, high contrast text
private val ElderLightScheme = lightColorScheme(
    primary = Green40,
    onPrimary = Color.White,
    primaryContainer = SoftGreen,
    onPrimaryContainer = DeepGreen,
    secondary = CardOrange,
    onSecondary = Color.White,
    tertiary = Teal40,
    onTertiary = Color.White,
    background = ElderBg,
    onBackground = Color(0xFF1C1B1F),
    surface = ElderSurface,
    onSurface = Color(0xFF1C1B1F),
    surfaceVariant = Cream,
    onSurfaceVariant = Color(0xFF333333),
    outline = Color(0xFF555555),
    error = ErrorRed,
    onError = Color.White,
)

// Dark theme — warm dark (not pure black) for reduced eye strain
private val ElderDarkScheme = darkColorScheme(
    primary = Green80,
    onPrimary = DeepGreen,
    primaryContainer = Green40,
    onPrimaryContainer = SoftGreen,
    secondary = Color(0xFFFFCC80),
    onSecondary = Color(0xFF1C1B1F),
    tertiary = Color(0xFF80CBC4),
    onTertiary = Color(0xFF1C1B1F),
    background = Color(0xFF1A1612),
    onBackground = Color(0xFFE8E0D8),
    surface = Color(0xFF211E19),
    onSurface = Color(0xFFE8E0D8),
    surfaceVariant = Color(0xFF2E2A24),
    onSurfaceVariant = Color(0xFFBDB5A8),
    outline = Color(0xFF8A8279),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
)

@Composable
fun CogniCareTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) ElderDarkScheme else ElderLightScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = ElderlyTypography,
        content = content
    )
}
