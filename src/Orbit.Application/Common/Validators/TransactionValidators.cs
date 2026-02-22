using FluentValidation;
using Orbit.Application.Common.DTOs;

namespace Orbit.Application.Common.Validators;

public class CreateTransactionRequestValidator : AbstractValidator<CreateTransactionRequest>
{
    public CreateTransactionRequestValidator()
    {
        RuleFor(x => x.AccountId)
            .NotEmpty().WithMessage("Conta é obrigatória");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Categoria é obrigatória");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Valor deve ser maior que zero");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Descrição é obrigatória")
            .MaximumLength(500).WithMessage("Descrição deve ter no máximo 500 caracteres");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Data é obrigatória");

        RuleFor(x => x.Tags)
            .MaximumLength(200).WithMessage("Tags devem ter no máximo 200 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Tags));
    }
}

public class UpdateTransactionRequestValidator : AbstractValidator<UpdateTransactionRequest>
{
    public UpdateTransactionRequestValidator()
    {
        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Categoria é obrigatória");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Valor deve ser maior que zero");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Descrição é obrigatória")
            .MaximumLength(500).WithMessage("Descrição deve ter no máximo 500 caracteres");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Data é obrigatória");

        RuleFor(x => x.Tags)
            .MaximumLength(200).WithMessage("Tags devem ter no máximo 200 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Tags));
    }
}

public class ImportCsvRequestValidator : AbstractValidator<ImportCsvRequest>
{
    public ImportCsvRequestValidator()
    {
        RuleFor(x => x.AccountId)
            .NotEmpty().WithMessage("Conta é obrigatória");

        RuleFor(x => x.CsvContent)
            .NotEmpty().WithMessage("Conteúdo CSV é obrigatório")
            .MaximumLength(5_242_880).WithMessage("CSV muito grande (máximo 5MB)");
    }
}
