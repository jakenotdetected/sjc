package com.garage.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val GarageLightColorScheme = lightColorScheme(
    primary = IndianOceanBlue,
    onPrimary = TempleLotus,
    primaryContainer = TempleLotus,
    onPrimaryContainer = IndianOceanBlue,
    secondary = CeylonTea,
    onSecondary = TempleLotus,
    secondaryContainer = CeylonTea.copy(alpha = 0.12f),
    onSecondaryContainer = CeylonTea,
    tertiary = GoldenSand,
    onTertiary = IndianOceanBlue,
    tertiaryContainer = GoldenSand.copy(alpha = 0.20f),
    onTertiaryContainer = GoldenSand,
    error = LushCanopy,
    onError = TempleLotus,
    background = TempleLotus,
    onBackground = IndianOceanBlue,
    surface = TempleLotus,
    onSurface = IndianOceanBlue,
    surfaceVariant = TempleLotusDark,
    onSurfaceVariant = CeylonTea,
    outline = CeylonTea.copy(alpha = 0.5f),
    outlineVariant = CeylonTea.copy(alpha = 0.2f)
)

@Composable
fun GarageTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = GarageLightColorScheme,
        typography = GarageTypography,
        shapes = GarageShapes,
        content = content
    )
}
