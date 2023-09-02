using System;
using Microsoft.EntityFrameworkCore;

namespace Template.Library.DAL
{
    public class MySqlContext : DbContext
    {
		public MySqlContext(DbContextOptions<MySqlContext> options) : base(options)
        {
			//this.Database.EnsureCreated();
		}

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
			//multiple primary keys:
            //modelBuilder.Entity<MessageGroupContact>().HasKey(c => new { c.groupId, c.contactId });
		}

		//Tables
		public virtual DbSet<Table> Tables { get; set; }
	}
}
