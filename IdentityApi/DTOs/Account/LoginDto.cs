using System.ComponentModel.DataAnnotations;

namespace IdentityApi.DTOs.Account
{
    public class LoginDto
    {
        [Required(ErrorMessage ="Username is required")]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
