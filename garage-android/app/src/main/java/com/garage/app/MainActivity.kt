package com.garage.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.garage.app.ui.components.GarageSimulationSandbox
import com.garage.app.ui.theme.GarageTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            GarageTheme {
                GarageSimulationSandbox()
            }
        }
    }
}
