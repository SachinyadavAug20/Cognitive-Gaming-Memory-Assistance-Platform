package com.cognicare.ui.games

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import com.cognicare.util.HapticUtil
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val CanvasBg = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val WarmSurface = Color(0xFFFFFDF9)

data class PuzzlePhoto(
    val id: String,
    val title: String,
    val subtitle: String,
    val description: String,
    val assetPath: String,
    val emoji: String
)

private fun loadAndSliceBitmap(context: Context, assetPath: String, gridSize: Int): List<Bitmap>? {
    return try {
        context.assets.open(assetPath).use { inputStream ->
            val original = BitmapFactory.decodeStream(inputStream) ?: return null
            val minDim = minOf(original.width, original.height)
            val startX = (original.width - minDim) / 2
            val startY = (original.height - minDim) / 2
            val square = Bitmap.createBitmap(original, startX, startY, minDim, minDim)
            val tileSize = minDim / gridSize
            val slices = mutableListOf<Bitmap>()
            for (r in 0 until gridSize) {
                for (c in 0 until gridSize) {
                    val tile = Bitmap.createBitmap(square, c * tileSize, r * tileSize, tileSize, tileSize)
                    slices.add(tile)
                }
            }
            slices
        }
    } catch (e: Exception) {
        null
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JigsawGame(onBack: () -> Unit) {
    val context = LocalContext.current

    val photoList = remember {
        listOf(
            PuzzlePhoto(
                id = "pratima",
                title = "Pratima Borah",
                subtitle = "Beloved Spouse • 46 Years of Love",
                description = "Married for 46 joyful years. Loves tending to terrace orchids and cooking traditional Khar together.",
                assetPath = "sample-images/patient_1_biren_borah/relatives/02_spouse_pratima_borah.jpg",
                emoji = "👵"
            ),
            PuzzlePhoto(
                id = "home",
                title = "Silpukhuri Family Home",
                subtitle = "Ancestral Residence • Guwahati",
                description = "Two-story Assam-type house surrounded by betel nut palms where Biren has lived peacefully since 1978.",
                assetPath = "sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
                emoji = "🏡"
            ),
            PuzzlePhoto(
                id = "lake",
                title = "Dighalipukhuri Lake Park",
                subtitle = "Walking Park • Sacred Waters",
                description = "Centuries-old historic lake surrounded by giant rain trees where Biren takes peaceful sunset strolls with family.",
                assetPath = "sample-images/patient_1_biren_borah/places/05_dighalipukhuri_lake_park.jpg",
                emoji = "🏞️"
            ),
            PuzzlePhoto(
                id = "namghar",
                title = "Hari Namghar Prayer Hall",
                subtitle = "Community Sanctuary • Sacred Chimes",
                description = "Traditional Vaishnavite prayer hall for community hymns, Borgeet, and evening brass Doba chimes.",
                assetPath = "sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
                emoji = "🛕"
            ),
            PuzzlePhoto(
                id = "son",
                title = "Manash Borah",
                subtitle = "Eldest Son • Mechanical Engineer",
                description = "Eldest son working in Guwahati. Visits every Sunday morning with fresh sweets and market vegetables.",
                assetPath = "sample-images/patient_1_biren_borah/relatives/01_son_manash_borah.jpg",
                emoji = "👨‍💼"
            )
        )
    }

    var selectedPhotoIndex by remember { mutableIntStateOf(0) }
    val currentPhoto = photoList[selectedPhotoIndex % photoList.size]

    // Difficulty: 2 for 2x2 (4 pieces), 3 for 3x3 (9 pieces)
    var gridSize by remember { mutableIntStateOf(3) }
    val numPieces = gridSize * gridSize

    // Sliced bitmaps state
    var pieceBitmaps by remember { mutableStateOf<List<Bitmap>?>(null) }

    // Shuffled pieces order (pieceId at position i)
    fun makeInitialShuffle(): List<Int> {
        val list = (0 until numPieces).toList().shuffled()
        return if (list == (0 until numPieces).toList()) list.reversed() else list
    }

    var pieces by remember { mutableStateOf(makeInitialShuffle()) }
    var selectedPos by remember { mutableStateOf<Int?>(null) }
    var moves by remember { mutableIntStateOf(0) }
    var isSolved by remember { mutableStateOf(false) }
    var isPeeking by remember { mutableStateOf(false) }

    // Reload tiles when photo or gridSize changes
    LaunchedEffect(currentPhoto.assetPath, gridSize) {
        val loaded = loadAndSliceBitmap(context, currentPhoto.assetPath, gridSize)
        pieceBitmaps = loaded
        pieces = makeInitialShuffle()
        selectedPos = null
        moves = 0
        isSolved = false
        isPeeking = false
    }

    fun checkSolved(currentPieces: List<Int>) {
        val target = (0 until numPieces).toList()
        if (currentPieces == target) {
            isSolved = true
            HapticUtil.vibrateSuccess(context)
            LocalizationManager.speak("Wonderful! You solved the puzzle of ${currentPhoto.title}! ${currentPhoto.description}")
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🧩 Picture Puzzle",
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
                    // Peek original photo button
                    IconButton(onClick = {
                        HapticUtil.vibrateTap(context)
                        isPeeking = !isPeeking
                    }) {
                        Icon(
                            imageVector = Icons.Filled.Visibility,
                            contentDescription = "Peek Photo",
                            tint = if (isPeeking) Marigold else Ink
                        )
                    }
                    // Reset / Shuffle button
                    IconButton(onClick = {
                        HapticUtil.vibrateTap(context)
                        pieces = makeInitialShuffle()
                        selectedPos = null
                        moves = 0
                        isSolved = false
                    }) {
                        Icon(Icons.Filled.Refresh, contentDescription = "Shuffle", tint = Ink)
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
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. Photo Selection Carousel & Difficulty Selector
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Choose Photo to Solve:",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = InkSecondary
                    )
                    // 2x2 vs 3x3 Difficulty Pill
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color.White,
                        modifier = Modifier.border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                    ) {
                        Row(modifier = Modifier.padding(2.dp)) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (gridSize == 2) TeaGreen else Color.Transparent,
                                modifier = Modifier.clickable {
                                    if (gridSize != 2) {
                                        gridSize = 2
                                        HapticUtil.vibrateTap(context)
                                    }
                                }
                            ) {
                                Text(
                                    text = "2×2 Easy",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (gridSize == 2) Color.White else Ink,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (gridSize == 3) TeaGreen else Color.Transparent,
                                modifier = Modifier.clickable {
                                    if (gridSize != 3) {
                                        gridSize = 3
                                        HapticUtil.vibrateTap(context)
                                    }
                                }
                            ) {
                                Text(
                                    text = "3×3 Normal",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (gridSize == 3) Color.White else Ink,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Scrollable Photo Selector Pills
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    photoList.forEachIndexed { index, p ->
                        val isCurrent = index == selectedPhotoIndex
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isCurrent) Color(0xFFFEF3C7) else Color.White,
                            modifier = Modifier
                                .shadow(2.dp, RoundedCornerShape(12.dp))
                                .border(2.dp, if (isCurrent) Marigold else Ink, RoundedCornerShape(12.dp))
                                .clickable {
                                    if (selectedPhotoIndex != index) {
                                        HapticUtil.vibrateTap(context)
                                        selectedPhotoIndex = index
                                    }
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Image(
                                    painter = rememberAsyncImagePainter("file:///android_asset/${p.assetPath}"),
                                    contentDescription = p.title,
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .border(1.dp, Ink, RoundedCornerShape(6.dp)),
                                    contentScale = ContentScale.Crop
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = p.title,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Ink
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 2. Interactive Puzzle Board or Peek Overlay
            Box(
                modifier = Modifier
                    .size(330.dp)
                    .shadow(5.dp, RoundedCornerShape(22.dp))
                    .clip(RoundedCornerShape(22.dp))
                    .background(Color(0xFF1E293B))
                    .border(3.5.dp, Ink, RoundedCornerShape(22.dp))
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                if (isPeeking) {
                    // Full Original Photo Preview Mode
                    Box(modifier = Modifier.fillMaxSize()) {
                        Image(
                            painter = rememberAsyncImagePainter("file:///android_asset/${currentPhoto.assetPath}"),
                            contentDescription = "Original Photo",
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(RoundedCornerShape(16.dp)),
                            contentScale = ContentScale.Crop
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color.Black.copy(alpha = 0.75f),
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(bottom = 8.dp)
                        ) {
                            Text(
                                text = "👁️ Peeking at Original Photo",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }
                } else if (pieceBitmaps != null && pieceBitmaps!!.size == numPieces) {
                    // Real Sliced Jigsaw Grid
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        for (r in 0 until gridSize) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f),
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                for (c in 0 until gridSize) {
                                    val pos = r * gridSize + c
                                    val pieceId = pieces[pos]
                                    val isSelected = selectedPos == pos
                                    val isCorrect = pieceId == pos
                                    val tileBitmap = pieceBitmaps!![pieceId]

                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .fillMaxHeight()
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(Color.DarkGray)
                                            .border(
                                                width = if (isSelected) 3.5.dp else if (isCorrect) 2.dp else 1.5.dp,
                                                color = if (isSelected) Marigold else if (isCorrect) TeaGreen else Color.White.copy(alpha = 0.4f),
                                                shape = RoundedCornerShape(10.dp)
                                            )
                                            .clickable {
                                                HapticUtil.vibrateTap(context)
                                                if (selectedPos == null) {
                                                    selectedPos = pos
                                                } else {
                                                    val prev = selectedPos!!
                                                    if (prev != pos) {
                                                        val updated = pieces.toMutableList()
                                                        val temp = updated[prev]
                                                        updated[prev] = updated[pos]
                                                        updated[pos] = temp
                                                        pieces = updated
                                                        moves++
                                                        checkSolved(updated)
                                                    }
                                                    selectedPos = null
                                                }
                                            }
                                    ) {
                                        // The actual sliced photo tile!
                                        Image(
                                            bitmap = tileBitmap.asImageBitmap(),
                                            contentDescription = "Piece ${pieceId + 1}",
                                            modifier = Modifier.fillMaxSize(),
                                            contentScale = ContentScale.Crop
                                        )

                                        // Subtle piece number for elder assistance
                                        Surface(
                                            shape = CircleShape,
                                            color = if (isCorrect) TeaGreen else Color.Black.copy(alpha = 0.6f),
                                            modifier = Modifier
                                                .align(Alignment.TopStart)
                                                .padding(4.dp)
                                                .size(20.dp)
                                        ) {
                                            Box(contentAlignment = Alignment.Center) {
                                                if (isCorrect) {
                                                    Icon(Icons.Filled.Check, null, tint = Color.White, modifier = Modifier.size(14.dp))
                                                } else {
                                                    Text(
                                                        text = "${pieceId + 1}",
                                                        fontSize = 10.sp,
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
                } else {
                    CircularProgressIndicator(color = Marigold)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 3. Bottom Status / Solved Celebration Card
            if (isSolved) {
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = Color(0xFFDCFCE7),
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(18.dp))
                        .border(2.5.dp, TeaGreen, RoundedCornerShape(18.dp))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = "🎉", fontSize = 28.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = "Puzzle Solved!",
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.Black,
                                        color = TeaGreen
                                    )
                                    Text(
                                        text = "${currentPhoto.title} • Solved in $moves moves",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Ink
                                    )
                                }
                            }

                            // Voice read button
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = TeaGreen,
                                modifier = Modifier
                                    .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                                    .clickable {
                                        HapticUtil.vibrateTap(context)
                                        LocalizationManager.speak("${currentPhoto.title}. ${currentPhoto.subtitle}. ${currentPhoto.description}")
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Filled.VolumeUp, null, tint = Color.White, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(text = "Hear Story", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = currentPhoto.description,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = InkSecondary,
                            lineHeight = 16.sp
                        )
                    }
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(3.dp, RoundedCornerShape(16.dp))
                        .border(2.5.dp, Ink, RoundedCornerShape(16.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Moves: $moves",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                            val correctCount = pieces.filterIndexed { i, v -> i == v }.size
                            Text(
                                text = "$correctCount of $numPieces pieces in place",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (correctCount == numPieces) TeaGreen else Marigold
                            )
                        }

                        // Peek Toggle Action
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isPeeking) Marigold else Color(0xFFFEF3C7),
                            modifier = Modifier
                                .border(1.5.dp, Ink, RoundedCornerShape(12.dp))
                                .clickable {
                                    HapticUtil.vibrateTap(context)
                                    isPeeking = !isPeeking
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Visibility,
                                    contentDescription = null,
                                    tint = if (isPeeking) Color.White else Ink,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (isPeeking) "Hide Photo" else "Peek Photo",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (isPeeking) Color.White else Ink
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
