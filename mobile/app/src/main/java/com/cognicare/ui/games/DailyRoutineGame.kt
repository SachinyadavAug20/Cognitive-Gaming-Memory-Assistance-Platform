package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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

private val Ink = Color(0xFF16120E)
private val TextSecondary = Color(0xFF6B7280)
private val CanvasBg = Color(0xFFFAF7F2)
private val RoutineBrown = Color(0xFF4E342E)
private val WarmSurface = Color(0xFFFFFDF9)

private data class RoutineActivity(val emoji: String, val name: String)

private val routines = listOf(
    listOf(RoutineActivity("\uD83C\uDF1F", "Wake Up"), RoutineActivity("\uD83D\uDCBF", "Brush Teeth"), RoutineActivity("\uD83D\uDEBF", "Take Bath"), RoutineActivity("\uD83C\uDF5A", "Eat Breakfast"), RoutineActivity("\u2615", "Drink Tea")),
    listOf(RoutineActivity("\u23F0", "Morning Walk"), RoutineActivity("\uD83D\uDCD6", "Read Book"), RoutineActivity("\uD83C\uDF73", "Cook Lunch"), RoutineActivity("\uD83D\uDCC4", "Write Letters"), RoutineActivity("\uD83C\uDF19", "Evening Prayer")),
    listOf(RoutineActivity("\uD83C\uDF24\uFE0F", "Sunrise Meditation"), RoutineActivity("\uD83C\uDF3F", "Garden Work"), RoutineActivity("\uD83D\uDCAC", "Chat with Family"), RoutineActivity("\uD83C\uDFB5", "Listen to Radio"), RoutineActivity("\uD83D\uDE1C", "Sleep"))
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DailyRoutineGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(0) }
    var userOrder by remember { mutableStateOf(listOf<RoutineActivity>()) }
    var showResult by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }

    val currentRoutine = routines[level % routines.size]
    val availableActivities = currentRoutine.filter { it !in userOrder }

    fun checkOrder() {
        isCorrect = userOrder == currentRoutine
        showResult = true
        if (isCorrect) { score += 30 * (level + 1); ElderlyFeedback.onSuccess(context); LocalizationManager.speak("Perfect morning routine!") }
        else { ElderlyFeedback.onError(context); LocalizationManager.speak("Not quite right. Let's try again.") }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("\uD83D\uDD50 Daily Routine", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = RoutineBrown)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Routine ${level + 1}", fontSize = 12.sp, color = RoutineBrown, fontWeight = FontWeight.Bold) }
                    Text("${userOrder.size}/${currentRoutine.size}", fontSize = 16.sp, fontWeight = FontWeight.Black, color = RoutineBrown)
                }
            }
            Spacer(Modifier.height(8.dp))

            if (showResult) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(if (isCorrect) "\u2705" else "\u274C", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(if (isCorrect) "Routine Perfect!" else "Try Again!", fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Spacer(Modifier.height(16.dp))
                        Surface(shape = RoundedCornerShape(12.dp), color = if (isCorrect) Color(0xFFEFEBE9) else Color(0xFFFCE4EC), modifier = Modifier.border(1.5.dp, RoutineBrown, RoundedCornerShape(12.dp))) {
                            Text(if (isCorrect) "+${30 * (level + 1)} Executive XP!" else "Arrange activities in the right order.", fontSize = 13.sp, fontWeight = FontWeight.Black, color = RoutineBrown, modifier = Modifier.padding(12.dp))
                        }
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { ElderlyFeedback.onTap(context); level = (level + 1) % routines.size; userOrder = listOf(); showResult = false }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Next \u27A1", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { ElderlyFeedback.onTap(context); onBack() }, RoundedCornerShape(12.dp), RoutineBrown) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                // Your order
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                    Column(Modifier.padding(12.dp)) {
                        Text("Your order:", fontSize = 13.sp, fontWeight = FontWeight.Black, color = RoutineBrown)
                        Spacer(Modifier.height(6.dp))
                        if (userOrder.isEmpty()) {
                            Text("Tap activities below to add them in order", fontSize = 12.sp, color = TextSecondary, modifier = Modifier.padding(8.dp))
                        } else {
                            userOrder.forEachIndexed { idx, act ->
                                Surface(shape = RoundedCornerShape(10.dp), color = Color(0xFFEFEBE9), modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp).shadow(1.dp, RoundedCornerShape(10.dp)).border(1.5.dp, Ink, RoundedCornerShape(10.dp)).clickable {
                                    ElderlyFeedback.onTap(context)
                                    userOrder = userOrder.toMutableList().also { it.removeAt(idx) }
                                }) {
                                    Row(Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Text("${idx + 1}.", fontSize = 14.sp, fontWeight = FontWeight.Black, color = RoutineBrown, modifier = Modifier.width(24.dp))
                                        Text(act.emoji, fontSize = 20.sp)
                                        Spacer(Modifier.width(8.dp))
                                        Text(act.name, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Ink)
                                        Spacer(Modifier.weight(1f))
                                        Text("\u2716", fontSize = 14.sp, color = Color(0xFFD32F2F))
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(8.dp))

                if (userOrder.size == currentRoutine.size) {
                    Surface(Modifier.fillMaxWidth().height(52.dp).shadow(3.dp, RoundedCornerShape(14.dp)).border(2.dp, Ink, RoundedCornerShape(14.dp)).clickable { ElderlyFeedback.onTap(context); checkOrder() }, RoundedCornerShape(14.dp), RoutineBrown) {
                        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("CHECK ORDER \u2714", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color.White) }
                    }
                } else {
                    Text("Tap an activity to add it (step ${userOrder.size + 1} of ${currentRoutine.size})", fontSize = 12.sp, color = TextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center, modifier = Modifier.fillMaxWidth())
                }

                Spacer(Modifier.height(8.dp))

                // Available activities
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), Color(0xFFEFEBE9)) {
                    Column(Modifier.padding(12.dp)) {
                        Text("Available activities:", fontSize = 13.sp, fontWeight = FontWeight.Black, color = RoutineBrown)
                        Spacer(Modifier.height(6.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            availableActivities.forEach { act ->
                                Surface(shape = RoundedCornerShape(12.dp), color = Color.White, modifier = Modifier.weight(1f).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable {
                                    ElderlyFeedback.onTap(context)
                                    userOrder = userOrder + act
                                    LocalizationManager.speak(act.name)
                                    if (userOrder.size == currentRoutine.size) { checkOrder() }
                                }) {
                                    Column(Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(act.emoji, fontSize = 26.sp)
                                        Spacer(Modifier.height(4.dp))
                                        Text(act.name, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Ink, maxLines = 1)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
