"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/reverse-geocode", async (req, res) => {
    try {
        const lat = Number(req.query.lat);
        const lon = Number(req.query.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return res.status(400).json({
                error: "Valid latitude and longitude are required",
            });
        }
        if (lat < -90 || lat > 90) {
            return res.status(400).json({
                error: "Invalid latitude",
            });
        }
        if (lon < -180 || lon > 180) {
            return res.status(400).json({
                error: "Invalid longitude",
            });
        }
        const url = new URL("https://nominatim.openstreetmap.org/reverse");
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("lat", String(lat));
        url.searchParams.set("lon", String(lon));
        url.searchParams.set("zoom", "18");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("accept-language", "en");
        const response = await fetch(url.toString(), {
            headers: {
                "User-Agent": "Vet-Setu/1.0 (veterinary appointment application)",
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            console.error("Nominatim error:", response.status, response.statusText);
            return res.status(502).json({
                error: "Unable to find address for this location",
            });
        }
        const data = await response.json();
        if (!data || !data.address) {
            return res.status(404).json({
                error: "No address found for this location",
            });
        }
        const address = data.address;
        const addressParts = [
            address.house_number,
            address.road,
            address.neighbourhood,
            address.suburb,
            address.village,
            address.town,
            address.city,
            address.district,
            address.state,
            address.postcode,
            address.country,
        ].filter(Boolean);
        const formattedAddress = addressParts.join(", ");
        res.json({
            latitude: lat,
            longitude: lon,
            displayName: data.display_name || formattedAddress,
            address: formattedAddress,
            locationName: address.amenity ||
                address.building ||
                address.village ||
                address.town ||
                address.city ||
                address.suburb ||
                "",
            raw: {
                road: address.road || null,
                village: address.village || null,
                town: address.town || null,
                city: address.city || null,
                state: address.state || null,
                postcode: address.postcode || null,
                country: address.country || null,
            },
        });
    }
    catch (error) {
        console.error("Reverse geocoding failed:", error);
        res.status(500).json({
            error: "Failed to get address",
        });
    }
});
exports.default = router;
