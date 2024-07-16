using IdentityApi.DTOs.Account;
using IdentityApi.Models;
using IdentityApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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

        #endregion

    }
}
