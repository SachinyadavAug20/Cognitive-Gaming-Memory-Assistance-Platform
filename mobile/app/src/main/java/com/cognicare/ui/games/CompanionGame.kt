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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.unit.sp
import com.cognicare.util.ElderlyFeedback
import com.cognicare.util.LocalizationManager

private val Ink = Color(0xFF16120E)
private val CanvasBg = Color(0xFFFAF7F2)
private val CompanionPurple = Color(0xFF4C1D95)
private val WarmSurface = Color(0xFFFFFDF9)

private data class ChatNode(val id: String, val speaker: String, val message: String, val responses: List<Pair<String, String>>)

private val chatTree = mapOf(
    "start" to ChatNode("start", "Saathi", "Good morning! How are you feeling today?", listOf("I feel happy" to "happy", "I feel sad" to "sad", "I feel tired" to "tired", "I feel fine" to "fine")),
    "happy" to ChatNode("happy", "Saathi", "That is wonderful! What made you happy today?", listOf("Family time" to "happy_family", "Morning walk" to "happy_walk", "Good food" to "happy_food", "Just because" to "happy_just")),
    "sad" to ChatNode("sad", "Saathi", "I understand. Sometimes we all feel sad. Would you like to talk about it?", listOf("Yes, I miss someone" to "sad_miss", "I feel lonely" to "sad_lonely", "I feel confused" to "sad_confused", "Never mind" to "start")),
    "tired" to ChatNode("tired", "Saathi", "Rest is important. Did you sleep well last night?", listOf("Yes, but still tired" to "tired_yes", "No, I couldn't sleep" to "tired_no", "I had dreams" to "tired_dreams", "I don't remember" to "start")),
    "fine" to ChatNode("fine", "Saathi", "Good to hear! What did you do this morning?", listOf("Read the newspaper" to "fine_news", "Watched TV" to "fine_tv", "Met friends" to "fine_friends", "Just sat quietly" to "fine_quiet")),
    "happy_family" to ChatNode("happy_family", "Saathi", "Family is everything. Tell me about your family.", listOf("I have grandchildren" to "end_grandkids", "I live with my wife" to "end_spouse", "My children visit often" to "end_children", "I cherish old memories" to "end_memories")),
    "happy_walk" to ChatNode("happy_walk", "Saathi", "A morning walk refreshes the mind. Where do you walk?", listOf("Near the river" to "end_river", "In the garden" to "end_garden", "Around the village" to "end_village", "At the park" to "end_park")),
    "happy_food" to ChatNode("happy_food", "Saathi", "Good food lifts the spirit! What did you enjoy?", listOf("Masala chai" to "end_chai", "Pitha" to "end_pitha", "Rice and dal" to "end_rice", "Something sweet" to "end_sweet")),
    "happy_just" to ChatNode("happy_just", "Saathi", "Sometimes happiness comes from within. That is beautiful.", listOf("Yes, I feel peaceful" to "end_peace", "I want to share a memory" to "end_memory_share", "Tell me a story" to "end_story", "Thank you, Saathi" to "end_thanks")),
    "sad_miss" to ChatNode("sad_miss", "Saathi", "Missing someone means they mattered deeply. Who do you miss?", listOf("My late spouse" to "end_spouse_miss", "Old friends" to "end_friends_miss", "My childhood home" to "end_home_miss", "I want to remember them" to "end_remember")),
    "sad_lonely" to ChatNode("sad_lonely", "Saathi", "You are not alone. I am here with you. Would you like to remember happy times?", listOf("Yes, tell me about the past" to "end_past", "I want to think of my village" to "end_village_mem", "Let us just chat" to "start", "Thank you, Saathi" to "end_thanks")),
    "sad_confused" to ChatNode("sad_confused", "Saathi", "It is okay to feel confused sometimes. Talking helps.", listOf("I forget things" to "end_forget", "Everything feels different" to "end_different", "I need comfort" to "end_comfort", "Just talk to me" to "start")),
    "tired_yes" to ChatNode("tired_yes", "Saathi", "Sometimes rest comes from the heart, not just the body. Close your eyes for a moment.", listOf("That helps" to "end_rest", "I feel a bit better" to "end_better", "Tell me something calming" to "end_calm", "Thank you" to "end_thanks")),
    "tired_no" to ChatNode("tired_no", "Saathi", "Sleeplessness can be hard. Maybe some warm milk before bed tonight?", listOf("Good idea" to "end_milk", "I will try" to "end_try", "I worry at night" to "end_worry", "Thank you for caring" to "end_thanks")),
    "tired_dreams" to ChatNode("tired_dreams", "Saathi", "Dreams carry memories. Were they good dreams?", listOf("Yes, about my youth" to "end_youth", "No, they were strange" to "end_strange", "I don't remember them" to "start", "They were about family" to "end_dream_family")),
    "fine_news" to ChatNode("fine_news", "Saathi", "Reading keeps the mind sharp! What section do you enjoy?", listOf("Local news" to "end_local", "Sports" to "end_sports", "Editorials" to "end_editorial", "I just read headlines" to "end_headlines")),
    "fine_tv" to ChatNode("fine_tv", "Saathi", "Television can be nice company. What do you watch?", listOf("Old songs" to "end_songs", "News" to "end_news_show", "Serials" to "end_serials", "Just background noise" to "end_bgm")),
    "fine_friends" to ChatNode("fine_friends", "Saathi", "Friends are treasures. What did you talk about?", listOf("Old times" to "end_old_times", "Current events" to "end_current", "Just laughed together" to "end_laugh", "Shared tea" to "end_tea_friend")),
    "fine_quiet" to ChatNode("fine_quiet", "Saathi", "Quiet moments bring peace. What were you thinking about?", listOf("My life journey" to "end_journey", "Nature around me" to "end_nature", "Nothing specific" to "end_nothing", "Just enjoying silence" to "end_silence")),
    "end_grandkids" to ChatNode("end_grandkids", "Saathi", "Grandchildren fill life with joy! \uD83C\uDF1F They must bring you great happiness. Keep cherishing these moments.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_spouse" to ChatNode("end_spouse", "Saathi", "A loving partner is life's greatest gift. Your bond is beautiful. \u2764\uFE0F", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_children" to ChatNode("end_children", "Saathi", "Family visits are precious. The love of children warms the heart.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_memories" to ChatNode("end_memories", "Saathi", "Memories are treasures we carry forever. \uD83D\uDCD6 They keep loved ones close.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_river" to ChatNode("end_river", "Saathi", "The river teaches patience. It flows gently, just like life.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_garden" to ChatNode("end_garden", "Saathi", "Nature heals the soul. \uD83C\uDF3F Your garden must be beautiful.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_village" to ChatNode("end_village", "Saathi", "Village walks bring back so many memories. The paths remember our footsteps.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_park" to ChatNode("end_park", "Saathi", "Parks are peaceful places. The trees and birds keep good company.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_chai" to ChatNode("end_chai", "Saathi", "Nothing beats a warm cup of masala chai! \u2615 The aroma itself is medicine.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_pitha" to ChatNode("end_pitha", "Saathi", "Pitha! A true Assamese treasure. \uD83C\uDF5C Did someone special make it?", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_rice" to ChatNode("end_rice", "Saathi", "Simple meals are the most satisfying. Rice and dal is comfort food.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_sweet" to ChatNode("end_sweet", "Saathi", "Something sweet makes everything better! \uD83C\uDF6D", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_peace" to ChatNode("end_peace", "Saathi", "Inner peace is the greatest treasure. You are doing well.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_memory_share" to ChatNode("end_memory_share", "Saathi", "I would love to hear your memories. They are珍贵的 treasures.", listOf("Tell me more" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_story" to ChatNode("end_story", "Saathi", "Once upon a time, in a green valley surrounded by mountains, there lived a wise old person who knew all the secrets of the forest...", listOf("What happened next?" to "start", "Thank you, Saathi" to "end_thanks_final")),
    "end_thanks" to ChatNode("end_thanks", "Saathi", "You are welcome! I am always here for you. \uD83D\uDE0A Remember, every day is a gift.", listOf("Chat again" to "start", "Goodbye" to "end_farewell")),
    "end_spouse_miss" to ChatNode("end_spouse_miss", "Saathi", "The love you shared is eternal. \u2764\uFE0F They live on in your heart and memories.", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_friends_miss" to ChatNode("end_friends_miss", "Saathi", "True friends are never forgotten. The laughter echoes forever.", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_home_miss" to ChatNode("end_home_miss", "Saathi", "Home is where the heart is. \uD83C\uDFE0 Those walls hold a lifetime of love.", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_remember" to ChatNode("end_remember", "Saathi", "Remembering is an act of love. Share their story with someone you trust.", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_past" to ChatNode("end_past", "Saathi", "The past is a beautiful garden of memories. Walk through it gently.", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_village_mem" to ChatNode("end_village_mem", "Saathi", "Your village lives in your heart. Every path, every tree has a story.", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_forget" to ChatNode("end_forget", "Saathi", "Forgetting is natural. The important things stay in the heart. \u2764\uFE0F", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_different" to ChatNode("end_different", "Saathi", "Change is the nature of life. But your essence remains beautiful.", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_comfort" to ChatNode("end_comfort", "Saathi", "I am here. Take a deep breath. \uD83C\uDF1F You are safe and loved.", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_rest" to ChatNode("end_rest", "Saathi", "Rest well. Your body and mind deserve peace. \uD83D\uDE34", listOf("Thank you" to "end_thanks_final")),
    "end_better" to ChatNode("end_better", "Saathi", "I am glad. Remember, I am always here whenever you need me.", listOf("Thank you" to "end_thanks_final", "Chat again" to "start")),
    "end_calm" to ChatNode("end_calm", "Saathi", "Imagine a calm river flowing gently through green hills... The water sparkles in sunlight... Birds sing softly... You are at peace.", listOf("That was nice" to "end_thanks_final", "Tell me more" to "start")),
    "end_milk" to ChatNode("end_milk", "Saathi", "Warm milk with a pinch of turmeric is a grandmother's remedy. Sweet dreams tonight! \uD83C\uDF19", listOf("Thank you" to "end_thanks_final")),
    "end_try" to ChatNode("end_try", "Saathi", "That is all we can do. Trying is enough. I believe in you.", listOf("Thank you" to "end_thanks_final", "Chat again" to "start")),
    "end_worry" to ChatNode("end_worry", "Saathi", "Worry is the mind's way of caring. But you have survived every difficult day so far. You are strong.", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_youth" to ChatNode("end_youth", "Saathi", "Youth was beautiful, wasn't it? Those memories are yours forever. \uD83D\uDCD5", listOf("Thank you" to "end_thanks_final", "Tell me more" to "start")),
    "end_strange" to ChatNode("end_strange", "Saathi", "Strange dreams come and go like clouds. They do not define you.", listOf("Thank you" to "end_thanks_final", "Chat again" to "start")),
    "end_dream_family" to ChatNode("end_dream_family", "Saathi", "Dreaming of family means they are always with you, even in sleep.", listOf("Thank you" to "end_thanks_final")),
    "end_local" to ChatNode("end_local", "Saathi", "Knowing your community keeps you connected. That is wonderful!", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_sports" to ChatNode("end_sports", "Saathi", "Sports keep the spirit lively! Do you enjoy cricket or football?", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_editorial" to ChatNode("end_editorial", "Saathi", "Reading editorials shows a sharp mind! Your opinions matter.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_headlines" to ChatNode("end_headlines", "Saathi", "Staying informed is good. Headlines give the big picture.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_songs" to ChatNode("end_songs", "Saathi", "Old songs carry the magic of bygone days. \uD83C\uDFB5 Which era do you love?", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_news_show" to ChatNode("end_news_show", "Saathi", "Staying informed helps us feel connected to the world.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_serials" to ChatNode("end_serials", "Saathi", "Serials can be quite gripping! The stories keep us engaged.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_bgm" to ChatNode("end_bgm", "Saathi", "Sometimes just having sounds around makes us feel less alone.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_old_times" to ChatNode("end_old_times", "Saathi", "Nostalgia is warm tea for the soul. \u2615 Old times were golden.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_current" to ChatNode("end_current", "Saathi", "Discussing current events keeps the mind active and engaged.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_laugh" to ChatNode("end_laugh", "Saathi", "Laughter is the best medicine! \uD83D\uDE04 Keep laughing with friends.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_tea_friend" to ChatNode("end_tea_friend", "Saathi", "Sharing tea with friends is one of life's simplest pleasures. \u2615", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_journey" to ChatNode("end_journey", "Saathi", "Every life is a beautiful journey. Your story matters and is worth telling.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_nature" to ChatNode("end_nature", "Saathi", "Nature never judges. It simply is. And there is peace in that. \uD83C\uDF3F", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_nothing" to ChatNode("end_nothing", "Saathi", "Sometimes thinking of nothing is exactly what the mind needs. A gentle reset.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_silence" to ChatNode("end_silence", "Saathi", "Silence speaks louder than words. In quiet, we find ourselves.", listOf("Chat again" to "start", "Thank you" to "end_thanks_final")),
    "end_thanks_final" to ChatNode("end_thanks_final", "Saathi", "It was wonderful talking with you. \uD83D\uDE0A Come back anytime. Take care of yourself!", listOf("Goodbye, Saathi" to "end_farewell", "Chat again" to "start")),
    "end_farewell" to ChatNode("end_farewell", "Saathi", "Goodbye for now! Remember: you are valued, you are loved, and you are never alone. \u2764\uFE0F", listOf("Goodbye" to "start"))
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompanionGame(onBack: () -> Unit) {
    val context = LocalContext.current
    var score by remember { mutableIntStateOf(0) }
    var currentNode by remember { mutableStateOf("start") }
    var conversationLog by remember { mutableStateOf(listOf<Pair<String, String>>()) }
    var isTyping by remember { mutableStateOf(false) }
    val scrollState = rememberScrollState()

    val node = chatTree[currentNode] ?: chatTree["start"] ?: return

    LaunchedEffect(conversationLog.size) { scrollState.animateScrollTo(scrollState.maxValue) }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = { Text("\uD83E\uDD16 Chat with Saathi", fontWeight = FontWeight.Black, fontFamily = FontFamily.Serif, color = Color.White) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, "Back", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CompanionPurple)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(CanvasBg).padding(12.dp)) {
            Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column { Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Ink); Text("Conversations: ${conversationLog.size / 2}", fontSize = 12.sp, color = CompanionPurple, fontWeight = FontWeight.Bold) }
                }
            }
            Spacer(Modifier.height(8.dp))

            Surface(Modifier.weight(1f).fillMaxWidth().shadow(3.dp, RoundedCornerShape(18.dp)).border(2.5.dp, Ink, RoundedCornerShape(18.dp)), RoundedCornerShape(18.dp), WarmSurface) {
                Column(Modifier.padding(12.dp).verticalScroll(scrollState)) {
                    conversationLog.forEach { (speaker, msg) ->
                        val isUser = speaker == "You"
                        Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start) {
                            Surface(shape = RoundedCornerShape(14.dp), color = if (isUser) CompanionPurple else Color(0xFFEDE7F6), modifier = Modifier.widthIn(max = 280.dp).border(1.5.dp, if (isUser) CompanionPurple else Ink, RoundedCornerShape(14.dp))) {
                                Column(Modifier.padding(10.dp)) {
                                    Text(speaker, fontSize = 14.sp, fontWeight = FontWeight.Black, color = if (isUser) Color.White else CompanionPurple)
                                    Text(msg, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = if (isUser) Color.White else Ink)
                                }
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(8.dp))

            if (currentNode == "end_farewell") {
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), WarmSurface) {
                    Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("\u2764\uFE0F", fontSize = 32.sp)
                        Text("+${conversationLog.size * 5} Calm XP!", fontSize = 14.sp, fontWeight = FontWeight.Black, color = CompanionPurple)
                        Spacer(Modifier.height(8.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Surface(Modifier.weight(1f).height(44.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).semantics { contentDescription = "New Chat" }.clickable { ElderlyFeedback.onTap(context); conversationLog = listOf(); currentNode = "start"; score = 0 }, RoundedCornerShape(12.dp), Color.White) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("New Chat", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Ink) }
                            }
                            Surface(Modifier.weight(1f).height(44.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, Ink, RoundedCornerShape(12.dp)).semantics { contentDescription = "Done" }.clickable { ElderlyFeedback.onTap(context); onBack() }, RoundedCornerShape(12.dp), CompanionPurple) {
                                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Done \u2713", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Color.White) }
                            }
                        }
                    }
                }
            } else {
                Surface(Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(16.dp)).border(2.5.dp, Ink, RoundedCornerShape(16.dp)), RoundedCornerShape(16.dp), Color(0xFFEDE7F6)) {
                    Column(Modifier.padding(12.dp)) {
                        Text(node.message, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = Ink, lineHeight = 20.sp)
                    }
                }
                Spacer(Modifier.height(8.dp))
                node.responses.forEach { (text, nextId) ->
                    Surface(shape = RoundedCornerShape(12.dp), color = Color.White, modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp).shadow(2.dp, RoundedCornerShape(12.dp)).border(2.dp, CompanionPurple, RoundedCornerShape(12.dp)).semantics { contentDescription = text }.clickable {
                        ElderlyFeedback.onTap(context)
                        score += 5
                        val newLog = conversationLog + ("You" to text) + ("Saathi" to (chatTree[nextId]?.message ?: ""))
                        conversationLog = if (newLog.size > 60) newLog.takeLast(60) else newLog
                        currentNode = nextId
                        LocalizationManager.speak(text)
                    }) {
                        Text(text, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = CompanionPurple, modifier = Modifier.padding(12.dp))
                    }
                }
            }
        }
    }
}
