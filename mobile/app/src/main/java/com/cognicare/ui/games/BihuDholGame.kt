package com.cognicare.ui.games

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private const val POINTS_PER_TAP = 25

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BihuDholGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var combo by remember { mutableIntStateOf(0) }
    var lastFeedback by remember { mutableStateOf("Tap the Dhol in rhythm with the beat!") }

    // Rhythmic pulse indicator
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(650, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🪘 " + LocalizationManager.t("games.bihuDhol.title"),
                        fontWeight = FontWeight.Black,
                        color = Ink
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = Ink)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Canvas)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Stats Banner
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(3.dp, RoundedCornerShape(16.dp))
                    .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = lastFeedback, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Ink)
                        Text(text = "Rhythm Combo: ${combo}x", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Marigold)
                    }
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = TeaGreen,
                        modifier = Modifier
                            .shadow(2.dp, RoundedCornerShape(12.dp))
                            .border(1.5.dp, Ink, RoundedCornerShape(12.dp))
                    ) {
                        Text(
                            text = "Score: $score",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }
            }

            // Central Drum & Pulse Ring
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(240.dp)
            ) {
                // Pulsing outer halo
                Box(
                    modifier = Modifier
                        .size(230.dp)
                        .scale(pulseScale)
                        .clip(CircleShape)
                        .background(Color(0xFFFEF3C7).copy(alpha = 0.6f))
                )

                // Dhol Visual Illustration
                Surface(
                    shape = RoundedCornerShape(32.dp),
                    color = Color(0xFF78350F),
                    modifier = Modifier
                        .size(200.dp, 150.dp)
                        .shadow(6.dp, RoundedCornerShape(32.dp))
                        .border(3.5.dp, Ink, RoundedCornerShape(32.dp))
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(text = "🪘", fontSize = 56.sp)
                        Text(
                            text = "Assamese Dhol",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                    }
                }
            }

            // Left (Bass / Dha) and Right (Treble / Ti) Big Touch Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Left Head
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFFB45309),
                    modifier = Modifier
                        .weight(1f)
                        .height(130.dp)
                        .shadow(4.dp, RoundedCornerShape(20.dp))
                        .border(3.dp, Ink, RoundedCornerShape(20.dp))
                        .clickable {
                            ElderlyFeedback.onTap(context)
                            score += POINTS_PER_TAP
                            combo++
                            lastFeedback = "Dha! Great rhythm!"
                        }
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(text = "🥁", fontSize = 34.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "DHA (Bass)", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text(text = "Left Hand", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFEF3C7))
                    }
                }

                // Right Head
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Marigold,
                    modifier = Modifier
                        .weight(1f)
                        .height(130.dp)
                        .shadow(4.dp, RoundedCornerShape(20.dp))
                        .border(3.dp, Ink, RoundedCornerShape(20.dp))
                        .clickable {
                            ElderlyFeedback.onTap(context)
                            score += POINTS_PER_TAP
                            combo++
                            lastFeedback = "Ti-Khiti! Perfect beat!"
                        }
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(text = "🥢", fontSize = 34.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "TI (Treble)", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text(text = "Right Stick", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFEF3C7))
                    }
                }
            }
        }
    }
}
