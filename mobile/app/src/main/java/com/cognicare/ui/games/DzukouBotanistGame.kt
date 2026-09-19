package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import kotlinx.coroutines.delay

private val Ink = Color(0xFF16120E)
private val CanvasBg = Color(0xFFFAF7F2)
private val GreenDeep = Color(0xFF1B5E20)
private val GreenLight = Color(0xFF81C784)
private val GreenPale = Color(0xFFC8E6C9)
private val WarmSurface = Color(0xFFFFFDF9)

private data class FlowerCell(val id: Int, val emoji: String, val isTarget: Boolean, var found: Boolean = false)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DzukouBotanistGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var timeLeft by remember { mutableIntStateOf(30) }
    var gameOver by remember { mutableStateOf(false) }
    var foundCount by remember { mutableIntStateOf(0) }
    var totalTargets by remember { mutableIntStateOf(0) }
    var targetEmoji by remember { mutableStateOf("\uD83C\uDF3A") }
    var cells by remember { mutableStateOf(listOf<FlowerCell>()) }

    val distractorEmojis = listOf("\uD83C\uDF3B", "\uD83C\uDF3C", "\uD83C\uDF37", "\uD83C\uDF39", "\uD83C\uDF3D")
    val targetEmojis = listOf("\uD83C\uDF3A", "\uD83C\uDF38", "\u2618\uFE0F", "\uD83C\uDF3F")

    fun generateLevel() {
        val gridSize = (4 + level).coerceAtMost(8)
        val total = gridSize * gridSize
        targetEmoji = targetEmojis[level % targetEmojis.size]
        val numTargets = (2 + level * 2).coerceAtMost(total / 3)
        totalTargets = numTargets; foundCount = 0
        val distractors = distractorEmojis.filter { it != targetEmoji }
        val allCells = mutableListOf<FlowerCell>()
        repeat(numTargets) { allCells.add(FlowerCell(it, targetEmoji, true)) }
        repeat(total - numTargets) { idx -> allCells.add(FlowerCell(numTargets + idx, distractors[idx % distractors.size], false)) }
        cells = allCells.shuffled()
        timeLeft = (30 - level * 2).coerceAtLeast(12)
    }

    LaunchedEffect(level) { generateLevel() }

    LaunchedEffect(timeLeft, gameOver) {
        if (!gameOver && timeLeft > 0) { delay(1000L); timeLeft--
            if (timeLeft <= 0 && foundCount < totalTargets) { gameOver = true }
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("\uD83C\uDF3A Valley Flowers (Dzukou)", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenDeep)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(horizontal = 12.dp, vertical = 8.dp)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Level: $level", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GreenDeep) }
                    Text("\u23F0 ${timeLeft}s", fontSize = 20.sp, fontWeight = FontWeight.Black, color = if (timeLeft <= 10) Color(0xFFD32F2F) else Ink)
                    Text(targetEmoji, fontSize = 28.sp)
                }
            }
            Spacer(Modifier.height(8.dp))

            Surface(shape = RoundedCornerShape(10.dp), color = GreenPale, modifier = Modifier.fillMaxWidth().border(1.5.dp, GreenDeep, RoundedCornerShape(10.dp))) {
                Row(Modifier.padding(8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Found: $foundCount / $totalTargets", fontSize = 14.sp, fontWeight = FontWeight.Black, color = GreenDeep)
                    Text("Tap all $targetEmoji flowers!", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GreenDeep)
                }
            }
            Spacer(Modifier.height(8.dp))

            if (gameOver) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(if (foundCount >= totalTargets) "\uD83C\uDF1F" else "\u23F0", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(if (foundCount >= totalTargets) "Botanist Expert!" else "Time's Up!", fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Spacer(Modifier.height(16.dp))
                        Surface(shape = RoundedCornerShape(12.dp), color = Color(0xFFE8F5E9), modifier = Modifier.border(1.5.dp, GreenDeep, RoundedCornerShape(12.dp))) {
                            Text("+${score * 15} Attention XP Earned!", fontSize = 14.sp, fontWeight = FontWeight.Black, color = GreenDeep, modifier = Modifier.padding(12.dp))
                        }
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { ElderlyFeedback.onTap(context); score = 0; level = 1; gameOver = false; generateLevel() }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Search Again \u27F3", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { onBack() }, RoundedCornerShape(12.dp), GreenDeep) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                val gridSize = (4 + level).coerceAtMost(8)
                LazyVerticalGrid(columns = GridCells.Fixed(gridSize), modifier = Modifier.weight(1f).shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)).clip(RoundedCornerShape(18.dp)), horizontalArrangement = Arrangement.spacedBy(3.dp), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    items(cells) { cell ->
                        Surface(shape = RoundedCornerShape(8.dp), color = if (cell.found) GreenLight else if (cell.isTarget) GreenPale else Color(0xFFF3E5F5), modifier = Modifier.aspectRatio(1f).border(1.5.dp, if (cell.found) GreenDeep else Ink, RoundedCornerShape(8.dp)).clickable {
                            if (!cell.found) {
                                val idx = cells.indexOf(cell)
                                if (cell.isTarget) {
                                    cells = cells.toMutableList().also { it[idx] = cell.copy(found = true) }
                                    foundCount++; score += 10
                                    ElderlyFeedback.onSuccess(context)
                                    if (foundCount >= totalTargets) { score += level * 20; level++; ElderlyFeedback.onSuccess(context); LocalizationManager.speak("All flowers found! Level up!"); generateLevel() }
                                } else {
                                    ElderlyFeedback.onError(context); LocalizationManager.speak("Not that flower! Try again.")
                                }
                            }
                        }) {
                            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(cell.emoji, fontSize = 22.sp) }
                        }
                    }
                }
            }
        }
    }
}
