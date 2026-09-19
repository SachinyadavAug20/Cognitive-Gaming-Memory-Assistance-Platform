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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*
import com.cognicare.util.ElderlyFeedback
import kotlinx.coroutines.delay

private val Ink = Color(0xFF16120E)
private val TextSecondary = Color(0xFF6B7280)

private data class Drum(val emoji: String, val color: Color, val label: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TunedDrumGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var sequence by remember { mutableStateOf(listOf<Int>()) }
    var playerInput by remember { mutableStateOf(listOf<Int>()) }
    var showSequence by remember { mutableStateOf(false) }
    var highlightedDrum by remember { mutableIntStateOf(-1) }
    var isPlayerTurn by remember { mutableStateOf(false) }
    var showResult by remember { mutableStateOf(false) }
    var mistakes by remember { mutableIntStateOf(0) }

    val drums = listOf(
        Drum("\uD83E\uDD41", Color(0xFFE91E63), "Dhol"),
        Drum("\uD83E\uDD41", Color(0xFFF4A261), "Tabla"),
        Drum("\uD83E\uDD41", Color(0xFF4CAF50), "Mridangam"),
        Drum("\uD83E\uDD41", Color(0xFF2196F3), "Pakhawaj")
    )

    val seqLength = remember(level) { (3 + level).coerceAtMost(8) }

    fun setupLevel() {
        sequence = List(seqLength) { drums.indices.random() }
        playerInput = emptyList()
        showResult = false
        mistakes = 0
    }

    // Play sequence
    LaunchedEffect(level, showResult) {
        setupLevel()
        delay(1000)
        showSequence = true
        for ((i, drumIdx) in sequence.withIndex()) {
            highlightedDrum = drumIdx
            ElderlyFeedback.onSuccess(context)
            delay(600L)
            highlightedDrum = -1
            delay(200L)
        }
        showSequence = false
        isPlayerTurn = true
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("Drum Circle", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFFE91E63))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFFAF7F2))
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE91E63))
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE91E63))
            }

            Spacer(modifier = Modifier.height(8.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = when {
                            showSequence -> "Listen to the rhythm..."
                            isPlayerTurn -> "Repeat the sequence!"
                            else -> "Get ready..."
                        },
                        fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE91E63)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    // Sequence progress
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        sequence.forEachIndexed { idx, drumIdx ->
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(
                                        when {
                                            idx < playerInput.size -> if (playerInput[idx] == drumIdx) SuccessGreen else ErrorRed
                                            idx == playerInput.size && isPlayerTurn -> Color(0xFFFFF3E0)
                                            else -> Color(0xFFE8E0D8)
                                        }
                                    )
                                    .border(2.dp, Ink, CircleShape)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Drums grid
            val columns = 2
            for (row in 0 until 2) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    for (col in 0 until columns) {
                        val idx = row * columns + col
                        val drum = drums[idx]
                        val isHighlighted = highlightedDrum == idx
                        val animScale = animateFloatAsState(
                            targetValue = if (isHighlighted) 1.15f else 1f,
                            animationSpec = tween(200)
                        )
                        Box(
                            modifier = Modifier
                                .size(100.dp)
                                .padding(8.dp)
                                .scale(animScale.value)
                                .clip(CircleShape)
                                .background(drum.color.copy(alpha = if (isHighlighted) 1f else 0.7f))
                                .border(3.dp, Ink, CircleShape)
                                .clickable {
                                    ElderlyFeedback.onTap(context)
                                    if (isPlayerTurn && !showResult) {
                                        val newInput = playerInput + idx
                                        playerInput = newInput
                                        ElderlyFeedback.onSuccess(context)

                                        if (idx == sequence[playerInput.size - 1]) {
                                            score += 10 * level
                                            if (newInput.size >= sequence.size) {
                                                ElderlyFeedback.onSuccess(context)
                                                showResult = true
                                                isPlayerTurn = false
                                            }
                                        } else {
                                            ElderlyFeedback.onError(context)
                                            mistakes++
                                            score = (score - 5).coerceAtLeast(0)
                                            if (mistakes >= 3) {
                                                showResult = true
                                                isPlayerTurn = false
                                            }
                                        }
                                    }
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(drum.emoji, fontSize = 32.sp)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(drum.label, fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = "Mistakes: $mistakes / 3",
                fontSize = 16.sp, color = if (mistakes >= 2) ErrorRed else TextSecondary
            )
        }

        if (showResult) {
            val won = mistakes < 3
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text(
                        text = if (won) "Rhythm Master!" else "Too Many Mistakes",
                        fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center
                    )
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(if (won) "\uD83C\uDFB5" else "\uD83D\uDD34", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Mistakes: $mistakes", fontSize = 18.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE91E63))
                    }
                },
                confirmButton = {
                    Button(
                        onClick = { ElderlyFeedback.onTap(context); level++; showResult = false },
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("Next Level", fontSize = 18.sp) }
                }
            )
        }
    }
}
