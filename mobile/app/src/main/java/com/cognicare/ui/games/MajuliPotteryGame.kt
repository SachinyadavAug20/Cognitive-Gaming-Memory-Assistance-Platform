package com.cognicare.ui.games

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

private val Ink = Color(0xFF16120E)
private val TextSecondary = Color(0xFF6B7280)

private data class PotPiece(val emoji: String, val name: String, val order: Int, val color: Color)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MajuliPotteryGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var targetPieces by remember { mutableStateOf(listOf<PotPiece>()) }
    var playerSelected by remember { mutableStateOf(listOf<PotPiece>()) }
    var availablePieces by remember { mutableStateOf(listOf<PotPiece>()) }
    var showResult by remember { mutableStateOf(false) }
    var mistakes by remember { mutableIntStateOf(0) }

    val allPieces = listOf(
        PotPiece("\uD83C\uDFFA", "Base", 0, BridgeBrown),
        PotPiece("\uD83E\uDFBA", "Body", 1, MarketOrange),
        PotPiece("\uD83C\uDFFA", "Neck", 2, TempleGold),
        PotPiece("\uD83C\uDFFA", "Rim", 3, Color(0xFFE91E63)),
        PotPiece("\u2728", "Pattern", 4, Color(0xFF9C27B0)),
        PotPiece("\uD83C\uDF3F", "Handle", 5, TeaGreen)
    )

    fun setupLevel() {
        val count = (3 + level).coerceAtMost(6)
        targetPieces = allPieces.take(count)
        availablePieces = targetPieces.shuffled()
        playerSelected = emptyList()
        mistakes = 0
        showResult = false
    }

    LaunchedEffect(level) { setupLevel() }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("Majuli Pottery", color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BridgeBrown)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).background(Color(0xFFFAF7F2)).padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Level $level", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                Text("Score: $score", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                Text("Step ${playerSelected.size + 1}/${targetPieces.size}", fontSize = 16.sp, color = TextSecondary)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Target pattern
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Assemble the pot in order:", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        targetPieces.forEachIndexed { idx, piece ->
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(piece.color.copy(alpha = 0.3f))
                                    .border(2.dp, Ink, RoundedCornerShape(6.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("${idx + 1}", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Bottom to top order", fontSize = 12.sp, color = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Player's assembled pot
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Your pot:", fontSize = 16.sp, fontWeight = FontWeight.Medium, color = BridgeBrown)
                    Spacer(modifier = Modifier.height(8.dp))
                    // Stack vertically (bottom to top)
                    if (playerSelected.isNotEmpty()) {
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            playerSelected.reversed().forEach { piece ->
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(horizontal = 32.dp),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(piece.emoji, fontSize = 24.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(piece.name, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = piece.color)
                                }
                            }
                        }
                    } else {
                        Text("Tap pieces to add", fontSize = 14.sp, color = TextSecondary)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Available pieces to select
            Text("Select piece #${playerSelected.size + 1}:", fontSize = 16.sp, fontWeight = FontWeight.Medium, color = BridgeBrown)
            Spacer(modifier = Modifier.height(8.dp))

            for (row in 0..1) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    for (col in 0..2) {
                        val idx = row * 3 + col
                        if (idx < availablePieces.size) {
                            val piece = availablePieces[idx]
                            val isAlreadySelected = piece in playerSelected
                            Box(
                                modifier = Modifier
                                    .size(80.dp)
                                    .padding(4.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isAlreadySelected) Color.LightGray else Color.White)
                                    .border(2.dp, if (isAlreadySelected) Color.LightGray else Ink, RoundedCornerShape(12.dp))
                                    .clickable {
                                        ElderlyFeedback.onTap(context)
                                        if (!isAlreadySelected && !showResult) {
                                            val expectedIdx = playerSelected.size
                                            if (idx == targetPieces.indexOfFirst { it.order == expectedIdx }) {
                                                ElderlyFeedback.onSuccess(context)
                                                playerSelected = playerSelected + piece
                                                score += 15 * level
                                                if (playerSelected.size >= targetPieces.size) {
                                                    ElderlyFeedback.onSuccess(context)
                                                    showResult = true
                                                }
                                            } else {
                                                ElderlyFeedback.onError(context)
                                                mistakes++
                                                score = (score - 5).coerceAtLeast(0)
                                            }
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(piece.emoji, fontSize = 28.sp)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(piece.name, fontSize = 14.sp, color = if (isAlreadySelected) Color.LightGray else Color.DarkGray)
                                }
                            }
                        }
                    }
                }
            }
        }

        if (showResult) {
            AlertDialog(
                onDismissRequest = { },
                title = { Text("Pot Complete!", fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center) },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83C\uDFFA", fontSize = 60.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Mistakes: $mistakes", fontSize = 18.sp)
                        Text("Score: $score", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                    }
                },
                confirmButton = {
                    Button(onClick = { ElderlyFeedback.onTap(context); level++; showResult = false }, modifier = Modifier.fillMaxWidth()) {
                        Text("Next Level", fontSize = 18.sp)
                    }
                }
            )
        }
    }
}
