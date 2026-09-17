package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.theme.*

data class GameItem(
    val id: String,
    val emoji: String,
    val title: String,
    val description: String,
    val color: Color,
    val domain: String
)

val gamesList = listOf(
    GameItem("memory_road", "\uD83D\uDEE3\uFE0F", "Memory Road", "Find the landmarks", TeaGreen, "Memory"),
    GameItem("tea_garden", "\uD83C\uDF3F", "Tea Garden", "Pick tea leaves", Color(0xFF4CAF50), "Attention"),
    GameItem("market_visit", "\uD83C\uDFEA", "Market Visit", "Remember the items", MarketOrange, "Memory"),
    GameItem("temple_prayer", "\uD83D\uDE4F", "Temple Prayer", "Match the bells", TempleGold, "Calm"),
    GameItem("church_bell", "\uD83D\uDD14", "Church Bell", "Listen & repeat", ChurchBlue, "Attention"),
    GameItem("bamboo_craft", "\uD83C\uDF8B", "Bamboo Craft", "Build patterns", BridgeBrown, "Executive"),
    GameItem("auto_rickshaw", "\uD83D\uDEFA", "Auto Ride", "Navigate the route", AutoYellow, "Visuospatial"),
    GameItem("school_memories", "\uD83D\uDCDA", "School Days", "Recall lessons", SchoolPurple, "Language"),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GamesHubScreen(
    onGameClick: (String) -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Brain Games") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Green40,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(SoftGreen.copy(alpha = 0.3f))
                .padding(16.dp)
        ) {
            Text(
                text = "Choose a Game",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Each game trains a different part of your brain",
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
            Spacer(modifier = Modifier.height(16.dp))

            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(gamesList) { game ->
                    GameCard(
                        game = game,
                        onClick = { onGameClick(game.id) }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameCard(
    game: GameItem,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(160.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Emoji icon
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(game.color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = game.emoji, fontSize = 36.sp)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = game.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = game.domain,
                fontSize = 12.sp,
                color = game.color,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
