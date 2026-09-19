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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val Brick = Color(0xFFC5221F)
private val WarmSurface = Color(0xFFF8F5EE)

data class FontSizeOption(val label: String, val size: Float, val displaySize: String)

val fontSizeOptions = listOf(
    FontSizeOption("Small", 14f, "A-"),
    FontSizeOption("Medium", 18f, "A"),
    FontSizeOption("Large", 22f, "A+")
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
    patientName: String = "Biren Borah",
    patientState: String = "Assam",
    onDashboardClick: () -> Unit = {},
    onGamesClick: () -> Unit = {},
    onEchoesClick: () -> Unit = {},
    onCaregiverClick: () -> Unit,
    onAdminClick: () -> Unit = {},
    onSosClick: () -> Unit,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    ModalDrawerSheet(
        drawerContainerColor = Canvas,
        modifier = Modifier
            .width(320.dp)
            .fillMaxHeight()
            .border(width = 3.dp, color = Ink)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Header Profile Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(TeaGreen)
                    .border(width = 3.dp, color = Ink)
                    .padding(20.dp)
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .shadow(3.dp, CircleShape)
                                .clip(CircleShape)
                                .background(Color.White)
                                .border(2.5.dp, Ink, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "👴", fontSize = 28.sp)
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column {
                            Text(
                                text = patientName,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Serif,
                                color = Color.White
                            )
                            Text(
                                text = "Elderly Care • $patientState",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFFFF0DB)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // ABDM / SIH Health Badge
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color.Black.copy(alpha = 0.25f),
                        modifier = Modifier.border(1.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(10.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(text = "🇮🇳", fontSize = 14.sp)
                            Text(
                                text = "Ayushman Bharat ABDM Connected",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                        }
                    }
                }
            }

            Column(modifier = Modifier.padding(16.dp)) {
                // Navigation Quick Links
                DrawerSectionHeader(text = "📌 " + LocalizationManager.t("home.patient.subtitle"))

                DrawerNeoButton(
                    icon = Icons.Filled.Home,
                    title = LocalizationManager.t("home.patient.title"),
                    subtitle = "Main Patient Care Portal",
                    onClick = onDashboardClick
                )

                DrawerNeoButton(
                    icon = Icons.Filled.SportsEsports,
                    title = LocalizationManager.t("patient.moreGames.title"),
                    subtitle = "43 Cognitive CDTx Games",
                    badge = "43 Games",
                    onClick = onGamesClick
                )

                DrawerNeoButton(
                    icon = Icons.Filled.AutoAwesome,
                    title = "Echoes of Home 3D",
                    subtitle = "3D Interactive Time Capsule & River",
                    badge = "3D WebGL",
                    accentColor = Marigold,
                    onClick = onEchoesClick
                )

                DrawerNeoButton(
                    icon = Icons.Filled.HealthAndSafety,
                    title = LocalizationManager.t("home.caregiver.title"),
                    subtitle = "Vitals, Telemetry & Adherence",
                    onClick = onCaregiverClick
                )

                DrawerNeoButton(
                    icon = Icons.Filled.AdminPanelSettings,
                    title = "Mission Control",
                    subtitle = "Admin Dashboard & Analytics",
                    badge = "Admin",
                    accentColor = Color(0xFF1E293B),
                    onClick = onAdminClick
                )

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = Ink.copy(alpha = 0.2f), thickness = 2.dp)

                // Accessibility Settings
                DrawerSectionHeader(text = "⚙️ Accessibility & Clinical Settings")

                // Font Size
                Text(
                    text = "Text Size",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    color = Ink,
                    modifier = Modifier.padding(bottom = 6.dp)
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    fontSizeOptions.forEach { opt ->
                        val isSelected = currentFontSize == opt.size
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSelected) TeaGreen else Color.White,
                            modifier = Modifier
                                .weight(1f)
                                .shadow(2.dp, RoundedCornerShape(10.dp))
                                .border(2.dp, Ink, RoundedCornerShape(10.dp))
                                .clickable { onFontSizeChange(opt.size) }
                        ) {
                            Box(
                                modifier = Modifier.padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = opt.displaySize,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (isSelected) Color.White else Ink
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Listen-First Narration
                DrawerToggleCard(
                    icon = Icons.Filled.VolumeUp,
                    title = "Listen-First Audio",
                    subtitle = "Speaks text aloud automatically",
                    checked = isReadAloudEnabled,
                    onCheckedChange = onReadAloudToggle
                )

                // Night Mode
                DrawerToggleCard(
                    icon = Icons.Filled.DarkMode,
                    title = "High-Contrast Mode",
                    subtitle = "Optimized for visual impairment",
                    checked = isNightModeEnabled,
                    onCheckedChange = onNightModeToggle
                )

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = Ink.copy(alpha = 0.2f), thickness = 2.dp)

                // Language Section
                DrawerSectionHeader(text = "🌐 Regional Languages (11 North East)")

                var langExpanded by remember { mutableStateOf(false) }
                val currentLangName = LocalizationManager.getLanguageNativeName(currentLanguage)

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.White,
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(2.5.dp, RoundedCornerShape(12.dp))
                        .border(2.dp, Ink, RoundedCornerShape(12.dp))
                        .clickable {
                            ElderlyFeedback.onTap(context)
                            langExpanded = !langExpanded
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(text = "🗣️", fontSize = 18.sp)
                            Text(
                                text = "$currentLangName (${currentLanguage.uppercase()})",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                        }
                        Text(text = if (langExpanded) "▲" else "▼", fontSize = 12.sp, fontWeight = FontWeight.Black, color = Ink)
                    }
                }

                if (langExpanded) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White, RoundedCornerShape(12.dp))
                            .border(2.dp, Ink, RoundedCornerShape(12.dp))
                            .padding(6.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        LocalizationManager.availableLanguages.forEach { (code, names) ->
                            val isSelected = currentLanguage == code
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSelected) TeaGreen else Color.Transparent,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        ElderlyFeedback.onTap(context)
                                        onLanguageChange(code)
                                        LocalizationManager.setLanguage(code)
                                        langExpanded = false
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "${names.first} • ${names.second}",
                                        fontSize = 13.sp,
                                        fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                                        color = if (isSelected) Color.White else Ink
                                    )
                                    if (isSelected) {
                                        Text(text = "✓", fontWeight = FontWeight.Black, color = Color.White)
                                    }
                                }
                            }
                        }
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 14.dp), color = Ink.copy(alpha = 0.2f), thickness = 2.dp)

                // SOS Button
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Brick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(3.dp, RoundedCornerShape(14.dp))
                        .border(2.5.dp, Ink, RoundedCornerShape(14.dp))
                        .clickable { onSosClick() }
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
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = LocalizationManager.t("nav.sos") + " (108)",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Logout Button
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFFFEE2E2),
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(2.dp, RoundedCornerShape(14.dp))
                        .border(2.dp, Ink, RoundedCornerShape(14.dp))
                        .clickable { onLogout() }
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Filled.Logout, null, tint = Brick, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Switch User / Logout",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Brick
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "Ministry of DoNER • SIH 2026\nCognitive Gaming Memory Platform",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = InkSecondary,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    lineHeight = 14.sp
                )
            }
        }
    }
}

@Composable
private fun DrawerSectionHeader(text: String) {
    Text(
        text = text,
        fontSize = 12.sp,
        fontWeight = FontWeight.Black,
        color = InkSecondary,
        modifier = Modifier.padding(bottom = 8.dp, top = 4.dp)
    )
}

@Composable
private fun DrawerNeoButton(
    icon: ImageVector,
    title: String,
    subtitle: String,
    badge: String? = null,
    accentColor: Color = TeaGreen,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp)
            .shadow(2.dp, RoundedCornerShape(12.dp))
            .border(2.dp, Ink, RoundedCornerShape(12.dp))
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(accentColor.copy(alpha = 0.12f))
                    .border(1.5.dp, Ink, RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = accentColor, modifier = Modifier.size(22.dp))
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink)
                    if (badge != null) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Color(0xFFFEF3C7),
                            modifier = Modifier.border(1.dp, Ink, RoundedCornerShape(6.dp))
                        ) {
                            Text(
                                text = badge,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
                Text(text = subtitle, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = InkSecondary)
            }
        }
    }
}

@Composable
private fun DrawerToggleCard(
    icon: ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp)
            .shadow(2.dp, RoundedCornerShape(12.dp))
            .border(2.dp, Ink, RoundedCornerShape(12.dp))
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = TeaGreen, modifier = Modifier.size(22.dp))
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink)
                Text(text = subtitle, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = InkSecondary)
            }
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                colors = SwitchDefaults.colors(
                    checkedTrackColor = TeaGreen,
                    checkedThumbColor = Color.White
                )
            )
        }
    }
}
