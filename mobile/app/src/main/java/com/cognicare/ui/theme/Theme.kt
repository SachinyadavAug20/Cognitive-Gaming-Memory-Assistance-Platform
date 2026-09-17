package com.cognicare.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

private val CogniCareTypography = Typography(
    displayLarge = TextStyle(fontSize = 40.sp, fontWeight = FontWeight.Bold, lineHeight = 48.sp, fontFamily = FontFamily.Serif),
    displayMedium = TextStyle(fontSize = 34.sp, fontWeight = FontWeight.Bold, lineHeight = 42.sp, fontFamily = FontFamily.Serif),
    displaySmall = TextStyle(fontSize = 28.sp, fontWeight = FontWeight.Bold, lineHeight = 36.sp, fontFamily = FontFamily.Serif),
    headlineLarge = TextStyle(fontSize = 28.sp, fontWeight = FontWeight.Bold, lineHeight = 36.sp, fontFamily = FontFamily.Serif),
    headlineMedium = TextStyle(fontSize = 24.sp, fontWeight = FontWeight.SemiBold, lineHeight = 32.sp, fontFamily = FontFamily.Serif),
    headlineSmall = TextStyle(fontSize = 22.sp, fontWeight = FontWeight.SemiBold, lineHeight = 28.sp, fontFamily = FontFamily.Serif),
    titleLarge = TextStyle(fontSize = 22.sp, fontWeight = FontWeight.Bold, lineHeight = 28.sp),
    titleMedium = TextStyle(fontSize = 18.sp, fontWeight = FontWeight.Bold, lineHeight = 24.sp),
    titleSmall = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Medium, lineHeight = 22.sp),
    bodyLarge = TextStyle(fontSize = 18.sp, fontWeight = FontWeight.Normal, lineHeight = 26.sp),
    bodyMedium = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Normal, lineHeight = 24.sp),
    bodySmall = TextStyle(fontSize = 14.sp, fontWeight = FontWeight.Normal, lineHeight = 20.sp),
    labelLarge = TextStyle(fontSize = 18.sp, fontWeight = FontWeight.Bold, lineHeight = 24.sp),
    labelMedium = TextStyle(fontSize = 14.sp, fontWeight = FontWeight.Medium, lineHeight = 20.sp),
    labelSmall = TextStyle(fontSize = 12.sp, fontWeight = FontWeight.Medium, lineHeight = 16.sp),
)

private val LightColorScheme = lightColorScheme(
    primary = Green40,
    onPrimary = Color.White,
    primaryContainer = SoftGreen,
    onPrimaryContainer = DeepGreen,
    secondary = CardOrange,
    onSecondary = Color.White,
    tertiary = Teal40,
    onTertiary = Color.White,
    background = WarmWhite,
    onBackground = Color(0xFF1C1B1F),
    surface = Color.White,
    onSurface = Color(0xFF1C1B1F),
    surfaceVariant = Cream,
    onSurfaceVariant = Color(0xFF444444),
    outline = Color(0xFF777777),
    error = ErrorRed,
    onError = Color.White,
)

@Composable
fun CogniCareTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = CogniCareTypography,
        content = content
    )
}
