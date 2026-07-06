package com.garage.app.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val CardShape = RoundedCornerShape(24.dp)
val PillShape = RoundedCornerShape(30.dp)
val SmallShape = RoundedCornerShape(12.dp)

val GarageShapes = Shapes(
    extraSmall = RoundedCornerShape(12.dp),
    small = RoundedCornerShape(16.dp),
    medium = CardShape,
    large = RoundedCornerShape(28.dp),
    extraLarge = PillShape
)
