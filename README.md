# OrbitAtlas — Space Explorer v0.1

A beginner-friendly static website starter using HTML, CSS, JavaScript, and Three.js. The import map is configured so Three.js add-ons can resolve their imports in modern browsers.

## Run it locally
Because `script.js` uses JavaScript modules, open this folder with a local web server rather than opening `index.html` directly.

Easy options:
- VS Code + Live Server extension, then click **Go Live**.
- Or use Python if installed: `python -m http.server 8000`, then visit `http://localhost:8000`.

## Publish free with GitHub Pages
1. Create or sign in to a GitHub account.
2. Create a new public repository, e.g. `orbitatlas`.
3. Upload `index.html`, `style.css`, and `script.js` to the repository root.
4. Open **Settings → Pages**.
5. Under build/deployment, choose **Deploy from a branch**.
6. Choose branch `main` and folder `/ (root)`, then Save.
7. Wait for the deployment and open the URL shown in the Pages section.

## Important notes
- This version uses a Three.js CDN and a public Earth texture URL, so an internet connection is required.
- The satellite markers and orbit lines are illustrative demo graphics, NOT live satellite tracking.
- Before adding real satellite positions, integrate a suitable current orbital dataset (e.g. CelesTrak GP data) and a reputable SGP4 implementation, and label timestamps/data freshness clearly.
- NASA is not affiliated with this demo. Follow the relevant API terms and image/data attribution requirements when adding content.
- `OrbitAtlas` is a temporary name; check trademark and domain availability before using it publicly.
