package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import kotlin.math.abs

private val Ink = Color(0xFF16120E)
private val TextSecondary = Color(0xFF6B7280)
private val CanvasBg = Color(0xFFFAF7F2)
private val ForestGreen = Color(0xFF2E7D32)
private val PathTan = Color(0xFFD7CCC8)
private val HomeBlue = Color(0xFF1565C0)
private val WarmSurface = Color(0xFFFFFDF9)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WayfindingGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var playerX by remember { mutableIntStateOf(0) }
    var playerY by remember { mutableIntStateOf(0) }
    var goalX by remember { mutableIntStateOf(0) }
    var goalY by remember { mutableIntStateOf(0) }
    var moves by remember { mutableIntStateOf(0) }
    var bestMoves by remember { mutableIntStateOf(0) }
    var levelComplete by remember { mutableStateOf(false) }
    var walls by remember { mutableStateOf(setOf<Pair<Int, Int>>()) }

    val gridSize by remember(level) { mutableIntStateOf((5 + level).coerceAtMost(10)) }

    fun generateMaze() {
        val wallsSet = mutableSetOf<Pair<Int, Int>>()
        val totalWalls = (gridSize * gridSize / 5 + level * 2).coerceAtMost(gridSize * gridSize / 2)
        repeat(totalWalls) {
            val wx = (0 until gridSize).random()
            val wy = (0 until gridSize).random()
            if (wx != 0 || wy != 0) wallsSet.add(wx to wy)
        }
        walls = wallsSet
        playerX = 0; playerY = 0; moves = 0
        goalX = gridSize - 1; goalY = gridSize - 1
        bestMoves = gridSize * 2 + level * 3
        levelComplete = false
    }

    LaunchedEffect(level) { generateMaze() }

    fun moveTo(nx: Int, ny: Int) {
        if (nx !in 0 until gridSize || ny !in 0 until gridSize) return
        if ((nx to ny) in walls) { ElderlyFeedback.onError(context); LocalizationManager.speak("Wall!"); return }
        ElderlyFeedback.onTap(context)
        playerX = nx; playerY = ny; moves++
        if (nx == goalX && ny == goalY) {
            levelComplete = true
            val bonus = if (moves <= bestMoves) 30 else 10
            score += bonus * level
            ElderlyFeedback.onSuccess(context)
            LocalizationManager.speak("Home reached! $bonus points!")
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("\uD83D\uDEE3\uFE0F Finding Home (Wayfinding)", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ForestGreen)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Level: $level", fontSize = 12.sp, color = ForestGreen, fontWeight = FontWeight.Bold) }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) { Text("Moves: $moves", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink); Text("Best: $bestMoves", fontSize = 14.sp, color = TextSecondary) }
                }
            }
            Spacer(Modifier.height(8.dp))

            if (levelComplete) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83C\uDFE0", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text("You Found Home!", fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Spacer(Modifier.height(8.dp))
                        Text("Moves: $moves / Best: $bestMoves", fontSize = 14.sp, color = ForestGreen, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(12.dp))
                        Surface(shape = RoundedCornerShape(12.dp), color = Color(0xFFE8F5E9), modifier = Modifier.border(1.5.dp, ForestGreen, RoundedCornerShape(12.dp))) {
                            Column(Modifier.padding(12.dp)) {
                                Text("+${score} Visuospatial XP Earned!", fontSize = 14.sp, fontWeight = FontWeight.Black, color = ForestGreen)
                                Text("Navigate through obstacles to reach home.", fontSize = 12.sp, color = Ink)
                            }
                        }
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).semantics { contentDescription = "New path" }.clickable { ElderlyFeedback.onTap(context); score = 0; level = 1; generateMaze() }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("New Path \u27F3", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).semantics { contentDescription = "Done" }.clickable { onBack() }, RoundedCornerShape(12.dp), ForestGreen) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                // Maze grid
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)), RoundedCornerShape(18.dp), Color(0xFFE8F5E9)) {
                    Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(3.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        for (y in 0 until gridSize) {
                            Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                                for (x in 0 until gridSize) {
                                    val isPlayer = x == playerX && y == playerY
                                    val isGoal = x == goalX && y == goalY
                                    val isWall = (x to y) in walls
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = when {
                                            isPlayer -> ForestGreen
                                            isGoal -> HomeBlue
                                            isWall -> Color(0xFF795548)
                                            else -> PathTan
                                        },
                                        modifier = Modifier.size((40).dp).border(1.5.dp, Ink, RoundedCornerShape(6.dp)).semantics { contentDescription = when { isPlayer -> "You are here"; isGoal -> "Home goal"; isWall -> "Wall"; else -> "Path" } }.clickable {
                                            if (abs(x - playerX) + abs(y - playerY) == 1) moveTo(x, y)
                                        }
                                    ) {
                                        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                            Text(
                                                when {
                                                    isPlayer -> "\uD83D\uDEB6"
                                                    isGoal -> "\uD83C\uDFE0"
                                                    isWall -> "\uD83C\uDF32"
                                                    else -> ""
                                                }, fontSize = 18.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))
                Text("Tap adjacent tiles to move. Reach \uD83C\uDFE0!", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ForestGreen, textAlign = androidx.compose.ui.text.style.TextAlign.Center, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))

                // Arrow buttons
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("\u25C0" to { moveTo(playerX - 1, playerY) }, "\u25B2" to { moveTo(playerX, playerY - 1) }, "\u25BC" to { moveTo(playerX, playerY + 1) }, "\u25B6" to { moveTo(playerX + 1, playerY) }).forEach { (arrow, action) ->
                        Surface(Modifier.weight(1f).height(52.dp).shadow(2.dp, RoundedCornerShape(14.dp)).border(2.dp, Ink, RoundedCornerShape(14.dp)).semantics { contentDescription = when(arrow) { "\u25C0" -> "Move left"; "\u25B2" -> "Move up"; "\u25BC" -> "Move down"; else -> "Move right" } }.clickable { ElderlyFeedback.onTap(context); action() }, RoundedCornerShape(14.dp), Color.White) {
                            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(arrow, fontSize = 22.sp, fontWeight = FontWeight.Black, color = Ink) }
                        }
                    }
                }
            }
        }
    }
}
