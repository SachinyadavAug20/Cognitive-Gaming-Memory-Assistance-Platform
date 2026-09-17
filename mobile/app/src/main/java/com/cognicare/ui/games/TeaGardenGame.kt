package com.cognicare.ui.games

import androidx.compose.animation.*
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
import com.cognicare.util.HapticUtil

data class TeaLeaf(
    val emoji: String,
    val name: String,
    val color: Color,
    val points: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeaGardenGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var timeLeft by remember { mutableIntStateOf(30) }
    var targetLeaf by remember { mutableStateOf<TeaLeaf?>(null) }
    var gardenItems by remember { mutableStateOf(listOf<TeaLeaf>()) }
    var collected by remember { mutableIntStateOf(0) }
    var showResult by remember { mutableStateOf(false) }

    val allLeaves = listOf(
        TeaLeaf("\uD83C\uDF3F", "Green Leaf", TeaGreen, 10),
        TeaLeaf("\uD83C\uDF3B", "Marigold", TempleGold, 15),
        TeaLeaf("\uD83C\uDF38", "Rose", Color(0xFFE91E63), 20),
        TeaLeaf("\uD83C\uDF3C", "Sunflower", AutoYellow, 25),
    )

    fun setupLevel() {
        val count = (5 + level * 2).coerceAtMost(15)
        val selected = allLeaves.random()
        targetLeaf = selected
        gardenItems = List(count) { allLeaves.random() }
        collected = 0
        timeLeft = 30 + level * 5
        showResult = false
    }

    LaunchedEffect(level) { setupLevel() }

    // Timer
    LaunchedEffect(timeLeft, showResult) {
        if (timeLeft > 0 && !showResult) {
            kotlinx.coroutines.delay(1000)
            timeLeft--
            if (timeLeft <= 0) showResult = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tea Garden", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF4CAF50))
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
                Text(text = "Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Green40)
                Text(text = "Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Green40)
                Text(text = "\u23F1 $timeLeft s", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = if (timeLeft < 10) ErrorRed else Green40)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Target
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
                    Text("Pick the:", fontSize = 18.sp, color = Color.Gray)
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = targetLeaf?.emoji ?: "", fontSize = 48.sp)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = targetLeaf?.name ?: "",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = targetLeaf?.color ?: Green40
                        )
                    }
                    Text("+$${targetLeaf?.points} points each", fontSize = 14.sp, color = Color.Gray)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Garden grid
            val columns = 4
            val rows = (gardenItems.size + columns - 1) / columns

            for (row in 0 until rows) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    for (col in 0 until columns) {
                        val index = row * columns + col
                        if (index < gardenItems.size) {
                            val item = gardenItems[index]
                            Box(
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(item.color.copy(alpha = 0.1f))
                                    .border(2.dp, item.color.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                    .clickable {
                                        if (!showResult) {
                                            if (item.name == targetLeaf?.name) {
                                                HapticUtil.vibrate(context, 60)
                                                score += item.points
                                                collected++
                                            } else {
                                                HapticUtil.vibrate(context, 200)
                                                score = (score - 5).coerceAtLeast(0)
                                            }
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = item.emoji, fontSize = 36.sp)
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = "Collected: $collected",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Green40
            )
        }

        // Result dialog
        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text(
                        text = if (timeLeft <= 0) "Time's Up!" else "Well Done!",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "\uD83C\uDF3F", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "Collected: $collected", fontSize = 20.sp)
                        Text(text = "Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Green40)
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            level++
                            setupLevel()
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Next Level", fontSize = 18.sp)
                    }
                }
            )
        }
    }
}
