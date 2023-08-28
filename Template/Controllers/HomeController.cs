using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using Template.Library.DAL;
using Template.Models;

namespace Template.Controllers
{
    public class HomeController : Controller
    {
        //private MySqlContext db;
        private readonly IConfiguration config;
        private readonly ILogger<HomeController> log;

        public HomeController(
            //MySqlContext context,
            IConfiguration configuration,
            ILogger<HomeController> logger
            )
        {
            //db = context;
            config = configuration;
            log = logger;
        }

        public IActionResult Index()
        {
            return View();

            //Uncomment if using Authorisation
            //if (HttpContext.User.Identity.Name == null)
            //{
            //    return Redirect("/.auth/login/aad?post_login_redirect_uri=/");
            //}
            //else
            //{
            //return View();
            //}
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}