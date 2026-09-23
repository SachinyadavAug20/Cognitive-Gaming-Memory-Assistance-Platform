package com.cognicare.ui.games

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val CanvasBg = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val NewsPaperBg = Color(0xFFFFFBEB)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DainikNewspaperGame(onBack: () -> Unit) {
    val context = LocalContext.current

    // Initial 4x4 Sudoku (0 = empty)
    val initialGrid = remember {
        listOf(
            listOf(1, 0, 3, 0),
            listOf(0, 0, 0, 2),
            listOf(3, 0, 0, 0),
            listOf(0, 4, 0, 1)
        )
    }

    val solution = remember {
        listOf(
            listOf(1, 2, 3, 4),
            listOf(4, 3, 1, 2),
            listOf(3, 1, 2, 4),
            listOf(2, 4, 4, 1)
        )
    }

    var grid by remember {
        mutableStateOf(initialGrid.map { it.toMutableList() })
    }

    var selectedCell by remember { mutableStateOf<Pair<Int, Int>?>(null) }
    var isSolved by remember { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }

    fun checkSolved(currentGrid: List<List<Int>>): Boolean {
        for (r in 0..3) {
            for (c in 0..3) {
                if (currentGrid[r][c] != solution[r][c]) return false
            }
        }
        return true
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "📰 Dainik Newspaper Games",
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
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(CanvasBg)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Newspaper Masthead
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(3.dp, Ink, RoundedCornerShape(20.dp)),
                shape = RoundedCornerShape(20.dp),
                color = NewsPaperBg
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "DAINIK SATSANG SAMACHAR",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = TeaGreen,
                        letterSpacing = 2.sp
                    )
                    Text(
                        text = "The Morning Sudoku (দৈনিক সুডোকু)",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Serif,
                        color = Ink,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                    Text(
                        text = "Fill numbers 1, 2, 3, 4 without repetition. Zero rush.",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = InkSecondary,
                        textAlign = TextAlign.Center
                    )
                }
            }

            // 4x4 Grid Board
            Surface(
                modifier = Modifier
                    .border(3.dp, Ink, RoundedCornerShape(24.dp))
                    .padding(8.dp),
                shape = RoundedCornerShape(24.dp),
                color = Color.Black
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(6.dp)
                ) {
                    for (r in 0..3) {
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            for (c in 0..3) {
                                val isInitial = initialGrid[r][c] != 0
                                val isSelected = selectedCell?.first == r && selectedCell?.second == c
                                val value = grid[r][c]

                                Box(
                                    modifier = Modifier
                                        .size(64.dp)
                                        .background(
                                            when {
                                                isInitial -> Color(0xFFFEF3C7)
                                                isSelected -> Color(0xFFFDE68A)
                                                value != 0 -> Color.White
                                                else -> Color(0xFFF8FAFC)
                                            },
                                            shape = RoundedCornerShape(12.dp)
                                        )
                                        .border(
                                            width = if (isSelected) 3.dp else 1.5.dp,
                                            color = if (isSelected) TeaGreen else Ink,
                                            shape = RoundedCornerShape(12.dp)
                                        )
                                        .clickable(enabled = !isInitial && !isSolved) {
                                            ElderlyFeedback.onTap(context)
                                            selectedCell = Pair(r, c)
                                        },
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (value != 0) {
                                        Text(
                                            text = value.toString(),
                                            fontSize = 26.sp,
                                            fontWeight = FontWeight.Black,
                                            color = if (isInitial) Ink else TeaGreen
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Keypad & Hint
            if (!isSolved) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Tap a cell above, then tap a number:",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = InkSecondary
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        for (num in 1..4) {
                            Button(
                                onClick = {
                                    val cell = selectedCell
                                    if (cell != null) {
                                        val (r, c) = cell
                                        ElderlyFeedback.onTap(context)
                                        val newGrid = grid.map { it.toMutableList() }
                                        newGrid[r][c] = num
                                        grid = newGrid
                                        selectedCell = null

                                        if (checkSolved(newGrid)) {
                                            isSolved = true
                                            score += 50
                                            ElderlyFeedback.onSuccess(context)
                                        }
                                    }
                                },
                                shape = RoundedCornerShape(16.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                                modifier = Modifier
                                    .size(56.dp)
                                    .border(2.5.dp, Ink, RoundedCornerShape(16.dp)),
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Text(
                                    text = num.toString(),
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Ink
                                )
                            }
                        }
                    }

                    // Hint button
                    OutlinedButton(
                        onClick = {
                            ElderlyFeedback.onTap(context)
                            // Reveal first empty cell
                            for (r in 0..3) {
                                for (c in 0..3) {
                                    if (grid[r][c] == 0) {
                                        val newGrid = grid.map { it.toMutableList() }
                                        newGrid[r][c] = solution[r][c]
                                        grid = newGrid
                                        selectedCell = null
                                        if (checkSolved(newGrid)) {
                                            isSolved = true
                                            score += 50
                                            ElderlyFeedback.onSuccess(context)
                                        }
                                        return@OutlinedButton
                                    }
                                }
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .padding(top = 8.dp)
                            .border(2.dp, Ink, RoundedCornerShape(12.dp)),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color(0xFFFEF3C7))
                    ) {
                        Icon(Icons.Filled.Info, contentDescription = null, tint = Ink)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Hint (সহায়তা)",
                            fontWeight = FontWeight.Black,
                            color = Ink,
                            fontSize = 13.sp
                        )
                    }
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFFD1FAE5),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(3.dp, Ink, RoundedCornerShape(20.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Filled.CheckCircle,
                            contentDescription = null,
                            tint = TeaGreen,
                            modifier = Modifier.size(48.dp)
                        )
                        Text(
                            text = "Shabash! Sudoku Solved! 🌸",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Serif,
                            color = Ink
                        )
                        Text(
                            text = "You earned 50 points for working memory & concentration.",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = InkSecondary,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }
    }
}
