using System;
using System.ComponentModel.DataAnnotations;

namespace AgriOS.Domain.Entities
{
    public class InventoryItem
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = null!; // e.g., "Gübre", "İlaç", "Tohum", "Yakıt"

        [Required]
        public decimal Quantity { get; set; }

        [Required]
        [MaxLength(20)]
        public string Unit { get; set; } = null!; // e.g., "Litre", "Kg", "Adet"

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public Guid UserId { get; set; }

        public User User { get; set; } = null!;
    }
}
