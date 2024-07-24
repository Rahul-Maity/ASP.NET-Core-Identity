using IdentityApi.DTOs.Account;
using IdentityApi.Models;
using IdentityApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Claims;
using System.Text;
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
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;


        public AccountController(JWTService jwtService
            ,SignInManager<User> signInManager,
               UserManager<User> userManager ,
               EmailService emailService,
               IConfiguration config)
        {
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
            _config = config;
        }


        [Authorize]
        [HttpGet("refresh-user-token")]
        public async Task<ActionResult<UserDto>>RefreshUserToken()
        {
            var user = await _userManager.FindByNameAsync(User.FindFirst(ClaimTypes.Email)?.Value);
            return CreateApplicationUserDto(user);
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
                //EmailConfirmed = true
            };
            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if(!result.Succeeded) { return BadRequest(result.Errors); }

            try
            {
                if(await sendConfirmEmailAsync(userToAdd))
                {
                    return Ok(new JsonResult(new
                    {
                        title = "Account created",
                        message = "Your account created,plz confirm your email address"
                    }));
                }
                return BadRequest("Failed to send email, plz contact admin");

            }
            catch (Exception)
            {
                return BadRequest("Failed to send email, plz contact admin");
            }

            
        }

        [HttpPut("confirm-email")]
        public async Task<IActionResult>ConfirmEmail(ConfirmEmailDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if(user is null) { return Unauthorized("User not registerd yet with this email"); }
            if(user.EmailConfirmed == true) { return BadRequest("Email already confirmed, you can login"); }
            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
                var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
                if(result.Succeeded) {
                    return Ok(new JsonResult(new
                    {
                        title = "email confirmed",
                        message = "Your email address is confirmed. You can login now"
                    }));
                }
                return BadRequest("Invalid token, plz try again");
            }
            catch(Exception ex)
            {
                return BadRequest("Invalid token, plz try again");
            }
        }

        [HttpPost("resend-email-confirmation-link/{email}")]
        public async Task<IActionResult>ResendEmailConfirmationLink(string email)
        {
            if (string.IsNullOrEmpty(email)) { return BadRequest("Invalid email"); }
            var user = await _userManager.FindByEmailAsync(email);
            if(user is null) { return Unauthorized("User has not registered yet with this email"); }
            if (user.EmailConfirmed==true) { return BadRequest("Email already confirmed"); }
            try
            {
                if(await sendConfirmEmailAsync(user))
                {
                    return Ok(new JsonResult(new
                    {
                        title = "Confirmation email send",
                        message = "plz confirm your email address"
                    }));
                }
                return BadRequest("failed sending email, contact admin");
            }
            catch (Exception)
            {
                return BadRequest("failed sending email, contact admin");
            }

        }

        [HttpPost("forgot-username-or-password/{email}")]
        public async Task<IActionResult>ForgotUsernameOrPassword(string email)
        {
            if (string.IsNullOrEmpty(email)) { return BadRequest("Invalid email"); }
            var user = await _userManager.FindByEmailAsync(email);
            if (user is null) { return Unauthorized("User has not registered yet with this email"); }
            if (user.EmailConfirmed == false) { return BadRequest("plz confirm your email first"); }
            try
            {
                if(await SendForgotUsernameOrPasswordEmail(user))
                {
                    return Ok(new JsonResult(new
                    {
                        title = "forgot credentials email send",
                        message = "plz check your email"
                    }));
                    
                }
                return BadRequest("failed sending email, contact admin");

            }
            catch (Exception)
            {
                return BadRequest("failed sending email, contact admin");
            }
        }



        [HttpPut("reset-password")]
        public async Task<IActionResult>ResetPassword(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if(user is null) { return Unauthorized("User with this email not registerd yet"); }
            if (user.EmailConfirmed == false) { return BadRequest("plz confirm your email first"); }
            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
                var result = await _userManager.ResetPasswordAsync(user, decodedToken,model.NewPassword);
                if(result.Succeeded)
                {
                    return Ok(new JsonResult(new
                    {
                        title = "Password reset success",
                        message = "Your password has been reset"
                    }));
                }
                return BadRequest("Invalid token, plz try again");
            }
            catch (Exception)
            {
                return BadRequest("Invalid token, plz try again");
            }

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

        private async Task<bool> sendConfirmEmailAsync(User user)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["JWT:clientUrl"]}/{_config["Email:ConfirmEmailPath"]}?token={token}&email={user.Email}";

            var body = $"<p>hello, {user.FirstName} {user.LastName}</p>"+
                 "<p>Please confirm your email address by clicking on the following link.</p>" +
                 $"<p> <a href=\"{ url} \">Click here</a></p>"+
                  "<p>Thank you,</p>" +
                  $"<br>{_config["Email:ApplicationName"]}"

                ;
            var emailSend = new EmailSendDto(user.Email, "Confirm your email", body);
            return await _emailService.SendEmailAsync(emailSend);

        }

        private async Task<bool>SendForgotUsernameOrPasswordEmail(User user)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["JWT:clientUrl"]}/{_config["Email:ResetPasswordPath"]}?token={token}&email={user.Email}";

            var body = $"<p>hello, {user.FirstName} {user.LastName}</p>" +
                 $"<p>Username : {user.UserName}</p>" +
                 "<p>Reset your password by clicking on the following link.</p>" +
                 $"<p> <a href=\"{url} \">Click here</a></p>" +
                  "<p>Thank you,</p>" +
                  $"<br>{_config["Email:ApplicationName"]}"

                ;
            var emailsend = new EmailSendDto(user.Email, "Reset Password", body);
            return await _emailService.SendEmailAsync(emailsend);
        }

        #endregion

    }
}
