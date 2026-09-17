package com.cognicare.ui.navigation

sealed class Screen(val route: String) {
    data object Splash : Screen("splash")
    data object Login : Screen("login")
    data object QRScanner : Screen("qr_scanner")
    data object PatientDashboard : Screen("patient_dashboard")
    data object GamesHub : Screen("games_hub")
    data object MemoryRoad : Screen("memory_road")
    data object TeaGarden : Screen("tea_garden")
    data object MarketVisit : Screen("market_visit")
    data object TemplePrayer : Screen("temple_prayer")
    data object ChurchBell : Screen("church_bell")
    data object BambooCraft : Screen("bamboo_craft")
    data object AutoRickshaw : Screen("auto_rickshaw")
    data object SchoolDays : Screen("school_days")
    data object Caregiver : Screen("caregiver")
}
