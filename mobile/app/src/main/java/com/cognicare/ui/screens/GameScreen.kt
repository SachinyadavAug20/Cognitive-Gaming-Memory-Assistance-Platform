package com.cognicare.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.games.*

@Composable
fun GameScreen(
    gameId: String,
    onBack: () -> Unit
) {
    when (gameId) {
        "memory_road" -> MemoryRoadGame(onBack = onBack)
        "tea_garden" -> TeaGardenGame(onBack = onBack)
        "market_visit" -> MarketVisitGame(onBack = onBack)
        "temple_prayer" -> TemplePrayerGame(onBack = onBack)
        "church_bell" -> ChurchBellGame(onBack = onBack)
        "bamboo_craft" -> BambooCraftGame(onBack = onBack)
        "auto_rickshaw" -> AutoRickshawGame(onBack = onBack)
        "school_memories", "school_days" -> SchoolDaysGame(onBack = onBack)
        else -> ComingSoonGame(gameId = gameId, onBack = onBack)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ComingSoonGame(gameId: String, onBack: () -> Unit) {
    val game = GameRegistry.getGameById(gameId)
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(game?.title ?: gameId) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(text = game?.emoji ?: "\uD83C\uDF1F", fontSize = 80.sp)
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = game?.title ?: gameId,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "Coming Soon", fontSize = 18.sp, color = Color.Gray)
            }
        }
    }
}
