package com.cognicare.ui.games

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import com.cognicare.util.TiltSensor
import kotlinx.coroutines.delay

private val Ink = Color(0xFF16120E)
private val TextSecondary = Color(0xFF6B7280)
private val CanvasBg = Color(0xFFFAF7F2)
private val RiverBlue = Color(0xFF006064)
private val RiverLight = Color(0xFF00ACC1)
private val RockBrown = Color(0xFF4E342E)
private val LotusPink = Color(0xFFE91E63)
private val BoatBrown = Color(0xFF5D4037)
private val WarmSurface = Color(0xFFFFFDF9)

private data class Obstacle(val x: Float, val y: Float, val isRock: Boolean, val collected: Boolean = false)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BrahmaputraBoatGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var level by remember { mutableIntStateOf(1) }
    var lives by remember { mutableIntStateOf(3) }
    var gameOver by remember { mutableStateOf(false) }
    var boatLane by remember { mutableIntStateOf(1) }
    var scrollOffset by remember { mutableFloatStateOf(0f) }
    var obstacles by remember { mutableStateOf(listOf<Obstacle>()) }
    var highScore by remember { mutableIntStateOf(0) }

    val maxLanes = 3
    val laneWidth = 120f

    val tiltSensor = remember { TiltSensor(context) }
    DisposableEffect(Unit) { onDispose { tiltSensor.stop() } }

    LaunchedEffect(level) {
        val baseSpeed = 2f + level * 0.5f
        while (!gameOver) {
            scrollOffset += baseSpeed
            if (scrollOffset > 200f) {
                scrollOffset = 0f
                val newObs = mutableListOf<Obstacle>()
                for (lane in 0 until maxLanes) {
                    if (Math.random() < 0.3 + level * 0.05) {
                        newObs.add(Obstacle(x = lane * laneWidth + 60f, y = -80f, isRock = true))
                    }
                    if (Math.random() < 0.15) {
                        newObs.add(Obstacle(x = lane * laneWidth + 60f, y = -80f, isRock = false))
                    }
                }
                obstacles = obstacles.filter { it.y < 900f }.map { it.copy(y = it.y + 60f) } + newObs
            }
            obstacles = obstacles.map {
                if (!it.collected) it.copy(y = it.y + baseSpeed) else it
            }
            delay(16L)
        }
    }

    LaunchedEffect(Unit) {
        while (!gameOver) {
            obstacles = obstacles.filter { it.y < 1000f }
            delay(100L)
        }
    }

    if (gameOver) {
        if (score > highScore) highScore = score
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "\u26F5 River Boat (Brahmaputra)",
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Serif,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = RiverBlue)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(CanvasBg)
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            // HUD
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(3.dp, RoundedCornerShape(16.dp))
                    .border(2.5.dp, Ink, RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                color = WarmSurface
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink)
                        Text("Level: $level", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = RiverBlue)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        repeat(3) { i ->
                            Text(
                                text = if (i < lives) "\u2764\uFE0F" else "\u2761",
                                fontSize = 18.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (gameOver) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(22.dp))
                        .border(3.dp, Ink, RoundedCornerShape(22.dp)),
                    shape = RoundedCornerShape(22.dp),
                    color = WarmSurface
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "\u26F5", fontSize = 48.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Journey Complete!",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Serif,
                            color = Ink
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "You navigated the mighty Brahmaputra!",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFE0F7FA),
                            modifier = Modifier.border(1.5.dp, RiverBlue, RoundedCornerShape(12.dp))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "\u2B50 +${score * 10} Visuospatial XP Earned!",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = RiverBlue
                                )
                                Text(
                                    text = "Lotus collected: $score | High Score: $highScore",
                                    fontSize = 12.sp,
                                    color = Ink
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                                    .shadow(2.dp, RoundedCornerShape(12.dp))
                                    .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                    .semantics { contentDescription = "Play again" }
                                    .clickable {
                                        ElderlyFeedback.onTap(context)
                                        score = 0; lives = 3; level = 1
                                        gameOver = false; obstacles = listOf(); boatLane = 1
                                    },
                                shape = RoundedCornerShape(12.dp),
                                color = Color.White
                            ) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                    Text("Play Again \u27F3", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink)
                                }
                            }
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                                    .shadow(2.dp, RoundedCornerShape(12.dp))
                                    .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                    .semantics { contentDescription = "Done" }
                                    .clickable { onBack() },
                                shape = RoundedCornerShape(12.dp),
                                color = RiverBlue
                            ) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                    Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                            }
                        }
                    }
                }
            } else {
                // Game Canvas
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .shadow(3.dp, RoundedCornerShape(18.dp))
                        .border(2.5.dp, Ink, RoundedCornerShape(18.dp)),
                    shape = RoundedCornerShape(18.dp),
                    color = RiverLight
                ) {
                    Canvas(
                        modifier = Modifier
                            .fillMaxSize()
                            .clickable {
                                ElderlyFeedback.onTap(context)
                            }
                    ) {
                        val w = size.width
                        val h = size.height
                        // Draw river waves
                        for (i in 0..5) {
                            val waveY = (h * 0.15f * i + scrollOffset * 2) % h
                            drawLine(
                                color = Color(0xFF00838F).copy(alpha = 0.3f),
                                start = Offset(0f, waveY),
                                end = Offset(w, waveY),
                                strokeWidth = 3f
                            )
                        }
                        // Draw obstacles
                        obstacles.forEach { obs ->
                            val drawY = obs.y % h
                            if (obs.isRock) {
                                drawCircle(
                                    color = RockBrown,
                                    radius = 24f,
                                    center = Offset(obs.x, drawY)
                                )
                                drawCircle(
                                    color = Color(0xFF795548),
                                    radius = 18f,
                                    center = Offset(obs.x - 4f, drawY - 4f)
                                )
                            } else if (!obs.collected) {
                                // Lotus flower
                                drawCircle(
                                    color = LotusPink.copy(alpha = 0.7f),
                                    radius = 18f,
                                    center = Offset(obs.x, drawY)
                                )
                                drawCircle(
                                    color = Color(0xFFF48FB1),
                                    radius = 10f,
                                    center = Offset(obs.x, drawY)
                                )
                            }
                        }
                        // Draw boat
                        val boatX = boatLane * laneWidth + 60f
                        val boatY = h - 100f
                        drawCircle(
                            color = BoatBrown,
                            radius = 28f,
                            center = Offset(boatX, boatY)
                        )
                        drawCircle(
                            color = Color(0xFF8D6E63),
                            radius = 18f,
                            center = Offset(boatX, boatY)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Lane controls
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    listOf("\u25C0", "\u25BC", "\u25B6").forEachIndexed { idx, arrow ->
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .height(60.dp)
                                .shadow(3.dp, RoundedCornerShape(16.dp))
                                .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
                                .semantics { contentDescription = when(idx) { 0 -> "Move left"; 1 -> "Move center"; else -> "Move right" } }
                                .clickable {
                                    ElderlyFeedback.onTap(context)
                                    boatLane = idx
                                    // Check collisions
                                    val boatX = idx * laneWidth + 60f
                                    val hit = obstacles.any { obs ->
                                        !obs.collected && obs.isRock &&
                                            kotlin.math.abs(obs.x - boatX) < 50f &&
                                            kotlin.math.abs((obs.y % 800f) - 700f) < 50f
                                    }
                                    val collected = obstacles.filter { !it.isRock && !it.collected }.any { obs ->
                                        kotlin.math.abs(obs.x - boatX) < 50f &&
                                            kotlin.math.abs((obs.y % 800f) - 700f) < 50f
                                    }
                                    if (collected) {
                                        score += 5
                                        ElderlyFeedback.onSuccess(context)
                                        LocalizationManager.speak("Lotus collected!")
                                    }
                                    if (hit) {
                                        lives--
                                        ElderlyFeedback.onError(context)
                                        LocalizationManager.speak("Hit a rock!")
                                        if (lives <= 0) gameOver = true
                                    }
                                },
                            shape = RoundedCornerShape(16.dp),
                            color = if (boatLane == idx) RiverBlue else Color.White
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = arrow,
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (boatLane == idx) Color.White else Ink
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Collect lotuses to level up
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFFE0F7FA),
                    modifier = Modifier.fillMaxWidth().border(1.5.dp, RiverBlue, RoundedCornerShape(10.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Move left/right to dodge rocks and collect lotus \uD83C\uDF38",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = RiverBlue
                        )
                        if (score > 0 && score % 25 == 0) {
                            LaunchedEffect(score) {
                                level++
                                ElderlyFeedback.onSuccess(context)
                                LocalizationManager.speak("Level $level!")
                            }
                        }
                    }
                }
            }
        }
    }
}
