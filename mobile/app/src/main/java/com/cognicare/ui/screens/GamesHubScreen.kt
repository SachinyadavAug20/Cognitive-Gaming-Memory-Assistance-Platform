package com.cognicare.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.ui.components.CogniCareDrawerContent
import com.cognicare.ui.components.CogniCareTopBar
import com.cognicare.ui.components.DomainFilterChip
import com.cognicare.ui.games.*
import com.cognicare.ui.theme.*
import com.cognicare.util.ElderlyFeedback
import kotlinx.coroutines.launch

private val Ink = Color(0xFF16120E)
private val InkSecondary = Color(0xFF4A4036)
private val Canvas = Color(0xFFFAF7F2)
private val TeaGreen = Color(0xFF1B663E)
private val Marigold = Color(0xFFE66A00)
private val Brick = Color(0xFFC5221F)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GamesHubScreen(
    onGameClick: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    var fontSize by remember { mutableFloatStateOf(18f) }
    var language by remember { mutableStateOf("en") }
    var readAloudEnabled by remember { mutableStateOf(false) }
    var nightModeEnabled by remember { mutableStateOf(false) }

    var selectedDomain by remember { mutableStateOf<CognitiveDomain?>(null) }
    val allGames = remember { GameRegistry.getAllGames() }

    val filteredGames = remember(selectedDomain) {
        if (selectedDomain == null) allGames
        else allGames.filter { it.domain == selectedDomain }
    }

    val domainFilters = remember(allGames.size) {
        listOf(
            Triple(null, "All Activities", allGames.size),
            Triple(CognitiveDomain.MEMORY, "Memory & Recall", allGames.count { it.domain == CognitiveDomain.MEMORY }),
            Triple(CognitiveDomain.ATTENTION, "Attention & Focus", allGames.count { it.domain == CognitiveDomain.ATTENTION }),
            Triple(CognitiveDomain.EXECUTIVE, "Daily Routine", allGames.count { it.domain == CognitiveDomain.EXECUTIVE }),
            Triple(CognitiveDomain.VISUOSPATIAL, "Patterns & Art", allGames.count { it.domain == CognitiveDomain.VISUOSPATIAL }),
            Triple(CognitiveDomain.LANGUAGE, "Hands & Movement", allGames.count { it.domain == CognitiveDomain.LANGUAGE }),
            Triple(CognitiveDomain.CALM, "Calm & Music", allGames.count { it.domain == CognitiveDomain.CALM }),
            Triple(CognitiveDomain.REMINISCENCE, "Reminiscence", allGames.count { it.domain == CognitiveDomain.REMINISCENCE }),
            Triple(CognitiveDomain.ADVANCED, "Advanced 3D", allGames.count { it.domain == CognitiveDomain.ADVANCED }),
        )
    }

    val onGameClickRemembered = remember(onGameClick) { onGameClick }

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
                onCaregiverClick = { },
                onSosClick = {
                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108"))
                    context.startActivity(intent)
                },
                onLogout = { }
            )
        }
    ) {
        Scaffold(
            topBar = {
                CogniCareTopBar(
                    onBackClick = onBack,
                    onMenuClick = { scope.launch { drawerState.open() } }
                )
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = padding.calculateTopPadding())
                    .background(Canvas)
            ) {
                // Page header
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(TeaGreen)
                        .border(4.dp, Ink)
                        .padding(horizontal = 20.dp, vertical = 16.dp)
                ) {
                    Text(
                        text = "\u2728 Daily Activities",
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Choose a game to exercise your brain",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Domain filter chips
                LazyRow(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(
                        items = domainFilters,
                        key = { (domain, label, _) -> domain?.name ?: "all" }
                    ) { (domain, label, count) ->
                        DomainFilterChip(
                            label = label,
                            count = count,
                            emoji = when (domain) {
                                null -> "\uD83C\uDFAF"
                                CognitiveDomain.MEMORY -> "\uD83E\uDDE0"
                                CognitiveDomain.ATTENTION -> "\uD83D\uDCA1"
                                CognitiveDomain.EXECUTIVE -> "\u2699\uFE0F"
                                CognitiveDomain.VISUOSPATIAL -> "\uD83D\uDDFA\uFE0F"
                                CognitiveDomain.LANGUAGE -> "\uD83D\uDCD6"
                                CognitiveDomain.CALM -> "\uD83C\uDFB5"
                                CognitiveDomain.REMINISCENCE -> "\uD83E\uDDE1"
                                CognitiveDomain.ADVANCED -> "\uD83D\uDD25"
                            },
                            isSelected = selectedDomain == domain,
                            onClick = { selectedDomain = domain }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Game grid
                if (filteredGames.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("\uD83C\uDFAF", fontSize = 48.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("No games in this category", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = InkSecondary)
                        }
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(top = 4.dp, start = 16.dp, end = 16.dp, bottom = 120.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(
                            items = filteredGames,
                            key = { it.id },
                            contentType = { it.domain }
                        ) { game ->
                            HubGameCard(
                                game = game,
                                onClick = { onGameClick(game.id) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HubGameCard(
    game: GameConfig,
    onClick: () -> Unit
) {
    val context = LocalContext.current
    val cardColor = when (game.domain) {
        CognitiveDomain.CALM -> Color(0xFF1565C0)
        CognitiveDomain.EXECUTIVE, CognitiveDomain.ATTENTION -> Color(0xFFD84315)
        CognitiveDomain.MEMORY -> Color(0xFF6A1B9A)
        CognitiveDomain.REMINISCENCE -> Color(0xFF4E342E)
        CognitiveDomain.ADVANCED -> Color(0xFFE65100)
        else -> TeaGreen
    }

    Card(
        onClick = {
            ElderlyFeedback.onTap(context)
            onClick()
        },
        modifier = Modifier
            .height(230.dp)
            .shadow(6.dp, RoundedCornerShape(22.dp))
            .border(3.dp, Ink, RoundedCornerShape(22.dp))
            .semantics { contentDescription = "${game.title}, ${game.domain.label}" },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Title + domain tag
            Column {
                Text(
                    text = game.title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    maxLines = 2,
                    lineHeight = 22.sp
                )
                Spacer(modifier = Modifier.height(3.dp))
                Text(
                    text = game.domain.label.uppercase(),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFFFFF0DB),
                    letterSpacing = 1.sp
                )
            }

            // Game emoji — BIG for visual recognition
            Box(
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .size(88.dp)
                    .shadow(4.dp, RoundedCornerShape(22.dp))
                    .clip(RoundedCornerShape(22.dp))
                    .border(3.dp, Ink, RoundedCornerShape(22.dp))
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                Text(text = game.emoji, fontSize = 48.sp)
            }

            // Start button — solid white button with thick dark border for paperclip design language
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
                    .border(2.5.dp, Ink, RoundedCornerShape(14.dp))
                    .semantics { contentDescription = "Start ${game.title}" },
                shape = RoundedCornerShape(14.dp),
                color = Color.White,
                onClick = {
                    ElderlyFeedback.onTap(context)
                    onClick()
                }
            ) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        text = "Start \u2192",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = Ink,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}
