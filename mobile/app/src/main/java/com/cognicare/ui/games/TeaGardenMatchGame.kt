package com.cognicare.ui.games

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.VolumeUp
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
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import kotlin.math.abs

private val Ink = Color(0xFF16120E)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)

data class Tile(
    val type: Int, // 0..4
    val emoji: String,
    val color: Color
)

val TILE_TYPES = listOf(
    Tile(0, "🍃", Color(0xFF166534)), // Tea leaf
    Tile(1, "🌸", Color(0xFFDB2777)), // Orchid
    Tile(2, "🍋", Color(0xFFEAB308)), // Lemon
    Tile(3, "🫖", Color(0xFF9A3412)), // Clay Cup
    Tile(4, "🪷", Color(0xFF7C3AED))  // Lotus
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeaGardenMatchGame(onBack: () -> Unit) {
    val context = LocalContext.current
    val rows = 5
    val cols = 5
    val targetScore = 300
    val maxMoves = 20

    // Initialize random 5x5 board without pre-existing 3-matches
    fun generateInitialBoard(): MutableList<Int> {
        val board = mutableListOf<Int>()
        for (r in 0 until rows) {
            for (c in 0 until cols) {
                var pick: Int
                do {
                    pick = (0..4).random()
                } while (
                    (c >= 2 && board[r * cols + (c - 1)] == pick && board[r * cols + (c - 2)] == pick) ||
                    (r >= 2 && board[(r - 1) * cols + c] == pick && board[(r - 2) * cols + c] == pick)
                )
                board.add(pick)
            }
        }
        return board
    }

    var grid by remember { mutableStateOf(generateInitialBoard()) }
    var selectedPos by remember { mutableStateOf<Pair<Int, Int>?>(null) }
    var score by remember { mutableIntStateOf(0) }
    var movesUsed by remember { mutableIntStateOf(0) }
    var comboMessage by remember { mutableStateOf("Swap adjacent items to match 3 in a row!") }
    var isWon by remember { mutableStateOf(false) }

    fun checkAndClearMatches(currentGrid: MutableList<Int>): Int {
        val toClear = mutableSetOf<Int>()

        // Check horizontal
        for (r in 0 until rows) {
            for (c in 0 until cols - 2) {
                val idx = r * cols + c
                val t = currentGrid[idx]
                if (currentGrid[idx + 1] == t && currentGrid[idx + 2] == t) {
                    toClear.add(idx)
                    toClear.add(idx + 1)
                    toClear.add(idx + 2)
                }
            }
        }

        // Check vertical
        for (c in 0 until cols) {
            for (r in 0 until rows - 2) {
                val idx = r * cols + c
                val t = currentGrid[idx]
                if (currentGrid[(r + 1) * cols + c] == t && currentGrid[(r + 2) * cols + c] == t) {
                    toClear.add(idx)
                    toClear.add((r + 1) * cols + c)
                    toClear.add((r + 2) * cols + c)
                }
            }
        }

        if (toClear.isNotEmpty()) {
            for (idx in toClear) {
                currentGrid[idx] = (0..4).random() // refill
            }
            return toClear.size
        }
        return 0
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🍬 Tea Garden Match-3",
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Serif,
                        color = Ink
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = Ink)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        ElderlyFeedback.onTap(context)
                        grid = generateInitialBoard()
                        score = 0
                        movesUsed = 0
                        isWon = false
                        selectedPos = null
                        comboMessage = "Board reset. Match 3 items!"
                    }) {
                        Icon(Icons.Filled.Refresh, contentDescription = "Reset", tint = Ink)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Canvas)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header Score, Moves & Goal Status Card
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(3.dp, RoundedCornerShape(18.dp))
                    .border(2.5.dp, Ink, RoundedCornerShape(18.dp))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = comboMessage,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink,
                            lineHeight = 17.sp,
                            maxLines = 2
                        )
                        Text(
                            text = "Target: $targetScore Pts • Moves Left: ${(maxMoves - movesUsed).coerceAtLeast(0)}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Marigold
                        )
                    }
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (score >= targetScore) TeaGreen else Marigold,
                        modifier = Modifier
                            .shadow(2.dp, RoundedCornerShape(12.dp))
                            .border(1.5.dp, Ink, RoundedCornerShape(12.dp))
                    ) {
                        Text(
                            text = "Score: $score",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                }
            }

            // 5x5 Match Board
            Surface(
                shape = RoundedCornerShape(22.dp),
                color = Color.White,
                modifier = Modifier
                    .size(320.dp)
                    .shadow(5.dp, RoundedCornerShape(22.dp))
                    .border(3.5.dp, Ink, RoundedCornerShape(22.dp))
                    .padding(8.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    for (r in 0 until rows) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            for (c in 0 until cols) {
                                val idx = r * cols + c
                                val tileType = grid[idx]
                                val tile = TILE_TYPES[tileType]
                                val isSelected = selectedPos == Pair(r, c)

                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = if (isSelected) Color(0xFFFEF08A) else Color(0xFFF8F5EE),
                                    modifier = Modifier
                                        .weight(1f)
                                        .fillMaxHeight()
                                        .shadow(if (isSelected) 4.dp else 1.5.dp, RoundedCornerShape(14.dp))
                                        .border(
                                            width = if (isSelected) 3.5.dp else 2.dp,
                                            color = if (isSelected) Color.Black else Ink.copy(alpha = 0.8f),
                                            shape = RoundedCornerShape(14.dp)
                                        )
                                        .semantics { contentDescription = tile.emoji }
                                        .clickable {
                                            ElderlyFeedback.onTap(context)
                                            if (selectedPos == null) {
                                                selectedPos = Pair(r, c)
                                            } else {
                                                val (pr, pc) = selectedPos ?: return@clickable
                                                val isAdjacent = (abs(pr - r) + abs(pc - c)) == 1
                                                if (isAdjacent) {
                                                    val newGrid = grid.toMutableList()
                                                    val pIdx = pr * cols + pc
                                                    val temp = newGrid[pIdx]
                                                    newGrid[pIdx] = newGrid[idx]
                                                    newGrid[idx] = temp

                                                    val matchedCount = checkAndClearMatches(newGrid)
                                                    if (matchedCount > 0) {
                                                        grid = newGrid
                                                        score += matchedCount * 30
                                                        movesUsed++
                                                        ElderlyFeedback.onSuccess(context)
                                                        comboMessage = "🎉 Sweet Match! +${matchedCount * 30} Points!"
                                                        LocalizationManager.speak("Great match!")
                                                        if (score >= targetScore && !isWon) {
                                                            isWon = true
                                                            LocalizationManager.speak("Congratulations! You reached the target score!")
                                                        }
                                                    } else {
                                                        ElderlyFeedback.onError(context)
                                                        comboMessage = "No 3-in-a-row formed, try another pair!"
                                                    }
                                                }
                                                selectedPos = null
                                            }
                                        }
                                ) {
                                    Box(
                                        contentAlignment = Alignment.Center,
                                        modifier = Modifier.fillMaxSize()
                                    ) {
                                        Text(
                                            text = tile.emoji,
                                            fontSize = if (isSelected) 32.sp else 28.sp
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Bottom Section: Victory Celebration or Audio Assistance
            if (isWon) {
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = Color(0xFFDCFCE7),
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(18.dp))
                        .border(2.5.dp, TeaGreen, RoundedCornerShape(18.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "🎉 Level Target Achieved!", fontSize = 18.sp, fontWeight = FontWeight.Black, color = TeaGreen)
                        Text(text = "You scored $score points in $movesUsed moves! +100 Cognitive Points", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Ink)
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = TeaGreen,
                            modifier = Modifier
                                .border(1.5.dp, Ink, RoundedCornerShape(12.dp))
                                .semantics { contentDescription = "Next Level" }
                                .clickable {
                                    ElderlyFeedback.onTap(context)
                                    grid = generateInitialBoard()
                                    score = 0
                                    movesUsed = 0
                                    isWon = false
                                    comboMessage = "New Garden Level! Match 3 items!"
                                }
                        ) {
                            Text(
                                text = "Next Level ➔",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(2.dp, RoundedCornerShape(16.dp))
                        .border(2.dp, Ink, RoundedCornerShape(16.dp))
                        .semantics { contentDescription = "Listen to how to play Match 3" }
                        .clickable {
                            ElderlyFeedback.onTap(context)
                            LocalizationManager.speak("Tap one flower, then tap an adjacent flower to swap them into 3 in a line.")
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Filled.VolumeUp, null, tint = TeaGreen, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Listen: How to Play Match-3",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink
                        )
                    }
                }
            }
        }
    }
}
