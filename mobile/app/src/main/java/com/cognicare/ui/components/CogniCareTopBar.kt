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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
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
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .border(width = 2.5.dp, color = Ink)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Left: Navigation Icon + Logo + Brand Title
                Row(
                    modifier = Modifier.weight(1f, fill = false),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
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

                    // Logo
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .shadow(2.dp, RoundedCornerShape(10.dp))
                            .clip(RoundedCornerShape(10.dp))
                            .background(TeaGreen)
                            .border(2.dp, Ink, RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "\uD83E\uDDE0", fontSize = 18.sp)
                    }

                    // Brand Title Column
                    Column {
                        Text(
                            text = "CogniCare",
                            fontSize = 19.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.SansSerif,
                            color = Ink,
                            lineHeight = 21.sp,
                            maxLines = 1
                        )
                        Text(
                            text = "Memory Care",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.SansSerif,
                            color = InkSecondary,
                            maxLines = 1
                        )
                    }
                }

                Spacer(modifier = Modifier.width(6.dp))

                // Right: Status + Language + SOS Quick Phone Call
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Online status indicator
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isOnline) Color(0xFFE8F5E9) else Color(0xFFFFF3E0),
                        modifier = Modifier
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(if (isOnline) Color(0xFF1B5E20) else Color(0xFFE65100))
                            )
                            Text(
                                text = if (isOnline) "ONLINE" else "OFFLINE",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.SansSerif,
                                color = Ink
                            )
                        }
                    }

                    // Language switcher
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color.White,
                        modifier = Modifier
                            .height(36.dp)
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                            .semantics { contentDescription = "Change language, current: $currentLang" }
                            .clickable {
                                ElderlyFeedback.onTap(context)
                                showLangDialog = true
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(text = "\uD83C\uDF10", fontSize = 13.sp)
                            Text(
                                text = currentLang.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.SansSerif,
                                color = Ink
                            )
                        }
                    }

                    // Emergency Phone Call Icon
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Brick,
                        modifier = Modifier
                            .size(36.dp)
                            .border(2.dp, Color(0xFF7F0000), RoundedCornerShape(10.dp))
                            .semantics { contentDescription = "Emergency SOS, call 108" }
                            .clickable {
                                ElderlyFeedback.onTap(context)
                                val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108"))
                                context.startActivity(dialIntent)
                            }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Filled.Phone,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }
    }

    // Language Dialog
    if (showLangDialog) {
        AlertDialog(
            onDismissRequest = { showLangDialog = false },
            title = {
                Text(
                    text = "\uD83C\uDF10 Choose Your Language",
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.SansSerif,
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
                                    fontFamily = FontFamily.SansSerif,
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
 * Elder-friendly button — 44dp touch target, bold icon, border
 */
@Composable
private fun ElderlyButton(
    onClick: () -> Unit,
    icon: ImageVector,
    contentDescription: String
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val bgColor by animateColorAsState(
        if (isPressed) Color(0xFFE8F5E9) else Color.White,
        label = "btnBg"
    )

    Surface(
        shape = RoundedCornerShape(10.dp),
        color = bgColor,
        modifier = Modifier
            .size(44.dp)
            .border(2.dp, Ink, RoundedCornerShape(10.dp))
            .semantics { this.contentDescription = contentDescription }
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
                modifier = Modifier.size(24.dp)
            )
        }
    }
}
