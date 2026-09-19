package com.cognicare.ui.games

import androidx.compose.animation.*
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*
import com.cognicare.util.ElderlyFeedback
import kotlinx.coroutines.delay

data class FallingLeaf(
    val id: Int,
    val emoji: String,
    val x: Float,
    var y: Float,
    val speed: Float,
    val isCorrect: Boolean,
    val points: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeaGardenCatchGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var lives by remember { mutableIntStateOf(3) }
    var timeLeft by remember { mutableIntStateOf(30) }
    var caught by remember { mutableIntStateOf(0) }
    var missed by remember { mutableIntStateOf(0) }
    var gameOver by remember { mutableStateOf(false) }
    var leaves by remember { mutableStateOf(listOf<FallingLeaf>()) }
    var nextId by remember { mutableIntStateOf(0) }
    var showResult by remember { mutableStateOf(false) }

    val correctColor = remember(level) { listOf("\uD83C\uDF3F", "\uD83C\uDF43").random() }
    val leafEmojis = listOf("\uD83C\uDF3F", "\uD83C\uDF43", "\uD83C\uDF42", "\uD83C\uDF41", "\uD83C\uDF44")
    val spawnRate = remember(level) { (1200L - level * 80L).coerceAtMost(400L) }
    val fallSpeed = remember(level) { (3f + level * 0.5f).coerceAtMost(12f) }

    fun spawnLeaf() {
        val isCorrect = leafEmojis.random() == correctColor
        val leaf = FallingLeaf(
            id = nextId++,
            emoji = if (isCorrect) correctColor else leafEmojis.filter { it != correctColor }.random(),
            x = (0..8).random().toFloat(),
            y = 0f,
            speed = fallSpeed + (-1f..1f).random(),
            isCorrect = isCorrect,
            points = if (isCorrect) 10 * level else -5
        )
        leaves = leaves + leaf
    }

    LaunchedEffect(level) {
        score = 0
        lives = 3
        timeLeft = 30 + level * 5
        caught = 0
        missed = 0
        gameOver = false
        showResult = false
        leaves = emptyList()
        nextId = 0
    }

    // Timer
    LaunchedEffect(timeLeft, showResult) {
        if (timeLeft > 0 && !showResult && !gameOver) {
            delay(1000)
            timeLeft--
            if (timeLeft <= 0) showResult = true
        }
    }

    // Spawner
    LaunchedEffect(level, showResult) {
        while (!showResult && !gameOver) {
            spawnLeaf()
            delay(spawnRate)
        }
    }

    // Physics
    LaunchedEffect(showResult, gameOver) {
        while (!showResult && !gameOver) {
            leaves = leaves.map { it.copy(y = it.y + it.speed) }
                .filter { it.y < 12f }
            delay(50)
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("Catch Tea Leaves", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = TeaGreen)
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
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TeaGreen)
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TeaGreen)
                Text("\u23F1 $timeLeft s", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = if (timeLeft < 10) ErrorRed else TeaGreen)
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Caught: $caught", fontSize = 14.sp, color = SuccessGreen)
                Text("Target: $correctColor", fontSize = 22.sp)
                repeat(3) { i ->
                    Text("\u2764\uFE0F", fontSize = 16.sp, color = if (i < lives) Color.Red else Color.LightGray)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Falling field
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White)
                    .border(2.dp, Ink, RoundedCornerShape(16.dp))
            ) {
                leaves.forEach { leaf ->
                    val xFraction = leaf.x / 9f
                    val yFraction = leaf.y / 12f
                    Text(
                        text = leaf.emoji,
                        fontSize = 36.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .offset(
                                x = (xFraction * 300).dp,
                                y = (yFraction * 500).dp
                            )
                            .clickable {
                                if (!showResult && !gameOver) {
                                    if (leaf.isCorrect) {
                                        ElderlyFeedback.onSuccess(context)
                                        score += leaf.points
                                        caught++
                                    } else {
                                        ElderlyFeedback.onError(context)
                                        score = (score + leaf.points).coerceAtLeast(0)
                                        lives--
                                        if (lives <= 0) gameOver = true
                                    }
                                    leaves = leaves.filter { it.id != leaf.id }
                                }
                            }
                    )
                }

                if (leaves.isEmpty() && !showResult && !gameOver) {
                    Text(
                        text = "Tap the $correctColor leaves!",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Gray,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
        }

        if (showResult || gameOver) {
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text(
                        text = if (gameOver) "Game Over!" else "Time's Up!",
                        fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center
                    )
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "\uD83C\uDF3F", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Caught: $caught", fontSize = 20.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TeaGreen)
                    }
                },
                confirmButton = {
                    Button(
                        onClick = { level++; showResult = false; gameOver = false },
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("Next Level", fontSize = 18.sp) }
                }
            )
        }
    }
}
