package com.cognicare.ui.games

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.cognicare.util.HapticUtil
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JigsawGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var selectedIndex by remember { mutableStateOf<Int?>(null) }
    // 2x2 or 3x3 tiles: let's use 3x3 (9 pieces: 0..8)
    var pieces by remember { mutableStateOf(listOf(1, 4, 0, 7, 2, 8, 3, 5, 6)) }
    var moves by remember { mutableIntStateOf(0) }
    var isSolved by remember { mutableStateOf(false) }

    fun checkSolved(current: List<Int>) {
        if (current == listOf(0, 1, 2, 3, 4, 5, 6, 7, 8)) {
            isSolved = true
            HapticUtil.vibrateSuccess(context)
            LocalizationManager.speak("Wonderful! You solved the family memory puzzle!")
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🧩 " + LocalizationManager.t("games.jigsaw.title"),
                        fontWeight = FontWeight.Black,
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
                        pieces = listOf(0, 1, 2, 3, 4, 5, 6, 7, 8).shuffled()
                        moves = 0
                        isSolved = false
                        selectedIndex = null
                    }) {
                        Icon(Icons.Filled.Refresh, contentDescription = "Shuffle", tint = Ink)
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
            // Instructions banner
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(3.dp, RoundedCornerShape(16.dp))
                    .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFFEF3C7))
                            .border(2.dp, Ink, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "💡", fontSize = 24.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Tap two pieces to swap them",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink
                        )
                        Text(
                            text = "Arrange the family photo in the right order (1 to 9).",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF4A4036)
                        )
                    }
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = TeaGreen,
                        modifier = Modifier
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                            .clickable {
                                LocalizationManager.speak("Tap two pieces to swap them into the right places.")
                            }
                    ) {
                        Icon(
                            imageVector = Icons.Filled.VolumeUp,
                            contentDescription = "Read",
                            tint = Color.White,
                            modifier = Modifier.padding(8.dp)
                        )
                    }
                }
            }

            // 3x3 Puzzle Board
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White,
                modifier = Modifier
                    .size(320.dp)
                    .shadow(5.dp, RoundedCornerShape(20.dp))
                    .border(3.5.dp, Ink, RoundedCornerShape(20.dp))
                    .padding(8.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    for (row in 0..2) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            for (col in 0..2) {
                                val index = row * 3 + col
                                val pieceValue = pieces[index]
                                val isSelected = selectedIndex == index
                                val isCorrect = pieceValue == index

                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = when {
                                        isSelected -> Marigold
                                        isCorrect -> Color(0xFFDCFCE7)
                                        else -> Color(0xFFFFFBEB)
                                    },
                                    modifier = Modifier
                                        .weight(1f)
                                        .fillMaxHeight()
                                        .shadow(2.dp, RoundedCornerShape(12.dp))
                                        .border(
                                            width = if (isSelected) 3.dp else 2.dp,
                                            color = if (isSelected) Color.Black else Ink,
                                            shape = RoundedCornerShape(12.dp)
                                        )
                                        .clickable {
                                            HapticUtil.vibrateTap(context)
                                            if (selectedIndex == null) {
                                                selectedIndex = index
                                            } else {
                                                val prev = selectedIndex!!
                                                if (prev != index) {
                                                    val newPieces = pieces.toMutableList()
                                                    val temp = newPieces[prev]
                                                    newPieces[prev] = newPieces[index]
                                                    newPieces[index] = temp
                                                    pieces = newPieces
                                                    moves++
                                                    checkSolved(newPieces)
                                                }
                                                selectedIndex = null
                                            }
                                        }
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                            val emojiList = listOf("🌸", "👵", "🏡", "🌿", "👨‍👩‍👦", "🫖", "🏞️", "👦", "❤️")
                                            Text(text = emojiList[pieceValue], fontSize = 28.sp)
                                            Text(
                                                text = "${pieceValue + 1}",
                                                fontSize = 14.sp,
                                                fontWeight = FontWeight.Black,
                                                color = if (isSelected) Color.White else Ink
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Stats & Solved Banner
            if (isSolved) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFDCFCE7),
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(3.dp, RoundedCornerShape(16.dp))
                        .border(2.5.dp, TeaGreen, RoundedCornerShape(16.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(text = "🎉", fontSize = 32.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Puzzle Completed!",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = TeaGreen
                            )
                            Text(
                                text = "Solved in $moves moves • +100 Memory Points",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Ink
                            )
                        }
                    }
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color.White,
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(2.dp, RoundedCornerShape(14.dp))
                        .border(2.dp, Ink, RoundedCornerShape(14.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Moves: $moves",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink
                        )
                        Text(
                            text = "Matches: ${pieces.filterIndexed { i, v -> i == v }.size} / 9",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = TeaGreen
                        )
                    }
                }
            }
        }
    }
}
