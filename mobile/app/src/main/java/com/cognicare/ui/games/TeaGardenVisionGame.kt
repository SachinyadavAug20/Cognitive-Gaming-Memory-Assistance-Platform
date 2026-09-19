package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
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
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import kotlin.math.abs

private val Ink = Color(0xFF16120E)
private val CanvasBg = Color(0xFFFAF7F2)
private val TeaDeep = Color(0xFF14532D)
private val WarmSurface = Color(0xFFFFFDF9)

private data class TeaLeaf(val x: Float, val y: Float, val size: Int, var harvested: Boolean = false)

private data class GestureTask(val emoji: String, val name: String, val direction: String, val hint: String)

private val gestureTasks = listOf(
    GestureTask("\uD83C\uDF3F", "Pick Leaf Up", "up", "Swipe up to pick the leaf"),
    GestureTask("\uD83C\uDF3F", "Pick Leaf Down", "down", "Swipe down to pluck gently"),
    GestureTask("\uD83C\uDF3F", "Pick Leaf Left", "left", "Swipe left to harvest"),
    GestureTask("\uD83C\uDF3F", "Pick Leaf Right", "right", "Swipe right to collect"),
    GestureTask("\uD83C\uDF3F", "Shake Basket", "shake", "Shake gesture to gather leaves")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeaGardenVisionGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var currentTask by remember { mutableIntStateOf(0) }
    var leaves by remember { mutableStateOf(listOf<TeaLeaf>()) }
    var harvestedCount by remember { mutableIntStateOf(0) }
    var showResult by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }
    var lastDirection by remember { mutableStateOf("") }
    var gestureStarted by remember { mutableStateOf(false) }
    var startDragX by remember { mutableFloatStateOf(0f) }
    var startDragY by remember { mutableFloatStateOf(0f) }

    val task = gestureTasks[currentTask % gestureTasks.size]

    fun generateLeaves() {
        leaves = (1..(5 + level * 2)).map { TeaLeaf((0.1f + Math.random() * 0.8f).toFloat(), (0.1f + Math.random() * 0.8f).toFloat(), (16 + (Math.random() * 12).toInt())) }
        harvestedCount = 0
    }

    LaunchedEffect(level) { generateLeaves() }

    fun checkGesture(direction: String) {
        lastDirection = direction
        if (direction == task.direction || (task.direction == "shake" && (direction == "left" || direction == "right"))) {
            isCorrect = true
            val harvested = leaves.filter { !it.harvested }.take(1)
            if (harvested.isNotEmpty()) {
                leaves = leaves.map { l -> if (l == harvested.first()) l.copy(harvested = true) else l }
                harvestedCount++
            }
            score += 20
            ElderlyFeedback.onSuccess(context)
            LocalizationManager.speak("Beautiful harvest!")
            if (harvestedCount >= (3 + level)) {
                level++
                LocalizationManager.speak("Garden level $level!")
                generateLeaves()
            }
        } else {
            isCorrect = false; showResult = true
            ElderlyFeedback.onError(context)
            LocalizationManager.speak("Try ${task.direction} direction!")
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("\uD83C\uDF3F Tea with Hands", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = TeaDeep)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Level: $level", fontSize = 12.sp, color = TeaDeep, fontWeight = FontWeight.Bold) }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) { Text("Harvested: $harvestedCount", fontSize = 14.sp, fontWeight = FontWeight.Black, color = TeaDeep) }
                }
            }
            Spacer(Modifier.height(8.dp))

            if (showResult) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(if (isCorrect) "\uD83C\uDF1F" else "\u274C", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(if (isCorrect) "Great Harvest!" else "Wrong Direction!", fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Spacer(Modifier.height(8.dp))
                        Text("Task: ${task.hint}", fontSize = 14.sp, color = TeaDeep, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { ElderlyFeedback.onTap(context); showResult = false; currentTask = (currentTask + 1) % gestureTasks.size; generateLeaves() }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Try Again", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { onBack() }, RoundedCornerShape(12.dp), TeaDeep) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                // Task instruction
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)), RoundedCornerShape(18.dp), Color(0xFFE8F5E9)) {
                    Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(task.emoji, fontSize = 36.sp)
                        Spacer(Modifier.height(4.dp))
                        Text(task.name, fontSize = 18.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = TeaDeep)
                        Text(task.hint, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Ink)
                    }
                }
                Spacer(Modifier.height(8.dp))

                // Garden area with gesture detection
                Surface(
                    Modifier.fillMaxWidth().weight(1f).shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)).pointerInput(Unit) {
                        detectDragGestures(onDragStart = { offset -> startDragX = offset.x; startDragY = offset.y; gestureStarted = true }, onDragEnd = {
                            gestureStarted = false
                        }, onDragCancel = { gestureStarted = false }, onDrag = { change, dragAmount ->
                            change.consume()
                            if (abs(dragAmount.x) > 5f || abs(dragAmount.y) > 5f) {
                                val dir = if (abs(dragAmount.x) > abs(dragAmount.y)) { if (dragAmount.x > 0) "right" else "left" } else { if (dragAmount.y > 0) "down" else "up" }
                                checkGesture(dir)
                            }
                        })
                    },
                    RoundedCornerShape(18.dp), Color(0xFFC8E6C9)
                ) {
                    Box(Modifier.fillMaxSize()) {
                        leaves.forEach { leaf ->
                            if (!leaf.harvested) {
                                Surface(shape = RoundedCornerShape(50), color = Color(0xFF4CAF50).copy(alpha = 0.7f), modifier = Modifier.padding(0.dp).offset(x = (leaf.x * 300).dp, y = (leaf.y * 400).dp).size(leaf.size.dp).border(1.5.dp, TeaDeep, RoundedCornerShape(50))) {
                                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("\uD83C\uDF3F", fontSize = (leaf.size / 2).sp) }
                                }
                            }
                        }
                        if (harvestedCount > 0) {
                            Text("Harvested: $harvestedCount", fontSize = 14.sp, fontWeight = FontWeight.Black, color = TeaDeep, modifier = Modifier.align(Alignment.BottomEnd).padding(8.dp))
                        }
                        if (!gestureStarted) {
                            Text("Swipe to harvest!", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TeaDeep, modifier = Modifier.align(Alignment.TopCenter).padding(8.dp))
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                // Direction buttons as fallback
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("\u2B06\uFE0F" to "up", "\u2B07\uFE0F" to "down", "\u2B05\uFE0F" to "left", "\u27A1\uFE0F" to "right").forEach { (icon, dir) ->
                        Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { checkGesture(dir) }, RoundedCornerShape(12.dp), Color.White) {
                            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(icon, fontSize = 20.sp) }
                        }
                    }
                }
            }
        }
    }
}
