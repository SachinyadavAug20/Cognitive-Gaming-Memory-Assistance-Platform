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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.cognicare.data.local.Patient
import com.cognicare.ui.components.CogniCareDrawerContent
import com.cognicare.ui.theme.*
import kotlinx.coroutines.launch

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val Brick = Color(0xFFC5221F)
private val WarmSurface = Color(0xFFF8F5EE)

private fun getPatientPhotoPath(patient: Patient): String? {
    return when (patient.id) {
        1L -> "sample-images/patient_1_biren_borah/patient_profile_photo_biren_borah.jpg"
        2L -> "sample-images/patient_2_mary_nongrum/patient_profile_photo_mary_nongrum.jpg"
        3L -> "sample-images/patient_3_ibochouba_singh/patient_profile_photo_ibochouba_singh.jpg"
        4L -> "sample-images/patient_4_lalhmingmawii_sailo/patient_profile_photo_lalhmingmawii_sailo.jpg"
        5L -> "sample-images/patient_5_kevichusa_angami/patient_profile_photo_kevichusa_angami.jpg"
        else -> null
    }
}

private fun getPatientFamilyPhoto(patient: Patient): String? {
    return when (patient.id) {
        1L -> "sample-images/patient_1_biren_borah/relatives/daughter.jpg"
        2L -> "sample-images/patient_2_mary_nongrum/relatives/spouse.jpg"
        3L -> "sample-images/patient_3_ibochouba_singh/relatives/grandchild.jpg"
        4L -> "sample-images/patient_4_lalhmingmawii_sailo/relatives/daughter.jpg"
        5L -> "sample-images/patient_5_kevichusa_angami/relatives/spouse.jpg"
        else -> null
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDashboardScreen(
    patient: Patient,
    onGamesClick: () -> Unit,
    onCaregiverClick: () -> Unit,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    var fontSize by remember { mutableFloatStateOf(18f) }
    var language by remember { mutableStateOf(patient.language.ifEmpty { "en" }) }
    var readAloudEnabled by remember { mutableStateOf(false) }
    var nightModeEnabled by remember { mutableStateOf(false) }

    val today = remember {
        val sdf = java.text.SimpleDateFormat("EEEE, MMM d", java.util.Locale.US)
        sdf.format(java.util.Date())
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            CogniCareDrawerContent(
                currentFontSize = fontSize,
                onFontSizeChange = { fontSize = it },
                currentLanguage = language,
                onLanguageChange = { language = it },
                isReadAloudEnabled = readAloudEnabled,
                onReadAloudToggle = { readAloudEnabled = it },
                isNightModeEnabled = nightModeEnabled,
                onNightModeToggle = { nightModeEnabled = it },
                onCaregiverClick = onCaregiverClick,
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
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .shadow(3.dp, CircleShape)
                                    .clip(CircleShape)
                                    .background(Color.White)
                                    .border(2.dp, Ink, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "\uD83E\uDDE0", fontSize = 18.sp)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "CogniCare",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(
                                Icons.Filled.Menu,
                                contentDescription = "Menu",
                                tint = Color.White,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    },
                    actions = {
                        // SOS Button
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Brick,
                            modifier = Modifier
                                .shadow(3.dp, RoundedCornerShape(12.dp))
                                .border(2.dp, Ink, RoundedCornerShape(12.dp))
                                .clickable {
                                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108"))
                                    context.startActivity(intent)
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Filled.Phone,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "SOS",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent
                    )
                )
            }
        ) { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(if (nightModeEnabled) Color(0xFF161310) else Canvas)
                    .padding(paddingValues),
                contentPadding = PaddingValues(bottom = 32.dp)
            ) {
                // Green Header Banner
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(TeaGreen, Color(0xFF15803D))
                                )
                            )
                            .border(4.dp, Ink)
                            .padding(horizontal = 20.dp, vertical = 24.dp)
                    ) {
                        Column {
                            // Patient greeting
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                // Patient photo with neo-brutalist frame
                                val photoPath = getPatientPhotoPath(patient)
                                if (photoPath != null) {
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
                                            .shadow(4.dp, RoundedCornerShape(20.dp))
                                            .clip(RoundedCornerShape(20.dp))
                                            .border(3.dp, Ink, RoundedCornerShape(20.dp))
                                            .background(Color.White),
                                        contentScale = ContentScale.Crop
                                    )
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .size(80.dp)
                                            .shadow(4.dp, RoundedCornerShape(20.dp))
                                            .clip(RoundedCornerShape(20.dp))
                                            .border(3.dp, Ink, RoundedCornerShape(20.dp))
                                            .background(Color.White),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = patient.name.first().toString(),
                                            fontSize = 32.sp,
                                            fontWeight = FontWeight.Black,
                                            color = TeaGreen
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.width(16.dp))
                                Column {
                                    Text(
                                        text = "Good Day,",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White.copy(alpha = 0.85f)
                                    )
                                    Text(
                                        text = "${patient.name}!",
                                        fontSize = 30.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White,
                                        lineHeight = 36.sp
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "You are safe at home with your family today.",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color.White.copy(alpha = 0.75f),
                                        lineHeight = 20.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            // Read for Me + Sound On buttons (tactile neo-brutalist)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Read for Me - white tactile button
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .shadow(4.dp, RoundedCornerShape(16.dp))
                                        .border(3.dp, Ink, RoundedCornerShape(16.dp))
                                        .clickable { },
                                    shape = RoundedCornerShape(16.dp),
                                    color = Color.White
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.Center
                                    ) {
                                        Icon(
                                            Icons.Filled.VolumeUp,
                                            contentDescription = null,
                                            tint = Ink,
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "Read for Me",
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Ink
                                        )
                                    }
                                }
                                // Sound On - white tactile button
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .shadow(4.dp, RoundedCornerShape(16.dp))
                                        .border(3.dp, Ink, RoundedCornerShape(16.dp))
                                        .clickable { },
                                    shape = RoundedCornerShape(16.dp),
                                    color = Color.White
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.Center
                                    ) {
                                        Icon(
                                            Icons.Filled.VolumeUp,
                                            contentDescription = null,
                                            tint = Ink,
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "Sound On",
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Ink
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Family Photos & Peaceful Sounds card
                item {
                    Spacer(modifier = Modifier.height(20.dp))
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .shadow(4.dp, RoundedCornerShape(24.dp))
                            .border(3.dp, Ink, RoundedCornerShape(24.dp)),
                        shape = RoundedCornerShape(24.dp),
                        color = TeaGreen
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Icon
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .shadow(2.dp, RoundedCornerShape(16.dp))
                                    .clip(RoundedCornerShape(16.dp))
                                    .border(2.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                                    .background(Color.White.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "\uD83D\uDCBC", fontSize = 28.sp)
                            }
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Family Photos &\nPeaceful Sounds",
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White,
                                    lineHeight = 26.sp
                                )
                                Text(
                                    text = "Look at family pictures and listen to gentle music",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color.White.copy(alpha = 0.75f),
                                    lineHeight = 18.sp
                                )
                            }
                            // Play button
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Box(
                                    modifier = Modifier
                                        .size(44.dp)
                                        .shadow(2.dp, CircleShape)
                                        .clip(CircleShape)
                                        .border(2.dp, Ink, CircleShape)
                                        .background(Marigold),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Filled.PlayArrow,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "Play",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }

                // Daily Activities section
                item {
                    Spacer(modifier = Modifier.height(28.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "\u2728 Daily Activities",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink
                        )
                        Surface(
                            onClick = onGamesClick,
                            shape = RoundedCornerShape(12.dp),
                            color = Color.White,
                            modifier = Modifier
                                .shadow(3.dp, RoundedCornerShape(12.dp))
                                .border(2.dp, Ink, RoundedCornerShape(12.dp))
                        ) {
                            Text(
                                text = "View All \u2192",
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Black,
                                color = Ink
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                }

                // Game cards row 1
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        DashboardGameCard(
                            emoji = "\uD83E\uDDE9",
                            title = "Picture Puzzle",
                            color = TeaGreen,
                            onClick = onGamesClick,
                            modifier = Modifier.weight(1f)
                        )
                        DashboardGameCard(
                            emoji = "\uD83C\uDFEA",
                            title = "Going to the Market",
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
                        DashboardGameCard(
                            emoji = "\uD83C\uDF3F",
                            title = "Picking Tea Leaves",
                            color = TeaGreen,
                            onClick = onGamesClick,
                            modifier = Modifier.weight(1f)
                        )
                        DashboardGameCard(
                            emoji = "\uD83D\uDCDA",
                            title = "School Days",
                            color = Marigold,
                            onClick = onGamesClick,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Reminiscence & Comfort section
                item {
                    Spacer(modifier = Modifier.height(32.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "\uD83E\uDDE1 Reminiscence & Comfort",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            color = Ink
                        )
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                }

                // Memory of the Day card
                item {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .shadow(4.dp, RoundedCornerShape(24.dp))
                            .border(3.dp, Ink, RoundedCornerShape(24.dp)),
                        shape = RoundedCornerShape(24.dp),
                        color = Color(0xFFFFFDF9)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            // Header
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(text = "\uD83E\uDDE1", fontSize = 22.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Memory of the Day",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Ink
                                    )
                                }
                                Surface(
                                    shape = RoundedCornerShape(20.dp),
                                    color = Color(0xFFFFF0DB),
                                    modifier = Modifier.border(1.dp, Color(0xFFD97706), RoundedCornerShape(20.dp))
                                ) {
                                    Text(
                                        text = "Family Keepsake",
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF92400E)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Person info
                            Row(verticalAlignment = Alignment.Top) {
                                // Photo
                                val familyPhotoPath = getPatientFamilyPhoto(patient)
                                if (familyPhotoPath != null) {
                                    val painter = rememberAsyncImagePainter(
                                        model = ImageRequest.Builder(LocalContext.current)
                                            .data("file:///android_asset/$familyPhotoPath")
                                            .crossfade(true)
                                            .build()
                                    )
                                    Image(
                                        painter = painter,
                                        contentDescription = "Family member",
                                        modifier = Modifier
                                            .size(100.dp)
                                            .shadow(3.dp, RoundedCornerShape(16.dp))
                                            .clip(RoundedCornerShape(16.dp))
                                            .border(2.dp, Ink, RoundedCornerShape(16.dp)),
                                        contentScale = ContentScale.Crop
                                    )
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .size(100.dp)
                                            .shadow(3.dp, RoundedCornerShape(16.dp))
                                            .clip(RoundedCornerShape(16.dp))
                                            .border(2.dp, Ink, RoundedCornerShape(16.dp))
                                            .background(WarmSurface),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(text = "\uD83D\uDC68", fontSize = 48.sp)
                                    }
                                }
                                Spacer(modifier = Modifier.width(16.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    // Relationship badge
                                    Surface(
                                        shape = RoundedCornerShape(20.dp),
                                        color = Color(0xFFFFF0DB),
                                        modifier = Modifier.border(1.dp, Color(0xFFD97706), RoundedCornerShape(20.dp))
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(text = "\uD83D\uDC65", fontSize = 11.sp)
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = "Son",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Color(0xFF92400E)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = "Manash Borah",
                                        fontSize = 22.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Ink,
                                        lineHeight = 28.sp
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "Eldest son, mechanical engineer in Guwahati. Visits every Sunday morning.",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = InkSecondary,
                                        lineHeight = 20.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            // Action buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // Read memory - green tactile
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .shadow(3.dp, RoundedCornerShape(16.dp))
                                        .border(2.dp, Ink, RoundedCornerShape(16.dp))
                                        .clickable { },
                                    shape = RoundedCornerShape(16.dp),
                                    color = TeaGreen
                                ) {
                                    Row(
                                        modifier = Modifier.padding(vertical = 12.dp),
                                        horizontalArrangement = Arrangement.Center,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            Icons.Filled.VolumeUp,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "Read memory for me",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White
                                        )
                                    }
                                }
                                // Show another - white tactile
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .shadow(3.dp, RoundedCornerShape(16.dp))
                                        .border(2.dp, Ink, RoundedCornerShape(16.dp))
                                        .clickable { },
                                    shape = RoundedCornerShape(16.dp),
                                    color = Color.White
                                ) {
                                    Row(
                                        modifier = Modifier.padding(vertical = 12.dp),
                                        horizontalArrangement = Arrangement.Center,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "\u2728 Show another",
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

                item { Spacer(modifier = Modifier.height(16.dp)) }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DashboardGameCard(
    emoji: String,
    title: String,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier
            .height(190.dp)
            .shadow(4.dp, RoundedCornerShape(16.dp))
            .border(3.dp, Ink, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Title + speaker icon row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    maxLines = 2,
                    modifier = Modifier.weight(1f),
                    lineHeight = 20.sp
                )
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .shadow(2.dp, CircleShape)
                        .clip(CircleShape)
                        .border(2.dp, Ink, CircleShape)
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Filled.VolumeUp,
                        contentDescription = null,
                        tint = Ink,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            // Game emoji in white box
            Box(
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .size(80.dp)
                    .shadow(3.dp, RoundedCornerShape(20.dp))
                    .clip(RoundedCornerShape(20.dp))
                    .border(3.dp, Ink, RoundedCornerShape(20.dp))
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                Text(text = emoji, fontSize = 44.sp)
            }
        }
    }
}
