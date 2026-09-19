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
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import kotlinx.coroutines.delay

private val Ink = Color(0xFF16120E)
private val CanvasBg = Color(0xFFFAF7F2)
private val BridgeBrown = Color(0xFF33691E)
private val RootBrown = Color(0xFF5D4037)
private val WarmSurface = Color(0xFFFFFDF9)
private val PlankColor = Color(0xFF8D6E63)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RootBridgeGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var sequence by remember { mutableStateOf(listOf<Int>()) }
    var playerInput by remember { mutableStateOf(listOf<Int>()) }
    var phase by remember { mutableStateOf("watch") }
    var activePlank by remember { mutableIntStateOf(-1) }
    var showResult by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }

    val plankColors = listOf(Color(0xFF8D6E63), Color(0xFF6D4C41), Color(0xFFA1887F), Color(0xFF795548), Color(0xFF4E342E))

    fun generateSequence() {
        val len = (2 + level).coerceAtMost(7)
        sequence = List(len) { plankColors.indices.random() }
        playerInput = listOf(); phase = "watch"; showResult = false
    }

    LaunchedEffect(level) { generateSequence() }

    LaunchedEffect(phase) {
        if (phase == "watch") {
            delay(500)
            sequence.forEachIndexed { idx, ci ->
                activePlank = ci; delay(600); activePlank = -1; delay(200)
            }
            delay(300); phase = "input"
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("\uD83C\uDF33 Root Bridge (Cross)", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BridgeBrown)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Level: $level", fontSize = 12.sp, color = BridgeBrown, fontWeight = FontWeight.Bold) }
                    Text(if (phase == "watch") "Watch the planks!" else "Tap the sequence!", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = BridgeBrown)
                }
            }
            Spacer(Modifier.height(12.dp))

            if (showResult) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(if (isCorrect) "\uD83C\uDF06" else "\u274C", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(if (isCorrect) "Bridge Crossed!" else "Roots Tangled!", fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Spacer(Modifier.height(16.dp))
                        Surface(shape = RoundedCornerShape(12.dp), color = if (isCorrect) Color(0xFFE8F5E9) else Color(0xFFFCE4EC), modifier = Modifier.border(1.5.dp, if (isCorrect) BridgeBrown else Color(0xFFD32F2F), RoundedCornerShape(12.dp))) {
                            Text(if (isCorrect) "+${level * 20} Visuospatial XP!" else "Try again! Watch carefully.", fontSize = 14.sp, fontWeight = FontWeight.Black, color = if (isCorrect) BridgeBrown else Color(0xFFD32F2F), modifier = Modifier.padding(12.dp))
                        }
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { ElderlyFeedback.onTap(context); if (isCorrect) level++ else { score = 0; level = 1 }; generateSequence() }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(if (isCorrect) "Next \u27A1" else "Retry \u27F3", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { onBack() }, RoundedCornerShape(12.dp), BridgeBrown) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                // Bridge visualization
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)), RoundedCornerShape(18.dp), Color(0xFF2E7D32)) {
                    Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83C\uDF32 Living Root Bridge", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Spacer(Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            sequence.forEachIndexed { idx, ci ->
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (activePlank == idx) Color(0xFFFFEB3B) else plankColors[ci],
                                    modifier = Modifier.size(40.dp).border(2.dp, Ink, RoundedCornerShape(8.dp))
                                ) { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("${idx + 1}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White) } }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(16.dp))
                Text("Tap the planks in order: ${playerInput.size}/${sequence.size}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = BridgeBrown, modifier = Modifier.fillMaxWidth(), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                Spacer(Modifier.height(12.dp))

                // Plank buttons
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)), RoundedCornerShape(18.dp), WarmSurface) {
                    Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        plankColors.forEachIndexed { idx, color ->
                            Surface(
                                shape = RoundedCornerShape(12.dp), color = color,
                                modifier = Modifier.weight(1f).height(56.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable {
                                    if (phase == "input") {
                                        ElderlyFeedback.onTap(context)
                                        val newInput = playerInput + idx
                                        playerInput = newInput
                                        if (newInput.last() == sequence[newInput.size - 1]) {
                                            if (newInput.size == sequence.size) {
                                                isCorrect = true; showResult = true; score += level * 20
                                                ElderlyFeedback.onSuccess(context)
                                                LocalizationManager.speak("Perfect! Bridge crossed!")
                                            }
                                        } else {
                                            isCorrect = false; showResult = true
                                            ElderlyFeedback.onError(context)
                                            LocalizationManager.speak("Wrong plank! The roots tangled.")
                                        }
                                    }
                                }
                            ) { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("${idx + 1}", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White) } }
                        }
                    }
                }
            }
        }
    }
}
