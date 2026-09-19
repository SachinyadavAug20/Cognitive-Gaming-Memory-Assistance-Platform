package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import com.cognicare.util.ElderlyFeedback

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BambooCraftGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var pattern by remember { mutableStateOf(listOf<Int>()) }
    var options by remember { mutableStateOf(listOf<Int>()) }
    var selectedOption by remember { mutableIntStateOf(-1) }
    var showResult by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }

    val bambooColors = listOf(
        Color(0xFF4CAF50), // Green
        Color(0xFF8D6E63), // Brown
        Color(0xFFFFB74D), // Gold
        Color(0xFF42A5F5), // Blue
    )

    fun setupLevel() {
        val length = (3 + level).coerceAtMost(8)
        pattern = List(length) { bambooColors.indices.random() }
        options = bambooColors.indices.shuffled()
        selectedOption = -1
        showResult = false
    }

    LaunchedEffect(level) { setupLevel() }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("Bamboo Craft", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BridgeBrown)
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
                Text(text = "Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                Text(text = "Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
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
                        text = "Complete the pattern!",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "What comes next in the bamboo pattern?",
                        fontSize = 16.sp,
                        color = Color.Gray
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Pattern display
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
                    Text("Pattern:", fontSize = 16.sp, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        pattern.forEach { colorIndex ->
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .padding(4.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(bambooColors[colorIndex])
                                    .border(2.dp, bambooColors[colorIndex].copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                            )
                            // Arrow between items
                            Text(text = " → ", fontSize = 16.sp, color = Color.Gray)
                        }
                        // Question mark for next
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .padding(4.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color.LightGray.copy(alpha = 0.3f))
                                .border(2.dp, Color.LightGray, RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "?", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Options
            Text(
                text = "Pick the next color:",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                options.forEach { colorIndex ->
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(bambooColors[colorIndex].copy(alpha = 0.2f))
                            .border(
                                3.dp,
                                if (selectedOption == colorIndex) bambooColors[colorIndex] else bambooColors[colorIndex].copy(alpha = 0.3f),
                                RoundedCornerShape(16.dp)
                            )
                            .clickable {
                                if (!showResult) {
                                    ElderlyFeedback.onSuccess(context)
                                    selectedOption = colorIndex

                                    val expectedNext = pattern.last()
                                    isCorrect = colorIndex == expectedNext
                                    if (isCorrect) {
                                        score += 10 * level
                                    } else {
                                        score = (score - 5).coerceAtLeast(0)
                                    }
                                    showResult = true
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(bambooColors[colorIndex])
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Result
            if (showResult) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isCorrect) SuccessGreen.copy(alpha = 0.1f) else ErrorRed.copy(alpha = 0.1f)
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = if (isCorrect) "Correct! +${10 * level} pts" else "Not quite! The pattern repeats the last color.",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isCorrect) SuccessGreen else ErrorRed
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = { level++; setupLevel() },
                            colors = ButtonDefaults.buttonColors(containerColor = BridgeBrown)
                        ) {
                            Text("Next Pattern", fontSize = 16.sp)
                        }
                    }
                }
            }
        }
    }
}
