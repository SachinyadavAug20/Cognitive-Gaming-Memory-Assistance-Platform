package com.cognicare.ui.games

import androidx.compose.animation.*
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*
import com.cognicare.util.HapticUtil

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChurchBellGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var sequence by remember { mutableStateOf(listOf<Int>()) }
    var playerInput by remember { mutableStateOf(listOf<Int>()) }
    var phase by remember { mutableStateOf("watch") } // watch, input
    var showResult by remember { mutableStateOf(false) }
    var activeButton by remember { mutableIntStateOf(-1) }

    val bellColors = listOf(
        Color(0xFFE53935), // Red
        Color(0xFF43A047), // Green
        Color(0xFF1E88E5), // Blue
        Color(0xFFFFB300), // Yellow
    )

    fun generateSequence() {
        val length = (2 + level).coerceAtMost(8)
        sequence = List(length) { bellColors.indices.random() }
        playerInput = listOf()
        phase = "watch"
        showResult = false
    }

    LaunchedEffect(level) { generateSequence() }

    // Play sequence animation
    LaunchedEffect(phase) {
        if (phase == "watch") {
            sequence.forEachIndexed { index, colorIndex ->
                kotlinx.coroutines.delay(500)
                activeButton = colorIndex
                kotlinx.coroutines.delay(400)
                activeButton = -1
            }
            kotlinx.coroutines.delay(300)
            phase = "input"
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Church Bell", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ChurchBlue)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(SoftGreen.copy(alpha = 0.3f))
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = ChurchBlue)
                Text(text = "Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = ChurchBlue)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Instruction
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = when (phase) {
                            "watch" -> "Watch the pattern!"
                            else -> "Repeat the pattern!"
                        },
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = when (phase) {
                            "watch" -> "Remember the order of lights"
                            else -> "Tap the bells in the same order"
                        },
                        fontSize = 16.sp,
                        color = Color.Gray
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Step: ${playerInput.size} / ${sequence.size}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = ChurchBlue
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Bell buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                bellColors.forEachIndexed { index, color ->
                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape)
                            .background(
                                if (activeButton == index) color
                                else color.copy(alpha = 0.4f)
                            )
                            .border(3.dp, color, CircleShape)
                            .clickable {
                                if (phase == "input" && !showResult) {
                                    HapticUtil.vibrate(context, 60)
                                    val newInput = playerInput + index
                                    playerInput = newInput

                                    // Check if correct
                                    if (index == sequence[newInput.lastIndex]) {
                                        score += 5
                                        if (newInput.size == sequence.size) {
                                            // Level complete
                                            showResult = true
                                        }
                                    } else {
                                        // Wrong — restart
                                        showResult = true
                                    }
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "\uD83D\uDD14",
                            fontSize = 40.sp,
                            color = Color.White
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Progress dots
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                sequence.forEachIndexed { index, _ ->
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .padding(2.dp)
                            .clip(CircleShape)
                            .background(
                                if (index < playerInput.size) {
                                    if (playerInput[index] == sequence[index]) ChurchBlue else ErrorRed
                                } else {
                                    Color.LightGray
                                }
                            )
                    )
                }
            }
        }

        if (showResult) {
            val isCorrect = playerInput == sequence
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text(
                        text = if (isCorrect) "Well Done!" else "Oops!",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = if (isCorrect) "\uD83C\uDF1F" else "\uD83D\uDE14", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = ChurchBlue)
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (isCorrect) level++
                            generateSequence()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = ChurchBlue)
                    ) {
                        Text(if (isCorrect) "Next Level" else "Try Again", fontSize = 18.sp)
                    }
                }
            )
        }
    }
}
