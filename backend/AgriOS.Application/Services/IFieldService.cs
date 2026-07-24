using AgriOS.Application.DTOs;

namespace AgriOS.Application.Services;

public interface IFieldService
{
    Task<IReadOnlyList<FieldDto>> GetAllAsync(Guid userId);
    Task<FieldDto> GetByIdAsync(Guid id, Guid userId);
    Task<FieldDto> CreateAsync(Guid userId, CreateFieldDto dto);
    Task<FieldDto> UpdateAsync(Guid id, Guid userId, UpdateFieldDto dto);
    Task DeleteAsync(Guid id, Guid userId);
}
