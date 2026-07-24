namespace AgriOS.Application.DTOs;

public class FieldDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CropType { get; set; } = string.Empty;
    public string PolygonGeoJson { get; set; } = string.Empty;
    public double AreaSqMeters { get; set; }
    public double CenterLat { get; set; }
    public double CenterLng { get; set; }
    public DateTime CreatedAt { get; set; }
}
