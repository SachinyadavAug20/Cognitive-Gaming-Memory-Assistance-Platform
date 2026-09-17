package com.cognicare

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.cognicare.data.AppDatabase
import com.cognicare.data.Patient
import com.cognicare.ui.games.*
import com.cognicare.ui.navigation.Screen
import com.cognicare.ui.screens.*
import com.cognicare.ui.theme.CogniCareTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val db = AppDatabase.getDatabase(applicationContext)

        setContent {
            CogniCareTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CogniCareApp(db)
                }
            }
        }
    }
}

@Composable
fun CogniCareApp(db: AppDatabase) {
    val navController = rememberNavController()
    var currentPatient by remember { mutableStateOf<Patient?>(null) }

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        // Splash
        composable(Screen.Splash.route) {
            SplashScreen {
                navController.navigate(Screen.Login.route) {
                    popUpTo(Screen.Splash.route) { inclusive = true }
                }
            }
        }

        // Login
        composable(Screen.Login.route) {
            LoginScreen(
                onScanQR = { navController.navigate(Screen.QRScanner.route) },
                onDemoLogin = {
                    currentPatient = Patient(
                        id = 2,
                        name = "Biren Borah",
                        age = 72,
                        gender = "Male",
                        state = "Assam",
                        language = "as"
                    )
                    navController.navigate(Screen.PatientDashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        // QR Scanner
        composable(Screen.QRScanner.route) {
            QRScannerScreen(
                onScanSuccess = {
                    currentPatient = Patient(
                        id = 2,
                        name = "Biren Borah",
                        age = 72,
                        gender = "Male",
                        state = "Assam",
                        language = "as"
                    )
                    navController.navigate(Screen.PatientDashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        // Patient Dashboard
        composable(Screen.PatientDashboard.route) {
            val patient = currentPatient ?: return@composable
            PatientDashboardScreen(
                patient = patient,
                onGamesClick = { navController.navigate(Screen.GamesHub.route) },
                onCaregiverClick = { navController.navigate(Screen.Caregiver.route) },
                onLogout = {
                    currentPatient = null
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // Games Hub
        composable(Screen.GamesHub.route) {
            GamesHubScreen(
                onGameClick = { gameId ->
                    when (gameId) {
                        "memory_road" -> navController.navigate(Screen.MemoryRoad.route)
                        "tea_garden" -> navController.navigate(Screen.TeaGarden.route)
                        "market_visit" -> navController.navigate(Screen.MarketVisit.route)
                        "temple_prayer" -> navController.navigate(Screen.TemplePrayer.route)
                        "church_bell" -> navController.navigate(Screen.ChurchBell.route)
                        "bamboo_craft" -> navController.navigate(Screen.BambooCraft.route)
                        "auto_rickshaw" -> navController.navigate(Screen.AutoRickshaw.route)
                        "school_memories" -> navController.navigate(Screen.SchoolDays.route)
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        // Games
        composable(Screen.MemoryRoad.route) {
            MemoryRoadGame(onBack = { navController.popBackStack() })
        }
        composable(Screen.TeaGarden.route) {
            TeaGardenGame(onBack = { navController.popBackStack() })
        }
        composable(Screen.MarketVisit.route) {
            MarketVisitGame(onBack = { navController.popBackStack() })
        }
        composable(Screen.TemplePrayer.route) {
            TemplePrayerGame(onBack = { navController.popBackStack() })
        }
        composable(Screen.ChurchBell.route) {
            ChurchBellGame(onBack = { navController.popBackStack() })
        }
        composable(Screen.BambooCraft.route) {
            BambooCraftGame(onBack = { navController.popBackStack() })
        }
        composable(Screen.AutoRickshaw.route) {
            AutoRickshawGame(onBack = { navController.popBackStack() })
        }
        composable(Screen.SchoolDays.route) {
            SchoolDaysGame(onBack = { navController.popBackStack() })
        }

        // Caregiver
        composable(Screen.Caregiver.route) {
            val patient = currentPatient ?: return@composable
            CaregiverScreen(
                patient = patient,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
