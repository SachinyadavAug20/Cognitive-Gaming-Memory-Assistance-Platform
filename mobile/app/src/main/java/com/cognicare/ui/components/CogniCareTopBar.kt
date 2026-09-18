package com.cognicare.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val TeaGreen = Color(0xFF1B663E)
private val Brick = Color(0xFFC5221F)
private val WarmSurface = Color(0xFFFAF7F2)

@Composable
fun CogniCareTopBar(
    onMenuClick: (() -> Unit)? = null,
    onBackClick: (() -> Unit)? = null,
    showQuickNav: Boolean = false,
    onRoutineClick: (() -> Unit)? = null,
    onGamesClick: (() -> Unit)? = null,
    isOnline: Boolean = true
) {
    val context = LocalContext.current
    val currentLang by LocalizationManager.currentLanguage.collectAsState()
    var showLangDialog by remember { mutableStateOf(false) }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .border(width = 2.5.dp, color = Ink),
        color = Color.White,
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Left: Menu/Back Button + Brand Logo & Title
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (onMenuClick != null) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color.White,
                            modifier = Modifier
                                .size(42.dp)
                                .shadow(2.5.dp, RoundedCornerShape(12.dp))
                                .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                .clickable { onMenuClick() }
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Filled.Menu,
                                    contentDescription = "Menu Navigation",
                                    tint = Ink,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }
                    } else if (onBackClick != null) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color.White,
                            modifier = Modifier
                                .size(42.dp)
                                .shadow(2.5.dp, RoundedCornerShape(12.dp))
                                .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                .clickable { onBackClick() }
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Filled.ArrowBack,
                                    contentDescription = "Back",
                                    tint = Ink,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }
                    }

                    // Logo Icon Box
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .shadow(2.dp, RoundedCornerShape(12.dp))
                            .clip(RoundedCornerShape(12.dp))
                            .background(TeaGreen)
                            .border(2.dp, Ink, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "\uD83E\uDDE0", fontSize = 20.sp)
                    }

                    // Brand Text
                    Column {
                        Text(
                            text = "CogniCare",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Serif,
                            color = Ink,
                            lineHeight = 22.sp
                        )
                        Text(
                            text = "North East Memory Care",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkSecondary
                        )
                    }
                }

                // Right: Online Badge + Language Switcher + Emergency SOS Button
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Connectivity status badge
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isOnline) Color(0xFFDCFCE7) else Color(0xFFFEF3C7),
                        modifier = Modifier
                            .shadow(1.5.dp, RoundedCornerShape(10.dp))
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 7.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(if (isOnline) Color(0xFF16A34A) else Color(0xFFD97706))
                            )
                            Text(
                                text = if (isOnline) "LIVE" else "OFFLINE",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                        }
                    }

                    // Language Switch Pill
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color.White,
                        modifier = Modifier
                            .shadow(1.5.dp, RoundedCornerShape(10.dp))
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                            .clickable { showLangDialog = true }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(3.dp)
                        ) {
                            Text(text = "\uD83C\uDF10", fontSize = 11.sp)
                            Text(
                                text = currentLang.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                        }
                    }

                    // Emergency SOS Button
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Brick,
                        modifier = Modifier
                            .shadow(2.5.dp, RoundedCornerShape(12.dp))
                            .border(2.dp, Ink, RoundedCornerShape(12.dp))
                            .clickable {
                                val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108"))
                                context.startActivity(dialIntent)
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Phone,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(15.dp)
                            )
                            Text(
                                text = "SOS",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // Quick Nav Row (My Routine / Daily Activities) if enabled
            if (showQuickNav) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(WarmSurface)
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = TeaGreen,
                        modifier = Modifier
                            .shadow(2.dp, RoundedCornerShape(10.dp))
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                            .clickable { onRoutineClick?.invoke() }
                    ) {
                        Text(
                            text = "\uD83C\uDFE0 " + LocalizationManager.t("home.routine.label"),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp)
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color.White,
                        modifier = Modifier
                            .shadow(2.dp, RoundedCornerShape(10.dp))
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                            .clickable { onGamesClick?.invoke() }
                    ) {
                        Text(
                            text = "✨ " + LocalizationManager.t("patient.moreGames.label"),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp)
                        )
                    }
                }
            }
        }
    }

    // Quick Language Switch Dialog
    if (showLangDialog) {
        AlertDialog(
            onDismissRequest = { showLangDialog = false },
            title = {
                Text(
                    text = "Choose Your Language",
                    fontWeight = FontWeight.Black,
                    fontSize = 18.sp,
                    color = Ink
                )
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 380.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    LocalizationManager.availableLanguages.forEach { (code, names) ->
                        val isSelected = currentLang == code
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSelected) TeaGreen else Color.White,
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                                .clickable {
                                    LocalizationManager.setLanguage(code)
                                    showLangDialog = false
                                }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 14.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "${names.first} (${names.second})",
                                    fontSize = 14.sp,
                                    fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                                    color = if (isSelected) Color.White else Ink
                                )
                                if (isSelected) {
                                    Text(text = "✓", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showLangDialog = false }) {
                    Text("Close", fontWeight = FontWeight.Bold, color = TeaGreen)
                }
            },
            containerColor = Color.White,
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.border(3.dp, Ink, RoundedCornerShape(20.dp))
        )
    }
}
