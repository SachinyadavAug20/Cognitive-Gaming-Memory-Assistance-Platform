package com.cognicare.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val CanvasBg = Color(0xFFFAF7F2)
private val VillageAmber = Color(0xFFD97706)
private val WarmSurface = Color(0xFFFFFDF9)

private data class StoryNode(val id: String, val location: String, val emoji: String, val narration: String, val choices: List<Pair<String, String>>)

private val storyNodes = mapOf(
    "start" to StoryNode("start", "Your Home", "\uD83C\uDFE0", "The morning sun rises over the village. You wake up to the sound of birds singing. The air smells of wood smoke and dew. What would you like to do first?",
        listOf("Visit the tea garden" to "tea", "Go to the river" to "river", "Walk to the temple" to "temple", "Stay and rest" to "rest")),
    "tea" to StoryNode("tea", "Tea Garden", "\uD83C\uDF3F", "The emerald tea gardens stretch across the hills. Workers in colorful attire pluck leaves with practiced hands. The fresh mountain air fills your lungs. A worker offers you fresh tea.",
        listOf("Accept the tea" to "tea_drink", "Help pluck leaves" to "tea_pluck", "Walk through the garden" to "tea_walk", "Return home" to "start")),
    "tea_drink" to StoryNode("tea_drink", "Tea Garden", "\u2615", "The warm tea is perfect. The worker tells you about her grandmother who used to sing while plucking tea. The taste brings back your own childhood memories.",
        listOf("Share a memory" to "tea_memory", "Ask for another cup" to "tea_drink2", "Walk to the river" to "river", "Return home" to "start")),
    "tea_pluck" to StoryNode("tea_pluck", "Tea Garden", "\uD83C\uDF31", "You join the workers. Your fingers learn the gentle art of picking two leaves and a bud. The rhythm is calming, like a meditation. An elder shares folk songs while you work.",
        listOf("Sing along" to "tea_sing", "Listen quietly" to "tea_listen", "Take a break" to "tea_break", "Go to the market" to "market")),
    "tea_walk" to StoryNode("tea_walk", "Tea Garden Path", "\uD83D\uDEB6", "The path winds through rows of tea bushes. Butterflies dance in the sunlight. You find a small stream with clear water. There are footprints of many who walked here before.",
        listOf("Follow the stream" to "river", "Sit by the stream" to "tea_stream", "Climb the hill" to "hill", "Return home" to "start")),
    "tea_sing" to StoryNode("tea_sing", "Tea Garden", "\uD83C\uDFB5", "Your voice joins theirs in a Bihu song. The melody echoes across the hills. For a moment, time stands still. Even the wind seems to dance with your song.",
        listOf("Continue singing" to "tea_song2", "Go to the temple" to "temple", "Visit the market" to "market", "Return home" to "start")),
    "tea_listen" to StoryNode("tea_listen", "Tea Garden", "\uD83C\uDFB5", "The elder's voice carries stories of the land. She tells of festivals, of monsoons that came early, of harvests that were bountiful. Your heart fills with warmth.",
        listOf("Ask another story" to "tea_story2", "Go to the temple" to "temple", "Return home" to "start")),
    "tea_break" to StoryNode("tea_break", "Tea Garden Rest", "\uD83D\uDCA4", "Under a large shade tree, you rest. An old man sits beside you. He tells you about the old days when the village was young. His eyes sparkle with memories.",
        listOf("Listen to his stories" to "tea_old_stories", "Go to the river" to "river", "Return home" to "start")),
    "tea_memory" to StoryNode("tea_memory", "Tea Garden", "\uD83D\uDCD5", "You tell her about your grandmother's tea rituals. The worker listens with wide eyes. 'That is beautiful,' she says. 'My grandmother did the same thing!' You both smile.",
        listOf("Explore the garden" to "tea_walk", "Go to the river" to "river", "Return home" to "start")),
    "tea_drink2" to StoryNode("tea_drink2", "Tea Garden", "\u2615", "Another cup of warmth. The worker prepares it with cardamom this time. The fragrance is heavenly. 'My secret recipe,' she whispers with a wink.",
        listOf("Thank her warmly" to "tea_walk", "Go to the market" to "market", "Return home" to "start")),
    "tea_song2" to StoryNode("tea_song2", "Tea Garden", "\uD83C\uDFB5", "The songs carry you away. Other workers join in. For a moment, the whole valley is singing. Birds seem to answer from the trees. This is pure happiness.",
        listOf("Go to the temple" to "temple", "Visit the market" to "market", "Return home" to "start")),
    "tea_story2" to StoryNode("tea_story2", "Tea Garden", "\uD83D\uDCD6", "The elder tells you about the ancient tree at the village center where all celebrations happened. Her voice trembles with emotion. 'Those were the days,' she says.",
        listOf("Go to the temple" to "temple", "Go to the river" to "river", "Return home" to "start")),
    "tea_old_stories" to StoryNode("tea_old_stories", "Under the Tree", "\uD83C\uDF33", "The old man speaks of bamboo bridges that swayed in the wind, of river boats that carried traders from faraway lands. His words paint pictures of a world gone by.",
        listOf("Go to the river" to "river", "Visit the market" to "market", "Return home" to "start")),
    "tea_stream" to StoryNode("tea_stream", "By the Stream", "\uD83C\uDF0A", "The stream whispers ancient secrets. You dip your feet in the cool water. Dragonflies hover nearby. A frog jumps into the water with a splash.",
        listOf("Follow the stream to the river" to "river", "Return home" to "start")),
    "river" to StoryNode("river", "The River", "\uD83C\uDF0A", "The mighty river flows calmly. Fishermen cast their nets from wooden boats. Children play on the sandy bank. An elderly fisherman is repairing his net.",
        listOf("Talk to the fisherman" to "river_fish", "Watch the sunset" to "river_sunset", "Wade in the water" to "river_wade", "Return home" to "start")),
    "river_fish" to StoryNode("river_fish", "River Bank", "\uD83C\uDFA3", "The fisherman tells you about the river's moods. 'She gives, and she takes,' he says. He shows you a special knot used for centuries by river folk. Your hands remember the old patterns.",
        listOf("Learn the knot" to "river_knot", "Watch the sunset" to "river_sunset", "Go to the market" to "market", "Return home" to "start")),
    "river_sunset" to StoryNode("river_sunset", "Sunset Point", "\uD83C\uDF05", "The sun paints the sky in gold and crimson. The river reflects the colors like liquid fire. Birds return to their nests. The world grows quiet and peaceful.",
        listOf("Pray at the temple" to "temple", "Return home for the night" to "end_peaceful", "Return home" to "start")),
    "river_wade" to StoryNode("river_wade", "In the River", "\uD83C\uDF0A", "The water is cool and refreshing. Small fish dart around your ankles. You feel young again, like a child playing in the monsoon rain. Laughter bubbles up from deep within.",
        listOf("Watch the sunset" to "river_sunset", "Go to the temple" to "temple", "Return home" to "start")),
    "river_knot" to StoryNode("river_knot", "River Bank", "\uD83E\uDDE1", "Your fingers remember the old knot. 'You learn fast,' the fisherman says with a smile. 'Your ancestors must have been river folk.' You feel a deep connection to the land.",
        listOf("Watch the sunset" to "river_sunset", "Go to the market" to "market", "Return home" to "start")),
    "temple" to StoryNode("temple", "The Temple", "\uD83D\uDE4F", "The ancient temple stands serene on a small hill. Bells ring softly in the breeze. Incense smoke curls upward. An old priest tends the lamps with devoted care.",
        listOf("Light a lamp" to "temple_lamp", "Meditate quietly" to "temple_med", "Talk to the priest" to "temple_talk", "Return home" to "start")),
    "temple_lamp" to StoryNode("temple_lamp", "Temple", "\uD83D\uDD6F\uFE0F", "You light a small oil lamp. The flame flickers, then steadies. In its glow, you see the faces of those you love. The warmth spreads through your heart.",
        listOf("Meditate" to "temple_med", "Go to the river" to "river", "Return home" to "start")),
    "temple_med" to StoryNode("temple_med", "Temple Garden", "\uD83E\uDDD8", "You sit quietly. The sounds of the world fade. Only the temple bells remain. Your mind becomes still like a calm lake. For a moment, you feel infinite peace.",
        listOf("Light another lamp" to "temple_lamp", "Go to the river" to "river", "Return home for the night" to "end_peaceful")),
    "temple_talk" to StoryNode("temple_talk", "Temple", "\uD83D\uDCAC", "The priest shares wisdom about life and impermanence. 'Every flower blooms and falls,' he says. 'But the garden always returns in spring.' His words bring comfort.",
        listOf("Light a lamp" to "temple_lamp", "Meditate" to "temple_med", "Return home" to "start")),
    "rest" to StoryNode("rest", "Your Home", "\uD83D\uDCA4", "You decide to rest. The ceiling fan creates gentle shadows. Through the window, you see the hills. A neighbor calls out a greeting. Life is simple and beautiful.",
        listOf("Listen to the radio" to "radio", "Look at old photos" to "photos", "Go for a walk" to "river", "End the day peacefully" to "end_rest")),
    "radio" to StoryNode("radio", "Living Room", "\uD83D\uDCFB", "The radio crackles to life. A familiar old song plays. The melody takes you back decades. You close your eyes and drift through memories of festivals, dances, and laughter.",
        listOf("Keep listening" to "radio2", "Look at photos" to "photos", "End the day" to "end_music")),
    "radio2" to StoryNode("radio2", "Living Room", "\uD83D\uDCFB", "More songs follow. Each one unlocks a different memory. The afternoon passes like a gentle stream. You feel content and at peace with the world.",
        listOf("End the day" to "end_music", "Go for a walk" to "river")),
    "photos" to StoryNode("photos", "Living Room", "\uD83D\uDDBC\uFE0F", "Old photographs spread across the table. Weddings, festivals, children growing up. Each photo is a chapter of your life. Your eyes fill with happy tears.",
        listOf("Tell stories aloud" to "photos2", "Listen to the radio" to "radio", "End the day" to "end_photos")),
    "photos2" to StoryNode("photos2", "Living Room", "\uD83D\uDCD6", "You tell stories to the empty room, but they are not empty. Every photo has a voice. Every face has a story. The room fills with laughter and love from years gone by.",
        listOf("End the day" to "end_photos")),
    "market" to StoryNode("market", "Village Market", "\uD83C\uDFEA", "The market bustles with life. Vendors call out prices. Colors of fruits and vegetables paint a rainbow. The smell of fresh fish and spices fills the air.",
        listOf("Buy fresh fish" to "market_fish", "Chat with vendors" to "market_chat", "Buy flowers" to "market_flowers", "Return home" to "start")),
    "market_fish" to StoryNode("market_fish", "Market", "\uD83C\uDFA3", "The fishmonger selects the freshest fish for you. 'For today's lunch,' she says. You exchange news about the village. Life's simple transactions carry deep warmth.",
        listOf("Chat with vendors" to "market_chat", "Return home" to "start")),
    "market_chat" to StoryNode("market_chat", "Market", "\uD83D\uDCAC", "Vendors share stories of the week. Who got married, whose garden is blooming, when the festival is. The market is the village's heartbeat.",
        listOf("Buy flowers" to "market_flowers", "Go to the temple" to "temple", "Return home" to "start")),
    "market_flowers" to StoryNode("market_flowers", "Market", "\uD83C\uDF3C", "You buy marigolds and jasmine. Their fragrance is intoxicating. 'For the temple?' asks the flower seller. You nod. Some rituals never change.",
        listOf("Go to the temple" to "temple", "Return home" to "start")),
    "hill" to StoryNode("hill", "Hilltop View", "\uD83D\uDDFA\uFE0F", "From the hill, you see the entire village. The river gleams like silver. Tea gardens spread like green carpets. Your heart swells with pride for this beautiful land.",
        listOf("Go to the river" to "river", "Return home" to "start")),
    "end_peaceful" to StoryNode("end_peaceful", "Home - Evening", "\uD83C\uDF19", "As stars appear, you return home. The day has been full of beauty and connection. You feel grateful for this village, these people, this life. Tomorrow will bring new adventures.",
        listOf("\uD83D\uDD0A End Day" to "final")),
    "end_rest" to StoryNode("end_rest", "Home - Evening", "\uD83C\uDF19", "Rest has brought clarity. The simple joys of home are enough. The ceiling fan, the window, the distant hills. You drift into a peaceful evening, content with life.",
        listOf("\uD83D\uDD0A End Day" to "final")),
    "end_music" to StoryNode("end_music", "Home - Evening", "\uD83D\uDCFB", "The radio plays its last song of the evening. Music has carried you through the day. Your heart is full of melody and memory. The night is gentle and kind.",
        listOf("\uD83D\uDD0A End Day" to "final")),
    "end_photos" to StoryNode("end_photos", "Home - Evening", "\uD83D\uDCD6", "Photos carefully put away. Stories told and retold in your mind. The evening light turns golden. You feel the warmth of every memory surrounding you like a blanket.",
        listOf("\uD83D\uDD0A End Day" to "final")),
    "final" to StoryNode("final", "Goodnight", "\u2B50", "What a beautiful day in your village! Every person you met, every place you visited, every memory you shared made today special. Your village is not just a place - it is a living, breathing part of you. Sleep well, dear friend.",
        listOf("\uD83D\uDD04 Play Again" to "start"))
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DayInMyWorldGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var currentNodeId by remember { mutableStateOf("start") }
    var visitedNodes by remember { mutableStateOf(setOf<String>()) }
    val scrollState = rememberScrollState()

    val node = storyNodes[currentNodeId] ?: storyNodes["start"]!!

    LaunchedEffect(currentNodeId) { scrollState.animateScrollTo(0) }

    val isEnding = currentNodeId.startsWith("end_") || currentNodeId == "final"

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
        topBar = {
            TopAppBar(
                title = { Text("\uD83C\uDFD8\uFE0F Day in My Village", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = VillageAmber)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp).verticalScroll(scrollState)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Places visited: ${visitedNodes.size}", fontSize = 12.sp, color = VillageAmber, fontWeight = FontWeight.Bold) }
                }
            }
            Spacer(Modifier.height(8.dp))

            if (isEnding) {
                Surface(Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(22.dp)).border(3.dp, Ink, RoundedCornerShape(22.dp)), RoundedCornerShape(22.dp), WarmSurface) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(node.emoji, fontSize = 48.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(node.location, fontSize = 22.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = VillageAmber)
                        Spacer(Modifier.height(8.dp))
                        Text(node.narration, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = Ink, lineHeight = 22.sp, textAlign = TextAlign.Center)
                        Spacer(Modifier.height(16.dp))
                        Surface(shape = RoundedCornerShape(12.dp), color = Color(0xFFFFF8E1), modifier = Modifier.border(1.5.dp, VillageAmber, RoundedCornerShape(12.dp))) {
                            Column(Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("+$score Reminiscence XP!", fontSize = 14.sp, fontWeight = FontWeight.Black, color = VillageAmber)
                                Text("You explored ${visitedNodes.size} places in your village", fontSize = 12.sp, color = Ink)
                            }
                        }
                        Spacer(Modifier.height(16.dp))
                        node.choices.forEach { (text, nextId) ->
                            Surface(shape = RoundedCornerShape(14.dp), color = if (nextId == "start") Color.White else VillageAmber, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).shadow(2.dp, RoundedCornerShape(14.dp)).border(2.dp, Ink, RoundedCornerShape(14.dp)).clickable {
                                ElderlyFeedback.onTap(context)
                                if (nextId == "start") { score = 0; visitedNodes = setOf("start") } else { score += 10 }
                                currentNodeId = nextId; visitedNodes = visitedNodes + nextId
                            }) {
                                Text(text, fontSize = 15.sp, fontWeight = FontWeight.Black, color = if (nextId == "start") Ink else Color.White, modifier = Modifier.padding(14.dp), textAlign = TextAlign.Center)
                            }
                        }
                        Spacer(Modifier.height(10.dp))
                        Surface(Modifier.fillMaxWidth().height(48.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).clickable { onBack() }, RoundedCornerShape(12.dp), VillageAmber) {
                            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 14.sp, fontWeight = FontWeight.Black, color = Color.White) }
                        }
                    }
                }
            } else {
                // Location header
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)), RoundedCornerShape(18.dp), Color(0xFFFFF8E1)) {
                    Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(node.emoji, fontSize = 42.sp)
                        Spacer(Modifier.height(4.dp))
                        Text(node.location, fontSize = 18.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = VillageAmber)
                    }
                }
                Spacer(Modifier.height(8.dp))

                // Narration
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)), RoundedCornerShape(18.dp), WarmSurface) {
                    Text(node.narration, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = Ink, lineHeight = 22.sp, modifier = Modifier.padding(16.dp))
                }
                Spacer(Modifier.height(12.dp))

                Text("What would you like to do?", fontSize = 13.sp, fontWeight = FontWeight.Black, color = VillageAmber, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))

                // Choices
                node.choices.forEach { (text, nextId) ->
                    Surface(shape = RoundedCornerShape(14.dp), color = Color.White, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).shadow(2.dp, RoundedCornerShape(14.dp)).border(2.dp, VillageAmber, RoundedCornerShape(14.dp)).clickable {
                        ElderlyFeedback.onTap(context)
                        score += 10; currentNodeId = nextId; visitedNodes = visitedNodes + nextId
                        LocalizationManager.speak(text)
                    }) {
                        Text(text, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = VillageAmber, modifier = Modifier.padding(14.dp), textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}
