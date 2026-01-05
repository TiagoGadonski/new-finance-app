using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountIdToSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AccountId",
                table: "Subscriptions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4757));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111112"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4762));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111113"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4765));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111114"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4768));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4771));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4775));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4778));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4781));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4784));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4788));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4791));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4793));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4796));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222230"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 39, 35, 784, DateTimeKind.Utc).AddTicks(4799));

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_AccountId",
                table: "Subscriptions",
                column: "AccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_Accounts_AccountId",
                table: "Subscriptions",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_Accounts_AccountId",
                table: "Subscriptions");

            migrationBuilder.DropIndex(
                name: "IX_Subscriptions_AccountId",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "Subscriptions");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(515));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111112"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(522));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111113"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(526));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111114"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(529));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(533));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(536));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(539));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(542));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(545));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(549));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(552));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(555));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(557));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222230"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 29, 17, 10, 45, 224, DateTimeKind.Utc).AddTicks(561));
        }
    }
}
