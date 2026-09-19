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

private val ThreadColors = listOf(
    Color(0xFFE91E63), Color(0xFF4CAF50), Color(0xFFF4A261), Color(0xFF2196F3), Color(0xFF9C27B0), Color(0xFF795548)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoomGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var targetPattern by remember { mutableStateOf(listOf<Int>()) }
    var playerPattern by remember { mutableStateOf(listOf<Int>()) }
    var currentStep by remember { mutableIntStateOf(0) }
    var showResult by remember { mutableStateOf(false) }
    var showTarget by remember { mutableStateOf(true) }
    var mistakes by remember { mutableIntStateOf(0) }

    val patternLength = remember(level) { (3 + level).coerceAtMost(8) }

    fun setupLevel() {
        targetPattern = List(patternLength) { ThreadColors.indices.random() }
        playerPattern = emptyList()
        currentStep = 0
        mistakes = 0
        showResult = false
        showTarget = true
    }

    LaunchedEffect(level) { setupLevel() }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("Weaving Loom", color = Color.White) },
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
                .background(Color(0xFFFAF7F2))
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                Text("Step ${currentStep + 1}/$patternLength", fontSize = 16.sp, color = Color.Gray)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Target pattern display
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
                        text = if (showTarget) "Memorize the weave:" else "Recreate the pattern:",
                        fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    // Target thread strip
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        targetPattern.forEachIndexed { idx, colorIdx ->
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(ThreadColors[colorIdx])
                                    .border(
                                        width = if (!showTarget && idx == currentStep) 3.dp else 2.dp,
                                        color = if (!showTarget && idx == currentStep) Color.Black else Ink,
                                        shape = RoundedCornerShape(6.dp)
                                    )
                            )
                        }
                    }

                    if (showTarget) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Watch carefully...", fontSize = 14.sp, color = Color.Gray)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Player's woven strip
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
                    Text("Your weave:", fontSize = 16.sp, fontWeight = FontWeight.Medium, color = BridgeBrown)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        for (i in 0 until patternLength) {
                            val color = if (i < playerPattern.size) ThreadColors[playerPattern[i]] else Color(0xFFE8E0D8)
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(color)
                                    .border(2.dp, Ink, RoundedCornerShape(6.dp))
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (!showTarget) {
                Text("Select thread color #$${currentStep + 1}:", fontSize = 16.sp, fontWeight = FontWeight.Medium, color = BridgeBrown)
                Spacer(modifier = Modifier.height(8.dp))

                // Thread selection grid
                val columns = 3
                val rows = (ThreadColors.size + columns - 1) / columns
                for (row in 0 until rows) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        for (col in 0 until columns) {
                            val idx = row * columns + col
                            if (idx < ThreadColors.size) {
                                val color = ThreadColors[idx]
                                val isSelected = idx == targetPattern.getOrNull(currentStep)
                                Box(
                                    modifier = Modifier
                                        .size(56.dp)
                                        .padding(4.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(color)
                                        .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                        .clickable {
                                            if (!showResult && currentStep < patternLength) {
                                                if (idx == targetPattern[currentStep]) {
                                                    ElderlyFeedback.onSuccess(context)
                                                    playerPattern = playerPattern + idx
                                                    currentStep++
                                                    score += 10 * level
                                                    if (currentStep >= patternLength) {
                                                        ElderlyFeedback.onSuccess(context)
                                                        showResult = true
                                                    }
                                                } else {
                                                    ElderlyFeedback.onError(context)
                                                    mistakes++
                                                    score = (score - 5).coerceAtLeast(0)
                                                }
                                            }
                                        }
                                )
                            }
                        }
                    }
                }
            }
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text("Weave Complete!", fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83E\uDDF5", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Mistakes: $mistakes", fontSize = 18.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                    }
                },
                confirmButton = {
                    Button(
                        onClick = { level++; showResult = false },
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("Next Level", fontSize = 18.sp) }
                }
            )
        }
    }
}
