import React, { useMemo } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { WebView } from "react-native-webview";

export type PanoramaViewerProps = {
  panoramaUrl: string;
  title?: string;
  onClose?: () => void;
};

export function Panorama360Viewer({
  panoramaUrl,
  title = "360° Heritage Tour",
}: PanoramaViewerProps) {
  const fullPanoUrl = useMemo(() => {
    if (panoramaUrl.startsWith("http")) return panoramaUrl;
    return `https://calabarzon-heritage-trails.vercel.app${panoramaUrl}`;
  }, [panoramaUrl]);

  // Hardware-accelerated WebGL 360 Sphere Viewer with touch controls, inertia, and pinch-zoom
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
        canvas { width: 100%; height: 100%; display: block; touch-action: none; }
        #overlay {
          position: fixed; top: 16px; left: 16px; right: 16px;
          display: flex; justify-content: space-between; align-items: center;
          pointer-events: none; z-index: 100;
        }
        .pill {
          background: rgba(0, 35, 102, 0.85); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.25);
          color: #FFF; font-family: sans-serif; font-size: 13px; font-weight: 700;
          padding: 6px 14px; border-radius: 999px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        #compass {
          position: fixed; bottom: 20px; right: 20px;
          width: 44px; height: 44px; border-radius: 22px;
          background: rgba(255, 255, 255, 0.9);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-family: sans-serif; font-size: 11px; color: #0038A8;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3); z-index: 100;
        }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    </head>
    <body>
      <div id="overlay">
        <div class="pill">🏛️ ${title}</div>
        <div class="pill" style="background: rgba(252, 209, 22, 0.9); color: #000;">360° VR Mode</div>
      </div>
      <div id="compass">N</div>

      <script>
        let scene, camera, renderer, sphere;
        let isUserInteracting = false;
        let onPointerDownMouseX = 0, onPointerDownMouseY = 0;
        let lon = 0, onPointerDownLon = 0;
        let lat = 0, onPointerDownLat = 0;
        let phi = 0, theta = 0;
        let touchStartDist = 0;

        function init() {
          const container = document.body;
          camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
          camera.target = new THREE.Vector3(0, 0, 0);

          scene = new THREE.Scene();

          const geometry = new THREE.SphereGeometry(500, 60, 40);
          geometry.scale(-1, 1, 1);

          const textureLoader = new THREE.TextureLoader();
          textureLoader.crossOrigin = 'anonymous';
          const texture = textureLoader.load('${fullPanoUrl}', animate);

          const material = new THREE.MeshBasicMaterial({ map: texture });
          sphere = new THREE.Mesh(geometry, material);
          scene.add(sphere);

          renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.setSize(window.innerWidth, window.innerHeight);
          container.appendChild(renderer.domElement);

          container.addEventListener('pointerdown', onPointerDown);
          document.addEventListener('pointermove', onPointerMove);
          document.addEventListener('pointerup', onPointerUp);
          window.addEventListener('resize', onWindowResize);
          document.addEventListener('touchmove', handleTouchPinch, { passive: false });
        }

        function onWindowResize() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onPointerDown(e) {
          isUserInteracting = true;
          onPointerDownMouseX = e.clientX;
          onPointerDownMouseY = e.clientY;
          onPointerDownLon = lon;
          onPointerDownLat = lat;
        }

        function onPointerMove(e) {
          if (!isUserInteracting) return;
          lon = (onPointerDownMouseX - e.clientX) * 0.18 + onPointerDownLon;
          lat = (e.clientY - onPointerDownMouseY) * 0.18 + onPointerDownLat;
        }

        function onPointerUp() {
          isUserInteracting = false;
        }

        function handleTouchPinch(e) {
          if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (touchStartDist > 0) {
              const diff = dist - touchStartDist;
              camera.fov = Math.max(30, Math.min(100, camera.fov - diff * 0.1));
              camera.updateProjectionMatrix();
            }
            touchStartDist = dist;
          } else {
            touchStartDist = 0;
          }
        }

        function animate() {
          requestAnimationFrame(animate);
          update();
        }

        function update() {
          lat = Math.max(-85, Math.min(85, lat));
          phi = THREE.MathUtils.degToRad(90 - lat);
          theta = THREE.MathUtils.degToRad(lon);

          camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
          camera.target.y = 500 * Math.cos(phi);
          camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
          camera.lookAt(camera.target);

          const compass = document.getElementById('compass');
          if (compass) {
            compass.style.transform = 'rotate(' + (-lon) + 'deg)';
          }

          renderer.render(scene, camera);
        }

        init();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        allowsInlineMediaPlayback={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0038A8" />
            <Text style={styles.loadingText}>Rendering 360° Living Heritage Tour...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#001033",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
