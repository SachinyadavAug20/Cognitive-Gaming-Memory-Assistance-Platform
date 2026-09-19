package com.cognicare.ui.games

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import kotlin.math.sin

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val CanvasBg = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val Brick = Color(0xFFC5221F)

data class WalkLandmark(
    val name: String,
    val nativeName: String,
    val description: String,
    val emoji: String,
    val imageAssetPath: String,
    val question: String,
    val options: List<String>,
    val correctIndex: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MajuliWalk3DGame(onBack: () -> Unit) {
    val context = LocalContext.current
    val landmarks = remember {
        listOf(
            WalkLandmark(
                name = "Auniati Satra Namghar",
                nativeName = "আউনীআটী সত্ৰ নামঘৰ",
                description = "Sacred 350-year-old Vaishnavite prayer hall with brass Doba bells and devotional Borgeet hymns.",
                emoji = "🛕",
                imageAssetPath = "sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
                question = "Which sacred heritage prayer sanctuary have we reached?",
                options = listOf("Auniati Satra Namghar", "Modern Highway Mall", "Cinema Hall"),
                correctIndex = 0
            ),
            WalkLandmark(
                name = "Mising Bamboo Chang Ghar",
                nativeName = "মিচিং চাং ঘৰ",
                description = "Traditional raised bamboo stilt cottage built with woven thatch to stay safe and dry above Brahmaputra floods.",
                emoji = "🏡",
                imageAssetPath = "sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
                question = "What traditional river dwelling is standing on your right?",
                options = listOf("Concrete Skyscraper", "Mising Bamboo Chang Ghar", "Steel Warehouse"),
                correctIndex = 1
            ),
            WalkLandmark(
                name = "Kamalabari River Ghat",
                nativeName = "কমলাবাৰী ঘাট",
                description = "Scenic wooden ferry boat jetty overlooking the wide golden sunlit waters of the Brahmaputra River.",
                emoji = "⛵",
                imageAssetPath = "sample-images/patient_1_biren_borah/places/05_dighalipukhuri_lake_park.jpg",
                question = "Where do the peaceful wooden ferry boats dock on the riverbank?",
                options = listOf("Airport Runway", "Railway Station", "Kamalabari River Ghat"),
                correctIndex = 2
            ),
            WalkLandmark(
                name = "Majuli Morning Bazaar",
                nativeName = "মাজুলী পুৱাৰ বজাৰ",
                description = "Village marketplace where local farmers trade fresh organic greens, river fish, and handmade bamboo baskets.",
                emoji = "🛒",
                imageAssetPath = "sample-images/patient_1_biren_borah/places/02_silpukhuri_daily_market.jpg",
                question = "Where do village elders gather for morning produce and warm red tea?",
                options = listOf("Majuli Morning Bazaar", "Highway Petrol Pump", "Cricket Stadium"),
                correctIndex = 0
            )
        )
    }

    var stepProgress by remember { mutableFloatStateOf(0f) }
    var currentStopIndex by remember { mutableIntStateOf(0) }
    var totalSteps by remember { mutableIntStateOf(0) }
    var isAnsweringQuestion by remember { mutableStateOf(false) }
    var selectedOption by remember { mutableStateOf<Int?>(null) }
    var score by remember { mutableIntStateOf(0) }
    var isFinished by remember { mutableStateOf(false) }

    val activeLandmark = landmarks[currentStopIndex % landmarks.size]

    // Walking footstep head bobbing animation
    val bobbingOffset = (sin(stepProgress * 1.5) * 8f).toFloat()

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🚶 Majuli Island 3D Walk",
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Serif,
                        color = Ink
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = Ink)
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFFFEF3C7),
                        modifier = Modifier
                            .padding(end = 12.dp)
                            .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                    ) {
                        Text(
                            text = "Score: $score XP",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
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
        ) {
            // 1. 3D Perspective Walking Pathway Canvas
            Box(
                modifier = Modifier
                    .weight(1.2f)
                    .fillMaxWidth()
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height
                    val horizonY = h * 0.36f + bobbingOffset

                    // Sky gradient
                    drawRect(
                        brush = Brush.verticalGradient(
                            colors = listOf(Color(0xFF7DD3FC), Color(0xFFFEF3C7), Color(0xFFFFFBEB)),
                            startY = 0f,
                            endY = horizonY
                        ),
                        topLeft = Offset(0f, 0f),
                        size = androidx.compose.ui.geometry.Size(w, horizonY)
                    )

                    // Sunlit Brahmaputra River on right
                    val riverPath = androidx.compose.ui.graphics.Path().apply {
                        moveTo(w * 0.58f, horizonY)
                        lineTo(w, horizonY)
                        lineTo(w, h)
                        lineTo(w * 0.76f, h)
                        close()
                    }
                    drawPath(
                        path = riverPath,
                        brush = Brush.horizontalGradient(listOf(Color(0xFF0284C7), Color(0xFF38BDF8)))
                    )

                    // Lush Green Island vegetation
                    val grassPath = androidx.compose.ui.graphics.Path().apply {
                        moveTo(0f, horizonY)
                        lineTo(w * 0.58f, horizonY)
                        lineTo(w * 0.76f, h)
                        lineTo(0f, h)
                        close()
                    }
                    drawPath(path = grassPath, color = Color(0xFF15803D))

                    // 3D Perspective Walking Path
                    val path3D = androidx.compose.ui.graphics.Path().apply {
                        moveTo(w * 0.47f, horizonY)
                        lineTo(w * 0.53f, horizonY)
                        lineTo(w * 0.68f, h)
                        lineTo(w * 0.32f, h)
                        close()
                    }
                    drawPath(
                        path = path3D,
                        brush = Brush.verticalGradient(
                            colors = listOf(Color(0xFFE2E8F0), Color(0xFFFEF3C7), Color(0xFFD4D4D8))
                        )
                    )

                    // Moving trail markers to convey 3D forward walking speed
                    val numPoles = 6
                    for (i in 0 until numPoles) {
                        val t = ((i.toFloat() / numPoles) + (stepProgress * 0.15f)) % 1f
                        val y = horizonY + (h - horizonY) * (t * t)
                        val roadWidth = (w * 0.36f) * t
                        val centerX = w * 0.5f

                        drawLine(
                            color = Color(0xFFB45309),
                            start = Offset(centerX - roadWidth / 2f, y),
                            end = Offset(centerX + roadWidth / 2f, y),
                            strokeWidth = 3f * t + 1f
                        )
                    }
                }

                // Landmark Floating Real-Photo Preview in 3D Scene
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .padding(start = 16.dp)
                        .shadow(5.dp, RoundedCornerShape(16.dp))
                        .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Image(
                            painter = rememberAsyncImagePainter("file:///android_asset/${activeLandmark.imageAssetPath}"),
                            contentDescription = activeLandmark.name,
                            modifier = Modifier
                                .size(50.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .border(1.5.dp, Ink, RoundedCornerShape(10.dp)),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(text = activeLandmark.name, fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink)
                            Text(text = activeLandmark.nativeName, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TeaGreen)
                        }
                    }
                }

                // Steps Counter Pill
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.Black.copy(alpha = 0.8f),
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(14.dp)
                ) {
                    Text(
                        text = "👣 $totalSteps Steps Walked",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }

            // 2. Bottom Interactive Walking & Recognition Section
            Surface(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .border(width = 3.dp, color = Ink),
                color = Color.White
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    if (isFinished) {
                        // Finished Walk Celebration
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = "🎉 Island Walk Complete!", fontSize = 20.sp, fontWeight = FontWeight.Black, color = TeaGreen)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "You explored all 4 heritage sites of Majuli and walked $totalSteps steps!",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Ink
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = TeaGreen,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .shadow(2.dp, RoundedCornerShape(14.dp))
                                    .border(2.dp, Ink, RoundedCornerShape(14.dp))
                                    .clickable { onBack() }
                            ) {
                                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                    Text(text = "Return to Dashboard ✓", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                            }
                        }
                    } else if (!isAnsweringQuestion) {
                        // Walking Phase with Real Landmark Portrait & Story
                        Row(verticalAlignment = Alignment.Top) {
                            Image(
                                painter = rememberAsyncImagePainter("file:///android_asset/${activeLandmark.imageAssetPath}"),
                                contentDescription = activeLandmark.name,
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .border(2.dp, Ink, RoundedCornerShape(12.dp)),
                                contentScale = ContentScale.Crop
                            )

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Stop ${currentStopIndex + 1} of ${landmarks.size}: ${activeLandmark.name}",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Ink
                                    )
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = Color(0xFFFEF3C7),
                                        modifier = Modifier
                                            .border(1.5.dp, Ink, RoundedCornerShape(8.dp))
                                            .clickable {
                                                ElderlyFeedback.onTap(context)
                                                LocalizationManager.speak("${activeLandmark.name}. ${activeLandmark.description}")
                                            }
                                    ) {
                                        Icon(
                                            imageVector = Icons.Filled.VolumeUp,
                                            contentDescription = "Read aloud",
                                            tint = Ink,
                                            modifier = Modifier.padding(5.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = activeLandmark.description,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = InkSecondary,
                                    lineHeight = 16.sp
                                )
                            }
                        }

                        // Walk & Quiz Buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // Take step button
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = TeaGreen,
                                modifier = Modifier
                                    .weight(1.2f)
                                    .height(54.dp)
                                    .shadow(3.dp, RoundedCornerShape(16.dp))
                                    .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
                                    .clickable {
                                        ElderlyFeedback.onTap(context)
                                        stepProgress += 1f
                                        totalSteps += 10
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxSize(),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Filled.DirectionsWalk, null, tint = Color.White, modifier = Modifier.size(22.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Walk Forward 👣",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White
                                    )
                                }
                            }

                            // Heritage Quiz Button
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = Marigold,
                                modifier = Modifier
                                    .weight(0.9f)
                                    .height(54.dp)
                                    .shadow(3.dp, RoundedCornerShape(16.dp))
                                    .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
                                    .clickable {
                                        ElderlyFeedback.onTap(context)
                                        isAnsweringQuestion = true
                                        selectedOption = null
                                        LocalizationManager.speak(activeLandmark.question)
                                    }
                            ) {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "Quiz 💡",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                    } else {
                        // Heritage Recognition Question
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "💡 Heritage Landmark Question:",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Marigold
                            )
                            Text(
                                text = activeLandmark.question,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )

                            activeLandmark.options.forEachIndexed { optIdx, optText ->
                                val isCorrect = optIdx == activeLandmark.correctIndex
                                val isChosen = selectedOption == optIdx
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = when {
                                        isChosen && isCorrect -> Color(0xFFDCFCE7)
                                        isChosen && !isCorrect -> Color(0xFFFEE2E2)
                                        else -> Color(0xFFF8F5EE)
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .shadow(1.dp, RoundedCornerShape(12.dp))
                                        .border(2.dp, if (isChosen) (if (isCorrect) TeaGreen else Brick) else Ink, RoundedCornerShape(12.dp))
                                        .clickable {
                                            selectedOption = optIdx
                                            if (isCorrect) {
                                                ElderlyFeedback.onSuccess(context)
                                                score += 50
                                                LocalizationManager.speak("Correct! That is ${activeLandmark.name}.")
                                            } else {
                                                ElderlyFeedback.onError(context)
                                                LocalizationManager.speak("Let's look closely again.")
                                            }
                                        }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "${'A' + optIdx}.",
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Ink
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = optText,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Ink
                                        )
                                    }
                                }
                            }

                            if (selectedOption != null) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = TeaGreen,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(46.dp)
                                        .shadow(2.dp, RoundedCornerShape(12.dp))
                                        .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                        .clickable {
                                            ElderlyFeedback.onTap(context)
                                            if (currentStopIndex + 1 < landmarks.size) {
                                                currentStopIndex++
                                                isAnsweringQuestion = false
                                                selectedOption = null
                                            } else {
                                                isFinished = true
                                            }
                                        }
                                ) {
                                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                        Text(
                                            text = if (currentStopIndex + 1 < landmarks.size) "Next Landmark ➔" else "Finish Walk 🎉",
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White
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
}
