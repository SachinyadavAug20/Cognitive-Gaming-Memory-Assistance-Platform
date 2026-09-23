package com.cognicare.ui.games

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import com.cognicare.ui.theme.*

enum class CognitiveDomain(val label: String) {
    MEMORY("Memory"),
    ATTENTION("Attention"),
    EXECUTIVE("Executive"),
    VISUOSPATIAL("Visuospatial"),
    LANGUAGE("Language"),
    CALM("Calm"),
    REMINISCENCE("Reminiscence"),
    ADVANCED("Advanced")
}

@Immutable
data class GameConfig(
    val id: String,
    val title: String,
    val emoji: String,
    val description: String,
    val domain: CognitiveDomain,
    val accentColor: Color,
    val isWebcamGame: Boolean = false,
    val is3DGame: Boolean = false
)

object GameRegistry {

    private val allGames = listOf(
        // Existing 8 games
        GameConfig("memory_road", "Memory Road", "\uD83D\uDEE3\uFE0F", "Find landmarks", CognitiveDomain.MEMORY, HandpumpCyan),
        GameConfig("tea_garden", "Tea Garden", "\uD83C\uDF3F", "Pick tea leaves", CognitiveDomain.ATTENTION, TeaGreen),
        GameConfig("market_visit", "Market Visit", "\uD83C\uDFEA", "Remember items", CognitiveDomain.MEMORY, MarketOrange),
        GameConfig("temple_prayer", "Temple Prayer", "\uD83D\uDE4F", "Match the bells", CognitiveDomain.CALM, TempleGold),
        GameConfig("church_bell", "Church Bell", "\uD83D\uDD14", "Listen & repeat", CognitiveDomain.ATTENTION, ChurchBlue),
        GameConfig("bamboo_craft", "Bamboo Craft", "\uD83C\uDF8B", "Build patterns", CognitiveDomain.EXECUTIVE, BridgeBrown),
        GameConfig("auto_rickshaw", "Auto Ride", "\uD83D\uDEFA", "Navigate route", CognitiveDomain.VISUOSPATIAL, AutoYellow),
        GameConfig("school_memories", "School Days", "\uD83D\uDCDA", "Recall lessons", CognitiveDomain.LANGUAGE, SchoolPurple),

        // Domain 1: Vision-3D / Kinesthetic Praxis
        GameConfig("lotus_painter", "Lotus Painter", "\uD83C\uDF38", "Paint lotus flowers", CognitiveDomain.ADVANCED, Color(0xFF2E7D32), isWebcamGame = true),
        GameConfig("butterfly_sanctuary", "Butterfly Sanctuary", "\uD83E\uDD8B", "Garden butterflies", CognitiveDomain.ADVANCED, Color(0xFF7B1FA2), isWebcamGame = true),
        GameConfig("tea_garden_catch", "Tea Garden Catch", "\uD83C\uDF3F", "Catch tea leaves", CognitiveDomain.ATTENTION, Color(0xFF1B5E20), isWebcamGame = true),
        GameConfig("alpana", "Alpana", "\uD83C\uDF8F", "Draw rangoli", CognitiveDomain.EXECUTIVE, Color(0xFF6A1B9A)),
        GameConfig("river_lanterns", "River Lanterns", "\uD83D\uDCAF", "Float lanterns", CognitiveDomain.CALM, Color(0xFF00695C), is3DGame = true),
        GameConfig("loom", "Weaving Loom", "\uD83E\uDDF5", "Weave patterns", CognitiveDomain.EXECUTIVE, Color(0xFFE65100), is3DGame = true),
        GameConfig("drum", "Playing Drum", "\uD83D\uDD14", "Play folk drum", CognitiveDomain.ATTENTION, Color(0xFFBF360C), isWebcamGame = true, is3DGame = true),
        GameConfig("tuned_drum", "Tuned Drum", "\uD83C\uDFB5", "Music drum circle", CognitiveDomain.CALM, Color(0xFFE65100)),
        GameConfig("hornbill_flight", "Hornbill Flight", "\uD83E\uDD85", "Bird flying", CognitiveDomain.VISUOSPATIAL, Color(0xFF33691E), isWebcamGame = true),
        GameConfig("majuli_pottery", "Majuli Pottery", "\uD83C\uDFFA", "Make clay pots", CognitiveDomain.EXECUTIVE, Color(0xFF4E342E)),
        GameConfig("tea_garden_match", "Tea Garden Match", "\uD83C\uDF3F", "Match-3 bloom", CognitiveDomain.ATTENTION, Color(0xFF00695C)),

        // Domain 2: Autobiographical Reminiscence
        GameConfig("grandchild_chat", "Grandchild Chat", "\uD83D\uDCAC", "Morning tea chat", CognitiveDomain.REMINISCENCE, Color(0xFF5D4037)),
        GameConfig("memory_detective", "Memory Detective", "\uD83D\uDD0D", "Remember family", CognitiveDomain.MEMORY, Color(0xFFE65100)),
        GameConfig("timeline", "My Life Story", "\uD83D\uDCC5", "Life milestones", CognitiveDomain.REMINISCENCE, Color(0xFF5D4037)),
        GameConfig("jigsaw", "Picture Puzzle", "\uD83E\uDDE9", "Solve puzzle", CognitiveDomain.VISUOSPATIAL, Color(0xFF5D4037)),
        GameConfig("radio", "Nostalgia Radio", "\uD83D\uDCFB", "Tune radio", CognitiveDomain.REMINISCENCE, Color(0xFF4E342E)),
        GameConfig("ancestral_herbalist", "Herbalist", "\uD83C\uDF3F", "Healing herbs", CognitiveDomain.REMINISCENCE, Color(0xFF1B5E20)),
        GameConfig("family_emotions", "Family Emotions", "\uD83D\uDE0A", "Social warmth", CognitiveDomain.REMINISCENCE, Color(0xFF880E4F)),
        GameConfig("card_mastery", "Heritage Cards", "\uD83C\uDCCF", "Card memory & reasoning", CognitiveDomain.MEMORY, Color(0xFFC2185B)),
        GameConfig("dainik_newspaper", "Daily Newspaper", "📰", "Morning Sudoku & Word Search", CognitiveDomain.EXECUTIVE, Color(0xFFB45309)),

        // Domain 3: Attention / Working Memory / Spatial
        GameConfig("tea_harvest", "Tea Harvest", "\uD83C\uDF3F", "Picking leaves", CognitiveDomain.ATTENTION, Color(0xFF1B5E20)),
        GameConfig("monastery_bell", "Temple Bells", "\uD83D\uDD14", "Bell sounds", CognitiveDomain.ATTENTION, Color(0xFF4A148C)),
        GameConfig("brahmaputra_boat", "River Boat", "\u26F5", "Boat ride", CognitiveDomain.VISUOSPATIAL, Color(0xFF006064)),
        GameConfig("dzukou_botanist", "Valley Flowers", "\uD83C\uDF3A", "Find flowers", CognitiveDomain.MEMORY, Color(0xFF1B5E20)),
        GameConfig("wayfinding", "Finding Home", "\uD83D\uDEE3\uFE0F", "Navigate home", CognitiveDomain.VISUOSPATIAL, Color(0xFF2E7D32)),
        GameConfig("root_bridge", "Root Bridge", "\uD83C\uDF33", "Cross bridge", CognitiveDomain.VISUOSPATIAL, Color(0xFF33691E)),
        GameConfig("storybook", "Storybook", "\uD83D\uDCD6", "Grandmother's tales", CognitiveDomain.REMINISCENCE, Color(0xFFE65100)),

        // Domain 4: Executive Function / IADL
        GameConfig("daily_routine", "Daily Routine", "\uD83D\uDD50", "Checklist sequence", CognitiveDomain.EXECUTIVE, Color(0xFF4E342E)),
        GameConfig("heritage_kitchen", "Heritage Kitchen", "\uD83C\uDF73", "Cooking", CognitiveDomain.EXECUTIVE, Color(0xFFBF360C)),
        GameConfig("sorting", "Sorting Items", "\uD83E\uDDF4", "Sort household", CognitiveDomain.EXECUTIVE, Color(0xFF5D4037)),
        GameConfig("daily_tasks", "Making Tea", "\uD83C\uDF75", "Tea steps", CognitiveDomain.EXECUTIVE, Color(0xFFC2410C)),
        GameConfig("bazaar_buddies", "Market Shopping", "\uD83C\uDFEA", "Bazaar bargaining", CognitiveDomain.EXECUTIVE, Color(0xFFD97706)),

        // Domain 5: Sensory Calming
        GameConfig("bihu_dhol", "Bihu Drum", "\uD83E\uDD41", "Bihu beats", CognitiveDomain.CALM, Color(0xFF78350F)),
        GameConfig("rhythm_hills", "Rhythm Hills", "\uD83C\uDFB5", "Gentle songs", CognitiveDomain.CALM, Color(0xFFB45309)),
        GameConfig("companion", "Chat with Saathi", "\uD83E\uDD16", "AI companion", CognitiveDomain.CALM, Color(0xFF4C1D95)),

        // Domain 6: Advanced 3D
        GameConfig("majuli_walk", "Village Walk", "\uD83D\uDEB6", "Walk village", CognitiveDomain.ADVANCED, Color(0xFF2D5A27), is3DGame = true),
        GameConfig("tea_harvest_vision", "Tea with Hands", "\u270B", "Hand tracking", CognitiveDomain.ADVANCED, Color(0xFF14532D), isWebcamGame = true),
        GameConfig("day_in_my_world", "Day in My Village", "\uD83C\uDFD8\uFE0F", "3D village story", CognitiveDomain.REMINISCENCE, Color(0xFFD97706), is3DGame = true)
    )

    fun getAllGames(): List<GameConfig> = allGames

    fun getGameById(id: String): GameConfig? = allGames.find { it.id == id }

    fun getGamesByDomain(domain: CognitiveDomain): List<GameConfig> = allGames.filter { it.domain == domain }

    fun getDomainLabel(domain: CognitiveDomain): String = domain.label

    fun getAllDomains(): List<CognitiveDomain> = CognitiveDomain.entries.toList()
}
