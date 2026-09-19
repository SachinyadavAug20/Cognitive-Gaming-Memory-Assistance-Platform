package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import kotlinx.coroutines.delay

private val Ink = Color(0xFF16120E)
private val TextSecondary = Color(0xFF6B7280)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)

data class SacredBell(
    val id: Int,
    val name: String,
    val location: String,
    val color: Color,
    val emoji: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MonasteryBellGame(onBack: () -> Unit) {
    val context = LocalContext.current
    val bells = remember {
        listOf(
            SacredBell(0, "Hari Namghar", "Assam", Color(0xFFF59E0B), "🔔"),
            SacredBell(1, "Kamakhya Brass", "Guwahati", Color(0xFFEF4444), "🛕"),
            SacredBell(2, "Tawang Monastery", "Arunachal", Color(0xFF3B82F6), "🏮"),
            SacredBell(3, "Majuli Satra", "River Island", Color(0xFF10B981), "✨")
        )
    }

    var sequence by remember { mutableStateOf(listOf(0, 2, 1)) }
    var userIndex by remember { mutableIntStateOf(0) }
    var activeGlowingBell by remember { mutableStateOf<Int?>(null) }
    var isShowingSequence by remember { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    var feedbackMessage by remember { mutableStateOf("Watch the glowing sequence") }

    suspend fun playSequence() {
        isShowingSequence = true
        userIndex = 0
        feedbackMessage = "Listen & watch carefully..."
        delay(600)
        for (bellId in sequence) {
            activeGlowingBell = bellId
            ElderlyFeedback.onTap(context)
            delay(700)
            activeGlowingBell = null
            delay(350)
        }
        isShowingSequence = false
        feedbackMessage = "Your turn! Tap the bells in order"
    }

    LaunchedEffect(sequence) {
        playSequence()
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🔔 " + LocalizationManager.t("games.monasteryBell.title"),
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
            // Status Card
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
                        Text(text = feedbackMessage, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Ink)
                        Text(text = "Span Length: ${sequence.size} bells", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Marigold)
                    }
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = TeaGreen,
                        modifier = Modifier
                            .shadow(2.dp, RoundedCornerShape(10.dp))
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                    ) {
                        Text(
                            text = "Score: $score",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            // 4 Big Sacred Bell Buttons
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    listOf(bells[0], bells[1]).forEach { bell ->
                        val isGlowing = activeGlowingBell == bell.id
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (isGlowing) bell.color else Color.White,
                            modifier = Modifier
                                .weight(1f)
                                .height(140.dp)
                                .shadow(if (isGlowing) 8.dp else 3.dp, RoundedCornerShape(20.dp))
                                .border(
                                    width = if (isGlowing) 4.dp else 2.5.dp,
                                    color = if (isGlowing) Color.Black else Ink,
                                    shape = RoundedCornerShape(20.dp)
                                )
                                .clickable(enabled = !isShowingSequence) {
                                    ElderlyFeedback.onTap(context)
                                    if (bell.id == sequence[userIndex]) {
                                        userIndex++
                                        if (userIndex == sequence.size) {
                                            ElderlyFeedback.onSuccess(context)
                                            score += 50
                                            feedbackMessage = "Correct! Adding another bell..."
                                            val nextId = (0..3).random()
                                            sequence = sequence + nextId
                                        }
                                    } else {
                                        ElderlyFeedback.onError(context)
                                        feedbackMessage = "Missed! Watch again"
                                        userIndex = 0
                                    }
                                }
                        ) {
                            Column(
                                modifier = Modifier.fillMaxSize().padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Text(text = bell.emoji, fontSize = 42.sp)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = bell.name,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (isGlowing) Color.White else Ink
                                )
                                Text(
                                    text = bell.location,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isGlowing) Color.White.copy(alpha = 0.8f) else TextSecondary
                                )
                            }
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    listOf(bells[2], bells[3]).forEach { bell ->
                        val isGlowing = activeGlowingBell == bell.id
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (isGlowing) bell.color else Color.White,
                            modifier = Modifier
                                .weight(1f)
                                .height(140.dp)
                                .shadow(if (isGlowing) 8.dp else 3.dp, RoundedCornerShape(20.dp))
                                .border(
                                    width = if (isGlowing) 4.dp else 2.5.dp,
                                    color = if (isGlowing) Color.Black else Ink,
                                    shape = RoundedCornerShape(20.dp)
                                )
                                .clickable(enabled = !isShowingSequence) {
                                    ElderlyFeedback.onTap(context)
                                    if (bell.id == sequence[userIndex]) {
                                        userIndex++
                                        if (userIndex == sequence.size) {
                                            ElderlyFeedback.onSuccess(context)
                                            score += 50
                                            feedbackMessage = "Correct! Adding another bell..."
                                            val nextId = (0..3).random()
                                            sequence = sequence + nextId
                                        }
                                    } else {
                                        ElderlyFeedback.onError(context)
                                        feedbackMessage = "Missed! Watch again"
                                        userIndex = 0
                                    }
                                }
                        ) {
                            Column(
                                modifier = Modifier.fillMaxSize().padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Text(text = bell.emoji, fontSize = 42.sp)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = bell.name,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (isGlowing) Color.White else Ink
                                )
                                Text(
                                    text = bell.location,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isGlowing) Color.White.copy(alpha = 0.8f) else TextSecondary
                                )
                            }
                        }
                    }
                }
            }

            // Bottom Replay / Instructions Button
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(2.dp, RoundedCornerShape(16.dp))
                    .border(2.dp, Ink, RoundedCornerShape(16.dp))
                    .clickable(enabled = !isShowingSequence) {
                        ElderlyFeedback.onTap(context)
                        userIndex = 0
                    }
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Filled.PlayArrow, null, tint = Ink)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Replay Bell Sequence", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Ink)
                }
            }
        }
    }
}
