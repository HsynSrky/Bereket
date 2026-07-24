using AgriOS.Application.DTOs;
using AgriOS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AgriOS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FieldsController : ControllerBase
{
    private readonly IFieldService _fieldService;

    public FieldsController(IFieldService fieldService)
    {
        _fieldService = fieldService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var fields = await _fieldService.GetAllAsync(GetUserId());
        return Ok(fields);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var field = await _fieldService.GetByIdAsync(id, GetUserId());
            return Ok(field);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFieldDto dto)
    {
        try
        {
            var field = await _fieldService.CreateAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = field.Id }, field);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFieldDto dto)
    {
        try
        {
            var field = await _fieldService.UpdateAsync(id, GetUserId(), dto);
            return Ok(field);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _fieldService.DeleteAsync(id, GetUserId());
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Geçersiz token.");

        return Guid.Parse(claim);
    }
}
