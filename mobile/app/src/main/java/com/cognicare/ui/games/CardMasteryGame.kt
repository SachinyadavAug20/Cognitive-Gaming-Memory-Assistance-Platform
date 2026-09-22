package com.cognicare.ui.games

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeUp
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
import kotlinx.coroutines.delay

private val CardInk = Color(0xFF16120E)
private val CardCanvas = Color(0xFFFAF7F2)
private val CardWine = Color(0xFFC2185B)
private val CardRed = Color(0xFFDC2626)
private val CardBlack = Color(0xFF111827)
private val CardSurface = Color(0xFFFFFDF9)

enum class PlayingCardSuit(val symbol: String, val isRed: Boolean) {
    SPADES("♠", false),
    HEARTS("♥", true),
    DIAMONDS("♦", true),
    CLUBS("♣", false),
    JOKER("🃏", false)
}

enum class PlayingCardRank(val code: String, val value: Int) {
    ACE("A", 1),
    TWO("2", 2),
    THREE("3", 3),
    FOUR("4", 4),
    FIVE("5", 5),
    SIX("6", 6),
    SEVEN("7", 7),
    EIGHT("8", 8),
    NINE("9", 9),
    TEN("10", 10),
    JACK("J", 11),
    QUEEN("Q", 12),
    KING("K", 13),
    JOKER("Joker", 15)
}

data class CardItem(
    val id: String,
    val suit: PlayingCardSuit,
    val rank: PlayingCardRank,
    val isJoker: Boolean = false,
    val isRedJoker: Boolean = false
) {
    val isRedColor: Boolean get() = isRedJoker || (!isJoker && suit.isRed)
}

// 54-Card Full Deck Generator
object Standard54Deck {
    val fullDeck: List<CardItem> by lazy {
        val list = mutableListOf<CardItem>()
        val standardSuits = listOf(
            PlayingCardSuit.SPADES,
            PlayingCardSuit.HEARTS,
            PlayingCardSuit.DIAMONDS,
            PlayingCardSuit.CLUBS
        )
        val ranks = listOf(
            PlayingCardRank.ACE, PlayingCardRank.TWO, PlayingCardRank.THREE,
            PlayingCardRank.FOUR, PlayingCardRank.FIVE, PlayingCardRank.SIX,
            PlayingCardRank.SEVEN, PlayingCardRank.EIGHT, PlayingCardRank.NINE,
            PlayingCardRank.TEN, PlayingCardRank.JACK, PlayingCardRank.QUEEN,
            PlayingCardRank.KING
        )

        for (s in standardSuits) {
            for (r in ranks) {
                list.add(CardItem("${s.name}_${r.name}", s, r))
            }
        }

        // Red Joker
        list.add(CardItem("RED_JOKER", PlayingCardSuit.JOKER, PlayingCardRank.JOKER, isJoker = true, isRedJoker = true))
        // Black Joker
        list.add(CardItem("BLACK_JOKER", PlayingCardSuit.JOKER, PlayingCardRank.JOKER, isJoker = true, isRedJoker = false))

        list
    }
}

// Multilingual translations for suits and ranks
object CardLocalizer {
    fun getSuitName(suit: PlayingCardSuit, lang: String): String {
        return when (lang) {
            "hi" -> when (suit) {
                PlayingCardSuit.SPADES -> "हुकुम ♠"
                PlayingCardSuit.HEARTS -> "पान ♥"
                PlayingCardSuit.DIAMONDS -> "ईंट ♦"
                PlayingCardSuit.CLUBS -> "चिड़ी ♣"
                PlayingCardSuit.JOKER -> "जोकर 🃏"
            }
            "as" -> when (suit) {
                PlayingCardSuit.SPADES -> "ইস্কাপন ♠"
                PlayingCardSuit.HEARTS -> "পান ♥"
                PlayingCardSuit.DIAMONDS -> "ৰুইতন ♦"
                PlayingCardSuit.CLUBS -> "চিৰিয়া ♣"
                PlayingCardSuit.JOKER -> "জোকাৰ 🃏"
            }
            "bn" -> when (suit) {
                PlayingCardSuit.SPADES -> "ইস্কাপন ♠"
                PlayingCardSuit.HEARTS -> "হরতন (পান) ♥"
                PlayingCardSuit.DIAMONDS -> "রুইতন ♦"
                PlayingCardSuit.CLUBS -> "চিড়িতন ♣"
                PlayingCardSuit.JOKER -> "জোকার 🃏"
            }
            "mr" -> when (suit) {
                PlayingCardSuit.SPADES -> "इसपीक ♠"
                PlayingCardSuit.HEARTS -> "बदाम ♥"
                PlayingCardSuit.DIAMONDS -> "चौकट ♦"
                PlayingCardSuit.CLUBS -> "किलवर ♣"
                PlayingCardSuit.JOKER -> "जोकर 🃏"
            }
            "ne" -> when (suit) {
                PlayingCardSuit.SPADES -> "हुकुम ♠"
                PlayingCardSuit.HEARTS -> "पान ♥"
                PlayingCardSuit.DIAMONDS -> "ईंट ♦"
                PlayingCardSuit.CLUBS -> "चिड़ी ♣"
                PlayingCardSuit.JOKER -> "जोकर 🃏"
            }
            else -> when (suit) {
                PlayingCardSuit.SPADES -> "Spades ♠"
                PlayingCardSuit.HEARTS -> "Hearts ♥"
                PlayingCardSuit.DIAMONDS -> "Diamonds ♦"
                PlayingCardSuit.CLUBS -> "Clubs ♣"
                PlayingCardSuit.JOKER -> "Joker 🃏"
            }
        }
    }

    fun getRankName(rank: PlayingCardRank, lang: String): String {
        return when (lang) {
            "hi" -> when (rank) {
                PlayingCardRank.ACE -> "इक्का"
                PlayingCardRank.JACK -> "गुलाम"
                PlayingCardRank.QUEEN -> "बेगम"
                PlayingCardRank.KING -> "बादशाह"
                PlayingCardRank.JOKER -> "जोकर"
                else -> rank.code
            }
            "as" -> when (rank) {
                PlayingCardRank.ACE -> "টেক্কা"
                PlayingCardRank.JACK -> "গোলাম"
                PlayingCardRank.QUEEN -> "বিবি"
                PlayingCardRank.KING -> "চাহেব"
                PlayingCardRank.JOKER -> "জোকাৰ"
                else -> rank.code
            }
            "bn" -> when (rank) {
                PlayingCardRank.ACE -> "টেক্কা"
                PlayingCardRank.JACK -> "গোলাম"
                PlayingCardRank.QUEEN -> "বিবি"
                PlayingCardRank.KING -> "সাহেব"
                PlayingCardRank.JOKER -> "জোকার"
                else -> rank.code
            }
            "mr" -> when (rank) {
                PlayingCardRank.ACE -> "एक्का"
                PlayingCardRank.JACK -> "गुलाम"
                PlayingCardRank.QUEEN -> "राणी"
                PlayingCardRank.KING -> "राजा"
                PlayingCardRank.JOKER -> "जोकर"
                else -> rank.code
            }
            else -> when (rank) {
                PlayingCardRank.ACE -> "Ace"
                PlayingCardRank.JACK -> "Jack"
                PlayingCardRank.QUEEN -> "Queen"
                PlayingCardRank.KING -> "King"
                PlayingCardRank.JOKER -> "Joker"
                else -> rank.code
            }
        }
    }

    fun getCardTitle(card: CardItem, lang: String): String {
        if (card.isJoker) {
            return if (card.isRedJoker) {
                if (lang == "hi") "लाल जोकर" else if (lang == "as") "ৰঙা জোকাৰ" else "Red Joker"
            } else {
                if (lang == "hi") "काला जोकर" else if (lang == "as") "ক'লা জোকাৰ" else "Black Joker"
            }
        }
        val s = getSuitName(card.suit, lang)
        val r = getRankName(card.rank, lang)
        return if (lang in listOf("hi", "as", "bn", "mr", "ne")) "$s $r" else "$r of $s"
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CardMasteryGame(onBack: () -> Unit) {
    val context = LocalContext.current
    val currentLang by LocalizationManager.currentLanguage.collectAsState()

    var level by remember { mutableIntStateOf(1) }
    var round by remember { mutableIntStateOf(1) }
    var score by remember { mutableIntStateOf(0) }
    var showCelebration by remember { mutableStateOf(false) }

    // Level states
    var l1Target by remember { mutableStateOf<CardItem?>(null) }
    var l1Choices by remember { mutableStateOf<List<CardItem>>(emptyList()) }

    var l2Cards by remember { mutableStateOf<List<CardItem>>(emptyList()) }
    var l2Flipped by remember { mutableStateOf(false) }
    var l2Target by remember { mutableStateOf<CardItem?>(null) }
    var l2Countdown by remember { mutableIntStateOf(4) }

    var l3Sequence by remember { mutableStateOf<List<CardItem>>(emptyList()) }
    var l3TargetNext by remember { mutableStateOf<CardItem?>(null) }
    var l3Choices by remember { mutableStateOf<List<CardItem>>(emptyList()) }

    var l4Pattern by remember { mutableStateOf<List<CardItem>>(emptyList()) }
    var l4MissingCard by remember { mutableStateOf<CardItem?>(null) }
    var l4Choices by remember { mutableStateOf<List<CardItem>>(emptyList()) }

    var l5Hand by remember { mutableStateOf<List<CardItem>>(emptyList()) }
    var l5Sorted by remember { mutableStateOf<List<CardItem>>(emptyList()) }
    var l5CorrectOrder by remember { mutableStateOf<List<CardItem>>(emptyList()) }

    var l6Card by remember { mutableStateOf<CardItem?>(null) }
    var l6Remaining by remember { mutableStateOf<List<CardItem>>(emptyList()) }
    var l6Mode by remember { mutableStateOf("suit") } // "suit", "color", "face_number"

    var l7Card by remember { mutableStateOf<CardItem?>(null) }
    var l7Showing by remember { mutableStateOf(true) }
    var l7SubStage by remember { mutableStateOf("A") } // "A" for number, "B" for full card
    var l7Options by remember { mutableStateOf<List<String>>(emptyList()) }
    var l7CorrectOption by remember { mutableStateOf("") }

    var l8Prompt by remember { mutableStateOf("") }
    var l8Cards by remember { mutableStateOf<List<CardItem>>(emptyList()) }
    var l8Correct by remember { mutableStateOf<CardItem?>(null) }

    fun speakPrompt(text: String) {
        LocalizationManager.speak(text)
    }

    // Generator for Level 1
    fun initL1() {
        val nonJokers = Standard54Deck.fullDeck.shuffled()
        val target = nonJokers[0]
        val distractors = nonJokers.subList(1, 4)
        l1Target = target
        l1Choices = (listOf(target) + distractors).shuffled()
        speakPrompt(CardLocalizer.getCardTitle(target, currentLang))
    }

    // Generator for Level 2
    fun initL2() {
        val nonJokers = Standard54Deck.fullDeck.filter { !it.isJoker }.shuffled()
        val cards = nonJokers.take(3)
        val target = cards.random()
        l2Cards = cards
        l2Target = target
        l2Flipped = false
        l2Countdown = 4
    }

    // Generator for Level 3
    fun initL3() {
        val s = listOf(PlayingCardSuit.SPADES, PlayingCardSuit.HEARTS, PlayingCardSuit.DIAMONDS, PlayingCardSuit.CLUBS).random()
        val suitCards = Standard54Deck.fullDeck.filter { it.suit == s && !it.isJoker }
        val startIdx = (0..9).random()
        val seq = suitCards.subList(startIdx, startIdx + 3)
        val targetNext = suitCards[startIdx + 3]
        val distractors = Standard54Deck.fullDeck.filter { it.id != targetNext.id && !seq.contains(it) }.shuffled().take(2)
        l3Sequence = seq
        l3TargetNext = targetNext
        l3Choices = (listOf(targetNext) + distractors).shuffled()
        speakPrompt("What comes next in the sequence?")
    }

    // Generator for Level 4
    fun initL4() {
        val red = Standard54Deck.fullDeck.filter { it.isRedColor && !it.isJoker }.shuffled()
        val black = Standard54Deck.fullDeck.filter { !it.isRedColor && !it.isJoker }.shuffled()
        val pattern = listOf(red[0], black[0], red[1])
        val missing = black[1]
        val distractors = listOf(red[2], red[3])
        l4Pattern = pattern
        l4MissingCard = missing
        l4Choices = (listOf(missing) + distractors).shuffled()
        speakPrompt("Observe the pattern and pick the matching card")
    }

    // Generator for Level 5
    fun initL5() {
        val nonJokers = Standard54Deck.fullDeck.filter { !it.isJoker }.shuffled()
        val distinctCards = mutableListOf<CardItem>()
        for (c in nonJokers) {
            if (distinctCards.none { it.rank.value == c.rank.value }) {
                distinctCards.add(c)
            }
            if (distinctCards.size == 4) break
        }
        val sorted = distinctCards.sortedBy { it.rank.value }
        l5Hand = distinctCards.shuffled()
        l5Sorted = emptyList()
        l5CorrectOrder = sorted
        speakPrompt("Tap the cards in order from smallest to largest")
    }

    // Generator for Level 6
    fun initL6() {
        val modes = listOf("suit", "color", "face_number")
        l6Mode = modes[(round - 1) % modes.size]
        val pool = Standard54Deck.fullDeck.filter { !it.isJoker }.shuffled().take(6)
        l6Card = pool[0]
        l6Remaining = pool.drop(1)
        speakPrompt("Put this card into its matching basket")
    }

    // Generator for Level 7
    fun initL7() {
        val card = Standard54Deck.fullDeck.filter { !it.isJoker }.shuffled().first()
        l7Card = card
        l7Showing = true

        if (l7SubStage == "A") {
            val correct = CardLocalizer.getRankName(card.rank, currentLang)
            val ranks = listOf(PlayingCardRank.ACE, PlayingCardRank.SEVEN, PlayingCardRank.TEN, PlayingCardRank.KING, PlayingCardRank.FIVE)
                .filter { it != card.rank }.take(3).map { CardLocalizer.getRankName(it, currentLang) }
            l7CorrectOption = correct
            l7Options = (listOf(correct) + ranks).shuffled()
        } else {
            val correct = CardLocalizer.getCardTitle(card, currentLang)
            val otherCards = Standard54Deck.fullDeck.filter { it.id != card.id && !it.isJoker }.shuffled().take(3)
                .map { CardLocalizer.getCardTitle(it, currentLang) }
            l7CorrectOption = correct
            l7Options = (listOf(correct) + otherCards).shuffled()
        }
    }

    // Generator for Level 8
    fun initL8() {
        val types = listOf("odd_one_out", "highest", "find_joker")
        val type = types[(round - 1) % types.size]
        if (type == "odd_one_out") {
            val suits = listOf(PlayingCardSuit.SPADES, PlayingCardSuit.HEARTS, PlayingCardSuit.DIAMONDS, PlayingCardSuit.CLUBS).shuffled()
            val maj = Standard54Deck.fullDeck.filter { it.suit == suits[0] && !it.isJoker }.shuffled().take(3)
            val odd = Standard54Deck.fullDeck.filter { it.suit == suits[1] && !it.isJoker }.shuffled().first()
            l8Cards = (maj + odd).shuffled()
            l8Correct = odd
            l8Prompt = if (currentLang == "hi") "कौन सा पत्ता सबसे अलग है? (Odd One Out)" else "Which card is the Odd One Out?"
        } else if (type == "highest") {
            val cards = Standard54Deck.fullDeck.filter { !it.isJoker }.shuffled().take(4)
            val highest = cards.maxByOrNull { if (it.rank == PlayingCardRank.ACE) 14 else it.rank.value }
            l8Cards = cards
            l8Correct = highest
            l8Prompt = if (currentLang == "hi") "सबसे बड़े मान का पत्ता कौन सा है?" else "Which card has the HIGHEST value?"
        } else {
            val jokers = Standard54Deck.fullDeck.filter { it.isJoker }.shuffled()
            val regulars = Standard54Deck.fullDeck.filter { !it.isJoker }.shuffled().take(3)
            val chosen = jokers.first()
            l8Cards = (listOf(chosen) + regulars).shuffled()
            l8Correct = chosen
            l8Prompt = if (currentLang == "hi") "जोकर (Joker) पत्ता पहचानें!" else "Find the special JOKER card!"
        }
        speakPrompt(l8Prompt)
    }

    // Reset Level
    fun loadRound() {
        when (level) {
            1 -> initL1()
            2 -> initL2()
            3 -> initL3()
            4 -> initL4()
            5 -> initL5()
            6 -> initL6()
            7 -> initL7()
            8 -> initL8()
        }
    }

    LaunchedEffect(level, round) {
        loadRound()
    }

    // Timer effect for Level 2
    LaunchedEffect(level, l2Countdown, l2Flipped) {
        if (level == 2 && !l2Flipped) {
            if (l2Countdown > 0) {
                delay(1000)
                l2Countdown -= 1
            } else {
                l2Flipped = true
                l2Target?.let { speakPrompt("Where is the ${CardLocalizer.getCardTitle(it, currentLang)}?") }
            }
        }
    }

    // Timer effect for Level 7 (Hide card after 3 seconds)
    LaunchedEffect(level, l7Showing) {
        if (level == 7 && l7Showing) {
            delay(3000)
            l7Showing = false
            speakPrompt(if (l7SubStage == "A") "What was the rank of the card?" else "What was the full card?")
        }
    }

    fun onAnswerCorrect() {
        score += 20
        ElderlyFeedback.onSuccess(context)
        if (round < 3) {
            round += 1
        } else {
            showCelebration = true
        }
    }

    fun onAnswerWrong() {
        ElderlyFeedback.onError(context)
        speakPrompt(if (currentLang == "hi") "फिर से प्रयास करें" else "Try again!")
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "🃏 Heritage Cards (L$level)",
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Serif,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        val prompt = when (level) {
                            1 -> l1Target?.let { CardLocalizer.getCardTitle(it, currentLang) } ?: ""
                            2 -> l2Target?.let { "Where is ${CardLocalizer.getCardTitle(it, currentLang)}?" } ?: ""
                            8 -> l8Prompt
                            else -> "Level $level Card Task"
                        }
                        speakPrompt(prompt)
                    }) {
                        Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = "Listen", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CardWine)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(CardCanvas)
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Level Selector Row
            LazyRow(
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items((1..8).toList()) { lvl ->
                    val isCurrent = lvl == level
                    Surface(
                        modifier = Modifier
                            .clickable {
                                ElderlyFeedback.onTap(context)
                                level = lvl
                                round = 1
                                showCelebration = false
                            }
                            .border(2.dp, CardInk, RoundedCornerShape(12.dp)),
                        shape = RoundedCornerShape(12.dp),
                        color = if (isCurrent) CardWine else Color.White
                    ) {
                        Text(
                            text = "L$lvl",
                            fontWeight = FontWeight.Black,
                            fontSize = 13.sp,
                            color = if (isCurrent) Color.White else CardInk,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            // Score & Round Banner
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(3.dp, RoundedCornerShape(16.dp))
                    .border(2.5.dp, CardInk, RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                color = CardSurface
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Score: $score", fontSize = 16.sp, fontWeight = FontWeight.Black, color = CardInk)
                        Text("Round $round of 3", fontSize = 12.sp, color = CardWine, fontWeight = FontWeight.Bold)
                    }
                    Text("54 Cards Deck", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = CardWine)
                }
            }

            Spacer(Modifier.height(12.dp))

            // Level Content
            when (level) {
                1 -> {
                    // Level 1: Identifying
                    Text("Find this card:", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = CardInk)
                    l1Target?.let {
                        Text(
                            text = CardLocalizer.getCardTitle(it, currentLang),
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Serif,
                            color = CardWine,
                            modifier = Modifier.padding(vertical = 6.dp)
                        )
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        l1Choices.forEach { card ->
                            MobileCardView(card = card, isFaceUp = true) {
                                ElderlyFeedback.onTap(context)
                                if (card.id == l1Target?.id) onAnswerCorrect() else onAnswerWrong()
                            }
                        }
                    }
                }

                2 -> {
                    // Level 2: Memorizing
                    if (!l2Flipped) {
                        Text("Memorize these cards! ($l2Countdown s)", fontSize = 16.sp, fontWeight = FontWeight.Black, color = CardWine)
                    } else {
                        l2Target?.let {
                            Text("Where was: ${CardLocalizer.getCardTitle(it, currentLang)}?", fontSize = 18.sp, fontWeight = FontWeight.Black, color = CardWine)
                        }
                    }
                    Spacer(Modifier.height(14.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        l2Cards.forEach { card ->
                            MobileCardView(card = card, isFaceUp = !l2Flipped) {
                                if (l2Flipped) {
                                    ElderlyFeedback.onTap(context)
                                    if (card.id == l2Target?.id) onAnswerCorrect() else onAnswerWrong()
                                }
                            }
                        }
                    }
                }

                3 -> {
                    // Level 3: Sequencing
                    Text("Which card comes next in the sequence?", fontSize = 15.sp, fontWeight = FontWeight.Black, color = CardInk)
                    Spacer(Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        l3Sequence.forEach { MobileCardView(card = it, isFaceUp = true) }
                        Surface(
                            modifier = Modifier
                                .width(64.dp)
                                .height(96.dp)
                                .border(2.dp, CardInk, RoundedCornerShape(12.dp)),
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFE2E8F0)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("?", fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color.Gray)
                            }
                        }
                    }
                    Spacer(Modifier.height(16.dp))
                    Text("Select the next card:", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = CardInk)
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        l3Choices.forEach { card ->
                            MobileCardView(card = card, isFaceUp = true) {
                                ElderlyFeedback.onTap(context)
                                if (card.id == l3TargetNext?.id) onAnswerCorrect() else onAnswerWrong()
                            }
                        }
                    }
                }

                4 -> {
                    // Level 4: Patterns
                    Text("Complete the pattern:", fontSize = 15.sp, fontWeight = FontWeight.Black, color = CardInk)
                    Spacer(Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        l4Pattern.forEach { MobileCardView(card = it, isFaceUp = true) }
                        Surface(
                            modifier = Modifier
                                .width(64.dp)
                                .height(96.dp)
                                .border(2.dp, CardWine, RoundedCornerShape(12.dp)),
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFFCE4EC)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("?", fontSize = 28.sp, fontWeight = FontWeight.Black, color = CardWine)
                            }
                        }
                    }
                    Spacer(Modifier.height(16.dp))
                    Text("Pick the card that completes the pattern:", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = CardInk)
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        l4Choices.forEach { card ->
                            MobileCardView(card = card, isFaceUp = true) {
                                ElderlyFeedback.onTap(context)
                                if (card.id == l4MissingCard?.id) onAnswerCorrect() else onAnswerWrong()
                            }
                        }
                    }
                }

                5 -> {
                    // Level 5: Sorting
                    Text("Tap cards in order from Smallest to Largest:", fontSize = 14.sp, fontWeight = FontWeight.Black, color = CardInk)
                    Spacer(Modifier.height(8.dp))
                    // Sorted Rack
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(110.dp)
                            .border(2.dp, CardInk, RoundedCornerShape(12.dp)),
                        shape = RoundedCornerShape(12.dp),
                        color = Color.White
                    ) {
                        Row(
                            modifier = Modifier.padding(8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (l5Sorted.isEmpty()) {
                                Text("Sorted cards appear here...", fontSize = 13.sp, color = Color.Gray)
                            } else {
                                l5Sorted.forEach { MobileCardView(card = it, isFaceUp = true) }
                            }
                        }
                    }
                    Spacer(Modifier.height(14.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        l5Hand.forEach { card ->
                            MobileCardView(card = card, isFaceUp = true) {
                                val expected = l5CorrectOrder[l5Sorted.size]
                                if (card.id == expected.id) {
                                    ElderlyFeedback.onTap(context)
                                    val nextSorted = l5Sorted + card
                                    l5Sorted = nextSorted
                                    l5Hand = l5Hand.filter { it.id != card.id }
                                    if (nextSorted.size == l5CorrectOrder.size) onAnswerCorrect()
                                } else {
                                    onAnswerWrong()
                                }
                            }
                        }
                    }
                }

                6 -> {
                    // Level 6: Grouping / Classification
                    Text("Classify this card:", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = CardInk)
                    Spacer(Modifier.height(6.dp))
                    l6Card?.let { MobileCardView(card = it, isFaceUp = true) }
                    Spacer(Modifier.height(14.dp))
                    if (l6Mode == "suit") {
                        val suits = listOf(PlayingCardSuit.SPADES, PlayingCardSuit.HEARTS, PlayingCardSuit.DIAMONDS, PlayingCardSuit.CLUBS)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            suits.forEach { s ->
                                Button(
                                    onClick = {
                                        ElderlyFeedback.onTap(context)
                                        if (l6Card?.suit == s) {
                                            if (l6Remaining.isNotEmpty()) {
                                                l6Card = l6Remaining.first()
                                                l6Remaining = l6Remaining.drop(1)
                                                ElderlyFeedback.onSuccess(context)
                                            } else {
                                                onAnswerCorrect()
                                            }
                                        } else {
                                            onAnswerWrong()
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = if (s.isRed) Color(0xFFFFEBEE) else Color(0xFFF1F5F9)),
                                    modifier = Modifier.border(2.dp, CardInk, RoundedCornerShape(12.dp)),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text(s.symbol, fontSize = 20.sp, color = if (s.isRed) CardRed else CardBlack)
                                }
                            }
                        }
                    } else if (l6Mode == "color") {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            Button(
                                onClick = {
                                    ElderlyFeedback.onTap(context)
                                    if (l6Card?.isRedColor == true) {
                                        if (l6Remaining.isNotEmpty()) {
                                            l6Card = l6Remaining.first()
                                            l6Remaining = l6Remaining.drop(1)
                                            ElderlyFeedback.onSuccess(context)
                                        } else onAnswerCorrect()
                                    } else onAnswerWrong()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFEBEE)),
                                modifier = Modifier.border(2.dp, CardInk, RoundedCornerShape(12.dp)),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("Red ♥♦", fontWeight = FontWeight.Black, color = CardRed)
                            }
                            Button(
                                onClick = {
                                    ElderlyFeedback.onTap(context)
                                    if (l6Card?.isRedColor == false) {
                                        if (l6Remaining.isNotEmpty()) {
                                            l6Card = l6Remaining.first()
                                            l6Remaining = l6Remaining.drop(1)
                                            ElderlyFeedback.onSuccess(context)
                                        } else onAnswerCorrect()
                                    } else onAnswerWrong()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF1F5F9)),
                                modifier = Modifier.border(2.dp, CardInk, RoundedCornerShape(12.dp)),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("Black ♠♣", fontWeight = FontWeight.Black, color = CardBlack)
                            }
                        }
                    } else {
                        // Face vs Number
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            Button(
                                onClick = {
                                    ElderlyFeedback.onTap(context)
                                    val isFace = l6Card?.rank in listOf(PlayingCardRank.JACK, PlayingCardRank.QUEEN, PlayingCardRank.KING)
                                    if (isFace) {
                                        if (l6Remaining.isNotEmpty()) {
                                            l6Card = l6Remaining.first()
                                            l6Remaining = l6Remaining.drop(1)
                                            ElderlyFeedback.onSuccess(context)
                                        } else onAnswerCorrect()
                                    } else onAnswerWrong()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF3E5F5)),
                                modifier = Modifier.border(2.dp, CardInk, RoundedCornerShape(12.dp)),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("Picture (J, Q, K)", fontWeight = FontWeight.Black, color = Color(0xFF4A148C))
                            }
                            Button(
                                onClick = {
                                    ElderlyFeedback.onTap(context)
                                    val isNum = l6Card?.rank !in listOf(PlayingCardRank.JACK, PlayingCardRank.QUEEN, PlayingCardRank.KING)
                                    if (isNum) {
                                        if (l6Remaining.isNotEmpty()) {
                                            l6Card = l6Remaining.first()
                                            l6Remaining = l6Remaining.drop(1)
                                            ElderlyFeedback.onSuccess(context)
                                        } else onAnswerCorrect()
                                    } else onAnswerWrong()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE8F5E9)),
                                modifier = Modifier.border(2.dp, CardInk, RoundedCornerShape(12.dp)),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("Number (2–10)", fontWeight = FontWeight.Black, color = Color(0xFF1B5E20))
                            }
                        }
                    }
                }

                7 -> {
                    // Level 7: Flash Card Recall
                    if (l7Showing) {
                        Text("Memorize this card (3s)...", fontSize = 16.sp, fontWeight = FontWeight.Black, color = CardWine)
                        Spacer(Modifier.height(12.dp))
                        l7Card?.let { MobileCardView(card = it, isFaceUp = true) }
                    } else {
                        Text(
                            if (l7SubStage == "A") "What was the NUMBER / RANK?" else "What was the FULL CARD?",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = CardInk,
                            textAlign = TextAlign.Center
                        )
                        Spacer(Modifier.height(14.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            l7Options.chunked(2).forEach { rowOpts ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceEvenly
                                ) {
                                    rowOpts.forEach { opt ->
                                        Button(
                                            onClick = {
                                                ElderlyFeedback.onTap(context)
                                                if (opt == l7CorrectOption) {
                                                    if (l7SubStage == "A") {
                                                        ElderlyFeedback.onSuccess(context)
                                                        l7SubStage = "B"
                                                        initL7()
                                                    } else {
                                                        l7SubStage = "A"
                                                        onAnswerCorrect()
                                                    }
                                                } else {
                                                    onAnswerWrong()
                                                }
                                            },
                                            modifier = Modifier
                                                .weight(1f)
                                                .padding(horizontal = 4.dp)
                                                .border(2.dp, CardInk, RoundedCornerShape(12.dp)),
                                            shape = RoundedCornerShape(12.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = Color.White)
                                        ) {
                                            Text(opt, color = CardInk, fontWeight = FontWeight.Black, fontSize = 14.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                8 -> {
                    // Level 8: Reasoning
                    Text(l8Prompt, fontSize = 16.sp, fontWeight = FontWeight.Black, color = CardWine, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(14.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        l8Cards.forEach { card ->
                            MobileCardView(card = card, isFaceUp = true) {
                                ElderlyFeedback.onTap(context)
                                if (card.id == l8Correct?.id) onAnswerCorrect() else onAnswerWrong()
                            }
                        }
                    }
                }
            }

            // Celebration Dialog
            if (showCelebration) {
                AlertDialog(
                    onDismissRequest = { },
                    title = { Text("🎉 Level Complete!", fontWeight = FontWeight.Black, color = CardWine) },
                    text = {
                        Text("Splendid work! You completed Level $level. Score: $score", fontSize = 15.sp, color = CardInk)
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                ElderlyFeedback.onTap(context)
                                showCelebration = false
                                round = 1
                                if (level < 8) level += 1 else onBack()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = CardWine)
                        ) {
                            Text(if (level < 8) "Next Level ($level) ➔" else "Finish Game", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    },
                    containerColor = Color.White
                )
            }
        }
    }
}

@Composable
fun MobileCardView(
    card: CardItem,
    isFaceUp: Boolean,
    onClick: (() -> Unit)? = null
) {
    val modifier = Modifier
        .width(68.dp)
        .height(102.dp)
        .shadow(3.dp, RoundedCornerShape(12.dp))
        .border(2.dp, CardInk, RoundedCornerShape(12.dp))
        .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)

    if (!isFaceUp) {
        Surface(
            modifier = modifier,
            shape = RoundedCornerShape(12.dp),
            color = Color(0xFFB71C1C)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text("⚜", fontSize = 28.sp, color = Color(0xFFFFD54F))
            }
        }
    } else {
        val color = if (card.isRedColor) CardRed else CardBlack
        Surface(
            modifier = modifier,
            shape = RoundedCornerShape(12.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(4.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Top pip
                Text(
                    text = if (card.isJoker) "★" else "${card.rank.code}\n${card.suit.symbol}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = color,
                    lineHeight = 11.sp
                )
                // Center pip
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    Text(
                        text = if (card.isJoker) "🃏" else card.suit.symbol,
                        fontSize = 24.sp,
                        color = color
                    )
                }
                // Bottom pip
                Text(
                    text = if (card.isJoker) "★" else "${card.rank.code}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = color,
                    modifier = Modifier.align(Alignment.End)
                )
            }
        }
    }
}
