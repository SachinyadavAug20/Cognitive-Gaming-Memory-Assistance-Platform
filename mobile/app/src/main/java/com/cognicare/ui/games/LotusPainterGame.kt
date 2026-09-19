package com.cognicare.ui.games

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import kotlin.math.cos
import kotlin.math.sin

private val Ink = Color(0xFF16120E)
private val CanvasBg = Color(0xFFFAF7F2)

data class DrawnStroke(
    val points: List<Offset>,
    val color: Color,
    val symmetry: Int = 8
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LotusPainterGame(onBack: () -> Unit) {
    val context = LocalContext.current
    val strokes = remember { mutableStateListOf<DrawnStroke>() }
    val currentPoints = remember { mutableStateListOf<Offset>() }
    val palette = listOf(
        Color(0xFFEC4899), // Lotus Pink
        Color(0xFFF59E0B), // Sacred Marigold
        Color(0xFF10B981), // Fresh Tea Green
        Color(0xFF6366F1), // Royal Indigo
        Color(0xFFEF4444)  // Holy Sindoor
    )
    var selectedColor by remember { mutableStateOf(palette[0]) }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🪷 " + LocalizationManager.t("games.lotusPainter.title"),
                        fontWeight = FontWeight.Black,
                        color = Ink
                    )
                },
                navigationIcon = {
                    IconButton(onClick = {
                        ElderlyFeedback.onTap(context)
                        onBack()
                    }) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = Ink)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        ElderlyFeedback.onTap(context)
                        strokes.clear()
                        currentPoints.clear()
                    }) {
                        Icon(Icons.Filled.Delete, contentDescription = "Clear Canvas", tint = Ink)
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
                .background(CanvasBg)
                .padding(16.dp)
        ) {
            // Instructions banner
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(2.dp, RoundedCornerShape(14.dp))
                    .border(2.dp, Ink, RoundedCornerShape(14.dp))
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "🎨", fontSize = 24.sp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Touch and draw: Symmetrical 8-fold lotus blooms appear automatically!",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Ink
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Canvas
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFFFFFDF8),
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .shadow(4.dp, RoundedCornerShape(20.dp))
                    .border(3.dp, Ink, RoundedCornerShape(20.dp))
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(selectedColor) {
                            detectDragGestures(
                                onDragStart = { offset ->
                                    currentPoints.clear()
                                    currentPoints.add(offset)
                                },
                                onDrag = { change, _ ->
                                    change.consume()
                                    currentPoints.add(change.position)
                                },
                                onDragEnd = {
                                    if (currentPoints.isNotEmpty()) {
                                        strokes.add(DrawnStroke(currentPoints.toList(), selectedColor))
                                        if (strokes.size > 80) {
                                            strokes.subList(0, strokes.size - 80).clear()
                                        }
                                        currentPoints.clear()
                                    }
                                }
                            )
                        }
                ) {
                    val cx = size.width / 2f
                    val cy = size.height / 2f

                    // Draw subtle sacred center dot
                    drawCircle(color = Color(0xFFD97706).copy(alpha = 0.4f), radius = 6f, center = Offset(cx, cy))

                    fun drawSymmetric(points: List<Offset>, color: Color, symmetry: Int = 8) {
                        if (points.size < 2) return
                        for (k in 0 until symmetry) {
                            val angle = (2 * Math.PI.toFloat() / symmetry) * k
                            val cosA = cos(angle)
                            val sinA = sin(angle)

                            for (i in 0 until points.size - 1) {
                                val p1 = points[i]
                                val p2 = points[i + 1]

                                val dx1 = p1.x - cx
                                val dy1 = p1.y - cy
                                val dx2 = p2.x - cx
                                val dy2 = p2.y - cy

                                val rx1 = cx + (dx1 * cosA - dy1 * sinA)
                                val ry1 = cy + (dx1 * sinA + dy1 * cosA)
                                val rx2 = cx + (dx2 * cosA - dy2 * sinA)
                                val ry2 = cy + (dx2 * sinA + dy2 * cosA)

                                drawLine(
                                    color = color,
                                    start = Offset(rx1, ry1),
                                    end = Offset(rx2, ry2),
                                    strokeWidth = 6f,
                                    cap = StrokeCap.Round
                                )
                            }
                        }
                    }

                    strokes.forEach { stroke ->
                        drawSymmetric(stroke.points, stroke.color, stroke.symmetry)
                    }

                    if (currentPoints.size > 1) {
                        drawSymmetric(currentPoints, selectedColor, 8)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Color Palette Selector
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(3.dp, RoundedCornerShape(16.dp))
                    .border(2.dp, Ink, RoundedCornerShape(16.dp))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    palette.forEach { col ->
                        val isSelected = selectedColor == col
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .shadow(if (isSelected) 4.dp else 1.dp, CircleShape)
                                .clip(CircleShape)
                                .background(col)
                                .border(
                                    width = if (isSelected) 3.5.dp else 1.5.dp,
                                    color = if (isSelected) Ink else Color.LightGray,
                                    shape = CircleShape
                                )
                                .clickable { ElderlyFeedback.onTap(context); selectedColor = col }
                        )
                    }
                }
            }
        }
    }
}
