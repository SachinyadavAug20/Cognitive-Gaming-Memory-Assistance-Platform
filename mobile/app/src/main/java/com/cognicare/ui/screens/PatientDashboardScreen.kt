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
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.cognicare.data.local.Patient
import com.cognicare.ui.components.CogniCareTopBar
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager
import com.cognicare.util.NotificationHelper
import com.cognicare.util.PatientMediaManager
import com.cognicare.util.MemoryItem
import com.cognicare.di.ServiceLocator
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)

@Immutable
data class RoutineItem(
    val time: String,
    val title: String,
    val subtitle: String,
    val emoji: String,
    val key: String,
    val isDone: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDashboardScreen(
    patient: Patient,
    onGamesClick: () -> Unit,
    onEchoesClick: () -> Unit,
    onCaregiverClick: () -> Unit,
    onAdminClick: () -> Unit = {},
    onPlayGame: (String) -> Unit = { },
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val settingsDataStore = remember { ServiceLocator.provideSettingsDataStore(context.applicationContext as android.app.Application) }
    val coroutineScope = rememberCoroutineScope()

    val persistedReadAloud by settingsDataStore.readAloud.collectAsState(initial = false)
    val persistedMood by settingsDataStore.lastMood.collectAsState(initial = null)
    val persistedRoutine by settingsDataStore.routineCompleted.collectAsState(initial = emptySet())
    val persistedNightMode by settingsDataStore.nightMode.collectAsState(initial = false)

    var readAloudEnabled by remember { mutableStateOf(persistedReadAloud) }
    var isSoundOn by remember { mutableStateOf(true) }
    var selectedMood by remember { mutableStateOf(persistedMood) }

    val todayDateStr = remember {
        SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()).format(Date())
    }

    val onGamesClickRemembered = remember(onGamesClick) { onGamesClick }
    val onEchoesClickRemembered = remember(onEchoesClick) { onEchoesClick }

    LaunchedEffect(patient.id, persistedReadAloud) {
        if (persistedReadAloud) {
            kotlinx.coroutines.delay(500)
            LocalizationManager.speak("Good day, ${patient.name}! You are safe at home with your family today.")
        }
    }

    val routineItems = remember {
        mutableStateListOf(
            RoutineItem("8:00 AM", "Morning Medicine", "1 Pill with water", "\uD83D\uDC8A", "medicine"),
            RoutineItem("10:30 AM", "Drink Water", "Glass 3 of 6 today", "\uD83D\uDCA7", "water"),
            RoutineItem("1:00 PM", "Lunch & Rest", "Rice with fish & greens", "\uD83C\uDF72", "lunch"),
            RoutineItem("4:30 PM", "Evening Walk", "Garden stroll", "\uD83D\uDEB6", "walk"),
            RoutineItem("8:00 PM", "Evening Tea", "Herbal tea & relax", "\uD83C\uDF75", "tea")
        ).apply {
            forEachIndexed { idx, item ->
                if (item.key in persistedRoutine) {
                    this[idx] = item.copy(isDone = true)
                }
            }
        }
    }

    val memories = remember(patient.id) { PatientMediaManager.getMemoriesForPatient(patient.id) }
    var memoryIndex by remember { mutableIntStateOf(0) }
    val currentMemory = if (memories.isNotEmpty()) memories[memoryIndex % memories.size] else null

    Scaffold(
        topBar = {
            CogniCareTopBar(
                showQuickNav = true,
                onRoutineClick = { },
                onGamesClick = onGamesClickRemembered,
                isOnline = true
            )
        },
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(if (persistedNightMode) Color(0xFF161310) else Canvas)
                .padding(paddingValues),
            contentPadding = PaddingValues(bottom = 100.dp)
        ) {
            item {
                DashboardHero(
                    patient = patient,
                    todayDateStr = todayDateStr,
                    isSoundOn = isSoundOn,
                    onReadAloud = {
                        ElderlyFeedback.onTap(context)
                        LocalizationManager.speak("Good day, ${patient.name}! You are safe at home with your family today.")
                    },
                    onToggleSound = {
                        ElderlyFeedback.onTap(context)
                        isSoundOn = !isSoundOn
                        if (!isSoundOn) LocalizationManager.stopSpeaking()
                    }
                )
            }

            item {
                DailyRoutineSection(
                    routineItems = routineItems,
                    onToggleItem = { idx, item ->
                        ElderlyFeedback.onTap(context)
                        routineItems[idx] = item.copy(isDone = !item.isDone)
                        val completed = routineItems.filter { it.isDone }.map { it.key }.toSet()
                        coroutineScope.launch {
                            settingsDataStore.setRoutineCompleted(completed)
                        }
                        if (!item.isDone) {
                            ElderlyFeedback.onSuccess(context)
                            LocalizationManager.speak("Completed: ${item.title}")
                        }
                    },
                    onNotifyPhone = {
                        ElderlyFeedback.onTap(context)
                        NotificationHelper.sendMedicineReminder(context, "Morning Medicine")
                        NotificationHelper.sendHydrationReminder(context)
                    }
                )
            }

            item {
                QuickActionsSection(
                    onGamesClick = onGamesClickRemembered,
                    onEchoesClick = onEchoesClickRemembered,
                    onPlayGame = onPlayGame
                )
            }

            if (currentMemory != null) {
                item {
                    MemoryCard(
                        memory = currentMemory,
                        onReadMemory = {
                            ElderlyFeedback.onTap(context)
                            LocalizationManager.speak("${currentMemory.name}, your ${currentMemory.relation}. ${currentMemory.description}")
                        },
                        onNextMemory = {
                            ElderlyFeedback.onTap(context)
                            memoryIndex++
                        }
                    )
                }
            }

            item {
                MoodTrackerSection(
                    selectedMood = selectedMood,
                    onMoodSelected = { key, label ->
                        ElderlyFeedback.onTap(context)
                        selectedMood = key
                        coroutineScope.launch {
                            settingsDataStore.setMood(key)
                        }
                        LocalizationManager.speak("Thank you. You selected $label.")
                    }
                )
            }
        }
    }
}

@Composable
private fun DashboardHero(
    patient: Patient,
    todayDateStr: String,
    isSoundOn: Boolean,
    onReadAloud: () -> Unit,
    onToggleSound: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(TeaGreen)
            .border(width = 3.5.dp, color = Ink)
            .padding(horizontal = 20.dp, vertical = 22.dp)
    ) {
        Column {
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
                    Icon(Icons.Filled.CalendarToday, null, tint = Color(0xFFFDE68A), modifier = Modifier.size(18.dp))
                    Text(todayDateStr, fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color(0xFFFDE68A))
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

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
                    contentDescription = "Profile photo of ${patient.name}",
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
                        text = "You are safe at home with your family.",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White.copy(alpha = 0.9f),
                        lineHeight = 20.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Surface(
                    modifier = Modifier
                        .weight(1.3f)
                        .height(60.dp)
                        .semantics { contentDescription = "Read greeting aloud" }
                        .shadow(4.dp, RoundedCornerShape(16.dp))
                        .border(3.dp, Ink, RoundedCornerShape(16.dp))
                        .clickable { onReadAloud() },
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White
                ) {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Filled.VolumeUp, null, tint = TeaGreen, modifier = Modifier.size(28.dp))
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = LocalizationManager.t("patient.listen"),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink
                        )
                    }
                }

                Surface(
                    modifier = Modifier
                        .weight(0.9f)
                        .height(60.dp)
                        .semantics { contentDescription = if (isSoundOn) "Sound on, tap to mute" else "Muted, tap to unmute" }
                        .shadow(4.dp, RoundedCornerShape(16.dp))
                        .border(3.dp, Ink, RoundedCornerShape(16.dp))
                        .clickable { onToggleSound() },
                    shape = RoundedCornerShape(16.dp),
                    color = if (isSoundOn) Color(0xFFFEF3C7) else Color.White
                ) {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = if (isSoundOn) "\uD83D\uDD0A Sound On" else "\uD83D\uDD07 Muted",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DailyRoutineSection(
    routineItems: SnapshotStateList<RoutineItem>,
    onToggleItem: (Int, RoutineItem) -> Unit,
    onNotifyPhone: () -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 24.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "\uD83D\uDCC5 Daily Routine",
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Serif,
                color = Ink
            )
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFFEF3C7),
                modifier = Modifier
                    .shadow(2.dp, RoundedCornerShape(12.dp))
                    .border(2.dp, Ink, RoundedCornerShape(12.dp))
                    .semantics { contentDescription = "Send reminders to phone" }
                    .clickable { onNotifyPhone() }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Filled.NotificationsActive, null, tint = Marigold, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Remind Me", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Ink)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        routineItems.forEachIndexed { idx, item ->
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = if (item.isDone) Color(0xFFF1F5F9) else Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp)
                    .shadow(2.dp, RoundedCornerShape(14.dp))
                    .border(2.dp, if (item.isDone) Color(0xFF9CA3AF) else Ink, RoundedCornerShape(14.dp))
                    .semantics { contentDescription = "${item.title}, ${if (item.isDone) "completed" else "not completed"}" }
                    .clickable { onToggleItem(idx, item) }
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (item.isDone) TeaGreen else Color(0xFFF3F4F6))
                            .border(2.dp, Ink, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        if (item.isDone) {
                            Icon(Icons.Filled.Check, null, tint = Color.White, modifier = Modifier.size(28.dp))
                        } else {
                            Text(item.emoji, fontSize = 22.sp)
                        }
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = item.title,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = if (item.isDone) Color(0xFF6B7280) else Ink
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "${item.time} • ${item.subtitle}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = InkSecondary
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickActionsSection(
    onGamesClick: () -> Unit,
    onEchoesClick: () -> Unit,
    onPlayGame: (String) -> Unit
) {
    val context = LocalContext.current
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Text(
            text = "\u2728 Quick Activities",
            fontSize = 22.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Serif,
            color = Ink
        )
        Spacer(modifier = Modifier.height(14.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            QuickActionCard(
                emoji = "\uD83C\uDFB5",
                title = "Calming Music",
                subtitle = "Soothing sounds",
                color = Color(0xFF1565C0),
                onClick = { onPlayGame("river_lanterns") },
                modifier = Modifier.weight(1f)
            )
            QuickActionCard(
                emoji = "\uD83E\uDDE0",
                title = "Memory Game",
                subtitle = "Recall & match",
                color = Color(0xFF6A1B9A),
                onClick = onGamesClick,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(4.dp, RoundedCornerShape(18.dp))
                .border(3.dp, Ink, RoundedCornerShape(18.dp))
                .semantics { contentDescription = "Open Echoes of Home 3D memory space" }
                .clickable {
                    ElderlyFeedback.onTap(context)
                    onEchoesClick()
                },
            shape = RoundedCornerShape(18.dp),
            color = Color(0xFF1E293B)
        ) {
            Row(
                modifier = Modifier.padding(18.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF334155))
                        .border(2.dp, Color(0xFFFDE68A), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("\uD83C\uDF0D", fontSize = 28.sp)
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text("Echoes of Home 3D", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
                    Text("Spatial memory with family photos", fontSize = 13.sp, color = Color.White.copy(alpha = 0.8f))
                }
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Marigold,
                    modifier = Modifier.border(2.dp, Ink, RoundedCornerShape(12.dp))
                ) {
                    Text("Open", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Color.White, modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickActionCard(
    emoji: String,
    title: String,
    subtitle: String,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    Card(
        onClick = {
            ElderlyFeedback.onTap(context)
            onClick()
        },
        modifier = modifier
            .height(140.dp)
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
            Text(title, fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
            Text(subtitle, fontSize = 12.sp, color = Color.White.copy(alpha = 0.8f))
            Box(
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .size(56.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                Text(emoji, fontSize = 32.sp)
            }
        }
    }
}

@Composable
private fun MemoryCard(
    memory: MemoryItem,
    onReadMemory: () -> Unit,
    onNextMemory: () -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 24.dp)) {
        Text(
            text = "\uD83E\uDDE1 Family Memory",
            fontSize = 22.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Serif,
            color = Ink
        )
        Spacer(modifier = Modifier.height(12.dp))

        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(4.dp, RoundedCornerShape(22.dp))
                .border(3.dp, Ink, RoundedCornerShape(22.dp)),
            shape = RoundedCornerShape(22.dp),
            color = Color(0xFFFFFDF9)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val painter = rememberAsyncImagePainter(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data("file:///android_asset/${memory.imageAssetPath}")
                            .crossfade(true)
                            .build()
                    )
                    Image(
                        painter = painter,
                        contentDescription = memory.name,
                        modifier = Modifier
                            .size(90.dp)
                            .shadow(3.dp, RoundedCornerShape(18.dp))
                            .clip(RoundedCornerShape(18.dp))
                            .border(2.5.dp, Ink, RoundedCornerShape(18.dp))
                            .background(Color.White),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.width(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFFFEF3C7),
                            modifier = Modifier.border(1.dp, Ink, RoundedCornerShape(8.dp))
                        ) {
                            Text(memory.relation, fontSize = 12.sp, fontWeight = FontWeight.Black, color = Ink, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(memory.name, fontSize = 20.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Ink)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(memory.description, fontSize = 13.sp, color = InkSecondary, lineHeight = 17.sp)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Surface(
                        modifier = Modifier
                            .weight(1.3f)
                            .height(52.dp)
                            .semantics { contentDescription = "Read memory aloud" }
                            .shadow(3.dp, RoundedCornerShape(14.dp))
                            .border(2.dp, Ink, RoundedCornerShape(14.dp))
                            .clickable { onReadMemory() },
                        shape = RoundedCornerShape(14.dp),
                        color = TeaGreen
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Filled.VolumeUp, null, tint = Color.White, modifier = Modifier.size(22.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Read for me", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color.White)
                        }
                    }
                    Surface(
                        modifier = Modifier
                            .weight(0.8f)
                            .height(52.dp)
                            .semantics { contentDescription = "Show next memory" }
                            .shadow(3.dp, RoundedCornerShape(14.dp))
                            .border(2.dp, Ink, RoundedCornerShape(14.dp))
                            .clickable { onNextMemory() },
                        shape = RoundedCornerShape(14.dp),
                        color = Color.White
                    ) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("Next \u2192", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Ink)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MoodTrackerSection(
    selectedMood: String?,
    onMoodSelected: (String, String) -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 24.dp)) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(4.dp, RoundedCornerShape(22.dp))
                .border(3.dp, Ink, RoundedCornerShape(22.dp)),
            shape = RoundedCornerShape(22.dp),
            color = Color.White
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "\u2764\uFE0F How are you feeling today?",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = Ink
                )
                Spacer(modifier = Modifier.height(14.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    listOf(
                        Triple("happy", "Happy \uD83D\uDE0A", Color(0xFFDCFCE7)),
                        Triple("peaceful", "Peaceful \uD83D\uDE0C", Color(0xFFDBEAFE)),
                        Triple("okay", "Okay \uD83D\uDE10", Color(0xFFFEF3C7)),
                        Triple("care", "Need Care \uD83E\uDD17", Color(0xFFFEE2E2))
                    ).forEach { (key, label, color) ->
                        val isSelected = selectedMood == key
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = if (isSelected) TeaGreen else color,
                            modifier = Modifier
                                .weight(1f)
                                .height(56.dp)
                                .semantics { contentDescription = label }
                                .shadow(2.dp, RoundedCornerShape(14.dp))
                                .border(2.dp, Ink, RoundedCornerShape(14.dp))
                                .clickable { onMoodSelected(key, label) }
                        ) {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text(
                                    text = label,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (isSelected) Color.White else Ink
                                )
                            }
                        }
                    }
                }
                if (selectedMood != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "\u2713 Logged for your caregiver.",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = TeaGreen
                    )
                }
            }
        }
    }
}
