namespace AgriOS.Application.DTOs;

public class UpdateFieldDto
{
    public string Name { get; set; } = string.Empty;
    public string CropType { get; set; } = string.Empty;
    public string PolygonGeoJson { get; set; } = string.Empty;
}
