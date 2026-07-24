using AgriOS.Application.DTOs;
using AgriOS.Application.Helpers;
using AgriOS.Application.Interfaces;
using AgriOS.Domain.Entities;

namespace AgriOS.Application.Services;

public class FieldService : IFieldService
{
    private readonly IFieldRepository _fieldRepository;

    public FieldService(IFieldRepository fieldRepository)
    {
        _fieldRepository = fieldRepository;
    }

    public async Task<IReadOnlyList<FieldDto>> GetAllAsync(Guid userId)
    {
        var fields = await _fieldRepository.GetByUserIdAsync(userId);
        return fields.Select(MapToDto).ToList();
    }

    public async Task<FieldDto> GetByIdAsync(Guid id, Guid userId)
    {
        var field = await _fieldRepository.GetByIdAsync(id, userId)
            ?? throw new KeyNotFoundException("Tarla bulunamadı.");

        return MapToDto(field);
    }

    public async Task<FieldDto> CreateAsync(Guid userId, CreateFieldDto dto)
    {
        ValidateInput(dto.Name, dto.PolygonGeoJson);

        var (areaSqMeters, centerLat, centerLng) = GeoJsonHelper.CalculatePolygonMetrics(dto.PolygonGeoJson);

        var field = new Field
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = dto.Name.Trim(),
            CropType = dto.CropType.Trim(),
            PolygonGeoJson = dto.PolygonGeoJson,
            AreaSqMeters = areaSqMeters,
            CenterLat = centerLat,
            CenterLng = centerLng
        };

        var created = await _fieldRepository.CreateAsync(field);
        return MapToDto(created);
    }

    public async Task<FieldDto> UpdateAsync(Guid id, Guid userId, UpdateFieldDto dto)
    {
        ValidateInput(dto.Name, dto.PolygonGeoJson);

        var existing = await _fieldRepository.GetByIdAsync(id, userId)
            ?? throw new KeyNotFoundException("Tarla bulunamadı.");

        var (areaSqMeters, centerLat, centerLng) = GeoJsonHelper.CalculatePolygonMetrics(dto.PolygonGeoJson);

        existing.Name = dto.Name.Trim();
        existing.CropType = dto.CropType.Trim();
        existing.PolygonGeoJson = dto.PolygonGeoJson;
        existing.AreaSqMeters = areaSqMeters;
        existing.CenterLat = centerLat;
        existing.CenterLng = centerLng;

        var updated = await _fieldRepository.UpdateAsync(existing)
            ?? throw new InvalidOperationException("Tarla güncellenemedi.");

        return MapToDto(updated);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var deleted = await _fieldRepository.DeleteAsync(id, userId);
        if (!deleted)
            throw new KeyNotFoundException("Tarla bulunamadı.");
    }

    private static void ValidateInput(string name, string polygonGeoJson)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("Tarla adı zorunludur.");

        if (string.IsNullOrWhiteSpace(polygonGeoJson))
            throw new InvalidOperationException("Poligon GeoJSON zorunludur.");
    }

    private static FieldDto MapToDto(Field field) => new()
    {
        Id = field.Id,
        Name = field.Name,
        CropType = field.CropType,
        PolygonGeoJson = field.PolygonGeoJson,
        AreaSqMeters = field.AreaSqMeters,
        CenterLat = field.CenterLat,
        CenterLng = field.CenterLng,
        CreatedAt = field.CreatedAt
    };
}
