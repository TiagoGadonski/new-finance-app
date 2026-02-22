using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Orbit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertConfigExpenseSplit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AlertConfigurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FamilyId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Threshold = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Channel = table.Column<int>(type: "integer", nullable: false),
                    CronSchedule = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedByUsername = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    UpdatedByUsername = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlertConfigurations_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AlertConfigurations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ExpenseSplits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FamilyId = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionId = table.Column<Guid>(type: "uuid", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedByUsername = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    UpdatedByUsername = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpenseSplits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExpenseSplits_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExpenseSplits_Transactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ExpenseSplitItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpenseSplitId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Username = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpenseSplitItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExpenseSplitItems_ExpenseSplits_ExpenseSplitId",
                        column: x => x.ExpenseSplitId,
                        principalTable: "ExpenseSplits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExpenseSplitItems_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(86));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111112"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(93));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111113"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(97));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111114"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(99));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(102));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(104));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(106));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(109));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(112));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(115));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(118));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(120));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(124));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222230"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 23, 32, 42, 8, DateTimeKind.Utc).AddTicks(126));

            migrationBuilder.CreateIndex(
                name: "IX_AlertConfigurations_FamilyId",
                table: "AlertConfigurations",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertConfigurations_UserId",
                table: "AlertConfigurations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseSplitItems_ExpenseSplitId",
                table: "ExpenseSplitItems",
                column: "ExpenseSplitId");

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseSplitItems_UserId",
                table: "ExpenseSplitItems",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseSplits_FamilyId",
                table: "ExpenseSplits",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseSplits_TransactionId",
                table: "ExpenseSplits",
                column: "TransactionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertConfigurations");

            migrationBuilder.DropTable(
                name: "ExpenseSplitItems");

            migrationBuilder.DropTable(
                name: "ExpenseSplits");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6179));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111112"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6185));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111113"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6188));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111114"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6191));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6193));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6195));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6199));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6201));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6204));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6206));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6209));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6211));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6213));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222230"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 8, 19, 49, 26, 782, DateTimeKind.Utc).AddTicks(6216));
        }
    }
}
