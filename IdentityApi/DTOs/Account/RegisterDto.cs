using System.ComponentModel.DataAnnotations;

namespace IdentityApi.DTOs.Account
{
    public class RegisterDto
    {
        [Required]
        [StringLength(15,MinimumLength =3,ErrorMessage ="First name should be atleast {2}, and maximum {1} characters")]
        public string Firstname { get; set; }
        [Required]
        [StringLength(15, MinimumLength = 3, ErrorMessage = "Last name should be atleast {2}, and maximum {1} characters")]
        public string Lastname { get; set; }
        [Required]
        [RegularExpression("^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$",ErrorMessage ="Invalid email address")]
        public string Email { get; set; }
        [Required]
        [StringLength(15, MinimumLength = 6, ErrorMessage = "Password should be atleast {2}, and maximum {1} characters")]
        public string Password { get; set; }
    }
}
