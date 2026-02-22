using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Orbit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLastPaidAtFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastPaidAt",
                table: "Subscriptions",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastPaidAt",
                table: "Debts",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3190));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111112"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3197));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111113"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3199));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111114"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3202));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3204));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3206));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3209));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3211));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3213));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3216));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3218));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3220));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3223));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222230"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 53, 37, 884, DateTimeKind.Utc).AddTicks(3225));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastPaidAt",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "LastPaidAt",
                table: "Debts");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4854));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111112"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4859));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111113"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4862));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111114"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4864));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4867));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4870));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4872));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4875));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4877));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4880));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4882));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4884));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4887));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222230"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 21, 17, 9, 25, 697, DateTimeKind.Utc).AddTicks(4889));
        }
    }
}
