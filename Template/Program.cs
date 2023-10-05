using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Template
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((context, config) =>
                {
                    if (File.Exists($"secrets.json"))
                    {
                        config.AddJsonFile($"secrets.json"); //for production
                    }
                    else
                    {
                        string dir = Directory.GetCurrentDirectory();
                        if (File.Exists($"{dir}/../secrets.json"))
                        {
                            config.AddJsonFile($"{dir}/../secrets.json"); //for development
                        }
                    }
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}