package com.garage.app.ui.map

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.garage.app.ui.theme.IndianOceanBlue
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.CameraPositionState
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapUiSettings
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState

@Composable
fun GarageMapView(
    centerLatitude: Double,
    centerLongitude: Double,
    markerLatitude: Double? = null,
    markerLongitude: Double? = null,
    zoomLevel: Float = 14f,
    modifier: Modifier = Modifier
) {
    val center = remember(centerLatitude, centerLongitude) {
        LatLng(centerLatitude, centerLongitude)
    }

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(center, zoomLevel)
    }

    val markerPosition = if (markerLatitude != null && markerLongitude != null) {
        remember(markerLatitude, markerLongitude) {
            LatLng(markerLatitude, markerLongitude)
        }
    } else null

    GoogleMap(
        modifier = modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState,
        properties = MapProperties(
            isBuildingEnabled = true,
            isMyLocationEnabled = false
        ),
        uiSettings = MapUiSettings(
            zoomControlsEnabled = false,
            scrollGesturesEnabled = true,
            zoomGesturesEnabled = true,
            tiltGesturesEnabled = false,
            rotationGesturesEnabled = false,
            mapToolbarEnabled = false
        )
    ) {
        if (markerPosition != null) {
            Marker(
                state = MarkerState(position = markerPosition),
                icon = BitmapDescriptorFactory.defaultMarker(
                    BitmapDescriptorFactory.HUE_AZURE
                )
            )
        }
    }
}

@Composable
fun MiniMapPlaceholder(
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.LightGray.copy(alpha = 0.3f))
    ) {
        GarageMapView(
            centerLatitude = 6.9271,
            centerLongitude = 79.8612,
            zoomLevel = 15f
        )
    }
}
