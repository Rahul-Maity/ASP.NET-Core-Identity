using IdentityApi.DTOs.Account;
using IdentityApi.Models;
using IdentityApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace IdentityApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly JWTService _jwtService;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;


        public AccountController(JWTService jwtService
            ,SignInManager<User> signInManager,
               UserManager<User> userManager )
        {
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>>Login(LoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);
            if(user is null)
            {
                return Unauthorized("Invalid username or password");
            }
            if(user.EmailConfirmed == false) { return Unauthorized("Please confirm your email"); }

            var result =await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded) return Unauthorized("Invalid username or password");

            return CreateApplicationUserDto(user);
        }

        [HttpPost("register")]
        public async Task<IActionResult>Register(RegisterDto model)
        {
            if(await CheckEmailExistAsync(model.Email))
            {
                return BadRequest($"An account already using this {model.Email},try using another");
            }
            var userToAdd = new User
            {
                FirstName = model.Firstname.ToLower(),
                LastName = model.Lastname.ToLower(),
                UserName = model.Email.ToLower(),
                Email = model.Email.ToLower(),
                EmailConfirmed = true
            };
            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if(!result.Succeeded) { return BadRequest(result.Errors); }
            return Ok("The account has been created, you can now login");
        }

        #region private helper method

        private UserDto CreateApplicationUserDto(User user)
        {

            return new UserDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                JWT = _jwtService.createJWT(user)
            };
        }

        private async Task<bool>CheckEmailExistAsync(string email)
        {
            return await _userManager.Users.AnyAsync(u =>u.Email == email.ToLower());
        }

        #endregion

    }
}
