package com.cognicare.ui.games

import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*
import com.cognicare.util.ElderlyFeedback
import kotlinx.coroutines.delay

data class BirdObstacle(val x: Float, val gapY: Float, val gapSize: Float)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HornbillFlightGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var birdY by remember { mutableFloatStateOf(0.5f) }
    var birdVelocity by remember { mutableFloatStateOf(0f) }
    var obstacles by remember { mutableStateOf(listOf<BirdObstacle>()) }
    var gameRunning by remember { mutableStateOf(false) }
    var gameOver by remember { mutableStateOf(false) }

    val gravity = 0.004f
    val gameSpeed = remember(level) { (0.006f + level * 0.001f).coerceAtMost(0.015f) }

    fun resetGame() {
        birdY = 0.5f; birdVelocity = 0f; obstacles = emptyList()
        gameRunning = true; gameOver = false
    }

    LaunchedEffect(level) { score = 0; resetGame() }

    LaunchedEffect(gameRunning, gameOver) {
        while (gameRunning && !gameOver) {
            birdVelocity += gravity
            birdY += birdVelocity
            obstacles = obstacles.map { it.copy(x = it.x - gameSpeed) }.filter { it.x > -0.3f }

            if (obstacles.isEmpty() || obstacles.last().x < 1.2f) {
                obstacles = obstacles + BirdObstacle(x = 2f, gapY = (0.25f..0.7f).random(), gapSize = (0.25f - level * 0.01f).coerceAtLeast(0.18f))
            }

            for (obs in obstacles) {
                if (birdY in (obs.x - 0.05f)..(obs.x + 0.05f)) {
                    if (birdY < obs.gapY - obs.gapSize / 2 || birdY > obs.gapY + obs.gapSize / 2) {
                        ElderlyFeedback.onError(context)
                        gameRunning = false; gameOver = true
                    }
                }
            }

            if (birdY < 0f || birdY > 1f) {
                ElderlyFeedback.onError(context)
                gameRunning = false; gameOver = true
            }
            delay(16)
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("Hornbill Flight", color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF795548))
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).background(Color(0xFFFAF7F2)).padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF87CEEB))
                    .border(2.dp, Ink, RoundedCornerShape(16.dp))
                    .clickable {
                        if (!gameOver && gameRunning) {
                            birdVelocity = -0.08f
                            ElderlyFeedback.onTap(context)
                        } else if (gameOver) {
                            level++; resetGame()
                        }
                    }
            ) {
                val w = size.width; val h = size.height

                // Draw obstacles (trees)
                obstacles.forEach { obs ->
                    val ox = obs.x * w
                    val gapTop = (obs.gapY - obs.gapSize / 2) * h
                    val gapBot = (obs.gapY + obs.gapSize / 2) * h
                    drawRect(Color(0xFF4CAF50), topLeft = androidx.compose.ui.geometry.Offset(ox - 25f, 0f), size = androidx.compose.ui.geometry.Size(50f, gapTop))
                    drawRect(Color(0xFF8D6E63), topLeft = androidx.compose.ui.geometry.Offset(ox - 10f, gapTop - 20f), size = androidx.compose.ui.geometry.Size(20f, gapBot - gapTop + 40f))
                    drawRect(Color(0xFF4CAF50), topLeft = androidx.compose.ui.geometry.Offset(ox - 25f, gapBot), size = androidx.compose.ui.geometry.Size(50f, h - gapBot))
                }

                // Draw bird
                val bx = 0.25f * w; val by = birdY * h
                drawCircle(Color(0xFFF4A261), radius = 20f, center = androidx.compose.ui.geometry.Offset(bx, by))
                drawCircle(Color(0xFFE91E63), radius = 8f, center = androidx.compose.ui.geometry.Offset(bx + 12f, by - 5f))
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (gameOver) {
                Text("Game Over! Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Tap to restart", fontSize = 14.sp, color = Color.Gray)
            } else {
                Text("Tap to flap!", fontSize = 16.sp, color = BridgeBrown)
            }
        }
    }
}
