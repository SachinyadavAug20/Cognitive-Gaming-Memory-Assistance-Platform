package com.cognicare.ui.games

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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

data class MarketItem(val emoji: String, val name: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarketVisitGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var memoryItems by remember { mutableStateOf(listOf<MarketItem>()) }
    var choiceItems by remember { mutableStateOf(listOf<MarketItem>()) }
    var selected by remember { mutableStateOf(setOf<String>()) }
    var phase by remember { mutableStateOf("memorize") } // memorize, pick
    var showResult by remember { mutableStateOf(false) }

    val allItems = listOf(
        MarketItem("\uD83E\uDD5B", "Rice"),
        MarketItem("\uD83C\uDF4E", "Apple"),
        MarketItem("\uD83C\uDF4A", "Orange"),
        MarketItem("\uD83E\uDD5C", "Dal"),
        MarketItem("\uD83C\uDF44", "Mushroom"),
        MarketItem("\uD83C\uDF4D", "Mango"),
        MarketItem("\uD83E\uDD54", "Peas"),
        MarketItem("\uD83E\uDD55", "Potato"),
        MarketItem("\uD83E\uDDC0", "Cheese"),
        MarketItem("\uD83E\uDD5A", "Meat"),
        MarketItem("\uD83C\uDF53", "Tomato"),
        MarketItem("\uD83C\uDF3D", "Corn"),
    )

    fun setupLevel() {
        val count = (2 + level).coerceAtMost(6)
        memoryItems = allItems.shuffled().take(count)
        choiceItems = (memoryItems + allItems.shuffled().take(4)).shuffled()
        selected = setOf()
        phase = "memorize"
        showResult = false

        // After delay, switch to pick phase
    }

    LaunchedEffect(level) { setupLevel() }

    LaunchedEffect(phase) {
        if (phase == "memorize") {
            kotlinx.coroutines.delay((2000 + level * 500).toLong())
            phase = "pick"
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Market Visit", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MarketOrange)
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
                Text(text = "Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MarketOrange)
                Text(text = "Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MarketOrange)
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
                        text = if (phase == "memorize") "Memorize these items!" else "Pick what you saw!",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (phase == "memorize") "Remember everything on the list"
                        else "Tap the items you saw on the list",
                        fontSize = 16.sp,
                        color = Color.Gray
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Items to memorize
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Shopping List:", fontSize = 16.sp, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        memoryItems.forEach { item ->
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(text = item.emoji, fontSize = 36.sp)
                                Text(text = item.name, fontSize = 12.sp, color = Color.Gray)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Choice grid (only in pick phase)
            if (phase == "pick") {
                Text(
                    text = "Tap the correct items:",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                val columns = 4
                val rows = (choiceItems.size + columns - 1) / columns

                for (row in 0 until rows) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        for (col in 0 until columns) {
                            val index = row * columns + col
                            if (index < choiceItems.size) {
                                val item = choiceItems[index]
                                val isSelected = item.name in selected
                                val isCorrect = item.name in memoryItems.map { it.name }

                                Box(
                                    modifier = Modifier
                                        .size(72.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(
                                            when {
                                                isSelected && isCorrect -> SuccessGreen.copy(alpha = 0.2f)
                                                isSelected && !isCorrect -> ErrorRed.copy(alpha = 0.2f)
                                                else -> Color.White
                                            }
                                        )
                                        .border(
                                            2.dp,
                                            when {
                                                isSelected && isCorrect -> SuccessGreen
                                                isSelected && !isCorrect -> ErrorRed
                                                else -> Color.LightGray
                                            },
                                            RoundedCornerShape(12.dp)
                                        )
                                        .clickable {
                                            if (!isSelected && !showResult) {
                                                HapticUtil.vibrate(context, 60)
                                                selected = selected + item.name
                                                if (isCorrect) {
                                                    score += 10
                                                } else {
                                                    score = (score - 5).coerceAtLeast(0)
                                                }
                                                // Check if all correct items found
                                                val correctSelected = selected.filter { it in memoryItems.map { m -> m.name } }
                                                if (correctSelected.size >= memoryItems.size) {
                                                    showResult = true
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
            }

            Spacer(modifier = Modifier.weight(1f))

            // Progress
            if (phase == "pick") {
                val correctCount = selected.filter { it in memoryItems.map { m -> m.name } }.size
                Text(
                    text = "Found: $correctCount / ${memoryItems.size}",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MarketOrange
                )
            }
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = {
                    Text(
                        text = "Great Memory!",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "\uD83C\uDFEA", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = MarketOrange)
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
