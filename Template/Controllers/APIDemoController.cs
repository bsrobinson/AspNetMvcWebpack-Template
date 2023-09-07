using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using WCKDRZR.Gaspar;

namespace Template.Controllers
{
    [ExportFor(GasparType.TypeScript)]
    public class APIDemoController : Controller
    {
        public APIDemoController() { }

        [HttpGet("api/get")]
        public ActionResult<List<string>> Get()
        {
            return new List<string>() { "1", "2", "3" };
        }

        [HttpPost("api/post")]
        public ActionResult<List<string>> Post([FromBody] DemoObject obj)
        {
            List<string> numbers = new();
            for (int i = obj.Start; i < obj.Start + obj.Count; i++)
            {
                numbers.Add(i.ToString());
            }
            return numbers;
        }

        [HttpDelete("api/delete")]
        public ActionResult<bool> Delete(int id)
        {
            return true;
        }
    }

    [ExportFor(GasparType.TypeScript)]
    public class DemoObject {
        public int Start { get; set; }
        public int Count { get; set; }
    }
}