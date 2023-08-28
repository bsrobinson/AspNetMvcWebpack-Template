using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Template.Library.DAL;

namespace Template
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Environment { get; }

        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            /*
             * Uncomment if Azure Auth Enabled; then use [Authorize] decorations on Actions
             *		... except HomeController/Index where code needs uncommenting
             *      also uncomment app.UseAuthentication(); below
             *      
             * In Azure enable authentication, and configure AD Auth using express
             *		
             * If removing; delete the .auth folder from wwwroot
             * 
            services.AddAuthentication(
                options =>
                {
                    options.DefaultAuthenticateScheme = EasyAuthAuthenticationDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = EasyAuthAuthenticationDefaults.AuthenticationScheme;
                }
            ).AddEasyAuth(
                options =>
                {
                    if (this.Environment.IsDevelopment())
                    {
                        options.LocalProviderOption.AuthEndpoint = ".auth/me.json";
                    }
                }
            );
            */

            string? connectionString = Configuration.GetConnectionString("MySql");
            if (connectionString != null)
            {
                services.AddDbContext<MySqlContext>(
                   OptionsServiceCollectionExtensions => OptionsServiceCollectionExtensions.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
                );
            }

            services.AddControllersWithViews();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            //app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
