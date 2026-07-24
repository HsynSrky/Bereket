using System.Text.Json;

namespace AgriOS.Application.Helpers;

public static class GeoJsonHelper
{
    private const double MetersPerDegreeLat = 110_540;
    private const double MetersPerDegreeLngAtEquator = 111_320;

    public static (double AreaSqMeters, double CenterLat, double CenterLng) CalculatePolygonMetrics(string polygonGeoJson)
    {
        var coordinates = ExtractOuterRing(polygonGeoJson);
        if (coordinates.Count < 3)
            throw new InvalidOperationException("Geçerli bir poligon çizilmelidir.");

        var centerLat = coordinates.Average(c => c.Lat);
        var centerLng = coordinates.Average(c => c.Lng);
        var latRad = centerLat * Math.PI / 180;
        var metersPerDegreeLng = MetersPerDegreeLngAtEquator * Math.Cos(latRad);

        var projected = coordinates
            .Select(c => (
                X: c.Lng * metersPerDegreeLng,
                Y: c.Lat * MetersPerDegreeLat
            ))
            .ToList();

        double area = 0;
        for (var i = 0; i < projected.Count; i++)
        {
            var j = (i + 1) % projected.Count;
            area += projected[i].X * projected[j].Y;
            area -= projected[j].X * projected[i].Y;
        }

        return (Math.Abs(area) / 2, centerLat, centerLng);
    }

    private static List<(double Lat, double Lng)> ExtractOuterRing(string polygonGeoJson)
    {
        using var document = JsonDocument.Parse(polygonGeoJson);
        var root = document.RootElement;

        if (root.TryGetProperty("type", out var typeElement))
        {
            var type = typeElement.GetString();
            if (string.Equals(type, "Feature", StringComparison.OrdinalIgnoreCase))
            {
                return ExtractOuterRingFromGeometry(root.GetProperty("geometry"));
            }

            if (string.Equals(type, "FeatureCollection", StringComparison.OrdinalIgnoreCase))
            {
                var firstFeature = root.GetProperty("features")[0];
                return ExtractOuterRingFromGeometry(firstFeature.GetProperty("geometry"));
            }

            if (string.Equals(type, "Polygon", StringComparison.OrdinalIgnoreCase))
            {
                return ExtractOuterRingFromGeometry(root);
            }
        }

        throw new InvalidOperationException("Desteklenmeyen GeoJSON formatı.");
    }

    private static List<(double Lat, double Lng)> ExtractOuterRingFromGeometry(JsonElement geometry)
    {
        var coordinates = geometry.GetProperty("coordinates");
        var outerRing = coordinates[0];

        var points = new List<(double Lat, double Lng)>();
        foreach (var point in outerRing.EnumerateArray())
        {
            var lng = point[0].GetDouble();
            var lat = point[1].GetDouble();
            points.Add((lat, lng));
        }

        if (points.Count > 1 &&
            Math.Abs(points[0].Lat - points[^1].Lat) < 0.0000001 &&
            Math.Abs(points[0].Lng - points[^1].Lng) < 0.0000001)
        {
            points.RemoveAt(points.Count - 1);
        }

        return points;
    }
}
