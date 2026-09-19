package com.cognicare.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
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
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val TeaGreen = Color(0xFF1B5E20)
private val Brick = Color(0xFFB71C1C)
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
        modifier = Modifier.fillMaxWidth(),
        color = Color.White,
        shadowElevation = 6.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .border(width = 3.dp, color = Ink)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Left: Menu/Back + Logo + Title
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (onMenuClick != null) {
                        ElderlyButton(
                            onClick = {
                                ElderlyFeedback.onTap(context)
                                onMenuClick()
                            },
                            icon = Icons.Filled.Menu,
                            contentDescription = "Menu Navigation"
                        )
                    } else if (onBackClick != null) {
                        ElderlyButton(
                            onClick = {
                                ElderlyFeedback.onNavigate(context)
                                onBackClick()
                            },
                            icon = Icons.Filled.ArrowBack,
                            contentDescription = "Go Back"
                        )
                    }

                    // Logo — larger for visibility
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .shadow(3.dp, RoundedCornerShape(14.dp))
                            .clip(RoundedCornerShape(14.dp))
                            .background(TeaGreen)
                            .border(2.dp, Ink, RoundedCornerShape(14.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "\uD83E\uDDE0", fontSize = 24.sp)
                    }

                    // Brand Text — larger, clearer
                    Column {
                        Text(
                            text = "CogniCare",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Serif,
                            color = Ink,
                            lineHeight = 26.sp
                        )
                        Text(
                            text = "North East Memory Care",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkSecondary
                        )
                    }
                }

                // Right: Status + Language + SOS
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Online status
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isOnline) Color(0xFFE8F5E9) else Color(0xFFFFF3E0),
                        modifier = Modifier
                            .shadow(2.dp, RoundedCornerShape(12.dp))
                            .border(2.dp, Ink, RoundedCornerShape(12.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(9.dp)
                                    .clip(CircleShape)
                                    .background(if (isOnline) Color(0xFF1B5E20) else Color(0xFFE65100))
                            )
                            Text(
                                text = if (isOnline) "ONLINE" else "OFFLINE",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                        }
                    }

                    // Language switcher — bigger touch target
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color.White,
                        modifier = Modifier
                            .shadow(2.dp, RoundedCornerShape(12.dp))
                            .border(2.dp, Ink, RoundedCornerShape(12.dp))
                            .clickable {
                                ElderlyFeedback.onTap(context)
                                showLangDialog = true
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(text = "\uD83C\uDF10", fontSize = 14.sp)
                            Text(
                                text = currentLang.uppercase(),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                        }
                    }

                    // SOS — BIG, RED, IMPOSSIBLE TO MISS
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = Brick,
                        modifier = Modifier
                            .shadow(4.dp, RoundedCornerShape(14.dp))
                            .border(3.dp, Color(0xFF7F0000), RoundedCornerShape(14.dp))
                            .clickable {
                                ElderlyFeedback.onTap(context)
                                val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108"))
                                context.startActivity(dialIntent)
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 9.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Phone,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = "SOS",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // Quick Nav — bigger buttons for elderly
            if (showQuickNav) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(WarmSurface)
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = TeaGreen,
                        modifier = Modifier
                            .shadow(3.dp, RoundedCornerShape(14.dp))
                            .border(2.dp, Ink, RoundedCornerShape(14.dp))
                            .clickable {
                                ElderlyFeedback.onTap(context)
                                onRoutineClick?.invoke()
                            }
                    ) {
                        Text(
                            text = "\uD83C\uDFE0 " + LocalizationManager.t("home.routine.label"),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = Color.White,
                        modifier = Modifier
                            .shadow(3.dp, RoundedCornerShape(14.dp))
                            .border(2.dp, Ink, RoundedCornerShape(14.dp))
                            .clickable {
                                ElderlyFeedback.onTap(context)
                                onGamesClick?.invoke()
                            }
                    ) {
                        Text(
                            text = "✨ " + LocalizationManager.t("patient.moreGames.label"),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }
    }

    // Language Dialog — big text, easy to tap
    if (showLangDialog) {
        AlertDialog(
            onDismissRequest = { showLangDialog = false },
            title = {
                Text(
                    text = "\uD83C\uDF10 Choose Your Language",
                    fontWeight = FontWeight.Black,
                    fontSize = 22.sp,
                    color = Ink
                )
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 400.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    LocalizationManager.availableLanguages.forEach { (code, names) ->
                        val isSelected = currentLang == code
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = if (isSelected) TeaGreen else Color.White,
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(2.dp, Ink, RoundedCornerShape(14.dp))
                                .clickable {
                                    ElderlyFeedback.onTap(context)
                                    LocalizationManager.setLanguage(code)
                                    showLangDialog = false
                                }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 18.dp, vertical = 14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "${names.first} (${names.second})",
                                    fontSize = 18.sp,
                                    fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                                    color = if (isSelected) Color.White else Ink
                                )
                                if (isSelected) {
                                    Text(text = "✓", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showLangDialog = false }) {
                    Text("Close", fontWeight = FontWeight.Bold, color = TeaGreen, fontSize = 18.sp)
                }
            },
            containerColor = Color.White,
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.border(3.dp, Ink, RoundedCornerShape(24.dp))
        )
    }
}

/**
 * Elder-friendly button — 52dp minimum touch target, bold icon, border
 */
@Composable
private fun ElderlyButton(
    onClick: () -> Unit,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    contentDescription: String
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val bgColor by animateColorAsState(
        if (isPressed) Color(0xFFE8F5E9) else Color.White,
        label = "btnBg"
    )

    Surface(
        shape = RoundedCornerShape(14.dp),
        color = bgColor,
        modifier = Modifier
            .size(52.dp)
            .shadow(3.dp, RoundedCornerShape(14.dp))
            .border(2.5.dp, Ink, RoundedCornerShape(14.dp))
            .clickable(
                interactionSource = interactionSource,
                indication = null
            ) { onClick() }
    ) {
        Box(contentAlignment = Alignment.Center) {
            Icon(
                imageVector = icon,
                contentDescription = contentDescription,
                tint = Ink,
                modifier = Modifier.size(28.dp)
            )
        }
    }
}
