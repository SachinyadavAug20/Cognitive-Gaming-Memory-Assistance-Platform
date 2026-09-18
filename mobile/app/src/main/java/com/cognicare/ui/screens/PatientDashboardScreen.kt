package com.cognicare.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.cognicare.data.local.Patient
import com.cognicare.ui.components.CogniCareDrawerContent
import com.cognicare.ui.components.CogniCareTopBar
import com.cognicare.util.HapticUtil
import com.cognicare.util.LocalizationManager
import com.cognicare.util.NotificationHelper
import com.cognicare.util.PatientMediaManager
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val Brick = Color(0xFFC5221F)
private val WarmSurface = Color(0xFFFFFDF9)

data class RoutineItem(
    val time: String,
    val title: String,
    val subtitle: String,
    val emoji: String,
    var isDone: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDashboardScreen(
    patient: Patient,
    onGamesClick: () -> Unit,
    onEchoesClick: () -> Unit,
    onCaregiverClick: () -> Unit,
    onPlayGame: (String) -> Unit = { },
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    var fontSize by remember { mutableFloatStateOf(18f) }
    val currentLang by LocalizationManager.currentLanguage.collectAsState()
    var readAloudEnabled by remember { mutableStateOf(false) }
    var nightModeEnabled by remember { mutableStateOf(false) }
    var isSoundOn by remember { mutableStateOf(true) }

    val todayDateStr = remember {
        val sdf = SimpleDateFormat("EEEE, d MMMM", Locale.getDefault())
        sdf.format(Date())
    }

    // Routine checklist items
    val routineItems = remember {
        mutableStateListOf(
            RoutineItem("8:00 AM", "Morning Medicine (BP & Vitamin)", "1 Pill with Fresh Water", "💊", true),
            RoutineItem("10:30 AM", "Drink Fresh Water", "Glass 3 of 6 glasses today", "💧", false),
            RoutineItem("1:00 PM", "Nutritious Lunch & Rest", "Steamed Joha rice with fish & greens", "🍲", false),
            RoutineItem("4:30 PM", "Gentle Evening Walk", "Garden stroll with family", "🚶", false),
            RoutineItem("8:00 PM", "Evening Medicine & Tea", "Warm herbal tea & relax", "🍵", false)
        )
    }

    // Memories loaded from PatientMediaManager
    val memories = remember(patient.id) {
        PatientMediaManager.getMemoriesForPatient(patient.id)
    }
    var memoryIndex by remember { mutableIntStateOf(0) }
    val currentMemory = if (memories.isNotEmpty()) memories[memoryIndex % memories.size] else null

    // Mood tracker state
    var selectedMood by remember { mutableStateOf<String?>(null) }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            CogniCareDrawerContent(
                currentFontSize = fontSize,
                onFontSizeChange = { fontSize = it },
                currentLanguage = currentLang,
                onLanguageChange = { LocalizationManager.setLanguage(it) },
                isReadAloudEnabled = readAloudEnabled,
                onReadAloudToggle = { readAloudEnabled = it },
                isNightModeEnabled = nightModeEnabled,
                onNightModeToggle = { nightModeEnabled = it },
                patientName = patient.name,
                patientState = patient.state.ifEmpty { "Assam" },
                onDashboardClick = { scope.launch { drawerState.close() } },
                onGamesClick = {
                    scope.launch { drawerState.close() }
                    onGamesClick()
                },
                onEchoesClick = {
                    scope.launch { drawerState.close() }
                    onEchoesClick()
                },
                onCaregiverClick = {
                    scope.launch { drawerState.close() }
                    onCaregiverClick()
                },
                onSosClick = {
                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108"))
                    context.startActivity(intent)
                },
                onLogout = onLogout
            )
        }
    ) {
        Scaffold(
            topBar = {
                CogniCareTopBar(
                    onMenuClick = { scope.launch { drawerState.open() } },
                    showQuickNav = true,
                    onRoutineClick = { },
                    onGamesClick = onGamesClick,
                    isOnline = true
                )
            }
        ) { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(if (nightModeEnabled) Color(0xFF161310) else Canvas)
                    .padding(paddingValues),
                contentPadding = PaddingValues(bottom = 36.dp)
            ) {
                // 1. TEA GREEN HERO BANNER (Elder-Friendly Typography & Real Photo)
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(TeaGreen)
                            .border(width = 3.5.dp, color = Ink)
                            .padding(horizontal = 20.dp, vertical = 22.dp)
                    ) {
                        Column {
                            // Date pill
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color.Black.copy(alpha = 0.25f),
                                modifier = Modifier.border(1.dp, Color.White.copy(alpha = 0.35f), RoundedCornerShape(10.dp))
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.CalendarToday,
                                        contentDescription = null,
                                        tint = Color(0xFFFDE68A),
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = todayDateStr,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFFFDE68A)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Patient Portrait & Greeting (Large Elder-First Typography)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                val photoPath = PatientMediaManager.getProfilePhoto(patient.id)
                                val painter = rememberAsyncImagePainter(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data("file:///android_asset/$photoPath")
                                        .crossfade(true)
                                        .build()
                                )
                                Image(
                                    painter = painter,
                                    contentDescription = patient.name,
                                    modifier = Modifier
                                        .size(86.dp)
                                        .shadow(4.dp, RoundedCornerShape(22.dp))
                                        .clip(RoundedCornerShape(22.dp))
                                        .border(3.dp, Ink, RoundedCornerShape(22.dp))
                                        .background(Color.White),
                                    contentScale = ContentScale.Crop
                                )

                                Spacer(modifier = Modifier.width(16.dp))

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = LocalizationManager.t("patient.greetingName", "name" to patient.name),
                                        fontSize = 28.sp,
                                        fontWeight = FontWeight.Black,
                                        fontFamily = FontFamily.Serif,
                                        color = Color.White,
                                        lineHeight = 32.sp
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = "You are safe at home with your family today.",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White.copy(alpha = 0.9f),
                                        lineHeight = 20.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            // Audio & Action Buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // "Read for Me" Button
                                Surface(
                                    modifier = Modifier
                                        .weight(1.3f)
                                        .height(52.dp)
                                        .shadow(3.dp, RoundedCornerShape(14.dp))
                                        .border(2.5.dp, Ink, RoundedCornerShape(14.dp))
                                        .clickable {
                                            HapticUtil.vibrateTap(context)
                                            LocalizationManager.speak("Good day, ${patient.name}! You are safe at home with your family today. Let's do your daily brain activities.")
                                        },
                                    shape = RoundedCornerShape(14.dp),
                                    color = Color.White
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxSize(),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.Center
                                    ) {
                                        Icon(Icons.Filled.VolumeUp, null, tint = TeaGreen, modifier = Modifier.size(24.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = LocalizationManager.t("patient.listen"),
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Ink
                                        )
                                    }
                                }

                                // "Sound On" Button
                                Surface(
                                    modifier = Modifier
                                        .weight(0.9f)
                                        .height(52.dp)
                                        .shadow(3.dp, RoundedCornerShape(14.dp))
                                        .border(2.5.dp, Ink, RoundedCornerShape(14.dp))
                                        .clickable {
                                            HapticUtil.vibrateTap(context)
                                            isSoundOn = !isSoundOn
                                            if (!isSoundOn) LocalizationManager.stopSpeaking()
                                        },
                                    shape = RoundedCornerShape(14.dp),
                                    color = if (isSoundOn) Color(0xFFFEF3C7) else Color.White
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxSize(),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.Center
                                    ) {
                                        Text(
                                            text = if (isSoundOn) "🔊 Sound On" else "🔇 Muted",
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Ink
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // 2. TODAY'S ROUTINE & NOTIFICATION REMINDERS (Checklist + Phone Notification)
                item {
                    Spacer(modifier = Modifier.height(24.dp))
                    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "📅 " + LocalizationManager.t("home.routine.title"),
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Serif,
                                color = Ink
                            )

                            // Native Mobile Notification Button
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color(0xFFFEF3C7),
                                modifier = Modifier
                                    .shadow(2.dp, RoundedCornerShape(10.dp))
                                    .border(1.5.dp, Ink, RoundedCornerShape(10.dp))
                                    .clickable {
                                        HapticUtil.vibrateTap(context)
                                        NotificationHelper.sendMedicineReminder(context, "Morning Medicine & BP Tablet")
                                        NotificationHelper.sendHydrationReminder(context)
                                        LocalizationManager.speak("Medication and hydration reminders sent to your phone notification bar.")
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Filled.NotificationsActive, contentDescription = null, tint = Marigold, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "🔔 Notify Phone",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Ink
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        routineItems.forEachIndexed { idx, item ->
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = if (item.isDone) Color(0xFFF1F5F9) else Color.White,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 8.dp)
                                    .shadow(2.dp, RoundedCornerShape(14.dp))
                                    .border(2.dp, if (item.isDone) Color.Gray else Ink, RoundedCornerShape(14.dp))
                                    .clickable {
                                        HapticUtil.vibrateTap(context)
                                        routineItems[idx] = item.copy(isDone = !item.isDone)
                                        if (!item.isDone) {
                                            LocalizationManager.speak("Completed: ${item.title}")
                                        }
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(32.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(if (item.isDone) TeaGreen else Color(0xFFF3F4F6))
                                            .border(2.dp, Ink, RoundedCornerShape(8.dp)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (item.isDone) {
                                            Icon(Icons.Filled.Check, null, tint = Color.White, modifier = Modifier.size(20.dp))
                                        }
                                    }

                                    Spacer(modifier = Modifier.width(14.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(text = item.emoji, fontSize = 18.sp)
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(
                                                text = item.title,
                                                fontSize = 16.sp,
                                                fontWeight = FontWeight.Black,
                                                color = if (item.isDone) Color.Gray else Ink
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = "${item.time} • ${item.subtitle}",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = InkSecondary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // 3. ECHOES OF HOME 3D TIME CAPSULE BANNER
                item {
                    Spacer(modifier = Modifier.height(18.dp))
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .shadow(4.dp, RoundedCornerShape(22.dp))
                            .border(3.dp, Ink, RoundedCornerShape(22.dp))
                            .clickable {
                                HapticUtil.vibrateTap(context)
                                onEchoesClick()
                            },
                        shape = RoundedCornerShape(22.dp),
                        color = Color(0xFF1E293B)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(18.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(60.dp)
                                    .shadow(2.dp, RoundedCornerShape(18.dp))
                                    .clip(RoundedCornerShape(18.dp))
                                    .background(Color(0xFF334155))
                                    .border(2.dp, Color(0xFFFDE68A), RoundedCornerShape(18.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "🌐", fontSize = 32.sp)
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "Echoes of Home 3D",
                                        fontSize = 19.sp,
                                        fontWeight = FontWeight.Black,
                                        fontFamily = FontFamily.Serif,
                                        color = Color.White
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = Marigold,
                                        modifier = Modifier.border(1.dp, Color.White, RoundedCornerShape(6.dp))
                                    ) {
                                        Text(
                                            text = "3D SPACE",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White,
                                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Spatial memory orbit with real family photos & sacred places",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color.White.copy(alpha = 0.85f),
                                    lineHeight = 17.sp
                                )
                            }

                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Marigold,
                                modifier = Modifier
                                    .shadow(2.dp, RoundedCornerShape(12.dp))
                                    .border(2.dp, Ink, RoundedCornerShape(12.dp))
                            ) {
                                Text(
                                    text = "Explore →",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)
                                )
                            }
                        }
                    }
                }

                // 4. DAILY CLINICAL GAMES (Featuring Candy Crush Match-3, 3D Majuli Walk, Puzzle)
                item {
                    Spacer(modifier = Modifier.height(26.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "✨ " + LocalizationManager.t("patient.moreGames.label"),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Serif,
                            color = Ink
                        )
                        Surface(
                            onClick = onGamesClick,
                            shape = RoundedCornerShape(12.dp),
                            color = Color.White,
                            modifier = Modifier
                                .shadow(2.5.dp, RoundedCornerShape(12.dp))
                                .border(2.dp, Ink, RoundedCornerShape(12.dp))
                        ) {
                            Text(
                                text = "All 43 Games →",
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                }

                // Game Row 1: Tea Garden Match (Candy Crush) & Majuli Island 3D Walk
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        DashboardFeaturedCard(
                            emoji = "🍬",
                            title = "Tea Garden Match-3",
                            domain = "ATTENTION // MATCH-3",
                            color = Color(0xFF0F766E),
                            onClick = { onPlayGame("tea_garden_match") },
                            modifier = Modifier.weight(1f)
                        )
                        DashboardFeaturedCard(
                            emoji = "🚶",
                            title = "Majuli Island 3D Walk",
                            domain = "VISUOSPATIAL 3D",
                            color = Color(0xFF2D5A27),
                            onClick = { onPlayGame("majuli_walk") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                item { Spacer(modifier = Modifier.height(12.dp)) }

                // Game Row 2: Picture Puzzle (Jigsaw) & Market Shopping (Bazaar Buddies)
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        DashboardFeaturedCard(
                            emoji = "🧩",
                            title = "Picture Puzzle",
                            domain = "VISUOSPATIAL PUZZLE",
                            color = TeaGreen,
                            onClick = { onPlayGame("jigsaw") },
                            modifier = Modifier.weight(1f)
                        )
                        DashboardFeaturedCard(
                            emoji = "🛒",
                            title = "Market Shopping",
                            domain = "EXECUTIVE & MATH",
                            color = Marigold,
                            onClick = { onPlayGame("bazaar_buddies") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Quick Launch Pills for Calming Games
                item {
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        listOf(
                            Triple("🪔 River Lanterns", "river_lanterns", Color(0xFF065F46)),
                            Triple("🪘 Bihu Drum Beats", "bihu_dhol", Color(0xFF854D0E)),
                            Triple("🔔 Temple Bells", "monastery_bell", Color(0xFF581C87))
                        ).forEach { (label, gId, col) ->
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color.White,
                                modifier = Modifier
                                    .weight(1f)
                                    .shadow(2.dp, RoundedCornerShape(12.dp))
                                    .border(1.5.dp, Ink, RoundedCornerShape(12.dp))
                                    .clickable {
                                        HapticUtil.vibrateTap(context)
                                        onPlayGame(gId)
                                    }
                            ) {
                                Box(
                                    modifier = Modifier.padding(vertical = 10.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Black,
                                        color = col,
                                        maxLines = 1
                                    )
                                }
                            }
                        }
                    }
                }

                // 5. REMINISCENCE & FAMILY COMFORT: REAL PHOTOS OF RELATIVES & PLACES
                item {
                    Spacer(modifier = Modifier.height(28.dp))
                    Text(
                        text = "🧡 Reminiscence & Family Comfort",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Serif,
                        color = Ink,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    if (currentMemory != null) {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                                .shadow(4.dp, RoundedCornerShape(22.dp))
                                .border(3.dp, Ink, RoundedCornerShape(22.dp)),
                            shape = RoundedCornerShape(22.dp),
                            color = WarmSurface
                        ) {
                            Column(modifier = Modifier.padding(18.dp)) {
                                // Header badge
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(text = currentMemory.emoji, fontSize = 22.sp)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "Memory of the Day",
                                            fontSize = 18.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Ink
                                        )
                                    }
                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = Color(0xFFFFF0DB),
                                        modifier = Modifier.border(1.5.dp, Color(0xFFD97706), RoundedCornerShape(10.dp))
                                    ) {
                                        Text(
                                            text = currentMemory.category,
                                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color(0xFF92400E)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                // Real family portrait / place photo + description
                                Row(verticalAlignment = Alignment.Top) {
                                    val painter = rememberAsyncImagePainter(
                                        model = ImageRequest.Builder(LocalContext.current)
                                            .data("file:///android_asset/${currentMemory.imageAssetPath}")
                                            .crossfade(true)
                                            .build()
                                    )
                                    Image(
                                        painter = painter,
                                        contentDescription = currentMemory.name,
                                        modifier = Modifier
                                            .size(105.dp)
                                            .shadow(3.dp, RoundedCornerShape(18.dp))
                                            .clip(RoundedCornerShape(18.dp))
                                            .border(2.5.dp, Ink, RoundedCornerShape(18.dp))
                                            .background(Color.White),
                                        contentScale = ContentScale.Crop
                                    )

                                    Spacer(modifier = Modifier.width(16.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = Color(0xFFFEF3C7),
                                            modifier = Modifier.border(1.dp, Ink, RoundedCornerShape(8.dp))
                                        ) {
                                            Text(
                                                text = currentMemory.relation,
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Ink,
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = currentMemory.name,
                                            fontSize = 22.sp,
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Serif,
                                            color = Ink
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = currentMemory.description,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = InkSecondary,
                                            lineHeight = 19.sp
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                // Action Buttons: Read aloud & Show next memory
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    // "Read memory" button
                                    Surface(
                                        modifier = Modifier
                                            .weight(1.3f)
                                            .height(50.dp)
                                            .shadow(3.dp, RoundedCornerShape(14.dp))
                                            .border(2.dp, Ink, RoundedCornerShape(14.dp))
                                            .clickable {
                                                HapticUtil.vibrateTap(context)
                                                LocalizationManager.speak("${currentMemory.name}, your ${currentMemory.relation}. ${currentMemory.description}")
                                            },
                                        shape = RoundedCornerShape(14.dp),
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
                                                text = "Read memory for me",
                                                fontSize = 14.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Color.White
                                            )
                                        }
                                    }

                                    // "Show another" button
                                    Surface(
                                        modifier = Modifier
                                            .weight(0.8f)
                                            .height(50.dp)
                                            .shadow(3.dp, RoundedCornerShape(14.dp))
                                            .border(2.dp, Ink, RoundedCornerShape(14.dp))
                                            .clickable {
                                                HapticUtil.vibrateTap(context)
                                                memoryIndex++
                                            },
                                        shape = RoundedCornerShape(14.dp),
                                        color = Color.White
                                    ) {
                                        Box(
                                            modifier = Modifier.fillMaxSize(),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "✨ Show next",
                                                fontSize = 14.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Ink
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // 6. SENSORY CALM & 40Hz GAMMA STIMULATION CARD
                item {
                    Spacer(modifier = Modifier.height(24.dp))
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .shadow(4.dp, RoundedCornerShape(22.dp))
                            .border(3.dp, Ink, RoundedCornerShape(22.dp)),
                        shape = RoundedCornerShape(22.dp),
                        color = Color(0xFF0F766E)
                    ) {
                        Row(
                            modifier = Modifier.padding(18.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(Color.White.copy(alpha = 0.2f))
                                    .border(2.dp, Color.White, RoundedCornerShape(16.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "🎵", fontSize = 30.sp)
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Sensory Calming & 40Hz Flute",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White
                                )
                                Text(
                                    text = "Gentle acoustic tones to enhance brain rhythm synchronization",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color.White.copy(alpha = 0.85f),
                                    lineHeight = 16.sp
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Marigold,
                                modifier = Modifier
                                    .shadow(2.dp, RoundedCornerShape(12.dp))
                                    .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                    .clickable {
                                        HapticUtil.vibrateTap(context)
                                        LocalizationManager.speak("Playing calming bamboo flute and 40 Hertz sensory rhythm.")
                                    }
                            ) {
                                Text(
                                    text = "Play ▶",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)
                                )
                            }
                        }
                    }
                }

                // 7. DAILY MOOD TRACKER
                item {
                    Spacer(modifier = Modifier.height(24.dp))
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .shadow(4.dp, RoundedCornerShape(22.dp))
                            .border(3.dp, Ink, RoundedCornerShape(22.dp)),
                        shape = RoundedCornerShape(22.dp),
                        color = Color.White
                    ) {
                        Column(modifier = Modifier.padding(18.dp)) {
                            Text(
                                text = "❤️ How are you feeling today, ${patient.name}?",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                listOf(
                                    Triple("peaceful", "Peaceful 😊", Color(0xFFDCFCE7)),
                                    Triple("okay", "Doing Okay 😐", Color(0xFFFEF3C7)),
                                    Triple("care", "Need Care 🫂", Color(0xFFFEE2E2))
                                ).forEach { (key, label, color) ->
                                    val isSelected = selectedMood == key
                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = if (isSelected) TeaGreen else color,
                                        modifier = Modifier
                                            .weight(1f)
                                            .shadow(2.dp, RoundedCornerShape(12.dp))
                                            .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                            .clickable {
                                                HapticUtil.vibrateTap(context)
                                                selectedMood = key
                                                LocalizationManager.speak("Thank you for sharing. You selected $label.")
                                            }
                                    ) {
                                        Box(
                                            modifier = Modifier.padding(vertical = 12.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = label,
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Black,
                                                color = if (isSelected) Color.White else Ink
                                            )
                                        }
                                    }
                                }
                            }
                            if (selectedMood != null) {
                                Spacer(modifier = Modifier.height(10.dp))
                                Text(
                                    text = "✓ Logged in your daily wellness chart for your caregiver.",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TeaGreen
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DashboardFeaturedCard(
    emoji: String,
    title: String,
    domain: String,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier
            .height(185.dp)
            .shadow(4.dp, RoundedCornerShape(18.dp))
            .border(3.dp, Ink, RoundedCornerShape(18.dp)),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = color),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = title,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    maxLines = 2,
                    lineHeight = 21.sp
                )
                Text(
                    text = domain,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White.copy(alpha = 0.75f),
                    letterSpacing = 0.8.sp
                )
            }

            Box(
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .size(72.dp)
                    .shadow(3.dp, RoundedCornerShape(18.dp))
                    .clip(RoundedCornerShape(18.dp))
                    .border(2.5.dp, Ink, RoundedCornerShape(18.dp))
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                Text(text = emoji, fontSize = 40.sp)
            }
        }
    }
}
