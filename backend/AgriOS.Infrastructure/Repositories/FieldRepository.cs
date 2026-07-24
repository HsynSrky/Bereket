using AgriOS.Application.Interfaces;
using AgriOS.Domain.Entities;
using AgriOS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgriOS.Infrastructure.Repositories;

public class FieldRepository : IFieldRepository
{
    private readonly AppDbContext _context;

    public FieldRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Field>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Fields
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<Field?> GetByIdAsync(Guid id, Guid userId)
    {
        return await _context.Fields
            .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
    }

    public async Task<Field> CreateAsync(Field field)
    {
        _context.Fields.Add(field);
        await _context.SaveChangesAsync();
        return field;
    }

    public async Task<Field?> UpdateAsync(Field field)
    {
        _context.Fields.Update(field);
        await _context.SaveChangesAsync();
        return field;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var field = await GetByIdAsync(id, userId);
        if (field == null)
            return false;

        _context.Fields.Remove(field);
        await _context.SaveChangesAsync();
        return true;
    }
}
