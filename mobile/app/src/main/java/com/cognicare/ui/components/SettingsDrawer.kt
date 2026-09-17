package com.cognicare.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*

data class FontSizeOption(val label: String, val size: Float, val displaySize: String)

val fontSizeOptions = listOf(
    FontSizeOption("Small (A)", 14f, "A-"),
    FontSizeOption("Medium (A)", 18f, "A"),
    FontSizeOption("Large (A+)", 22f, "A+")
)

val availableLanguages = listOf(
    "en" to "English",
    "hi" to "Hindi",
    "as" to "Assamese",
    "bn" to "Bengali",
    "mni" to "Manipuri",
    "lus" to "Mizo",
    "kha" to "Khasi",
    "grt" to "Garo",
    "brx" to "Bodo",
    "ne" to "Nepali",
    "mr" to "Marathi"
)

@Composable
fun CogniCareDrawerContent(
    currentFontSize: Float,
    onFontSizeChange: (Float) -> Unit,
    currentLanguage: String,
    onLanguageChange: (String) -> Unit,
    isReadAloudEnabled: Boolean,
    onReadAloudToggle: (Boolean) -> Unit,
    isNightModeEnabled: Boolean,
    onNightModeToggle: (Boolean) -> Unit,
    onCaregiverClick: () -> Unit,
    onSosClick: () -> Unit,
    onLogout: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxHeight()
            .width(300.dp)
            .background(WarmWhite)
            .statusBarsPadding()
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(colors = listOf(DeepGreen, Green40))
                )
                .padding(24.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "\uD83E\uDDE0", fontSize = 24.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "CogniCare",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "North East Memory Care",
                            fontSize = 12.sp,
                            color = Color.White.copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }

        // Scrollable content
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Accessibility Section
            DrawerSectionHeader(text = "\u2699\uFE0F Accessibility Settings")

            // Font Size
            DrawerSubHeader(text = "Font Size")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                fontSizeOptions.forEach { option ->
                    FilterChip(
                        selected = currentFontSize == option.size,
                        onClick = { onFontSizeChange(option.size) },
                        label = {
                            Text(
                                text = option.displaySize,
                                fontWeight = if (currentFontSize == option.size) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        modifier = Modifier.weight(1f),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Green40,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Read-Aloud Toggle
            DrawerToggleItem(
                icon = Icons.Filled.VolumeUp,
                title = "Listen-First Narration",
                subtitle = "Read content aloud on tap",
                checked = isReadAloudEnabled,
                onCheckedChange = onReadAloudToggle
            )

            // Night Mode Toggle
            DrawerToggleItem(
                icon = Icons.Filled.DarkMode,
                title = "Night Mode",
                subtitle = "High-contrast dark theme",
                checked = isNightModeEnabled,
                onCheckedChange = onNightModeToggle
            )

            HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

            // Language Section
            DrawerSectionHeader(text = "\uD83C\uDF10 Language")

            var languageExpanded by remember { mutableStateOf(false) }
            val currentLangName = availableLanguages.find { it.first == currentLanguage }?.second ?: "English"

            Surface(
                onClick = { languageExpanded = !languageExpanded },
                shape = RoundedCornerShape(12.dp),
                color = Color.White,
                border = ButtonDefaults.outlinedButtonBorder
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Filled.Language,
                            contentDescription = null,
                            tint = Green40,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(text = currentLangName, fontWeight = FontWeight.Medium)
                    }
                    Icon(
                        if (languageExpanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                        contentDescription = null,
                        tint = Color.Gray
                    )
                }
            }

            if (languageExpanded) {
                Spacer(modifier = Modifier.height(4.dp))
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.White,
                    border = ButtonDefaults.outlinedButtonBorder
                ) {
                    Column(modifier = Modifier.padding(8.dp)) {
                        availableLanguages.forEach { (code, name) ->
                            Surface(
                                onClick = {
                                    onLanguageChange(code)
                                    languageExpanded = false
                                },
                                color = if (currentLanguage == code) Green40.copy(alpha = 0.1f) else Color.Transparent,
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    if (currentLanguage == code) {
                                        Icon(
                                            Icons.Filled.Check,
                                            contentDescription = null,
                                            tint = Green40,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    } else {
                                        Spacer(modifier = Modifier.width(16.dp))
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = name,
                                        fontSize = 14.sp,
                                        color = if (currentLanguage == code) Green40 else Color.Black
                                    )
                                }
                            }
                        }
                    }
                }
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

            // Navigation Section
            DrawerSectionHeader(text = "\uD83D\uDD17 Quick Links")

            DrawerNavItem(
                icon = Icons.Filled.Shield,
                title = "Caregiver Portal",
                onClick = {
                    onCaregiverClick()
                }
            )

            DrawerNavItem(
                icon = Icons.Filled.SportsEsports,
                title = "All Games",
                onClick = { }
            )

            DrawerNavItem(
                icon = Icons.Filled.Favorite,
                title = "Echoes of Home",
                subtitle = "Family photos & peaceful sounds",
                onClick = { }
            )

            HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

            // SOS Button
            Surface(
                onClick = onSosClick,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = SOSRed
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        Icons.Filled.Phone,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Emergency SOS (108)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Logout
            Surface(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFFEE2E2)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        Icons.Filled.Logout,
                        contentDescription = null,
                        tint = ErrorRed,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Logout",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = ErrorRed
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Footer
            Text(
                text = "Ministry of DoNER \u2022 SIH 2026",
                fontSize = 11.sp,
                color = Color.Gray,
                modifier = Modifier.fillMaxWidth(),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
private fun DrawerSectionHeader(text: String) {
    Text(
        text = text,
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = Color.Gray,
        modifier = Modifier.padding(bottom = 8.dp, top = 4.dp)
    )
}

@Composable
private fun DrawerSubHeader(text: String) {
    Text(
        text = text,
        fontSize = 14.sp,
        fontWeight = FontWeight.SemiBold,
        color = Color.Black,
        modifier = Modifier.padding(bottom = 6.dp)
    )
}

@Composable
private fun DrawerToggleItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        border = ButtonDefaults.outlinedButtonBorder
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = Green40,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                Text(text = subtitle, fontSize = 11.sp, color = Color.Gray)
            }
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                colors = SwitchDefaults.colors(
                    checkedTrackColor = Green40,
                    checkedThumbColor = Color.White
                )
            )
        }
    }
    Spacer(modifier = Modifier.height(8.dp))
}

@Composable
private fun DrawerNavItem(
    icon: ImageVector,
    title: String,
    subtitle: String? = null,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = Color.Transparent
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = Green40,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                if (subtitle != null) {
                    Text(text = subtitle, fontSize = 11.sp, color = Color.Gray)
                }
            }
        }
    }
}

private val Brush = androidx.compose.ui.graphics.Brush
