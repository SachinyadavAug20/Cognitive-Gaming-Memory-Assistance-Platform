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
import com.cognicare.util.ElderlyFeedback

data class BellPair(val id: Int, val emoji: String, val name: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TemplePrayerGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var pairs by remember { mutableStateOf(listOf<BellPair>()) }
    var revealed by remember { mutableStateOf(setOf<Int>()) }
    var matched by remember { mutableStateOf(setOf<Int>()) }
    var firstSelection by remember { mutableStateOf<BellPair?>(null) }
    var showResult by remember { mutableStateOf(false) }

    val emojis = listOf("\uD83D\uDD14", "\uD83D\uDE4F", "\uD83C\uDF3B", "\uD83C\uDF38", "\uD83C\uDF4E", "\uD83C\uDF3F")

    fun setupLevel() {
        val count = (2 + level).coerceAtMost(6)
        val selected = emojis.take(count)
        val gamePairs = selected.mapIndexed { i, e -> BellPair(i, e, "bell_$i") }
        pairs = (gamePairs + gamePairs).shuffled()
        revealed = setOf()
        matched = setOf()
        firstSelection = null
        showResult = false
    }

    LaunchedEffect(level) { setupLevel() }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("Temple Prayer", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = TempleGold)
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
                Text(text = "Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TempleGold)
                Text(text = "Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TempleGold)
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
                        text = "Match the pairs!",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Tap two cards with the same symbol",
                        fontSize = 16.sp,
                        color = Color.Gray
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Matched: ${matched.size / 2} / ${pairs.size / 2}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = TempleGold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Card grid
            val columns = if (pairs.size <= 4) 2 else 4
            val rows = (pairs.size + columns - 1) / columns

            for (row in 0 until rows) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    for (col in 0 until columns) {
                        val index = row * columns + col
                        if (index < pairs.size) {
                            val pair = pairs[index]
                            val isRevealed = pair.id in revealed || pair.id in matched
                            val isMatched = pair.id in matched

                            Box(
                                modifier = Modifier
                                    .size(80.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(
                                        when {
                                            isMatched -> TempleGold.copy(alpha = 0.2f)
                                            isRevealed -> Color.White
                                            else -> TempleGold.copy(alpha = 0.5f)
                                        }
                                    )
                                    .border(
                                        2.dp,
                                        when {
                                            isMatched -> TempleGold
                                            isRevealed -> TempleGold.copy(alpha = 0.3f)
                                            else -> TempleGold.copy(alpha = 0.5f)
                                        },
                                        RoundedCornerShape(12.dp)
                                    )
                                    .clickable {
                                        if (!isRevealed && !showResult) {
                                            ElderlyFeedback.onSuccess(context)
                                            if (firstSelection == null) {
                                                // First card
                                                firstSelection = pair
                                                revealed = revealed + pair.id
                                            } else {
                                                // Second card
                                                revealed = revealed + pair.id
                                                if (firstSelection?.id == pair.id) {
                                                    // Match!
                                                    matched = matched + pair.id
                                                    score += 10 * level
                                                    firstSelection = null

                                                    // Check if all matched
                                                    if (matched.size == pairs.size) {
                                                        showResult = true
                                                    }
                                                } else {
                                                    // No match — flip back
                                                    val prev = firstSelection!!
                                                    val mismatchId = pair.id
                                                    val prevId = prev.id
                                                    firstSelection = null
                                                    revealed = revealed - mismatchId - prevId
                                                }
                                            }
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                if (isRevealed) {
                                    Text(text = pair.emoji, fontSize = 40.sp)
                                } else {
                                    Text(text = "?", fontSize = 36.sp, color = Color.White.copy(alpha = 0.6f))
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
            }

            Spacer(modifier = Modifier.weight(1f))
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text(
                        text = "Namaste! 🙏",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "\uD83D\uDD14", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "All pairs matched!", fontSize = 20.sp)
                        Text(text = "Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TempleGold)
                    }
                },
                confirmButton = {
                    Button(
                        onClick = { level++; setupLevel() },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = TempleGold)
                    ) {
                        Text("Next Level", fontSize = 18.sp)
                    }
                }
            )
        }
    }
}
