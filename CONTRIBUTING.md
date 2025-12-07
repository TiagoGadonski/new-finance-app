# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o FinanceApp! Este documento fornece diretrizes para contribuir com o projeto.

## 🔄 Processo de Contribuição

### 1. Fork e Clone
```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/financeapp.git
cd financeapp

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original-usuario/financeapp.git
```

### 2. Crie uma Branch
```bash
# Crie uma branch para sua feature/fix
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 3. Desenvolva

#### Padrões de Código
- **C#**: Siga as convenções do .NET
- **Indentação**: 4 espaços
- **Naming**:
  - Classes: `PascalCase`
  - Métodos: `PascalCase`
  - Variáveis: `camelCase`
  - Constantes: `UPPER_CASE`

#### Commits
Use mensagens claras e descritivas:
```bash
# Bom
git commit -m "feat: add roundup simulation endpoint"
git commit -m "fix: correct budget percentage calculation"
git commit -m "docs: update API documentation"

# Ruim
git commit -m "changes"
git commit -m "fixed stuff"
```

Padrões de commit:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula faltando, etc
- `refactor`: Refatoração de código
- `test`: Adicionar testes
- `chore`: Tarefas de manutenção

### 4. Testes

**Sempre adicione testes** para novas funcionalidades:

```bash
# Execute os testes
dotnet test tests/FinanceApp.Tests/FinanceApp.Tests.csproj

# Verifique a cobertura
dotnet test /p:CollectCoverage=true
```

#### Exemplo de Teste
```csharp
[Fact]
public async Task NewFeature_WithValidInput_ReturnsExpectedResult()
{
    // Arrange
    var service = new MyService();

    // Act
    var result = await service.DoSomething();

    // Assert
    result.Should().NotBeNull();
    result.Value.Should().Be(expectedValue);
}
```

### 5. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nome-da-feature

# Crie um Pull Request no GitHub
```

#### Template de Pull Request
```markdown
## Descrição
Breve descrição do que foi alterado

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Execute `docker-compose up -d`
2. Faça login com usuário demo
3. Teste o endpoint X com payload Y
4. Verifique resultado Z

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Commits seguem convenção
- [ ] Build passa sem erros
```

## 🏗️ Estrutura do Projeto

### Adicionar Nova Feature

#### 1. Domain Layer
```csharp
// src/FinanceApp.Domain/Entities/NovaEntidade.cs
public class NovaEntidade : BaseEntity
{
    public string Propriedade { get; set; }
}
```

#### 2. Application Layer
```csharp
// DTOs
public record NovaEntidadeDto(Guid Id, string Propriedade);

// Command
public record CreateNovaEntidadeCommand(CreateNovaEntidadeRequest Request)
    : IRequest<NovaEntidadeDto>;

// Handler
public class CreateNovaEntidadeCommandHandler
    : IRequestHandler<CreateNovaEntidadeCommand, NovaEntidadeDto>
{
    // Implementação
}
```

#### 3. Infrastructure Layer
```csharp
// Adicione ao DbContext se necessário
public DbSet<NovaEntidade> NovasEntidades => Set<NovaEntidade>();
```

#### 4. API Layer
```csharp
// src/FinanceApp.Api/Controllers/NovaEntidadeController.cs
[Route("api/[controller]")]
public class NovaEntidadeController : BaseAuthenticatedController
{
    // Implementação
}
```

#### 5. Testes
```csharp
// tests/FinanceApp.Tests/Features/NovaEntidade/NovaEntidadeTests.cs
public class NovaEntidadeTests
{
    [Fact]
    public void Test_NovaFuncionalidade() { }
}
```

## 📋 Checklist de Qualidade

Antes de submeter um PR, verifique:

- [ ] **Build**: `dotnet build` passa sem erros
- [ ] **Testes**: `dotnet test` todos passando
- [ ] **Formatação**: Código formatado corretamente
- [ ] **Migrations**: Se alterou banco, criou migration
- [ ] **Documentação**: README/Swagger atualizados
- [ ] **Security**: Sem senhas/secrets no código
- [ ] **Performance**: Queries otimizadas
- [ ] **Clean Code**: Código limpo e legível

## 🐛 Reportar Bugs

Use o template de issue do GitHub:

```markdown
### Descrição do Bug
Descrição clara do problema

### Passos para Reproduzir
1. Faça login
2. Acesse endpoint X
3. Envie payload Y
4. Veja erro Z

### Comportamento Esperado
O que deveria acontecer

### Comportamento Atual
O que está acontecendo

### Ambiente
- OS: Windows/Linux/Mac
- .NET Version: 8.0
- Docker: Sim/Não

### Logs
```
Cole logs relevantes aqui
```

## 💡 Sugerir Features

Use o template de feature request:

```markdown
### Problema
Qual problema essa feature resolve?

### Solução Proposta
Como você imagina que funcione?

### Alternativas Consideradas
Outras formas de resolver?

### Contexto Adicional
Screenshots, exemplos, etc.
```

## 🎯 Áreas que Precisam de Ajuda

- [ ] Frontend web (React/Vue)
- [ ] App mobile (React Native)
- [ ] Testes de integração
- [ ] Melhorias na classificação automática
- [ ] Integração Open Finance
- [ ] Dashboards e relatórios
- [ ] Notificações push
- [ ] Exportação PDF
- [ ] Multi-idioma (i18n)

## 📚 Recursos

- [.NET Documentation](https://docs.microsoft.com/dotnet/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://docs.microsoft.com/azure/architecture/patterns/cqrs)
- [REST API Best Practices](https://restfulapi.net/)

## 🙏 Agradecimentos

Toda contribuição é valorizada! Seja código, documentação, testes ou reportar bugs.

**Obrigado por ajudar a melhorar o FinanceApp!** ❤️
