package com.cognicare.ui.games

import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import kotlinx.coroutines.delay

private val Ink = Color(0xFF16120E)
private val TextSecondary = Color(0xFF6B7280)
private val CanvasBg = Color(0xFFFAF7F2)
private val HillBrown = Color(0xFFB45309)
private val WarmSurface = Color(0xFFFFFDF9)

private const val BASE_SPAWN_INTERVAL = 40
private const val SPAWN_INTERVAL_DECREMENT = 3
private const val MIN_SPAWN_INTERVAL = 15
private const val BASE_FALL_SPEED = 0.008f
private const val FALL_SPEED_INCREMENT = 0.001f
private const val BASE_POINTS = 10
private const val COMBO_MULTIPLIER = 2
private const val MAX_MISSES = 5

private data class Note(val color: Color, val lane: Int, var y: Float, var hit: Boolean = false)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RhythmHillsGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var combo by remember { mutableIntStateOf(0) }
    var maxCombo by remember { mutableIntStateOf(0) }
    var gameOver by remember { mutableStateOf(false) }
    var notes by remember { mutableStateOf(listOf<Note>()) }
    var misses by remember { mutableIntStateOf(0) }

    val laneColors = listOf(Color(0xFFE53935), Color(0xFF43A047), Color(0xFF1E88E5), Color(0xFFFFB300))
    val numLanes = 4
    val hitZoneY = 0.8f

    LaunchedEffect(level, gameOver) {
        var spawnTimer = 0
        val spawnInterval = (BASE_SPAWN_INTERVAL - level * SPAWN_INTERVAL_DECREMENT).coerceAtLeast(MIN_SPAWN_INTERVAL)
        while (!gameOver) {
            spawnTimer++
            if (spawnTimer >= spawnInterval) {
                spawnTimer = 0
                notes = notes + Note(laneColors[(0 until numLanes).random()], (0 until numLanes).random(), 0f)
            }
            notes = notes.map { it.copy(y = it.y + BASE_FALL_SPEED + level * FALL_SPEED_INCREMENT) }
            val missed = notes.filter { !it.hit && it.y > hitZoneY + 0.05f }
            if (missed.isNotEmpty()) { misses += missed.size; combo = 0; if (misses >= MAX_MISSES) gameOver = true }
            notes = notes.filter { it.y < 1.05f }
            delay(16L)
        }
    }

    fun tapLane(lane: Int) {
        ElderlyFeedback.onTap(context)
        val closest = notes.filter { it.lane == lane && !it.hit && it.y > hitZoneY - 0.08f && it.y < hitZoneY + 0.08f }
            .minByOrNull { kotlin.math.abs(it.y - hitZoneY) }
        if (closest != null) {
            notes = notes.map { if (it === closest) it.copy(hit = true) else it }
            combo++; if (combo > maxCombo) maxCombo = combo; score += BASE_POINTS + combo * COMBO_MULTIPLIER
            ElderlyFeedback.onSuccess(context)
            if (combo % 10 == 0) { level++; LocalizationManager.speak("Level $level!") }
        } else { misses++; combo = 0; if (misses >= MAX_MISSES) gameOver = true; ElderlyFeedback.onError(context) }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("\uD83C\uDFB5 Rhythm Hills", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = HillBrown)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Level: $level", fontSize = 12.sp, color = HillBrown, fontWeight = FontWeight.Bold) }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) { Text("Combo: $combo", fontSize = 14.sp, fontWeight = FontWeight.Black, color = HillBrown); Text("Misses: $misses/5", fontSize = 14.sp, color = if (misses >= 3) Color(0xFFD32F2F) else TextSecondary) }
                }
            }
            Spacer(Modifier.height(8.dp))

            if (gameOver) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\uD83C\uDFB5", fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text("Song Complete!", fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Text("Max Combo: $maxCombo | Score: $score", fontSize = 14.sp, color = HillBrown, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(16.dp))
                        Surface(shape = RoundedCornerShape(12.dp), color = Color(0xFFFFF8E1), modifier = Modifier.border(1.5.dp, HillBrown, RoundedCornerShape(12.dp))) {
                            Text("+$score Calm XP!", fontSize = 14.sp, fontWeight = FontWeight.Black, color = HillBrown, modifier = Modifier.padding(12.dp))
                        }
                        Spacer(Modifier.height(16.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).semantics { contentDescription = "Play again" }.clickable { ElderlyFeedback.onTap(context); score = 0; level = 1; combo = 0; misses = 0; gameOver = false; notes = listOf() }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Play Again \u27F3", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).semantics { contentDescription = "Done" }.clickable { ElderlyFeedback.onTap(context); onBack() }, RoundedCornerShape(12.dp), HillBrown) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                Surface(Modifier.weight(1f).fillMaxWidth().shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)), RoundedCornerShape(18.dp), Color(0xFF2D1B00)) {
                    Canvas(Modifier.fillMaxSize()) {
                        val w = size.width; val h = size.height; val laneW = w / numLanes
                        for (i in 0 until numLanes) drawLine(Color.White.copy(alpha = 0.1f), Offset(laneW * i, 0f), Offset(laneW * i, h), 1f)
                        val hitY = h * hitZoneY
                        drawLine(Color(0xFFFFEB3B).copy(alpha = 0.5f), Offset(0f, hitY), Offset(w, hitY), 4f)
                        notes.filter { !it.hit }.forEach { note ->
                            val x = laneW * note.lane + laneW / 2; val y = note.y * h
                            drawCircle(note.color.copy(alpha = 0.9f), radius = 20f, center = Offset(x, y))
                            drawCircle(Color.White.copy(alpha = 0.3f), radius = 12f, center = Offset(x, y))
                        }
                    }
                }
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    laneColors.forEachIndexed { idx, color ->
                        Surface(Modifier.weight(1f).height(64.dp).shadow(2.dp, RoundedCornerShape(14.dp)).border(2.5.dp, Ink, RoundedCornerShape(14.dp)).semantics { contentDescription = "Tap lane ${idx + 1}" }.clickable { tapLane(idx) }, RoundedCornerShape(14.dp), color) {
                            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("\u25CF", fontSize = 28.sp, color = Color.White) }
                        }
                    }
                }
                Spacer(Modifier.height(4.dp))
                Text("Tap as notes reach the line!", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = HillBrown, textAlign = androidx.compose.ui.text.style.TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }
        }
    }
}
