using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MongoDB.Driver;
using SmartCCTV.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace SmartCCTV.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMongoDatabase _database;
        private readonly IConfiguration _configuration;

        public AuthController(IMongoDatabase database, IConfiguration configuration)
        {
            _database = database;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid request data");
            }

            var usersCollection = _database.GetCollection<User>("users");

            // Check if user already exists
            var existingUser = await usersCollection
                .Find(u => u.Email == model.Email)
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return BadRequest("User already exists");
            }

            // Create new user
            var user = new User
            {
                Email = model.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
                FullName = model.FullName,
                CreatedAt = DateTime.UtcNow
            };

            await usersCollection.InsertOneAsync(user);

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                user = new { user.Id, user.Email, user.FullName },
                token
            });
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid request data");
            }

            var usersCollection = _database.GetCollection<User>("users");

            var user = await usersCollection
                .Find(u => u.Email == model.Email)
                .FirstOrDefaultAsync();

            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
            {
                return Unauthorized("Invalid credentials");
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                user = new { user.Id, user.Email, user.FullName },
                token
            });
        }

        private string GenerateJwtToken(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT Key is not configured");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
                    new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                    new Claim(ClaimTypes.Name, user.FullName ?? string.Empty)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class RegisterModel
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? FullName { get; set; }
    }

    public class LoginModel
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
}