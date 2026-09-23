package com.cognicare.ui.screens

import androidx.activity.compose.BackHandler
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.games.*
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)

@Composable
fun GameScreen(
    gameId: String,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    var showExitDialog by remember { mutableStateOf(false) }

    BackHandler {
        ElderlyFeedback.onTap(context)
        showExitDialog = true
    }

    if (showExitDialog) {
        AlertDialog(
            onDismissRequest = { showExitDialog = false },
            title = { Text("Leave Game?", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Ink) },
            text = { Text("Your progress in this game will be lost.", fontSize = 16.sp, color = Ink) },
            confirmButton = {
                TextButton(onClick = { showExitDialog = false; onBack() }) {
                    Text("Yes, Leave", fontSize = 16.sp, color = TeaGreen)
                }
            },
            dismissButton = {
                TextButton(onClick = { showExitDialog = false }) {
                    Text("Stay", fontSize = 16.sp, color = Ink)
                }
            },
            containerColor = Color.White
        )
    }

    when (gameId) {
        // Memory & Reminiscence
        "memory_road" -> MemoryRoadGame(onBack = onBack)
        "jigsaw" -> JigsawGame(onBack = onBack)
        "memory_detective" -> MemoryDetectiveGame(onBack = onBack)
        "dzukou_botanist" -> DzukouBotanistGame(onBack = onBack)
        "card_mastery", "card-mastery", "heritage_cards", "card_game" -> CardMasteryGame(onBack = onBack)
        "dainik_newspaper", "dainik-newspaper", "newspaper" -> DainikNewspaperGame(onBack = onBack)

        // Attention & Working Memory
        "tea_garden", "tea_harvest" -> TeaGardenGame(onBack = onBack)
        "church_bell" -> ChurchBellGame(onBack = onBack)
        "monastery_bell" -> MonasteryBellGame(onBack = onBack)
        "tea_garden_catch" -> TeaGardenCatchGame(onBack = onBack)
        "tuned_drum" -> TunedDrumGame(onBack = onBack)

        // Executive Function & IADL
        "market_visit", "bazaar_buddies" -> BazaarBuddiesGame(onBack = onBack)
        "bamboo_craft" -> BambooCraftGame(onBack = onBack)
        "heritage_kitchen" -> HeritageKitchenGame(onBack = onBack)
        "daily_routine" -> DailyRoutineGame(onBack = onBack)
        "sorting" -> SortingGame(onBack = onBack)
        "daily_tasks" -> DailyTasksGame(onBack = onBack)

        // Visuospatial & Movement
        "auto_rickshaw" -> AutoRickshawGame(onBack = onBack)
        "lotus_painter" -> LotusPainterGame(onBack = onBack)
        "brahmaputra_boat" -> BrahmaputraBoatGame(onBack = onBack)
        "wayfinding" -> WayfindingGame(onBack = onBack)
        "root_bridge" -> RootBridgeGame(onBack = onBack)

        // Calm, Sensory & Rhythmic
        "temple_prayer" -> TemplePrayerGame(onBack = onBack)
        "river_lanterns" -> RiverLanternsGame(onBack = onBack)
        "bihu_dhol" -> BihuDholGame(onBack = onBack)
        "rhythm_hills" -> RhythmHillsGame(onBack = onBack)
        "companion" -> CompanionGame(onBack = onBack)

        // Match-3
        "tea_garden_match" -> TeaGardenMatchGame(onBack = onBack)

        // 3D Spatial
        "majuli_walk" -> MajuliWalk3DGame(onBack = onBack)
        "day_in_my_world" -> DayInMyWorldGame(onBack = onBack)

        // Language & Lessons
        "school_memories", "school_days" -> SchoolDaysGame(onBack = onBack)
        "storybook" -> StorybookGame(onBack = onBack)

        // Webcam / Advanced
        "butterfly_sanctuary" -> ButterflySanctuaryGame(onBack = onBack)
        "hornbill_flight" -> HornbillFlightGame(onBack = onBack)
        "majuli_pottery" -> MajuliPotteryGame(onBack = onBack)
        "tea_garden_vision" -> TeaGardenVisionGame(onBack = onBack)

        // Reminiscence & Social
        "grandchild_chat" -> GrandchildChatGame(onBack = onBack)
        "timeline" -> TimelineGame(onBack = onBack)
        "radio" -> RadioGame(onBack = onBack)
        "ancestral_herbalist" -> AncestralHerbalistGame(onBack = onBack)
        "family_emotions" -> FamilyEmotionsGame(onBack = onBack)
        "alpana" -> AlpanaGame(onBack = onBack)
        "loom" -> LoomGame(onBack = onBack)

        else -> ClinicalGamePreview(gameId = gameId, onBack = onBack)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ClinicalGamePreview(gameId: String, onBack: () -> Unit) {
    val context = LocalContext.current
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
        },
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
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
                    Spacer(modifier = Modifier.height(16.dp))

                    var difficulty by remember { mutableStateOf("Gentle") }
                    var gameScore by remember { mutableIntStateOf(100) }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("Gentle", "Standard", "Advanced").forEach { mode ->
                            val isSelected = difficulty == mode
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) TeaGreen else Color(0xFFF3F4F6),
                                modifier = Modifier
                                    .weight(1f)
                                    .border(2.dp, Ink, RoundedCornerShape(10.dp))
                                    .clickable { difficulty = mode }
                            ) {
                                Box(
                                    modifier = Modifier.padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = mode,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Black,
                                        color = if (isSelected) Color.White else Ink
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                ElderlyFeedback.onTap(context)
                                LocalizationManager.speak("${game?.title ?: gameId}. ${game?.description ?: ""}. Difficulty: $difficulty.")
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFEF3C7)),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .border(2.dp, Ink, RoundedCornerShape(12.dp))
                        ) {
                            Text("🔊 Audio Guide", fontWeight = FontWeight.Black, color = Ink, fontSize = 13.sp)
                        }

                        Button(
                            onClick = {
                                ElderlyFeedback.onSuccess(context)
                                gameScore += 50
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = TeaGreen),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .border(2.dp, Ink, RoundedCornerShape(12.dp))
                        ) {
                            Text("🎮 Play (+50 pts)", fontWeight = FontWeight.Black, color = Color.White, fontSize = 13.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFE8F5E9),
                        modifier = Modifier.border(2.dp, Ink, RoundedCornerShape(12.dp))
                    ) {
                        Text(
                            text = "Score: $gameScore pts • Mode: $difficulty",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = TeaGreen,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }
    }
}
