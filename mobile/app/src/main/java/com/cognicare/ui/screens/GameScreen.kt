package com.cognicare.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.games.*
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)

@Composable
fun GameScreen(
    gameId: String,
    onBack: () -> Unit
) {
    when (gameId) {
        // Memory & Reminiscence
        "memory_road" -> MemoryRoadGame(onBack = onBack)
        "market_visit" -> MarketVisitGame(onBack = onBack)
        "jigsaw" -> JigsawGame(onBack = onBack)

        // Attention & Working Memory
        "tea_garden", "tea_harvest" -> TeaGardenGame(onBack = onBack)
        "church_bell" -> ChurchBellGame(onBack = onBack)
        "monastery_bell" -> MonasteryBellGame(onBack = onBack)

        // Executive Function & IADL
        "bamboo_craft" -> BambooCraftGame(onBack = onBack)
        "heritage_kitchen" -> HeritageKitchenGame(onBack = onBack)
        "bazaar_buddies" -> BazaarBuddiesGame(onBack = onBack)

        // Visuospatial & Movement
        "auto_rickshaw" -> AutoRickshawGame(onBack = onBack)
        "lotus_painter" -> LotusPainterGame(onBack = onBack)

        // Calm, Sensory & Rhythmic Entrainment
        "temple_prayer" -> TemplePrayerGame(onBack = onBack)
        "river_lanterns" -> RiverLanternsGame(onBack = onBack)
        "bihu_dhol" -> BihuDholGame(onBack = onBack)

        // Language & Lessons
        "school_memories", "school_days" -> SchoolDaysGame(onBack = onBack)

        else -> ClinicalGamePreview(gameId = gameId, onBack = onBack)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ClinicalGamePreview(gameId: String, onBack: () -> Unit) {
    val game = GameRegistry.getGameById(gameId)
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "${game?.emoji ?: "✨"} ${game?.title ?: gameId}",
                        fontWeight = FontWeight.Black,
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
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Canvas)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(4.dp, RoundedCornerShape(24.dp))
                    .border(3.dp, Ink, RoundedCornerShape(24.dp))
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = game?.emoji ?: "🎯", fontSize = 72.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = game?.title ?: gameId,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = Ink
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = game?.description ?: "Clinical Cognitive Exercise",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF4A4036)
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = TeaGreen,
                        modifier = Modifier
                            .shadow(2.dp, RoundedCornerShape(12.dp))
                            .border(2.dp, Ink, RoundedCornerShape(12.dp))
                    ) {
                        Text(
                            text = "CDTx Clinical Trial Exercise",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }
    }
}
