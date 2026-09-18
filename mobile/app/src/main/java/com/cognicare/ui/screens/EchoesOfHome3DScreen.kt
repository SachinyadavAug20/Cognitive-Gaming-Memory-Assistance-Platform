package com.cognicare.ui.screens

import android.graphics.Paint
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.data.local.Patient
import com.cognicare.ui.components.CogniCareTopBar
import com.cognicare.util.LocalizationManager
import kotlin.math.*

private val Ink = Color(0xFF16120E)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val CanvasBg = Color(0xFF121814)

data class MemoryNode3D(
    val id: String,
    val title: String,
    val subtitle: String,
    val relation: String,
    val emoji: String,
    val x: Float,
    val y: Float,
    val z: Float,
    val color: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EchoesOfHome3DScreen(
    patient: Patient,
    onBack: () -> Unit
) {
    var rotX by remember { mutableFloatStateOf(15f) }
    var rotY by remember { mutableFloatStateOf(0f) }
    var autoRotate by remember { mutableStateOf(true) }
    var selectedNode by remember { mutableStateOf<MemoryNode3D?>(null) }
    var activeScene by remember { mutableStateOf(0) } // 0: Capsule 3D, 1: Majuli Walk, 2: River Lanterns

    // Auto-orbit animation
    val infiniteTransition = rememberInfiniteTransition(label = "orbit")
    val autoAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(24000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "autoAngle"
    )

    val currentAngleY = if (autoRotate) rotY + autoAngle else rotY

    val memoryNodes = remember {
        listOf(
            MemoryNode3D("1", "Manash Borah", "Eldest son, mechanical engineer in Guwahati", "Son", "👨‍💼", -160f, -40f, -80f, Color(0xFF4ADE80)),
            MemoryNode3D("2", "Pratima Borah", "Married for 46 years. Loves gardening and cooking", "Spouse", "👵", 170f, -60f, 90f, Color(0xFFFBBF24)),
            MemoryNode3D("3", "Arnav Borah", "8-year-old grandson. Loves hearing bedtime folklore tales", "Grandson", "👦", -80f, 130f, 150f, Color(0xFF60A5FA)),
            MemoryNode3D("4", "Ananya Borah", "Youngest daughter, teacher at Cotton University", "Daughter", "👩‍🏫", 140f, 120f, -140f, Color(0xFFF472B6)),
            MemoryNode3D("5", "Dighalipukhuri Lake", "Historic lake surrounded by rain trees for evening walks", "Favorite Place", "🏞️", 0f, -150f, 120f, Color(0xFF34D399)),
            MemoryNode3D("6", "Hari Namghar", "Traditional prayer hall for community hymns and evening Doba", "Prayer Hall", "🛕", 0f, 160f, -120f, Color(0xFFF59E0B))
        )
    }

    Scaffold(
        topBar = {
            CogniCareTopBar(
                onBackClick = onBack,
                onMenuClick = null
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(CanvasBg)
        ) {
            // Mode switcher header
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(width = 2.dp, color = Color.White.copy(alpha = 0.2f)),
                color = Color(0xFF1E2620)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🌐", fontSize = 18.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Echoes of Home 3D",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Serif,
                                color = Color.White
                            )
                        }
                        Text(
                            text = "Interactive Spatial Memory Universe",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White.copy(alpha = 0.7f)
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (autoRotate) TeaGreen else Color.DarkGray,
                            modifier = Modifier
                                .border(1.5.dp, Color.White, RoundedCornerShape(10.dp))
                                .clickable { autoRotate = !autoRotate }
                        ) {
                            Text(
                                text = if (autoRotate) "Orbiting" else "Paused",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }

            // Interactive 3D Canvas
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .pointerInput(Unit) {
                        detectDragGestures { change, dragAmount ->
                            change.consume()
                            autoRotate = false
                            rotY += dragAmount.x * 0.4f
                            rotX = (rotX - dragAmount.y * 0.3f).coerceIn(-60f, 60f)
                        }
                    }
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val cx = size.width / 2f
                    val cy = size.height / 2f
                    val fov = 450f

                    // Draw starry background particles
                    val rand = kotlin.random.Random(42)
                    for (i in 0 until 120) {
                        val px = rand.nextFloat() * size.width
                        val py = rand.nextFloat() * size.height
                        val rad = rand.nextFloat() * 2f + 0.5f
                        val alpha = rand.nextFloat() * 0.6f + 0.2f
                        drawCircle(
                            color = Color(0xFFFDE68A).copy(alpha = alpha),
                            radius = rad,
                            center = Offset(px, py)
                        )
                    }

                    val radY = Math.toRadians(currentAngleY.toDouble()).toFloat()
                    val radX = Math.toRadians(rotX.toDouble()).toFloat()

                    val cosY = cos(radY)
                    val sinY = sin(radY)
                    val cosX = cos(radX)
                    val sinX = sin(radX)

                    // Draw 3D Golden Orbit Rings
                    val ringRadius = 240f
                    val numPoints = 72
                    val ringPath = androidx.compose.ui.graphics.Path()

                    for (i in 0..numPoints) {
                        val theta = (i.toFloat() / numPoints) * (2 * Math.PI.toFloat())
                        val rx = ringRadius * cos(theta)
                        val rz = ringRadius * sin(theta)
                        val ry = 0f

                        // Rotate Y then X
                        val x1 = rx * cosY + rz * sinY
                        val z1 = -rx * sinY + rz * cosY
                        val y2 = ry * cosX - z1 * sinX
                        val z2 = ry * sinX + z1 * cosX

                        val scale = fov / (fov + z2 + 300f)
                        val sx = cx + x1 * scale
                        val sy = cy + y2 * scale

                        if (i == 0) ringPath.moveTo(sx, sy) else ringPath.lineTo(sx, sy)
                    }

                    drawPath(
                        path = ringPath,
                        color = Color(0xFFD97706).copy(alpha = 0.35f),
                        style = Stroke(
                            width = 2f,
                            pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f))
                        )
                    )

                    // Draw Central Memory Core / Bonsai Glow
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(Color(0xFFFDE047), TeaGreen, Color.Transparent),
                            center = Offset(cx, cy),
                            radius = 60f
                        ),
                        radius = 60f,
                        center = Offset(cx, cy)
                    )

                    // Sort nodes by Z depth for realistic rendering order
                    val projectedNodes = memoryNodes.map { node ->
                        val x1 = node.x * cosY + node.z * sinY
                        val z1 = -node.x * sinY + node.z * cosY
                        val y2 = node.y * cosX - z1 * sinX
                        val z2 = node.y * sinX + z1 * cosX

                        val scale = (fov / (fov + z2 + 300f)).coerceIn(0.4f, 1.8f)
                        val sx = cx + x1 * scale
                        val sy = cy + y2 * scale
                        Triple(node, Offset(sx, sy), z2)
                    }.sortedBy { it.third } // back to front

                    // Draw connections and 3D memory orbs
                    projectedNodes.forEach { (node, pos, z) ->
                        val alpha = ((z + 250f) / 500f).coerceIn(0.35f, 1f)

                        // Draw golden beam to core
                        drawLine(
                            color = node.color.copy(alpha = alpha * 0.4f),
                            start = Offset(cx, cy),
                            end = pos,
                            strokeWidth = 1.5f
                        )

                        // Outer glowing aura
                        drawCircle(
                            color = node.color.copy(alpha = alpha * 0.3f),
                            radius = 32f,
                            center = pos
                        )

                        // Inner orb
                        drawCircle(
                            color = node.color.copy(alpha = alpha),
                            radius = 20f,
                            center = pos
                        )

                        // Draw Emoji & Label
                        drawIntoCanvas { canvas ->
                            val textPaint = Paint().apply {
                                color = android.graphics.Color.WHITE
                                textSize = 28f
                                textAlign = Paint.Align.CENTER
                                isAntiAlias = true
                                isFakeBoldText = true
                            }
                            canvas.nativeCanvas.drawText(node.emoji, pos.x, pos.y + 10f, textPaint)

                            val labelPaint = Paint().apply {
                                color = android.graphics.Color.WHITE
                                textSize = 22f
                                textAlign = Paint.Align.CENTER
                                isAntiAlias = true
                                isFakeBoldText = true
                                setShadowLayer(4f, 1f, 1f, android.graphics.Color.BLACK)
                            }
                            canvas.nativeCanvas.drawText(node.title, pos.x, pos.y + 40f, labelPaint)
                        }
                    }
                }

                // Instructions pill
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.Black.copy(alpha = 0.7f),
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 12.dp)
                        .border(1.dp, Color.White.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                ) {
                    Text(
                        text = "👆 Drag with finger to rotate 3D orbit • Tap below to focus",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                    )
                }
            }

            // Bottom Memory Selector Cards & Audio Narration
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(width = 3.dp, color = Ink),
                color = Color.White,
                shadowElevation = 8.dp
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "✨ Cherished Family Memories & Sacred Places",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = Ink
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        memoryNodes.take(3).forEach { node ->
                            val isFocused = selectedNode?.id == node.id
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (isFocused) Color(0xFFFEF3C7) else Color(0xFFF8F5EE),
                                modifier = Modifier
                                    .weight(1f)
                                    .shadow(2.dp, RoundedCornerShape(12.dp))
                                    .border(2.dp, if (isFocused) Marigold else Ink, RoundedCornerShape(12.dp))
                                    .clickable {
                                        selectedNode = node
                                        LocalizationManager.speak("${node.title}, ${node.relation}. ${node.subtitle}")
                                    }
                            ) {
                                Column(
                                    modifier = Modifier.padding(8.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(text = node.emoji, fontSize = 24.sp)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = node.title,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Ink,
                                        maxLines = 1
                                    )
                                    Text(
                                        text = node.relation,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TeaGreen
                                    )
                                }
                            }
                        }
                    }

                    if (selectedNode != null) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Color(0xFFFFFBEB),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(2.dp, Marigold, RoundedCornerShape(14.dp))
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = selectedNode!!.emoji, fontSize = 32.sp)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "${selectedNode!!.title} (${selectedNode!!.relation})",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Ink
                                    )
                                    Text(
                                        text = selectedNode!!.subtitle,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF4A4036)
                                    )
                                }
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = TeaGreen,
                                    modifier = Modifier
                                        .shadow(2.dp, RoundedCornerShape(10.dp))
                                        .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                                        .clickable {
                                            LocalizationManager.speak("${selectedNode!!.title}. ${selectedNode!!.subtitle}")
                                        }
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.VolumeUp,
                                        contentDescription = "Read aloud",
                                        tint = Color.White,
                                        modifier = Modifier.padding(8.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
