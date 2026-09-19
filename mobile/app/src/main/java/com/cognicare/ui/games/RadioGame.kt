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
import kotlin.math.abs

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RadioGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var targetFreq by remember { mutableFloatStateOf(0f) }
    var currentFreq by remember { mutableFloatStateOf(50f) }
    var attempts by remember { mutableIntStateOf(0) }
    var showResult by remember { mutableStateOf(false) }
    var feedbackText by remember { mutableStateOf("") }
    var tunedCount by remember { mutableIntStateOf(0) }

    fun setupLevel() {
        targetFreq = (10..90).random().toFloat()
        currentFreq = 50f
        attempts = 0
        showResult = false
        feedbackText = ""
    }

    LaunchedEffect(level) {
        tunedCount = 0
        setupLevel()
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("Nostalgia Radio", color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF457B9D))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).background(Color(0xFFFAF7F2)).padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = ChurchBlue)
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = ChurchBlue)
                Text("Tuned: $tunedCount", fontSize = 16.sp, color = Color.Gray)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Radio body
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF3E2723)),
                elevation = CardDefaults.cardElevation(4.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Radio screen
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(80.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF1B5E20))
                            .border(2.dp, Color(0xFF0D3311), RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("FM", fontSize = 14.sp, color = Color(0xFF76FF03))
                            Text(
                                text = "%.1f MHz".format(currentFreq),
                                fontSize = 32.sp, fontWeight = FontWeight.Bold, color = Color(0xFF76FF03)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Target frequency
                    Text("Tune to: ${"%.1f".format(targetFreq)} MHz", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFFF3E0))

                    Spacer(modifier = Modifier.height(12.dp))

                    // Frequency dial (slider)
                    Slider(
                        value = currentFreq,
                        onValueChange = { currentFreq = it },
                        valueRange = 0f..100f,
                        colors = SliderDefaults.colors(
                            thumbColor = TempleGold,
                            activeTrackColor = TempleGold,
                            inactiveTrackColor = Color(0xFF5D4037)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("0.0", fontSize = 12.sp, color = Color(0xFFBCAAA4))
                        Text("100.0", fontSize = 12.sp, color = Color(0xFFBCAAA4))
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Tune button
                    Button(
                        onClick = {
                            attempts++
                            val diff = abs(currentFreq - targetFreq)
                            when {
                                diff < 1f -> {
                                    ElderlyFeedback.onSuccess(context)
                                    feedbackText = "\u2B50 Perfect! +${30 * level} pts"
                                    score += 30 * level
                                    tunedCount++
                                    showResult = true
                                }
                                diff < 5f -> {
                                    ElderlyFeedback.onSuccess(context)
                                    feedbackText = "\uD83C\uDF1F Very close! +${15 * level} pts"
                                    score += 15 * level
                                    showResult = true
                                }
                                diff < 10f -> {
                                    ElderlyFeedback.onTap(context)
                                    feedbackText = "\uD83C\uDF1F Close! +${5 * level} pts"
                                    score += 5 * level
                                }
                                else -> {
                                    ElderlyFeedback.onError(context)
                                    feedbackText = "Off by ${"%.1f".format(diff)} MHz..."
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = TempleGold),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Tune!", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF3E2723))
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(feedbackText, fontSize = 14.sp, color = Color(0xFFFFF3E0), textAlign = TextAlign.Center)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (showResult) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SuccessGreen),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("\uD83C\uDFB5 Signal Found!", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Attempts: $attempts", fontSize = 16.sp, color = Color.White.copy(alpha = 0.9f))
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = { level++; showResult = false },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Next Station", color = ChurchBlue, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        }
                    }
                }
            }
        }
    }
}
