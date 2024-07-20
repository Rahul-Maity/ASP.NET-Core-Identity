using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace IdentityApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PlayController : ControllerBase
    {

        [HttpGet("get-players")]
        public IActionResult Players()
        {
            return Ok(new JsonResult(new { message = "only authorize user can view players" }));
        }
    }
}
