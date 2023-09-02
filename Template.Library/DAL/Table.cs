using System;
using System.ComponentModel.DataAnnotations;
using WCKDRZR.Gaspar;

namespace Template.Library.DAL
{
    [ExportFor(GasparType.FrontEnd)]
    public class Table
    {
        [Key]
        public uint Id { get; set; }
        [MaxLength(100)]
        public required string Str { get; set; }
    }
}
