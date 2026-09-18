package com.cognicare.ui.games

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.HapticUtil
import com.cognicare.util.LocalizationManager
import kotlin.math.sin

private val Ink = Color(0xFF16120E)

data class FloatingLantern(
    val id: Long,
    val x: Float,
    val initialY: Float,
    val birthTime: Long,
    val speed: Float,
    val color: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RiverLanternsGame(onBack: () -> Unit) {
    val context = LocalContext.current
    val lanterns = remember { mutableStateListOf<FloatingLantern>() }
    var lanternCount by remember { mutableIntStateOf(0) }

    // Floating water wave animation
    val infiniteTransition = rememberInfiniteTransition(label = "water")
    val waveOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 2 * Math.PI.toFloat(),
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "waveOffset"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🪔 " + LocalizationManager.t("games.riverLanterns.title"),
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFF0F172A))
        ) {
            // Instructions banner
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(width = 2.dp, color = Ink),
                color = Color(0xFF1E293B)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Peaceful Brahmaputra River",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                        Text(
                            text = "Tap on the water to float a gentle glowing lantern",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFFDE68A)
                        )
                    }
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFFF59E0B),
                        modifier = Modifier.border(1.5.dp, Color.White, RoundedCornerShape(10.dp))
                    ) {
                        Text(
                            text = "🪔 $lanternCount floated",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            // River Water Canvas
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .pointerInput(Unit) {
                        detectTapGestures { offset ->
                            HapticUtil.vibrateTap(context)
                            val newLantern = FloatingLantern(
                                id = System.currentTimeMillis(),
                                x = offset.x,
                                initialY = offset.y,
                                birthTime = System.currentTimeMillis(),
                                speed = kotlin.random.Random.nextFloat() * 1.5f + 1.2f,
                                color = listOf(Color(0xFFFBBF24), Color(0xFFF59E0B), Color(0xFFFB923C)).random()
                            )
                            lanterns.add(newLantern)
                            lanternCount++
                            if (lanternCount % 5 == 0) {
                                LocalizationManager.speak("Peace and light to you and your loved ones.")
                            }
                        }
                    }
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height

                    // Gradient river background
                    drawRect(
                        brush = Brush.verticalGradient(
                            colors = listOf(Color(0xFF0F172A), Color(0xFF1E3A8A), Color(0xFF0C4A6E), Color(0xFF042F2E))
                        )
                    )

                    // Draw Moon reflection
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(Color(0xFFFEF3C7), Color(0xFFFDE68A).copy(alpha = 0.5f), Color.Transparent),
                            center = Offset(w * 0.8f, h * 0.15f),
                            radius = 90f
                        ),
                        radius = 90f,
                        center = Offset(w * 0.8f, h * 0.15f)
                    )

                    // Draw water waves
                    val waveCount = 8
                    for (i in 0 until waveCount) {
                        val baseY = h * 0.35f + (i * h * 0.08f)
                        val path = androidx.compose.ui.graphics.Path()
                        path.moveTo(0f, baseY)
                        for (x in 0..w.toInt() step 20) {
                            val y = baseY + sin((x * 0.015f) + waveOffset + (i * 0.8f)) * 8f
                            path.lineTo(x.toFloat(), y)
                        }
                        path.lineTo(w, h)
                        path.lineTo(0f, h)
                        path.close()
                        drawPath(
                            path = path,
                            color = Color(0xFF0284C7).copy(alpha = 0.07f + i * 0.02f)
                        )
                    }

                    // Render floating lanterns
                    val now = System.currentTimeMillis()
                    lanterns.forEach { lantern ->
                        val elapsedSeconds = (now - lantern.birthTime) / 1000f
                        val currentY = lantern.initialY - (elapsedSeconds * 20f * lantern.speed)
                        val driftX = lantern.x + sin(elapsedSeconds * 1.5f) * 12f

                        if (currentY > -50f) {
                            // Outer golden glow
                            drawCircle(
                                brush = Brush.radialGradient(
                                    colors = listOf(lantern.color.copy(alpha = 0.8f), lantern.color.copy(alpha = 0.2f), Color.Transparent),
                                    center = Offset(driftX, currentY),
                                    radius = 36f
                                ),
                                radius = 36f,
                                center = Offset(driftX, currentY)
                            )
                            // Diya vessel (earthen boat)
                            drawOval(
                                color = Color(0xFF78350F),
                                topLeft = Offset(driftX - 16f, currentY + 4f),
                                size = androidx.compose.ui.geometry.Size(32f, 14f)
                            )
                            // Candle flame
                            drawCircle(
                                color = Color(0xFFFFFBEB),
                                radius = 7f,
                                center = Offset(driftX, currentY)
                            )
                        }
                    }
                }
            }
        }
    }
}
