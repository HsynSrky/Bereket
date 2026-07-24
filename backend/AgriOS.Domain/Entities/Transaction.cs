using System;

namespace AgriOS.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = "Gider"; // Gelir, Gider
    public string Category { get; set; } = "Diğer"; // Gübre, Mazot, Tohum, İlaç, İşçilik, Hasat Satışı
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public Guid? FieldId { get; set; }
    public Field? Field { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
