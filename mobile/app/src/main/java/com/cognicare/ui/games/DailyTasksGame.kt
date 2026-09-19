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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val CanvasBg = Color(0xFFFAF7F2)
private val TeaOrange = Color(0xFFC2410C)
private val WarmSurface = Color(0xFFFFFDF9)

private data class TeaStep(val step: Int, val instruction: String, val emoji: String, val options: List<String>, val correct: String)

private val teaSteps = listOf(
    TeaStep(1, "First, what do you need?", "\uD83C\uDF75", listOf("Water", "Milk", "Sugar", "Tea leaves"), "Water"),
    TeaStep(2, "Where do you put the water?", "\uD83D\uDD2C", listOf("Cup", "Kettle", "Plate", "Bowl"), "Kettle"),
    TeaStep(3, "What do you add to boiling water?", "\uD83C\uDF3F", listOf("Rice", "Tea leaves", "Bread", "Salt"), "Tea leaves"),
    TeaStep(4, "What do you pour into the cup?", "\u2615", listOf("Raw water", "Black tea", "Milk tea", "Cold tea"), "Milk tea"),
    TeaStep(5, "Final touch before serving?", "\u2728", listOf("Ice", "Sugar/honey", "Oil", "Salt"), "Sugar/honey")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DailyTasksGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(0) }
    var currentStep by remember { mutableIntStateOf(0) }
    var showResult by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }
    var completedSteps by remember { mutableIntStateOf(0) }

    val step = teaSteps[currentStep % teaSteps.size]

    fun checkAnswer(answer: String) {
        if (answer == step.correct) {
            ElderlyFeedback.onSuccess(context)
            LocalizationManager.speak("Correct! ${step.correct}")
            completedSteps++
            if (currentStep < teaSteps.size - 1) {
                currentStep++
            } else {
                score += 50 * (level + 1)
                isCorrect = true; showResult = true
                LocalizationManager.speak("Tea is ready! Great job!")
            }
        } else {
            ElderlyFeedback.onError(context)
            LocalizationManager.speak("Not quite. Try again!")
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("\uD83C\uDF75 Making Tea", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = TeaOrange)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Step ${completedSteps + 1}/${teaSteps.size}", fontSize = 12.sp, color = TeaOrange, fontWeight = FontWeight.Bold) }
                }
            }
            Spacer(Modifier.height(8.dp))

            // Progress bar
            Surface(Modifier.fillMaxWidth().height(8.dp).shadow(1.dp, RoundedCornerShape(4.dp)).border(1.dp, Ink, RoundedCornerShape(4.dp)), RoundedCornerShape(4.dp), Color(0xFFEFEBE9)) {
                Surface(Modifier.fillMaxWidth(fraction = completedSteps.toFloat() / teaSteps.size).fillMaxHeight(), RoundedCornerShape(4.dp), TeaOrange) {}
            }
            Spacer(Modifier.height(12.dp))

            if (showResult) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83C\uDF75", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text("Tea is Ready!", fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Text("Enjoy your warm cup of tea!", fontSize = 14.sp, color = TeaOrange, fontWeight = FontWeight.Medium)
                        Spacer(Modifier.height(16.dp))
                        Surface(shape = RoundedCornerShape(12.dp), color = Color(0xFFFBE9E7), modifier = Modifier.border(1.5.dp, TeaOrange, RoundedCornerShape(12.dp))) {
                            Text("+${50 * (level + 1)} Executive XP!", fontSize = 14.sp, fontWeight = FontWeight.Black, color = TeaOrange, modifier = Modifier.padding(12.dp))
                        }
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { ElderlyFeedback.onTap(context); level++; currentStep = 0; completedSteps = 0; showResult = false }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Brew Again \u27A1", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { ElderlyFeedback.onTap(context); onBack() }, RoundedCornerShape(12.dp), TeaOrange) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(step.emoji, fontSize = 42.sp)
                        Spacer(Modifier.height(8.dp))
                        Text("Step ${step.step}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TeaOrange)
                        Text(step.instruction, fontSize = 18.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink, textAlign = TextAlign.Center)
                    }
                }
                Spacer(Modifier.height(16.dp))
                Text("Choose the correct answer:", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TeaOrange, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
                Spacer(Modifier.height(8.dp))
                step.options.forEach { option ->
                    Surface(shape = RoundedCornerShape(14.dp), color = Color.White, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).shadow(2.dp, RoundedCornerShape(14.dp)).border(2.dp, Ink, RoundedCornerShape(14.dp)).clickable { ElderlyFeedback.onTap(context); checkAnswer(option) }) {
                        Text(option, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Ink, modifier = Modifier.padding(14.dp), textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}
