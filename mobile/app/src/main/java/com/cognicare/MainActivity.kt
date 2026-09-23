package com.cognicare

import android.graphics.Color
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.cognicare.di.ServiceLocator
import com.cognicare.ui.components.CogniCareBottomBar
import com.cognicare.ui.components.EmergencySOSButton
import com.cognicare.ui.navigation.Screen
import com.cognicare.ui.screens.*
import com.cognicare.ui.theme.CogniCareTheme
import com.cognicare.viewmodel.AdminViewModel
import com.cognicare.viewmodel.AuthViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.isNavigationBarContrastEnforced = false
        }

        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.light(
                scrim = Color.TRANSPARENT,
                darkScrim = Color.TRANSPARENT
            ),
            navigationBarStyle = SystemBarStyle.light(
                scrim = Color.TRANSPARENT,
                darkScrim = Color.TRANSPARENT
            )
        )

        setContent {
            val context = androidx.compose.ui.platform.LocalContext.current
            val application = context.applicationContext as android.app.Application
            val settingsDataStore = remember { ServiceLocator.provideSettingsDataStore(application) }
            val isDarkMode by settingsDataStore.nightMode.collectAsState(initial = false)

            CogniCareTheme(darkTheme = isDarkMode) {
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

private val bottomNavRoutes = setOf(
    Screen.PatientDashboard.route,
    Screen.GamesHub.route,
    Screen.Caregiver.route
)

@Composable
fun CogniCareApp() {
    val navController = rememberNavController()
    val context = androidx.compose.ui.platform.LocalContext.current
    val application = context.applicationContext as android.app.Application
    val authViewModel: AuthViewModel = viewModel(
        factory = ServiceLocator.provideAuthViewModelFactory(application)
    )
    val authState by authViewModel.authState.collectAsState()

    val adminViewModel: AdminViewModel = viewModel(
        factory = ServiceLocator.provideAdminViewModelFactory(application)
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val showBottomBar = currentRoute in bottomNavRoutes

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                CogniCareBottomBar(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        if (route != currentRoute) {
                            navController.navigate(route) {
                                popUpTo(Screen.PatientDashboard.route) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    }
                )
            }
        },
        floatingActionButton = {
            if (showBottomBar) {
                EmergencySOSButton()
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Splash.route,
            modifier = Modifier.padding(paddingValues),
            enterTransition = { fadeIn(animationSpec = tween(280)) + slideInHorizontally(initialOffsetX = { 80 }, animationSpec = tween(280)) },
            exitTransition = { fadeOut(animationSpec = tween(280)) + slideOutHorizontally(targetOffsetX = { -80 }, animationSpec = tween(280)) },
            popEnterTransition = { fadeIn(animationSpec = tween(280)) + slideInHorizontally(initialOffsetX = { -80 }, animationSpec = tween(280)) },
            popExitTransition = { fadeOut(animationSpec = tween(280)) + slideOutHorizontally(targetOffsetX = { 80 }, animationSpec = tween(280)) }
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
                    },
                    onSelectDemoPatient = { patientId ->
                        authViewModel.demoLoginPatient(patientId)
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
                    onGamesClick = {
                        navController.navigate(Screen.GamesHub.route) {
                            popUpTo(Screen.PatientDashboard.route) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onEchoesClick = { navController.navigate(Screen.EchoesOfHome3D.route) },
                    onCaregiverClick = {
                        navController.navigate(Screen.Caregiver.route) {
                            popUpTo(Screen.PatientDashboard.route) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onAdminClick = { navController.navigate(Screen.Admin.route) },
                    onPlayGame = { gameId ->
                        navController.navigate(Screen.GamePlayer.createRoute(gameId))
                    },
                    onLogout = {
                        authViewModel.logout()
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.EchoesOfHome3D.route) {
                val patient = authState.patient ?: return@composable
                EchoesOfHome3DScreen(
                    patient = patient,
                    onBack = { navController.popBackStack() }
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

            composable(Screen.DoctorDashboard.route) {
                DoctorDashboardScreen(
                    onBack = { navController.popBackStack() },
                    onNavigateToPatient = { navController.navigate(Screen.PatientDashboard.route) }
                )
            }

            composable(Screen.DietDashboard.route) {
                DietDashboardScreen(
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.FamilyPortal.route) {
                FamilyPortalScreen(
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Admin.route) {
                AdminScreen(
                    viewModel = adminViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
