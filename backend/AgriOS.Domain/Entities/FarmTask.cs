using System;

namespace AgriOS.Domain.Entities;

public class FarmTask
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = "Bekliyor"; // Bekliyor, Tamamlandı, İptal
    public string Category { get; set; } = "Genel"; // İlaçlama, Sulama, Hasat vs.
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public Guid? FieldId { get; set; }
    public Field? Field { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
