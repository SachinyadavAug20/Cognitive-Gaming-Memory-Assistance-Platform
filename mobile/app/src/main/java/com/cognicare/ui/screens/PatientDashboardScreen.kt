package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.data.local.Patient
import com.cognicare.ui.components.FloatingCallCaregiverButton
import com.cognicare.ui.components.FloatingTalkSaathiButton
import com.cognicare.ui.components.NeoBrutalistCard
import com.cognicare.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDashboardScreen(
    patient: Patient,
    onGamesClick: () -> Unit,
    onCaregiverClick: () -> Unit,
    onLogout: () -> Unit
) {
    val today = remember {
        val sdf = SimpleDateFormat("EEEE, MMM d", Locale.US)
        sdf.format(Date())
    }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(WarmWhite),
            contentPadding = PaddingValues(bottom = 100.dp)
        ) {
            // Green header with greeting (matching website)
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(DeepGreen, Green40)
                            )
                        )
                        .statusBarsPadding()
                        .padding(horizontal = 24.dp, vertical = 20.dp)
                ) {
                    Column {
                        // Top bar: CogniCare logo + SOS
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(Color.White.copy(alpha = 0.2f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(text = "\uD83E\uDDE0", fontSize = 18.sp)
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "CogniCare",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = RoundedCornerShape(16.dp),
                                    color = Color.White.copy(alpha = 0.15f)
                                ) {
                                    Text(
                                        text = "\uD83D\uDCC5 $today",
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                        fontSize = 12.sp,
                                        color = Color.White
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Surface(
                                    shape = RoundedCornerShape(16.dp),
                                    color = SOSRed
                                ) {
                                    Text(
                                        text = "\uD83D\uDE91 SOS HELP",
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Patient greeting
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            // Avatar
                            Box(
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFE07A3A))
                                    .border(3.dp, Color.White, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = patient.name.first().toString(),
                                    fontSize = 32.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(
                                    text = "Good Day,",
                                    fontSize = 16.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                                Text(
                                    text = "${patient.name}!",
                                    fontSize = 26.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "You are safe at home with your family today.",
                                    fontSize = 14.sp,
                                    color = Color.White.copy(alpha = 0.7f)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Read for Me + Sound On buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            OutlinedButton(
                                onClick = { },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    contentColor = Color.White
                                ),
                                border = ButtonDefaults.outlinedButtonBorder.copy(
                                    brush = Brush.horizontalGradient(listOf(Color.White.copy(alpha = 0.5f), Color.White.copy(alpha = 0.5f)))
                                )
                            ) {
                                Text(text = "\uD83D\uDD0A", fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = "Read for Me", fontSize = 14.sp)
                            }
                            OutlinedButton(
                                onClick = { },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    contentColor = Color.White
                                ),
                                border = ButtonDefaults.outlinedButtonBorder.copy(
                                    brush = Brush.horizontalGradient(listOf(Color.White.copy(alpha = 0.5f), Color.White.copy(alpha = 0.5f)))
                                )
                            ) {
                                Text(text = "\uD83D\uDD0A", fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = "Sound On", fontSize = 14.sp)
                            }
                        }
                    }
                }
            }

            // Family Photos & Peaceful Sounds card
            item {
                Spacer(modifier = Modifier.height(20.dp))
                NeoBrutalistCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    backgroundColor = DeepGreen
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color.White.copy(alpha = 0.15f),
                            modifier = Modifier.size(56.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(text = "\uD83D\uDCBC", fontSize = 28.sp)
                            }
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Family Photos &\nPeaceful Sounds",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                lineHeight = 26.sp
                            )
                            Text(
                                text = "Look at family pictures and listen to gentle music",
                                fontSize = 13.sp,
                                color = Color.White.copy(alpha = 0.7f)
                            )
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Surface(
                                shape = CircleShape,
                                color = CardOrange,
                                modifier = Modifier.size(40.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(text = "\uD83D\uDD0A", fontSize = 18.sp)
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "\u25B6 Play",
                                fontSize = 12.sp,
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // Daily Activities section
            item {
                Spacer(modifier = Modifier.height(24.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "\u2728 Daily Activities",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "View All",
                        fontSize = 14.sp,
                        color = Green40,
                        fontWeight = FontWeight.Medium
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            // Game cards (2-column, matching website style)
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ActivityGameCard(
                        emoji = "\uD83E\uDDE9",
                        title = "Picture Puzzle",
                        color = CardGreen,
                        onClick = { },
                        modifier = Modifier.weight(1f)
                    )
                    ActivityGameCard(
                        emoji = "\uD83C\uDFEA",
                        title = "Going to the Market",
                        color = CardOrange,
                        onClick = { },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            item { Spacer(modifier = Modifier.height(12.dp)) }

            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ActivityGameCard(
                        emoji = "\uD83C\uDF3F",
                        title = "Picking Tea Leaves",
                        color = CardGreen,
                        onClick = { },
                        modifier = Modifier.weight(1f)
                    )
                    ActivityGameCard(
                        emoji = "\uD83D\uDCDA",
                        title = "School Days",
                        color = CardOrange,
                        onClick = { },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Reminiscence & Comfort section
            item {
                Spacer(modifier = Modifier.height(28.dp))
                Text(
                    text = "\uD83E\uDDE1 Reminiscence & Comfort",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
            }

            // Memory of the Day card
            item {
                NeoBrutalistCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "\uD83E\uDDE1 Memory of the Day",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = CardOrange.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "Family Keepsake",
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = CardOrange
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(SoftGreen),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "\uD83D\uDC68", fontSize = 40.sp)
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = CardOrange.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = "\uD83D\uDC65 Son",
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                    fontSize = 11.sp,
                                    color = CardOrange,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Manash Borah",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Eldest son, mechanical engineer\nin Guwahati. Visits every\nSunday morning.",
                                fontSize = 13.sp,
                                color = Color.Gray,
                                lineHeight = 18.sp
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = { },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(text = "\uD83D\uDD0A Read memory for me", fontSize = 13.sp)
                        }
                        OutlinedButton(
                            onClick = { },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(text = "\u2728 Show another memory", fontSize = 13.sp)
                        }
                    }
                }
            }

            // Bottom padding for floating buttons
            item { Spacer(modifier = Modifier.height(32.dp)) }
        }

        // Floating buttons (matching website bottom corners)
        Box(modifier = Modifier.fillMaxSize()) {
            FloatingCallCaregiverButton(
                onClick = onCaregiverClick,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(start = 16.dp, bottom = 24.dp)
            )
            FloatingTalkSaathiButton(
                onClick = { },
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 16.dp, bottom = 24.dp)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ActivityGameCard(
    emoji: String,
    title: String,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier.height(180.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.weight(1f)
                )
                Surface(
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.2f),
                    modifier = Modifier.size(32.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(text = "\uD83D\uDD0A", fontSize = 14.sp)
                    }
                }
            }

            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                Text(text = emoji, fontSize = 40.sp)
            }
        }
    }
}
