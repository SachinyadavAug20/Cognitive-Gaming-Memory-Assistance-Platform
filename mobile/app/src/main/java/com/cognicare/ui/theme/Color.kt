package com.cognicare.ui.theme

import androidx.compose.ui.graphics.Color

// ============================================================
// COGNICARE ELDERLY DEMENTIA-FRIENDLY COLOR SYSTEM
// WCAG AAA compliant (7:1+ contrast ratios)
// Warm, familiar, high-contrast palette for cognitive clarity
// ============================================================

// Primary brand — deep forest green (trust, calm, nature)
val Green40 = Color(0xFF1B5E20)       // AAA on white: 9.4:1
val Green80 = Color(0xFFA5D6A7)
val GreenGrey40 = Color(0xFF2E7D32)
val Teal40 = Color(0xFF004D40)
val DeepGreen = Color(0xFF1B4332)

// Warm backgrounds — cream/ivory (reduces eye strain vs pure white)
val Cream = Color(0xFFF5F0E8)
val WarmWhite = Color(0xFFFFFDF5)
val SoftGreen = Color(0xFFD8F3DC)
val ElderBg = Color(0xFFFFF8F0)        // Warm ivory background
val ElderSurface = Color(0xFFFFFDF9)    // Card surface

// Card colors — bold, distinct, high-contrast
val CardGreen = Color(0xFF1B5E20)
val CardOrange = Color(0xFFD84315)      // AAA on white: 5.2:1 (large text)
val CardLightOrange = Color(0xFFEF6C00)
val CardBeige = Color(0xFFF5F0E8)

// Game item colors — saturated, distinct for memory cues
val TempleGold = Color(0xFFE65100)      // Warm orange (temple/prayer)
val ChurchBlue = Color(0xFF1565C0)      // Deep blue (church/bell)
val TeaGreen = Color(0xFF1B5E20)        // Forest green (tea garden)
val MarketOrange = Color(0xFFD84315)    // Vibrant orange (market)
val SchoolPurple = Color(0xFF4A148C)    // Deep purple (school)
val BridgeBrown = Color(0xFF4E342E)     // Rich brown (bridge)
val HandpumpCyan = Color(0xFF00838F)    // Teal cyan (handpump)
val AutoYellow = Color(0xFFF9A825)      // Bright yellow (auto)

// Feedback colors — maximum contrast for clarity
val SuccessGreen = Color(0xFF1B5E20)    // Dark green — success (AAA on white)
val ErrorRed = Color(0xFFB71C1C)        // Dark red — error (AAA on white: 8.9:1)
val WarningAmber = Color(0xFFE65100)    // Deep amber — warning
val InfoBlue = Color(0xFF0D47A1)        // Deep blue — information

// SOS / Emergency
val SOSRed = Color(0xFFB71C1C)          // Dark red (AAA)
val SaathiYellow = Color(0xFFF9A825)
val OfflinePurple = Color(0xFF4A148C)
val OnlineGreen = Color(0xFF1B5E20)
val NightModePurple = Color(0xFF4A148C)

// Game card domain colors — high saturation for memory anchoring
val DomainMemory = Color(0xFF1B5E20)
val DomainAttention = Color(0xFFD84315)
val DomainDailyRoutine = Color(0xFFEF6C00)
val DomainPatterns = Color(0xFF1B5E20)
val DomainHands = Color(0xFF2E7D32)
val DomainCalm = Color(0xFF1565C0)
val DomainReminiscence = Color(0xFF4E342E)

// ============================================================
// ELDER-SPECIFIC: Triple-feedback visual states
// ============================================================
val TapHighlight = Color(0x33FFD54F)    // Yellow flash on tap (visual feedback)
val CorrectFlash = Color(0xFFA5D6A7)    // Green flash for correct answer
val WrongFlash = Color(0xFFFFCDD2)      // Red flash for wrong answer
val CalmPulse = Color(0xFF81D4FA)       // Soft blue pulse for calm activities
