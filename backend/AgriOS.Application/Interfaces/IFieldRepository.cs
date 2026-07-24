using AgriOS.Domain.Entities;

namespace AgriOS.Application.Interfaces;

public interface IFieldRepository
{
    Task<IReadOnlyList<Field>> GetByUserIdAsync(Guid userId);
    Task<Field?> GetByIdAsync(Guid id, Guid userId);
    Task<Field> CreateAsync(Field field);
    Task<Field?> UpdateAsync(Field field);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
