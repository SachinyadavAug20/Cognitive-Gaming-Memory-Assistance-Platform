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
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.cognicare.di.ServiceLocator
import com.cognicare.ui.navigation.Screen
import com.cognicare.ui.screens.*
import com.cognicare.ui.theme.CogniCareTheme
import com.cognicare.viewmodel.AuthViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            CogniCareTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CogniCareApp()
                }
            }
        }
    }
}

@Composable
fun CogniCareApp() {
    val navController = rememberNavController()
    val context = androidx.compose.ui.platform.LocalContext.current
    val application = context.applicationContext as android.app.Application
    val authViewModel: AuthViewModel = viewModel(
        factory = object : androidx.lifecycle.ViewModelProvider.Factory {
            override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                @Suppress("UNCHECKED_CAST")
                return ServiceLocator.provideAuthViewModel(application) as T
            }
        }
    )
    val authState by authViewModel.authState.collectAsState()

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) {
            SplashScreen {
                navController.navigate(Screen.Login.route) {
                    popUpTo(Screen.Splash.route) { inclusive = true }
                }
            }
        }

        composable(Screen.Login.route) {
            LoginScreen(
                onScanQR = { navController.navigate(Screen.QRScanner.route) },
                onDemoLogin = {
                    authViewModel.demoLoginLocal()
                    navController.navigate(Screen.PatientDashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.QRScanner.route) {
            QRScannerScreen(
                onScanSuccess = { qrData ->
                    authViewModel.kioskScan(qrData)
                    navController.navigate(Screen.PatientDashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.PatientDashboard.route) {
            val patient = authState.patient ?: return@composable
            PatientDashboardScreen(
                patient = patient,
                onGamesClick = { navController.navigate(Screen.GamesHub.route) },
                onCaregiverClick = { navController.navigate(Screen.Caregiver.route) },
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.GamesHub.route) {
            GamesHubScreen(
                onGameClick = { gameId ->
                    navController.navigate(Screen.GamePlayer.createRoute(gameId))
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.GamePlayer.route,
            arguments = listOf(navArgument("gameId") { type = NavType.StringType })
        ) { backStackEntry ->
            val gameId = backStackEntry.arguments?.getString("gameId") ?: return@composable
            GameScreen(
                gameId = gameId,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Caregiver.route) {
            val patient = authState.patient ?: return@composable
            CaregiverScreen(
                patient = patient,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
