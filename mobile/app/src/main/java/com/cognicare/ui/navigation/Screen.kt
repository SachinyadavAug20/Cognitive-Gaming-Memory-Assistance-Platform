package com.cognicare.ui.navigation

sealed class Screen(val route: String) {
    data object Splash : Screen("splash")
    data object Login : Screen("login")
    data object QRScanner : Screen("qr_scanner")
    data object PatientDashboard : Screen("patient_dashboard")
    data object GamesHub : Screen("games_hub")
    data object GamePlayer : Screen("game/{gameId}") {
        fun createRoute(gameId: String) = "game/$gameId"
    }
    data object EchoesOfHome3D : Screen("echoes_3d")
    data object Caregiver : Screen("caregiver")
    data object DoctorDashboard : Screen("doctor_dashboard")
    data object DietDashboard : Screen("diet_dashboard")
    data object FamilyPortal : Screen("family_portal")
    data object Admin : Screen("admin")
}
