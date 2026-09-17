package com.cognicare.ui.games

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*
import com.cognicare.util.HapticUtil

data class Landmark(
    val emoji: String,
    val name: String,
    val color: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MemoryRoadGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var level by remember { mutableIntStateOf(1) }
    var score by remember { mutableIntStateOf(0) }
    var lives by remember { mutableIntStateOf(3) }
    var target by remember { mutableStateOf<Landmark?>(null) }
    var grid by remember { mutableStateOf(listOf<Landmark>()) }
    var foundCount by remember { mutableIntStateOf(0) }
    var totalTargets by remember { mutableIntStateOf(0) }
    var showSuccess by remember { mutableStateOf(false) }
    var showWrong by remember { mutableStateOf(false) }
    var wrongItem by remember { mutableStateOf<Landmark?>(null) }

    val landmarks = listOf(
        Landmark("\uD83D\uDEE3\uFE0F", "Temple", TempleGold),
        Landmark("\u26EA", "Church", ChurchBlue),
        Landmark("\uD83C\uDF3F", "Tea Garden", TeaGreen),
        Landmark("\uD83C\uDFEA", "Market", MarketOrange),
        Landmark("\uD83C\uDFEB", "School", SchoolPurple),
        Landmark("\uD83C\uDF09", "Bridge", BridgeBrown),
        Landmark("\uD83D\uDCA7", "Hand Pump", HandpumpCyan),
        Landmark("\uD83D\uDEFA", "Auto", AutoYellow)
    )

    fun setupLevel() {
        val count = (level + 2).coerceAtMost(6)
        val shuffled = landmarks.shuffled()
        val selected = shuffled.take(count)
        val gridItems = selected + selected
        grid = gridItems.shuffled()
        target = selected.random()
        foundCount = 0
        totalTargets = selected.count { it.name == target?.name }
        showSuccess = false
        showWrong = false
    }

    LaunchedEffect(level) {
        setupLevel()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Memory Road", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Green40)
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
            // Header: Level, Score, Lives
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Level badge
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Green40
                ) {
                    Text(
                        text = "Level $level",
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                // Score
                Text(
                    text = "$score pts",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Green40
                )

                // Lives
                Row {
                    repeat(3) { i ->
                        Text(
                            text = "\u2764\uFE0F",
                            fontSize = 20.sp,
                            modifier = Modifier.padding(start = 2.dp),
                            color = if (i < lives) Color.Red else Color.LightGray
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Story instruction
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Find all the",
                        fontSize = 18.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = target?.emoji ?: "", fontSize = 40.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = target?.name ?: "",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = target?.color ?: Green40
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Tap each ${target?.name} you see",
                        fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Game Grid — matching pairs
            val columns = if (grid.size <= 4) 2 else if (grid.size <= 9) 3 else 4
            val rows = (grid.size + columns - 1) / columns

            for (row in 0 until rows) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    for (col in 0 until columns) {
                        val index = row * columns + col
                        if (index < grid.size) {
                            val item = grid[index]
                            val isTarget = item.name == target?.name
                            val isFound = item in grid.take(index + 1).filter {
                                it.name == target?.name && grid.indexOf(it) < index
                            }

                            GameTile(
                                landmark = item,
                                isTarget = isTarget,
                                onClick = {
                                    if (isTarget && !showSuccess) {
                                        HapticUtil.vibrate(context, 80)
                                        foundCount++
                                        score += 10 * level
                                        if (foundCount >= totalTargets) {
                                            showSuccess = true
                                        }
                                    } else if (!isTarget && !showSuccess) {
                                        HapticUtil.vibrate(context, 200)
                                        showWrong = true
                                        wrongItem = item
                                        lives--
                                        if (lives <= 0) {
                                            // Game over — restart
                                            level = 1
                                            score = 0
                                            lives = 3
                                            setupLevel()
                                        }
                                    }
                                }
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
            }

            Spacer(modifier = Modifier.weight(1f))

            // Found counter
            Text(
                text = "Found: $foundCount / $totalTargets",
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium,
                color = Green40
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Wrong answer flash
            AnimatedVisibility(visible = showWrong) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.15f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Not a ${target?.name}! Try again.",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = ErrorRed
                        )
                    }
                }
            }

            // Success dialog
            AnimatedVisibility(visible = showSuccess) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    colors = CardDefaults.cardColors(containerColor = SuccessGreen),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "\uD83C\uDF89 Excellent!",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "You found all the ${target?.name}s!",
                            fontSize = 18.sp,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "+${10 * level * totalTargets} points",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                level++
                                lives = (lives + 1).coerceAtMost(3)
                                setupLevel()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                "Next Level \u2192",
                                color = SuccessGreen,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun GameTile(
    landmark: Landmark,
    isTarget: Boolean,
    onClick: () -> Unit
) {
    val scale = remember { Animatable(1f) }

    Box(
        modifier = Modifier
            .size(80.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(
                width = 2.dp,
                color = landmark.color.copy(alpha = 0.4f),
                shape = RoundedCornerShape(16.dp)
            )
            .scale(scale.value)
            .clickable {
                onClick()
            },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = landmark.emoji,
            fontSize = 36.sp
        )
    }
}
