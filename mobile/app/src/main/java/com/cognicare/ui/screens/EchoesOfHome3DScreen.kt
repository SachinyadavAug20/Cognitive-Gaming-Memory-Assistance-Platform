package com.cognicare.ui.screens

import android.graphics.Paint
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.Immutable
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.cognicare.data.local.Patient
import com.cognicare.ui.components.CogniCareTopBar
import com.cognicare.ui.games.MajuliWalk3DGame
import com.cognicare.ui.games.RiverLanternsGame
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import com.cognicare.util.PatientMediaManager
import kotlin.math.*

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val CanvasBg = Color(0xFF121814)

@Immutable
data class MemoryNode3D(
    val id: String,
    val title: String,
    val subtitle: String,
    val relation: String,
    val category: String,
    val emoji: String,
    val imageAssetPath: String,
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
    val context = LocalContext.current
    var activeScene by remember { mutableIntStateOf(0) } // 0: Capsule 3D, 1: Majuli Walk, 2: River Lanterns

    // If Majuli Walk or River Lanterns is selected, render those 3D games directly
    when (activeScene) {
        1 -> {
            MajuliWalk3DGame(onBack = { activeScene = 0 })
            return
        }
        2 -> {
            RiverLanternsGame(onBack = { activeScene = 0 })
            return
        }
    }

    var rotX by remember { mutableFloatStateOf(15f) }
    var rotY by remember { mutableFloatStateOf(0f) }
    var autoRotate by remember { mutableStateOf(true) }

    // Load actual memories & photos from PatientMediaManager
    val patientMemories = remember(patient.id) {
        PatientMediaManager.getMemoriesForPatient(patient.id)
    }

    val memoryNodes = remember(patientMemories) {
        val nodeColors = listOf(
            Color(0xFF4ADE80), Color(0xFFFBBF24), Color(0xFF60A5FA),
            Color(0xFFF472B6), Color(0xFF34D399), Color(0xFFF59E0B),
            Color(0xFFA78BFA), Color(0xFFFB7185), Color(0xFF38BDF8)
        )
        val positions = listOf(
            Triple(-160f, -40f, -80f),
            Triple(170f, -60f, 90f),
            Triple(-80f, 130f, 150f),
            Triple(140f, 120f, -140f),
            Triple(0f, -150f, 120f),
            Triple(0f, 160f, -120f),
            Triple(-150f, 60f, 70f),
            Triple(160f, -90f, -60f),
            Triple(80f, -140f, -90f)
        )
        patientMemories.mapIndexed { idx, mem ->
            val pos = positions[idx % positions.size]
            val col = nodeColors[idx % nodeColors.size]
            MemoryNode3D(
                id = mem.id,
                title = mem.name,
                subtitle = mem.description,
                relation = mem.relation,
                category = mem.category,
                emoji = mem.emoji,
                imageAssetPath = mem.imageAssetPath,
                x = pos.first,
                y = pos.second,
                z = pos.third,
                color = col
            )
        }
    }

    var selectedNode by remember(memoryNodes) {
        mutableStateOf(memoryNodes.firstOrNull())
    }

    // Auto-orbit animation
    val infiniteTransition = rememberInfiniteTransition(label = "orbit")
    val autoAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(26000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "autoAngle"
    )

    val currentAngleY = if (autoRotate) rotY + autoAngle else rotY

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
            // Mode Switcher Header with tabs for all 3D experiences
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(width = 2.dp, color = Color.White.copy(alpha = 0.2f)),
                color = Color(0xFF1E2620)
            ) {
                Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
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

                        // Orbit Pause/Play button
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (autoRotate) TeaGreen else Color.DarkGray,
                            modifier = Modifier
                                .border(1.5.dp, Color.White, RoundedCornerShape(10.dp))
                                .clickable {
                                    ElderlyFeedback.onTap(context)
                                    autoRotate = !autoRotate
                                }
                        ) {
                            Text(
                                text = if (autoRotate) "Orbiting ⟳" else "Paused ⏸",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 3D Scene Switcher Tabs (Inline with web)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            Triple(0, "🌐 Memory Sphere", "Echoes of Home"),
                            Triple(1, "🚶 Majuli 3D Walk", "River Satras"),
                            Triple(2, "🪔 River Lanterns", "Floating Diya")
                        ).forEach { (idx, title, _) ->
                            val isSelected = activeScene == idx
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .shadow(if (isSelected) 2.dp else 0.dp, RoundedCornerShape(10.dp))
                                    .border(1.5.dp, if (isSelected) Marigold else Color.White.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                                    .clickable {
                                        ElderlyFeedback.onTap(context)
                                        activeScene = idx
                                    },
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) Marigold else Color(0xFF2B3A30)
                            ) {
                                Box(
                                    modifier = Modifier.padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = title,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White,
                                        maxLines = 1
                                    )
                                }
                            }
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
                    val textPaint = Paint().apply {
                        textAlign = Paint.Align.CENTER
                        isAntiAlias = true
                        isFakeBoldText = true
                    }
                    val labelPaint = Paint().apply {
                        textAlign = Paint.Align.CENTER
                        isAntiAlias = true
                        isFakeBoldText = true
                    }
                    projectedNodes.forEach { (node, pos, z) ->
                        val isCurrent = selectedNode?.id == node.id
                        val alpha = ((z + 250f) / 500f).coerceIn(0.35f, 1f)

                        // Golden beam to center core
                        drawLine(
                            color = (if (isCurrent) Marigold else node.color).copy(alpha = alpha * (if (isCurrent) 0.8f else 0.4f)),
                            start = Offset(cx, cy),
                            end = pos,
                            strokeWidth = if (isCurrent) 3f else 1.5f
                        )

                        // Outer glowing aura
                        drawCircle(
                            color = (if (isCurrent) Marigold else node.color).copy(alpha = alpha * (if (isCurrent) 0.6f else 0.25f)),
                            radius = if (isCurrent) 42f else 32f,
                            center = pos
                        )

                        // Inner orb
                        drawCircle(
                            color = if (isCurrent) Color.White else node.color.copy(alpha = alpha),
                            radius = if (isCurrent) 24f else 19f,
                            center = pos
                        )

                        // Draw Emoji & Label
                        drawIntoCanvas { canvas ->
                            textPaint.color = android.graphics.Color.WHITE
                            textPaint.textSize = if (isCurrent) 34f else 26f
                            canvas.nativeCanvas.drawText(node.emoji, pos.x, pos.y + 10f, textPaint)

                            labelPaint.color = if (isCurrent) android.graphics.Color.YELLOW else android.graphics.Color.WHITE
                            labelPaint.textSize = if (isCurrent) 26f else 20f
                            labelPaint.setShadowLayer(4f, 1f, 1f, android.graphics.Color.BLACK)
                            canvas.nativeCanvas.drawText(node.title, pos.x, pos.y + 44f, labelPaint)
                        }
                    }
                }

                // Drag gesture hint
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.Black.copy(alpha = 0.7f),
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 10.dp)
                        .border(1.dp, Color.White.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                ) {
                    Text(
                        text = "👆 Drag anywhere to orbit 3D galaxy • Tap memory cards below",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                    )
                }
            }

            // Bottom Panel: Focused Memory Card with Real Photo & Audio + Scrollable Photo Carousel
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(width = 3.dp, color = Ink),
                color = Color.White,
                shadowElevation = 8.dp
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    // 1. Focused Memory with REAL PHOTO
                    if (selectedNode != null) {
                        selectedNode?.let { node ->
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color(0xFFFFFBEB),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(2.5.dp, Marigold, RoundedCornerShape(16.dp))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(verticalAlignment = Alignment.Top) {
                                    // Real Photo loaded via Coil
                                    val painter = rememberAsyncImagePainter(
                                        model = ImageRequest.Builder(context)
                                            .data("file:///android_asset/${node.imageAssetPath}")
                                            .crossfade(true)
                                            .build()
                                    )
                                    Image(
                                        painter = painter,
                                        contentDescription = node.title,
                                        modifier = Modifier
                                            .size(90.dp)
                                            .shadow(3.dp, RoundedCornerShape(14.dp))
                                            .clip(RoundedCornerShape(14.dp))
                                            .border(2.dp, Ink, RoundedCornerShape(14.dp))
                                            .background(Color.White),
                                        contentScale = ContentScale.Crop
                                    )

                                    Spacer(modifier = Modifier.width(14.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Surface(
                                                shape = RoundedCornerShape(6.dp),
                                                color = Color(0xFFFEF3C7),
                                                modifier = Modifier.border(1.dp, Ink, RoundedCornerShape(6.dp))
                                            ) {
                                                Text(
                                                    text = "${node.emoji} ${node.relation}",
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Black,
                                                    color = Ink,
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                )
                                            }

                                            Surface(
                                                shape = RoundedCornerShape(6.dp),
                                                color = TeaGreen
                                            ) {
                                                Text(
                                                    text = node.category,
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Black,
                                                    color = Color.White,
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                )
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = node.title,
                                            fontSize = 18.sp,
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Serif,
                                            color = Ink
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = node.subtitle,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = InkSecondary,
                                            lineHeight = 16.sp,
                                            maxLines = 3
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                // Audio Narration Button
                                Surface(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(44.dp)
                                        .shadow(2.dp, RoundedCornerShape(12.dp))
                                        .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                        .clickable {
                                            ElderlyFeedback.onTap(context)
                                            LocalizationManager.speak("${node.title}, your ${node.relation}. ${node.subtitle}")
                                        },
                                    shape = RoundedCornerShape(12.dp),
                                    color = TeaGreen
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxSize(),
                                        horizontalArrangement = Arrangement.Center,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Filled.VolumeUp, null, tint = Color.White, modifier = Modifier.size(20.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "Read Aloud in Your Voice Note",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White
                                        )
                                    }
                                }
                            }
                        }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 2. Scrollable Photo Carousel with Real Thumbnails
                    Text(
                        text = "Family & Familiar Places (${memoryNodes.size} nodes in orbit)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        color = InkSecondary
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        memoryNodes.forEach { node ->
                            val isFocused = selectedNode?.id == node.id
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (isFocused) Color(0xFFFEF3C7) else Color(0xFFF8F5EE),
                                modifier = Modifier
                                    .width(110.dp)
                                    .shadow(2.dp, RoundedCornerShape(12.dp))
                                    .border(2.dp, if (isFocused) Marigold else Ink, RoundedCornerShape(12.dp))
                                    .clickable {
                                        ElderlyFeedback.onTap(context)
                                        selectedNode = node
                                        LocalizationManager.speak("${node.title}, ${node.relation}. ${node.subtitle}")
                                    }
                            ) {
                                Column(
                                    modifier = Modifier.padding(6.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    // Real thumbnail image
                                    Image(
                                        painter = rememberAsyncImagePainter("file:///android_asset/${node.imageAssetPath}"),
                                        contentDescription = node.title,
                                        modifier = Modifier
                                            .size(54.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .border(1.dp, Ink, RoundedCornerShape(8.dp)),
                                        contentScale = ContentScale.Crop
                                    )
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
                                        color = TeaGreen,
                                        maxLines = 1
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
