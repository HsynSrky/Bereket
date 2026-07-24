using AgriOS.Domain.Entities;

namespace AgriOS.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User?> GetByIdAsync(Guid id);
}
