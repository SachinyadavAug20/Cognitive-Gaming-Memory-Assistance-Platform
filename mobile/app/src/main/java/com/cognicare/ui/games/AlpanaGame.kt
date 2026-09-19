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
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*
import com.cognicare.util.ElderlyFeedback
import kotlinx.coroutines.delay

private const val INITIAL_GRID_SIZE = 4
private const val BASE_GRID_SIZE = 3
private const val MAX_GRID_SIZE = 6
private const val BASE_DISPLAY_TIME_MS = 2000L
private const val DISPLAY_TIME_PER_LEVEL_MS = 500L
private const val POINTS_PER_CORRECT = 5
private const val COMPLETION_BONUS_MULTIPLIER = 50

private val Ink = Color(0xFF16120E)
private val TextSecondary = Color(0xFF6B7280)

private val AlpanaColors = listOf(
    Color(0xFFE91E63), Color(0xFFF4A261), Color(0xFF4CAF50), Color(0xFF2196F3), Color(0xFF9C27B0)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlpanaGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var gridSize by remember { mutableIntStateOf(INITIAL_GRID_SIZE) }
    var targetGrid by remember { mutableStateOf(listOf<Int>()) }
    var playerGrid by remember { mutableStateOf(listOf<Int>()) }
    var showTarget by remember { mutableStateOf(true) }
    var mistakes by remember { mutableIntStateOf(0) }
    var showResult by remember { mutableStateOf(false) }
    var roundComplete by remember { mutableStateOf(false) }

    fun setupLevel() {
        gridSize = (BASE_GRID_SIZE + level).coerceAtMost(MAX_GRID_SIZE)
        val total = gridSize * gridSize
        targetGrid = List(total) { AlpanaColors.indices.random() }
        playerGrid = List(total) { -1 }
        showTarget = true
        mistakes = 0
        showResult = false
        roundComplete = false
    }

    LaunchedEffect(level) { setupLevel() }

    // Show reference briefly
    LaunchedEffect(showTarget, level) {
        if (showTarget) {
            delay(BASE_DISPLAY_TIME_MS + level * DISPLAY_TIME_PER_LEVEL_MS)
            showTarget = false
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("Alpana Pattern", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF9C27B0))
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
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9C27B0))
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9C27B0))
                Text("Mistakes: $mistakes", fontSize = 16.sp, color = ErrorRed)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = if (showTarget) "Memorize this pattern!" else "Recreate the pattern:",
                        fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9C27B0)
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    // Reference grid (shown during memorize phase)
                    if (showTarget) {
                        Column {
                            for (row in 0 until gridSize) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    for (col in 0 until gridSize) {
                                        val idx = row * gridSize + col
                                        Box(
                                            modifier = Modifier
                                                .size(40.dp)
                                                .padding(2.dp)
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(AlpanaColors[targetGrid[idx]])
                                                .border(1.dp, Ink, RoundedCornerShape(4.dp))
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Player grid
                    if (!showTarget) {
                        Column {
                            for (row in 0 until gridSize) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    for (col in 0 until gridSize) {
                                        val idx = row * gridSize + col
                                        val playerColor = playerGrid[idx]
                                        Box(
                                            modifier = Modifier
                                                .size(40.dp)
                                                .padding(2.dp)
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(if (playerColor >= 0) AlpanaColors[playerColor] else Color(0xFFF0EDE8))
                                                .border(2.dp, Ink, RoundedCornerShape(4.dp))
                                                .semantics { contentDescription = "Color cell ${idx + 1}" }
                                                .clickable {
                                                    if (!roundComplete) {
                                                        val nextColor = (playerGrid[idx] + 1) % AlpanaColors.size
                                                        val newGrid = playerGrid.toMutableList()
                                                        newGrid[idx] = nextColor
                                                        playerGrid = newGrid

                                                        if (nextColor == targetGrid[idx]) {
                                                            ElderlyFeedback.onTap(context)
                                                            score += POINTS_PER_CORRECT
                                                        } else {
                                                            ElderlyFeedback.onError(context)
                                                            mistakes++
                                                        }

                                                        // Check completion
                                                        if (playerGrid.zip(targetGrid).all { (a, b) -> a == b }) {
                                                            ElderlyFeedback.onSuccess(context)
                                                            roundComplete = true
                                                            score += COMPLETION_BONUS_MULTIPLIER * level
                                                            showResult = true
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
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Color palette hint
            if (!showTarget) {
                Text("Tap cells to cycle colors", fontSize = 14.sp, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    AlpanaColors.forEach { color ->
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(color)
                                .border(2.dp, Ink, RoundedCornerShape(6.dp))
                        )
                    }
                }
            }
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text("Pattern Matched!", fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83C\uDFAD", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Mistakes: $mistakes", fontSize = 18.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9C27B0))
                    }
                },
                confirmButton = {
                    Button(
                        onClick = { ElderlyFeedback.onTap(context); level++; showResult = false },
                        modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Next Level" }
                    ) { Text("Next Level", fontSize = 18.sp) }
                }
            )
        }
    }
}
