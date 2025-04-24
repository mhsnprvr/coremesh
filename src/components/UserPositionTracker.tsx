import { useAppStore } from "@core/stores/appStore.ts";
import { useEffect, useState } from "react";

export const UserPositionTracker = (): null => {
  const { setUserPosition, setLocationError } = useAppStore();
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionState | null>(null);

  useEffect(() => {
    let watchId: number | null = null;
    let retryTimeout: number | null = null;

    const checkAndRequestPermission = async () => {
      try {
        // Check if the Permissions API is available
        if (!navigator.permissions) {
          console.warn("Permissions API not supported");
          setLocationError("Permissions API not supported");
          return "prompt";
        }

        const result = await navigator.permissions.query({
          name: "geolocation",
        });
        setPermissionStatus(result.state);

        // Listen for permission changes
        result.onchange = () => {
          setPermissionStatus(result.state);
          if (result.state === "granted") {
            updatePosition();
          }
        };

        return result.state;
      } catch (error) {
        console.error("Error checking permissions:", error);
        setLocationError("Error checking permissions");
        return "prompt";
      }
    };

    const updatePosition = () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser");
        setLocationError("Geolocation is not supported by this browser");
        return;
      }

      const successCallback = (position: GeolocationPosition) => {
        const { longitude, latitude } = position.coords;
        setUserPosition([longitude, latitude]);
        setLocationError(null);
        console.log("User position updated:", [longitude, latitude]);
        // Clear any existing retry timeout
        if (retryTimeout) {
          window.clearTimeout(retryTimeout);
          retryTimeout = null;
        }
      };

      const errorCallback = (error: GeolocationPositionError) => {
        console.error("Error getting location:", error);
        setLocationError(error.message);
        // Only retry if permission is granted
        if (permissionStatus === "granted") {
          retryTimeout = window.setTimeout(updatePosition, 5000);
        }
      };

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };

      // Start watching position
      watchId = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options
      );
    };

    const initializeGeolocation = async () => {
      const permissionState = await checkAndRequestPermission();

      if (permissionState === "granted") {
        updatePosition();
      } else if (permissionState === "prompt") {
        // Request permission by trying to get current position
        navigator.geolocation.getCurrentPosition(
          () => {
            // Permission granted, start watching position
            updatePosition();
          },
          (error) => {
            console.error("Permission denied:", error);
            setLocationError(error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    };

    // Initialize geolocation
    initializeGeolocation();

    // Cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (retryTimeout !== null) {
        window.clearTimeout(retryTimeout);
      }
    };
  }, [setUserPosition, permissionStatus, setLocationError]);

  return null;
};
