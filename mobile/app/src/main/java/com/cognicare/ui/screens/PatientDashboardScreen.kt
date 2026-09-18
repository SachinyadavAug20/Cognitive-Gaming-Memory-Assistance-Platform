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

private fun getPatientPhotoPath(patient: Patient): String? {
    return when (patient.id) {
        1L -> "sample-images/patient_1_biren_borah/patient_profile_photo_biren_borah.jpg"
        2L -> "sample-images/patient_2_mary_nongrum/patient_profile_photo_mary_nongrum.jpg"
        3L -> "sample-images/patient_3_ibochouba_singh/patient_profile_photo_ibochouba_singh.jpg"
        4L -> "sample-images/patient_4_lalhmingmawii_sailo/patient_profile_photo_lalhmingmawii_sailo.jpg"
        5L -> "sample-images/patient_5_kevichusa_angami/patient_profile_photo_kevichusa_angami.jpg"
        else -> "sample-images/patient_1_biren_borah/patient_profile_photo_biren_borah.jpg"
    }
}

private fun getFamilyMemberPhoto(index: Int): String {
    val relativePhotos = listOf(
        "sample-images/patient_1_biren_borah/relatives/daughter.jpg",
        "sample-images/patient_1_biren_borah/relatives/spouse.jpg",
        "sample-images/patient_1_biren_borah/relatives/grandchild.jpg",
        "sample-images/patient_1_biren_borah/places/lake.jpg",
        "sample-images/patient_1_biren_borah/places/namghar.jpg"
    )
    return relativePhotos[index % relativePhotos.size]
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDashboardScreen(
    patient: Patient,
    onGamesClick: () -> Unit,
    onEchoesClick: () -> Unit,
    onCaregiverClick: () -> Unit,
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

    // Memories rotation
    data class MemoryData(val name: String, val relation: String, val note: String, val emoji: String)
    val memories = remember {
        listOf(
            MemoryData("Manash Borah", "Son", "Eldest son, mechanical engineer in Guwahati. Visits every Sunday morning.", "👨‍💼"),
            MemoryData("Pratima Borah", "Spouse", "Married for 46 years. Loves gardening and cooking traditional Khar together.", "👵"),
            MemoryData("Arnav Borah", "Grandson", "8-year-old grandson. Loves hearing bedtime folklore tales about Kaziranga.", "👦"),
            MemoryData("Ananya Borah", "Daughter", "Youngest daughter, teacher at Cotton University. Calls every evening at 7 PM.", "👩‍🏫"),
            MemoryData("Hari Namghar", "Prayer Hall", "Traditional Assamese prayer hall for community hymns and evening Doba.", "🛕")
        )
    }
    var memoryIndex by remember { mutableIntStateOf(0) }
    val currentMemory = memories[memoryIndex % memories.size]

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
                // 1. TEA GREEN HERO BANNER
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(TeaGreen)
                            .border(width = 3.5.dp, color = Ink)
                            .padding(horizontal = 20.dp, vertical = 20.dp)
                    ) {
                        Column {
                            // Date pill
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color.Black.copy(alpha = 0.25f),
                                modifier = Modifier.border(1.dp, Color.White.copy(alpha = 0.35f), RoundedCornerShape(10.dp))
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.CalendarToday,
                                        contentDescription = null,
                                        tint = Color(0xFFFDE68A),
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Text(
                                        text = todayDateStr,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFFFDE68A)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            // Patient Portrait & Greeting
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                val photoPath = getPatientPhotoPath(patient)
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
                                        .size(80.dp)
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
                                        fontSize = 26.sp,
                                        fontWeight = FontWeight.Black,
                                        fontFamily = FontFamily.Serif,
                                        color = Color.White,
                                        lineHeight = 30.sp
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "You are safe at home with your family today.",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White.copy(alpha = 0.85f),
                                        lineHeight = 18.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            // Audio & Action Buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // "Read for Me" Button
                                Surface(
                                    modifier = Modifier
                                        .weight(1.2f)
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
                                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.Center
                                    ) {
                                        Icon(Icons.Filled.VolumeUp, null, tint = TeaGreen, modifier = Modifier.size(22.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = LocalizationManager.t("patient.listen"),
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Ink
                                        )
                                    }
                                }

                                // "Sound On" Button
                                Surface(
                                    modifier = Modifier
                                        .weight(0.8f)
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
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.Center
                                    ) {
                                        Text(text = if (isSoundOn) "🔊 Sound On" else "🔇 Muted", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Ink)
                                    }
                                }
                            }
                        }
                    }
                }

                // 2. TODAY'S ROUTINE & MEDICATION SCHEDULE (Checklist)
                item {
                    Spacer(modifier = Modifier.height(20.dp))
                    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "📅 " + LocalizationManager.t("home.routine.title"),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Serif,
                                color = Ink
                            )
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0xFFDCFCE7),
                                modifier = Modifier.border(1.dp, Ink, RoundedCornerShape(8.dp))
                            ) {
                                Text(
                                    text = "${routineItems.count { it.isDone }} of ${routineItems.size} done",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    color = TeaGreen,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

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
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(28.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(if (item.isDone) TeaGreen else Color(0xFFF3F4F6))
                                            .border(1.5.dp, Ink, RoundedCornerShape(8.dp)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (item.isDone) {
                                            Icon(Icons.Filled.Check, null, tint = Color.White, modifier = Modifier.size(18.dp))
                                        }
                                    }

                                    Spacer(modifier = Modifier.width(12.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(text = item.emoji, fontSize = 16.sp)
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(
                                                text = item.title,
                                                fontSize = 14.sp,
                                                fontWeight = FontWeight.Black,
                                                color = if (item.isDone) Color.Gray else Ink
                                            )
                                        }
                                        Text(
                                            text = "${item.time} • ${item.subtitle}",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = InkSecondary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // 3. ECHOES OF HOME 3D TIME CAPSULE FEATURED BANNER
                item {
                    Spacer(modifier = Modifier.height(14.dp))
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .shadow(4.dp, RoundedCornerShape(22.dp))
                            .border(3.dp, Ink, RoundedCornerShape(22.dp))
                            .clickable { onEchoesClick() },
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
                                    .size(56.dp)
                                    .shadow(2.dp, RoundedCornerShape(16.dp))
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(Color(0xFF334155))
                                    .border(2.dp, Color(0xFFFDE68A), RoundedCornerShape(16.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "🌐", fontSize = 30.sp)
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "Echoes of Home 3D",
                                        fontSize = 18.sp,
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
                                            text = "3D WebGL",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                                Text(
                                    text = "Explore 3D time capsule, orbit rings & sacred memories",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color.White.copy(alpha = 0.8f),
                                    lineHeight = 16.sp
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
                                    text = "Open 3D →",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)
                                )
                            }
                        }
                    }
                }

                // 4. DAILY CLINICAL ACTIVITIES (4 Featured Serious Games)
                item {
                    Spacer(modifier = Modifier.height(24.dp))
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
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Game cards row 1
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
                            domain = "VISUOSPATIAL",
                            color = TeaGreen,
                            onClick = onGamesClick,
                            modifier = Modifier.weight(1f)
                        )
                        DashboardFeaturedCard(
                            emoji = "🛒",
                            title = "Market Shopping",
                            domain = "EXECUTIVE",
                            color = Marigold,
                            onClick = onGamesClick,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                item { Spacer(modifier = Modifier.height(12.dp)) }

                // Game cards row 2
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        DashboardFeaturedCard(
                            emoji = "🌿",
                            title = "Tea Garden",
                            domain = "ATTENTION",
                            color = Color(0xFF0D9488),
                            onClick = onGamesClick,
                            modifier = Modifier.weight(1f)
                        )
                        DashboardFeaturedCard(
                            emoji = "🪘",
                            title = "Bihu Dhol Beats",
                            domain = "ENTRAINMENT",
                            color = Color(0xFF78350F),
                            onClick = onGamesClick,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // 5. REMINISCENCE & COMFORT: MEMORY OF THE DAY
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
                                    Text(text = "🧡", fontSize = 20.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Memory of the Day",
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Ink
                                    )
                                }
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = Color(0xFFFFF0DB),
                                    modifier = Modifier.border(1.5.dp, Color(0xFFD97706), RoundedCornerShape(12.dp))
                                ) {
                                    Text(
                                        text = "Family Keepsake",
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF92400E)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            // Family member portrait + description
                            Row(verticalAlignment = Alignment.Top) {
                                val memPhoto = getFamilyMemberPhoto(memoryIndex)
                                val painter = rememberAsyncImagePainter(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data("file:///android_asset/$memPhoto")
                                        .crossfade(true)
                                        .build()
                                )
                                Image(
                                    painter = painter,
                                    contentDescription = currentMemory.name,
                                    modifier = Modifier
                                        .size(96.dp)
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
                                        Text(
                                            text = currentMemory.relation,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Ink,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = currentMemory.name,
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black,
                                        fontFamily = FontFamily.Serif,
                                        color = Ink
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = currentMemory.note,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = InkSecondary,
                                        lineHeight = 18.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Action Buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // "Read memory" button
                                Surface(
                                    modifier = Modifier
                                        .weight(1.2f)
                                        .shadow(3.dp, RoundedCornerShape(14.dp))
                                        .border(2.dp, Ink, RoundedCornerShape(14.dp))
                                        .clickable {
                                            HapticUtil.vibrateTap(context)
                                            LocalizationManager.speak("${currentMemory.name}, your ${currentMemory.relation}. ${currentMemory.note}")
                                        },
                                    shape = RoundedCornerShape(14.dp),
                                    color = TeaGreen
                                ) {
                                    Row(
                                        modifier = Modifier.padding(vertical = 12.dp),
                                        horizontalArrangement = Arrangement.Center,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Filled.VolumeUp, null, tint = Color.White, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "Read memory for me",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White
                                        )
                                    }
                                }

                                // "Show another" button
                                Surface(
                                    modifier = Modifier
                                        .weight(0.8f)
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
                                        modifier = Modifier.padding(vertical = 12.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = "✨ Show another",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Ink
                                        )
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
                                    .size(54.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(Color.White.copy(alpha = 0.2f))
                                    .border(2.dp, Color.White, RoundedCornerShape(16.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "🎵", fontSize = 28.sp)
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Sensory Calming & 40Hz Flute",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White
                                )
                                Text(
                                    text = "Gentle acoustic tones proven to enhance brain rhythm synchronization",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color.White.copy(alpha = 0.8f),
                                    lineHeight = 15.sp
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
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
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
                                fontSize = 16.sp,
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
                                                fontSize = 12.sp,
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
                                    fontSize = 12.sp,
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
            .height(180.dp)
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
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    maxLines = 2,
                    lineHeight = 20.sp
                )
                Text(
                    text = domain,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White.copy(alpha = 0.75f),
                    letterSpacing = 1.sp
                )
            }

            Box(
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .size(70.dp)
                    .shadow(3.dp, RoundedCornerShape(18.dp))
                    .clip(RoundedCornerShape(18.dp))
                    .border(2.5.dp, Ink, RoundedCornerShape(18.dp))
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                Text(text = emoji, fontSize = 38.sp)
            }
        }
    }
}
